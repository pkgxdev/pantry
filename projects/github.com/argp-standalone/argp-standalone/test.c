#include <argp.h>
#include <stdio.h>

const char *argp_program_version = "argp-standalone-test 1.0";

int main(int argc, char **argv)
{
    error_t err = argp_parse(0, argc, argv, 0, 0, 0);
    return err ? 1 : 0;
}
