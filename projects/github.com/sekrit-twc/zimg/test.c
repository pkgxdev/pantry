#include <assert.h>
#include <zimg.h>

int main() {
    zimg_image_format format;
    zimg_image_format_default(&format, ZIMG_API_VERSION);
    assert(ZIMG_MATRIX_UNSPECIFIED == format.matrix_coefficients);
    return 0;
}