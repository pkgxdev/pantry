#include <assert.h>
#include <stdio.h>
#include <string.h>

#include <libpsl.h>

int main(void)
{
    const psl_ctx_t *psl = psl_builtin();

    const char *domain = ".eu";
    assert(psl_is_public_suffix(psl, domain));

    const char *host = "www.example.com";
    const char *expected_domain = "example.com";
    const char *actual_domain = psl_registrable_domain(psl, host);
    assert(strcmp(actual_domain, expected_domain) == 0);

    return 0;
}