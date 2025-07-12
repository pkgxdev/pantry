#define _GNU_SOURCE
#include <gnu/libc-version.h>
#include <stdio.h>

int main(int argc, char **argv) {
    /* Basic library version check. */
    printf("gnu_get_libc_version() = %s\n", gnu_get_libc_version());
}