#include <assert.h>
#include <mpdecimal.h>
#include <string.h>
int main() {
  mpd_context_t ctx;
  mpd_t *a, *b, *result;
  char *rstring;
  mpd_defaultcontext(&ctx);
  a = mpd_new(&ctx);
  b = mpd_new(&ctx);
  result = mpd_new(&ctx);
  mpd_set_string(a, "0.1", &ctx);
  mpd_set_string(b, "0.2", &ctx);
  mpd_add(result, a, b, &ctx);
  rstring = mpd_to_sci(result, 1);
  assert(strcmp(rstring, "0.3") == 0);
  mpd_del(a);
  mpd_del(b);
  mpd_del(result);
  mpd_free(rstring);
  return 0;
}
