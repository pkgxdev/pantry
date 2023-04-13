#include <jxl/thread_parallel_runner.h>
#include <stdlib.h>

int main() {
  void* runner = JxlThreadParallelRunnerCreate(NULL, 1);
  if (runner == NULL) {
    return EXIT_FAILURE;
  }
  JxlThreadParallelRunnerDestroy(runner);
  return EXIT_SUCCESS;
}
