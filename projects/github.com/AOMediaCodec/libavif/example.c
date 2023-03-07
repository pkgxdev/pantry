#include "avif/avif.h"
#include <inttypes.h>
#include <stdio.h>
#include <string.h>

int main(int argc, char * argv[])
{
    if (argc != 2) {
        fprintf(stderr, "avif_example_decode_file [filename.avif]\n");
        return 1;
    }
    const char * inputFilename = argv[1];

    int returnCode = 1;
    avifRGBImage rgb;
    memset(&rgb, 0, sizeof(rgb));

    avifDecoder * decoder = avifDecoderCreate();

    avifResult result = avifDecoderSetIOFile(decoder, inputFilename);
    if (result != AVIF_RESULT_OK) {
        fprintf(stderr, "Cannot open file for read: %s\n", inputFilename);
        goto cleanup;
    }

    result = avifDecoderParse(decoder);
    if (result != AVIF_RESULT_OK) {
        fprintf(stderr, "Failed to decode image: %s\n", avifResultToString(result));
        goto cleanup;
    }

    printf("Parsed AVIF: %ux%u (%ubpc)\n", decoder->image->width, decoder->image->height, decoder->image->depth);

    while (avifDecoderNextImage(decoder) == AVIF_RESULT_OK) {
        avifRGBImageSetDefaults(&rgb, decoder->image);

        avifRGBImageAllocatePixels(&rgb);

        if (avifImageYUVToRGB(decoder->image, &rgb) != AVIF_RESULT_OK) {
            fprintf(stderr, "Conversion from YUV failed: %s\n", inputFilename);
            goto cleanup;
        }

        if (rgb.depth > 8) {
            uint16_t * firstPixel = (uint16_t *)rgb.pixels;
            printf(" * First pixel: RGBA(%u,%u,%u,%u)\n", firstPixel[0], firstPixel[1], firstPixel[2], firstPixel[3]);
        } else {
            uint8_t * firstPixel = rgb.pixels;
            printf(" * First pixel: RGBA(%u,%u,%u,%u)\n", firstPixel[0], firstPixel[1], firstPixel[2], firstPixel[3]);
        }
    }

    returnCode = 0;
cleanup:
    avifRGBImageFreePixels(&rgb);
    avifDecoderDestroy(decoder);
    return returnCode;
}
