#include "lapacke.h"
int main() {
    void *p = LAPACKE_malloc(sizeof(char)*100);
    if (p) {
        LAPACKE_free(p);
    }
    return 0;
}