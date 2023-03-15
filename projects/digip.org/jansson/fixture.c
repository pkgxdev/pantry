#include <jansson.h>
#include <assert.h>
int main()
{
  json_t *json;
  json_error_t error;
  json = json_loads("\"foo\"", JSON_DECODE_ANY, &error);
  assert(json && json_is_string(json));
  json_decref(json);
  return 0;
}