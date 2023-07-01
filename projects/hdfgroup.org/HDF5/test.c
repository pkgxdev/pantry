#include <stdio.h>
#include "hdf5.h"
int main() {
    printf("%d.%d.%d\\n", H5_VERS_MAJOR, H5_VERS_MINOR, H5_VERS_RELEASE);
    return 0;
}