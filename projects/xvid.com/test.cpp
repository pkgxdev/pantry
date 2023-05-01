#include <xvid.h>
#define NULL 0
int main() {
    xvid_gbl_init_t xvid_gbl_init;
    xvid_global(NULL, XVID_GBL_INIT, &xvid_gbl_init, NULL);
    return 0;
}