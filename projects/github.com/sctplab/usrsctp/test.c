#include <unistd.h>
#include <usrsctp.h>
int main() {
    usrsctp_init(0, NULL, NULL);
    return 0;
}