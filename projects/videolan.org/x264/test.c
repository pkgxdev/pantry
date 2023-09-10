#include <stdint.h>
#include <x264.h>

int main() {
    x264_picture_t pic;
    x264_picture_init(&pic);
    x264_picture_alloc(&pic, 1, 1, 1);
    x264_picture_clean(&pic);
    return 0;
}