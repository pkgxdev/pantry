#include <unibilium.h>
#include <stdio.h>

int main() {
    setvbuf(stdout, NULL, _IOLBF, 0);
    unibi_term *ut = unibi_dummy();
    unibi_destroy(ut);
    printf("%s", unibi_terminfo_dirs);
    return 0;
}