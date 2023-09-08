#include <stdio.h>
#include <stdlib.h>
#include <pkcs11-helper-1.0/pkcs11h-core.h>

int main() {
    printf("Version: %08x", pkcs11h_getVersion ());
    return 0;
}