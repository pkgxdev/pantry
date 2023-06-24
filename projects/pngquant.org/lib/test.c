#include <libimagequant.h>

int main() {
    liq_attr *attr = liq_attr_create();
    if (!attr) {
        return 1;
    } else {
        liq_attr_destroy(attr);
        return 0;
    }
}