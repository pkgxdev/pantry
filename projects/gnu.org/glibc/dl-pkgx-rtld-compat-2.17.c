#include <stdarg.h>
#include <fcntl.h>
#include <unistd.h>
#include <errno.h>
#include <sysdep.h>
#include <abort-instr.h>

#ifndef ABORT_INSTRUCTION
# define ABORT_INSTRUCTION
#endif

#if RTLD_PRIVATE_ERRNO
int rtld_errno attribute_hidden;
#endif

int __open (const char *file, int oflag, ...) attribute_hidden;
int __close (int fd) attribute_hidden;
int __access (const char *file, int type) attribute_hidden;
void __libc_check_standard_fds (void) attribute_hidden;

int
__open (const char *file, int oflag, ...)
{
  mode_t mode = 0;

  if (oflag & O_CREAT)
    {
      va_list arg;
      va_start (arg, oflag);
      mode = va_arg (arg, mode_t);
      va_end (arg);
    }

  return INLINE_SYSCALL (open, 3, file, oflag, mode);
}

int
__close (int fd)
{
  return INLINE_SYSCALL (close, 1, fd);
}

int
__access (const char *file, int type)
{
  return INLINE_SYSCALL (access, 2, file, type);
}

static void
check_one_fd (int fd, int mode)
{
  if (INLINE_SYSCALL (fcntl, 3, fd, F_GETFD, 0) == -1
      && errno == EBADF)
    {
      const char *name;

      if ((mode & O_ACCMODE) == O_WRONLY)
        name = "/dev/full";
      else
        name = "/dev/null";

      int nullfd = __open (name, mode, 0);
      if (nullfd != fd)
        while (1)
          ABORT_INSTRUCTION;
    }
}

void
__libc_check_standard_fds (void)
{
#ifndef O_NOFOLLOW
# define O_NOFOLLOW 0
#endif
  check_one_fd (STDIN_FILENO, O_WRONLY | O_NOFOLLOW);
  check_one_fd (STDOUT_FILENO, O_RDONLY | O_NOFOLLOW);
  check_one_fd (STDERR_FILENO, O_RDONLY | O_NOFOLLOW);
}
