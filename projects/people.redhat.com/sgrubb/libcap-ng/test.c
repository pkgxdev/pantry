#include <stdio.h>
#include <cap-ng.h>

int main(int argc, char *argv[])
{
    if(capng_have_permitted_capabilities() > -1)
        printf("ok");
}