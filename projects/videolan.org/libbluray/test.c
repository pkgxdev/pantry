#include <libbluray/bluray.h>

int main(void) {
    BLURAY *bluray = bd_init();
    bd_close(bluray);
    return 0;
}
