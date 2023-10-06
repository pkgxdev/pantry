#include <iostream>
#include <tbb/task_arena.h>

int main() {
    const auto max_concurrency = tbb::this_task_arena::max_concurrency();

    if (max_concurrency == 1) {
        std::cerr << "Error: Invalid conditions." << std::endl;
        return EXIT_FAILURE;
    }

    std::cout << "Conditions are valid." << std::endl;
    return EXIT_SUCCESS;
}