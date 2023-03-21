 #include <yaml.h>

int main() {
  yaml_parser_t parser;
  yaml_parser_initialize(&parser);
  yaml_parser_delete(&parser);
  return 0;
}
