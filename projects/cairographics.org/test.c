#include <cairo.h>

int main(int argc, char *argv[]) {
  cairo_surface_t *surface = cairo_image_surface_create(CAIRO_FORMAT_ARGB32, 600, 400);
  cairo_t *context = cairo_create(surface);
  return 0;
}
