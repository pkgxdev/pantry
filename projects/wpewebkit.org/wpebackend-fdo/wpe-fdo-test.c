#include "wpe/fdo.h"
#include <stdio.h>
int main() {
    printf("%u.%u.%u", wpe_fdo_get_major_version(), wpe_fdo_get_minor_version(), wpe_fdo_get_micro_version());
}