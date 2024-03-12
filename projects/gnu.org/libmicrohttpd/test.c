#include <sys/types.h>
#ifndef _WIN32
#include <sys/select.h>
#include <sys/socket.h>
#else
#include <winsock2.h>
#endif
#include <microhttpd.h>
#include <stdio.h>
#include <string.h>
#include <stdlib.h>

#if defined(_MSC_VER) && _MSC_VER + 0 <= 1800
/* Substitution is OK while return value is not used */
#define snprintf _snprintf
#endif

#define PORT            8888
#define POSTBUFFERSIZE  512
#define MAXNAMESIZE     20
#define MAXANSWERSIZE   512

#define GET             0
#define POST            1

struct connection_info_struct
{
  int connectiontype;
  char *answerstring;
  struct MHD_PostProcessor *postprocessor;
};

static const char *askpage =
  "<html><body>\n"
  "What's your name, Sir?<br>\n"
  "<form action=\"/namepost\" method=\"post\">\n"
  "<input name=\"name\" type=\"text\">\n"
  "<input type=\"submit\" value=\" Send \"></form>\n"
  "</body></html>";

#define GREETINGPAGE \
  "<html><body><h1>Welcome, %s!</center></h1></body></html>"

static const char *errorpage =
  "<html><body>This doesn't seem to be right.</body></html>";


static enum MHD_Result
send_page (struct MHD_Connection *connection, const char *page)
{
  enum MHD_Result ret;
  struct MHD_Response *response;


  response = MHD_create_response_from_buffer_static (strlen (page), page);
  if (! response)
    return MHD_NO;

  ret = MHD_queue_response (connection, MHD_HTTP_OK, response);
  MHD_destroy_response (response);

  return ret;
}


static enum MHD_Result
iterate_post (void *coninfo_cls, enum MHD_ValueKind kind, const char *key,
              const char *filename, const char *content_type,
              const char *transfer_encoding, const char *data, uint64_t off,
              size_t size)
{
  struct connection_info_struct *con_info = coninfo_cls;
  (void) kind;               /* Unused. Silent compiler warning. */
  (void) filename;           /* Unused. Silent compiler warning. */
  (void) content_type;       /* Unused. Silent compiler warning. */
  (void) transfer_encoding;  /* Unused. Silent compiler warning. */
  (void) off;                /* Unused. Silent compiler warning. */

  if (0 == strcmp (key, "name"))
  {
    if ((size > 0) && (size <= MAXNAMESIZE))
    {
      char *answerstring;
      answerstring = malloc (MAXANSWERSIZE);
      if (! answerstring)
        return MHD_NO;

      snprintf (answerstring, MAXANSWERSIZE, GREETINGPAGE, data);
      con_info->answerstring = answerstring;
    }
    else
      con_info->answerstring = NULL;

    return MHD_NO;
  }

  return MHD_YES;
}


static void
request_completed (void *cls, struct MHD_Connection *connection,
                   void **req_cls, enum MHD_RequestTerminationCode toe)
{
  struct connection_info_struct *con_info = *req_cls;
  (void) cls;         /* Unused. Silent compiler warning. */
  (void) connection;  /* Unused. Silent compiler warning. */
  (void) toe;         /* Unused. Silent compiler warning. */

  if (NULL == con_info)
    return;

  if (con_info->connectiontype == POST)
  {
    MHD_destroy_post_processor (con_info->postprocessor);
    if (con_info->answerstring)
      free (con_info->answerstring);
  }

  free (con_info);
  *req_cls = NULL;
}


static enum MHD_Result
answer_to_connection (void *cls, struct MHD_Connection *connection,
                      const char *url, const char *method,
                      const char *version, const char *upload_data,
                      size_t *upload_data_size, void **req_cls)
{
  (void) cls;               /* Unused. Silent compiler warning. */
  (void) url;               /* Unused. Silent compiler warning. */
  (void) version;           /* Unused. Silent compiler warning. */

  if (NULL == *req_cls)
  {
    struct connection_info_struct *con_info;

    con_info = malloc (sizeof (struct connection_info_struct));
    if (NULL == con_info)
      return MHD_NO;
    con_info->answerstring = NULL;

    if (0 == strcmp (method, "POST"))
    {
      con_info->postprocessor =
        MHD_create_post_processor (connection, POSTBUFFERSIZE,
                                   iterate_post, (void *) con_info);

      if (NULL == con_info->postprocessor)
      {
        free (con_info);
        return MHD_NO;
      }

      con_info->connectiontype = POST;
    }
    else
      con_info->connectiontype = GET;

    *req_cls = (void *) con_info;

    return MHD_YES;
  }

  if (0 == strcmp (method, "GET"))
  {
    return send_page (connection, askpage);
  }

  if (0 == strcmp (method, "POST"))
  {
    struct connection_info_struct *con_info = *req_cls;

    if (*upload_data_size != 0)
    {
      if (MHD_YES !=
          MHD_post_process (con_info->postprocessor,
                            upload_data,
                            *upload_data_size))
        return MHD_NO;
      *upload_data_size = 0;

      return MHD_YES;
    }
    else if (NULL != con_info->answerstring)
      return send_page (connection, con_info->answerstring);
  }

  return send_page (connection, errorpage);
}


int
main (void)
{
  struct MHD_Daemon *daemon;

  daemon = MHD_start_daemon (MHD_USE_AUTO | MHD_USE_INTERNAL_POLLING_THREAD,
                             PORT, NULL, NULL,
                             &answer_to_connection, NULL,
                             MHD_OPTION_NOTIFY_COMPLETED, request_completed,
                             NULL, MHD_OPTION_END);
  if (NULL == daemon)
    return 1;

  while (1) {
    sleep(1); // or use another method to pause execution
  }

  MHD_stop_daemon (daemon);

  return 0;
}
