#include <assert.h>
#include <ccd/config.h>
#include <ccd/vec3.h>
int main() {
    #ifndef CCD_DOUBLE
        assert(false);
    #endif
    ccdVec3PointSegmentDist2(
        ccd_vec3_origin, ccd_vec3_origin,
        ccd_vec3_origin, NULL);
    return 0;
}