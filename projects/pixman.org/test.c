#include <pixman.h>
int main(int argc, char *argv[])
{
  pixman_color_t white = { 0xffff, 0xffff, 0xffff, 0xffff };
  pixman_image_t *image = pixman_image_create_solid_fill(&white);
  pixman_image_unref(image);
  return 0;
}
