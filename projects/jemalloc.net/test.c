#include <stdlib.h>
#include <jemalloc/jemalloc.h>

    int main(void) {

    for (size_t i = 0; i < 1000; i++) {
        // Leak some memory
        malloc(i * 100);
    }

    // Dump allocator statistics to stderr
        malloc_stats_print(NULL, NULL, NULL);
    }
