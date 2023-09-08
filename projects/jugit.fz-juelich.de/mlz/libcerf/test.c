#include <cerf.h>
#include <complex.h>
#include <math.h>
#include <stdio.h>
#include <stdlib.h>

int main (void) {
    double _Complex a = 1.0 - 0.4I;
    a = cerf(a);
    if (fabs(creal(a)-0.910867) > 1.e-6) abort();
    if (fabs(cimag(a)+0.156454) > 1.e-6) abort();
    return 0;
}