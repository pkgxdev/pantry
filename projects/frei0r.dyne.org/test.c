#include <frei0r.h>

int main() {
    int mver = FREI0R_MAJOR_VERSION;
    if (mver != 0) {
        return 0;
    } else {
        return 1;
    }
}
