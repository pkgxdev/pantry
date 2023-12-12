#include <stdio.h>
#include <wireshark/ws_version.h>

int main() {
    printf("%d.%d.%d", WIRESHARK_VERSION_MAJOR, WIRESHARK_VERSION_MINOR,
            WIRESHARK_VERSION_MICRO);
    return 0;
}