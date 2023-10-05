#include <iostream>
#include <tbb/task_arena.h>

int main() {
    const auto max_concurrency = tbb::this_task_arena::max_concurrency();

#ifdef __APPLE__
    if (max_concurrency == 1) {
        std::cerr << "Error: Invalid conditions on MacOS." << std::endl;
        return EXIT_FAILURE;
    }
#else
    if (max_concurrency != 1) {
        std::cerr << "Error: Invalid conditions on Linux." << std::endl;
        return EXIT_FAILURE;
    }
#endif

    std::cout << "Conditions are valid." << std::endl;
    return EXIT_SUCCESS;
}