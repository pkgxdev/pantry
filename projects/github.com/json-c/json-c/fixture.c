#include <stdio.h>
#include <json-c/json.h>
int main() {
  json_object *obj = json_object_new_object();
  json_object *value = json_object_new_string("value");
  json_object_object_add(obj, "key", value);
  printf("%s\n", json_object_to_json_string(obj));
  return 0;
}
