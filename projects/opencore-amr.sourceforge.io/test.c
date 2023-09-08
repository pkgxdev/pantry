#include <opencore-amrwb/dec_if.h>
int main(void) {
    void *s = D_IF_init();
    D_IF_exit(s);
    return 0;
}