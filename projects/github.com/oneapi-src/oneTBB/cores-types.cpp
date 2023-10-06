#include <cstdlib>
#include <tbb/task_arena.h>

int main() {
    const auto numa_nodes = tbb::info::numa_nodes();
    const auto size = numa_nodes.size();
    const auto type = numa_nodes.front();

    return size == 1 && type == tbb::task_arena::automatic ? EXIT_SUCCESS : EXIT_FAILURE;
}