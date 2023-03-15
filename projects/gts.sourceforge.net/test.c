#include "gts.h"
int main() {
    GtsRange r;
    gts_range_init(&r);

    for (int i = 0; i < 10; ++i)
        gts_range_add_value(&r, i);

    gts_range_update(&r);

    if (r.n == 10) return 0;
    return 1;
}

