#include <stdio.h>
#include "duktape.h"

int main(int argc, char *argv[]) {
    duk_context *ctx = duk_create_heap_default();
    duk_eval_string(ctx, "1 + 2");
    printf("1 + 2 = %d\\n", (int) duk_get_int(ctx, -1));
    duk_destroy_heap(ctx);
    return 0;
}