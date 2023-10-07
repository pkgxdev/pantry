#include <stdio.h>
#include <stdlib.h>
#include <rpcsvc/ypclnt.h>

int main(int argc, char *argv[]) {
    char *domain;
    switch (yp_get_default_domain(&domain)) {
        case YPERR_SUCCESS:
            printf("Domain: %s\n", domain);
            return 0;
        case YPERR_NODOM:
            printf("No domain\n");
            return 0;
        default:
            return 1;
    }
}