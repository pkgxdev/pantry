#include <err.h>
#include <stddef.h>
#include <sys/types.h>
#include <libserdes/serdes.h>

int main()
{
    char errstr[512];
    serdes_conf_t *sconf = serdes_conf_new(NULL, 0, NULL);
    serdes_t *serdes = serdes_new(sconf, errstr, sizeof(errstr));
    if (serdes == NULL)
    {
        errx(1, "constructing serdes: %s", errstr);
    }
    serdes_destroy(serdes);
    return 0;
}