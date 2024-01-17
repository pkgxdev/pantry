#include "sigsegv.h"

#include <errno.h>
#include <fcntl.h>
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>

const char *null_pointer = NULL;
static int
handler(void *fault_address, int serious)
{
    abort();
}

int main()
{
    if (open(null_pointer, O_RDONLY) != -1 || errno != EFAULT)
    {
        fprintf(stderr, "EFAULT not detected alone");
        exit(1);
    }

    if (sigsegv_install_handler(&handler) < 0)
        exit(2);

    if (open(null_pointer, O_RDONLY) != -1 || errno != EFAULT)
    {
        fprintf(stderr, "EFAULT not detected with handler");
        exit(1);
    }

    printf("Test passed");
    return 0;
}