#include <jxl/encode.h>
#include <stdlib.h>

int main() {
  JxlEncoder* enc = JxlEncoderCreate(NULL);
  if (enc == NULL) {
    return EXIT_FAILURE;
  }
  JxlEncoderDestroy(enc);
  return EXIT_SUCCESS;
}
