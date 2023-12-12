#include <gio/gio.h>
int main (int argc, char *argv[])
{
    if (g_tls_backend_supports_tls (g_tls_backend_get_default()))
        return 0;
    else
        return 1;
}