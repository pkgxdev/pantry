#include <libplacebo/config.h>
#include <stdlib.h>
int main() {
    return (pl_version() != NULL) ? 0 : 1;
}