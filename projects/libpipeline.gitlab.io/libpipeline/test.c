#include <pipeline.h>
int main() {
    pipeline *p = pipeline_new();
    pipeline_command_args(p, "echo", "Hello world", NULL);
    pipeline_command_args(p, "cat", NULL);
    return pipeline_run(p);
}