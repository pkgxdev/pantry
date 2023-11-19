#include <sass/context.h>
#include <string.h>
#include <stdio.h>

int main() {
    const char* source_string = "a { color:blue; &:hover { color:red; } }";
    struct Sass_Data_Context* data_ctx = sass_make_data_context(strdup(source_string));
    struct Sass_Options* options = sass_data_context_get_options(data_ctx);
    sass_option_set_precision(options, 1);
    sass_option_set_source_comments(options, false);
    sass_data_context_set_options(data_ctx, options);
    sass_compile_data_context(data_ctx);
    struct Sass_Context* ctx = sass_data_context_get_context(data_ctx);
    int err = sass_context_get_error_status(ctx);

    if (err != 0) {
        const char* error_message = sass_context_get_error_message(ctx);
        printf("Compilation error: %s\n", error_message);
        return 1;
    } else {
        const char* output = sass_context_get_output_string(ctx);
        printf("Compilation successful. Output:\n%s\n", output);
        printf("%d\n", strcmp(output, "a {\\n  color: blue; }\\n  a:hover {\\n    color: red; }\\n"));
        return 0;
    }
}
