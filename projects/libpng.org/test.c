#include <png.h>
int main()
{
  png_structp png_ptr;
  png_ptr = png_create_write_struct(PNG_LIBPNG_VER_STRING, NULL, NULL, NULL);
  png_destroy_write_struct(&png_ptr, (png_infopp)NULL);
  return 0;
}
