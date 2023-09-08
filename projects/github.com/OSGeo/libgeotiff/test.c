#include "geotiffio.h"
#include "xtiffio.h"
#include <stdlib.h>
#include <string.h>

int main(int argc, char* argv[]) {
    TIFF *tif = XTIFFOpen(argv[1], "w");
    GTIF *gtif = GTIFNew(tif);
    TIFFSetField(tif, TIFFTAG_IMAGEWIDTH, (uint32_t) 10);
    GTIFKeySet(gtif, GeogInvFlatteningGeoKey, TYPE_DOUBLE, 1, (double)123.456);

    int i;
    char buffer[20L];

    memset(buffer,0,(size_t)20L);
    for (i=0;i<20L;i++){
        TIFFWriteScanline(tif, buffer, i, 0);
    }

    GTIFWriteKeys(gtif);
    GTIFFree(gtif);
    XTIFFClose(tif);
    return 0;
}