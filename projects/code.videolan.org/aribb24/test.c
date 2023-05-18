#include <aribb24/aribb24.h>
#include <stdlib.h>

int main() {
    arib_instance_t *ptr = arib_instance_new(NULL);
    if (!ptr)
        return 1;
    arib_instance_destroy(ptr);
    return 0;
}
