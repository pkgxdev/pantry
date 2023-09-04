#include <rpc/des_crypt.h>
#include <stdio.h>
int main () {
    char key[] = "My8digitkey1234";
    if (sizeof(key) != 16)
        return 1;
    des_setparity(key);
    printf("%lu\\n", sizeof(key));
    return 0;
}