#include "ass/ass.h"

int main() {
    ASS_Library *library;
    ASS_Renderer *renderer;
    library = ass_library_init();
    if (library) {
        renderer = ass_renderer_init(library);
        if (renderer) {
            ass_renderer_done(renderer);
            ass_library_done(library);
            return 0;
        } else {
            ass_library_done(library);
            return 1;
        }
    } else {
        return 1;
    }
}
