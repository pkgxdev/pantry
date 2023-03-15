#include <string.h>
#include <glib.h>
int main(void)
{
    gchar *result_1, *result_2;
    char *str = "string";
    result_1 = g_convert(str, strlen(str), "ASCII", "UTF-8", NULL, NULL, NULL);
    result_2 = g_convert(result_1, strlen(result_1), "UTF-8", "ASCII", NULL, NULL, NULL);
    return (strcmp(str, result_2) == 0) ? 0 : 1;
}
