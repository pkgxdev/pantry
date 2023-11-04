#include "wpe/wpe.h"
#include <stdio.h>
int main() {
    printf("%u.%u.%u", wpe_get_major_version(), wpe_get_minor_version(), wpe_get_micro_version());
}