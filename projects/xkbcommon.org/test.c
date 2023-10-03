#include <stdlib.h>
#include <xkbcommon/xkbcommon.h>
int main() {
return (xkb_context_new(XKB_CONTEXT_NO_FLAGS) == NULL)
    ? EXIT_FAILURE
    : EXIT_SUCCESS;
}