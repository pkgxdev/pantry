#ifdef _WIN32
#define WIN32_LEAN_AND_MEAN
#include <windows.h>
#include <winsock2.h>
#include <ws2tcpip.h> /* gai_strerror() */
#include <io.h> /* write() */
#include <fcntl.h> /* O_BINARY */
#define strncasecmp _strnicmp
#else
#include <sys/socket.h>
#include <sys/uio.h>
#include <netinet/in.h>
#include <netdb.h>
#include <arpa/inet.h>
#include <unistd.h>
#include <fcntl.h>
#endif

#include <sys/types.h>
#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <errno.h>

#include "rustls.h"
#include "common.h"

void
print_error(const char *program_name, const char *prefix, rustls_result result)
{
  char buf[256];
  size_t n;
  rustls_error(result, buf, sizeof(buf), &n);
  fprintf(stderr, "%s: %s: %.*s\n", program_name, prefix, (int)n, buf);
}

#ifdef _WIN32
const char *
ws_strerror(int err)
{
  static char ws_err[50];

  if(err >= WSABASEERR) {
    snprintf(ws_err, sizeof(ws_err), "Winsock err: %d", err);
    return ws_err;
  }
  /* Assume a CRT error */
  return (strerror)(err);
}
#endif

/*
 * Write n bytes from buf to the provided fd (on Windows, this must be
 * stdout/stderr or a file, not a socket), retrying short writes until
 * we finish or hit an error. Assumes fd is blocking and therefore doesn't
 * handle EAGAIN. Returns 0 for success or 1 for error.
 */
int
write_all(int fd, const char *buf, int n)
{
  int m = 0;

  while(n > 0) {
    m = write(fd, buf, n);
    if(m < 0) {
      perror("write_all");
      return 1;
    }
    n -= m;
  }
  return 0;
}

/*
 * Set a socket to be nonblocking.
 *
 * Returns CRUSTLS_DEMO_OK on success, CRUSTLS_DEMO_ERROR on error.
 */
enum crustls_demo_result
nonblock(int sockfd)
{
#ifdef _WIN32
  u_long nonblock = 1UL;

  if(ioctlsocket(sockfd, FIONBIO, &nonblock) != 0) {
    perror("Error setting socket nonblocking");
    return CRUSTLS_DEMO_ERROR;
  }
#else
  int flags;
  flags = fcntl(sockfd, F_GETFL, 0);
  if(flags < 0) {
    perror("getting socket flags");
    return CRUSTLS_DEMO_ERROR;
  }
  flags = fcntl(sockfd, F_SETFL, flags | O_NONBLOCK);
  if(flags < 0) {
    perror("setting socket nonblocking");
    return CRUSTLS_DEMO_ERROR;
  }
#endif
  return CRUSTLS_DEMO_OK;
}

int
read_cb(void *userdata, unsigned char *buf, size_t len, size_t *out_n)
{
  ssize_t n = 0;
  struct conndata *conn = (struct conndata *)userdata;
  n = recv(conn->fd, buf, len, 0);
  if(n < 0) {
    return errno;
  }
  if(out_n != NULL) {
    *out_n = n;
  }
  return 0;
}

int
write_cb(void *userdata, const unsigned char *buf, size_t len, size_t *out_n)
{
  ssize_t n = 0;
  struct conndata *conn = (struct conndata *)userdata;

  n = send(conn->fd, buf, len, 0);
  if(n < 0) {
    return errno;
  }
  if(out_n != NULL) {
    *out_n = n;
  }
  return 0;
}

rustls_io_result
write_tls(struct rustls_connection *rconn, struct conndata *conn, size_t *n)
{
#ifdef _WIN32
  return rustls_connection_write_tls(rconn, write_cb, conn, n);
#else
  if(getenv("VECTORED_IO")) {
    return rustls_connection_write_tls_vectored(rconn, write_vectored_cb, conn, n);
  } else {
    return rustls_connection_write_tls(rconn, write_cb, conn, n);
  }
#endif /* _WIN32 */
}

#ifndef _WIN32
rustls_io_result write_vectored_cb(
    void *userdata, const struct rustls_iovec *iov, size_t count, size_t *out_n)
{
  ssize_t n = 0;
  struct conndata *conn = (struct conndata *)userdata;

  n = writev(conn->fd, (const struct iovec *)iov, count);
  if(n < 0) {
    return errno;
  }
  *out_n = n;
  return 0;
}
#endif /* _WIN32 */

size_t
bytevec_available(struct bytevec *vec)
{
  return vec->capacity - vec->len;
}

char *
bytevec_writeable(struct bytevec *vec)
{
  return vec->data + vec->len;
}

void
bytevec_consume(struct bytevec *vec, size_t n)
{
  vec->len += n;
}

// Ensure there are at least n bytes available between vec->len and
// vec->capacity. If this requires reallocating, this may return
// CRUSTLS_DEMO_ERROR.
enum crustls_demo_result
bytevec_ensure_available(struct bytevec *vec, size_t n)
{
  size_t available = vec->capacity - vec->len;
  size_t newsize;
  void *newdata;
  if(available < n) {
    newsize = vec->len + n;
    if(newsize < vec->capacity * 2) {
      newsize = vec->capacity * 2;
    }
    newdata = realloc(vec->data, newsize);
    if(newdata == NULL) {
      fprintf(stderr, "out of memory trying to get %zu bytes\n", newsize);
      return CRUSTLS_DEMO_ERROR;
    }
    vec->data = newdata;
    vec->capacity = newsize;
  }
  return CRUSTLS_DEMO_OK;
}

/**
 * Copy all available plaintext from rustls into our own buffer, growing
 * our buffer as much as needed.
 */
int
copy_plaintext_to_buffer(struct conndata *conn)
{
  int result;
  size_t n;
  struct rustls_connection *rconn = conn->rconn;

  if(bytevec_ensure_available(&conn->data, 1024) != CRUSTLS_DEMO_OK) {
    return CRUSTLS_DEMO_ERROR;
  }

  for(;;) {
    char *buf = bytevec_writeable(&conn->data);
    size_t avail = bytevec_available(&conn->data);
    result = rustls_connection_read(rconn, (uint8_t *)buf, avail, &n);
    if(result == RUSTLS_RESULT_PLAINTEXT_EMPTY) {
      /* This is expected. It just means "no more bytes for now." */
      return CRUSTLS_DEMO_OK;
    }
    if(result != RUSTLS_RESULT_OK) {
      print_error(conn->program_name, "Error in rustls_connection_read", result);
      return CRUSTLS_DEMO_ERROR;
    }
    if(n == 0) {
      fprintf(stderr, "got 0-byte read, cleanly ending connection\n");
      return CRUSTLS_DEMO_EOF;
    }
    bytevec_consume(&conn->data, n);
    if(bytevec_ensure_available(&conn->data, 1024) != CRUSTLS_DEMO_OK) {
      return CRUSTLS_DEMO_ERROR;
    }
  }

  return CRUSTLS_DEMO_ERROR;
}

/**
 * Since memmem is not cross-platform compatible, we bring our own.
 * Copied from https://www.capitalware.com/rl_blog/?p=5847.
 *
 * Function Name
 *  memmem
 *
 * Description
 *  Like strstr(), but for non-text buffers that are not NULL delimited.
 *
 *  public domain by Bob Stout
 *
 * Input parameters
 *  haystack    - pointer to the buffer to be searched
 *  haystacklen - length of the haystack buffer
 *  needle      - pointer to a buffer that will be searched for
 *  needlelen   - length of the needle buffer
 *
 * Return Value
 *  pointer to the memory address of the match or NULL.
 */
void *
memmem(const void *haystack, size_t haystacklen, const void *needle,
       size_t needlelen)
{
  const char *bf = haystack;
  const char *pt = needle;
  const char *p = bf;

  while(needlelen <= (haystacklen - (p - bf))) {
    if(NULL != (p = memchr(p, (int)(*pt), haystacklen - (p - bf)))) {
      if(0 == memcmp(p, needle, needlelen)) {
        return (void *)p;
      }
      else {
        ++p;
      }
    }
    else {
      break;
    }
  }

  return NULL;
}

char *
body_beginning(struct bytevec *vec)
{
  const void *result = memmem(vec->data, vec->len, "\r\n\r\n", 4);
  if(result == NULL) {
    return NULL;
  }
  else {
    return (char *)result + 4;
  }
}

const char *
get_first_header_value(const char *headers, size_t headers_len,
                       const char *name, size_t name_len, size_t *n)
{
  const void *result;
  const char *current = headers;
  size_t len = headers_len;
  size_t skipped;

  // We use + 3 because there needs to be room for `:` and `\r\n` after the
  // header name
  while(len > name_len + 3) {
    result = memmem(current, len, "\r\n", 2);
    if(result == NULL) {
      return NULL;
    }
    skipped = (char *)result - current + 2;
    len -= skipped;
    current += skipped;
    /* Make sure there's enough room to conceivably contain the header name,
     * a colon (:), and something after that.
     */
    if(len < name_len + 2) {
      return NULL;
    }
    if(strncasecmp(name, current, name_len) == 0 && current[name_len] == ':') {
      /* Found it! */
      len -= name_len + 1;
      current += name_len + 1;
      result = memmem(current, len, "\r\n", 2);
      if(result == NULL) {
        *n = len;
        return current;
      }
      *n = (char *)result - current;
      return current;
    }
  }
  return NULL;
}

void
log_cb(void *userdata, const struct rustls_log_params *params)
{
  struct conndata *conn = (struct conndata*)userdata;
  struct rustls_str level_str = rustls_log_level_str(params->level);
  fprintf(stderr, "%s[fd %d][%.*s]: %.*s\n", conn->program_name, conn->fd,
    (int)level_str.len, level_str.data, (int)params->message.len, params->message.data);
}
