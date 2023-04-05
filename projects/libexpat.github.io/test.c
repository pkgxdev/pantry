#include <stdio.h>
#include "expat.h"
static void XMLCALL my_StartElementHandler(
  void *userdata,
  const XML_Char *name,
  const XML_Char **atts)
{
  printf("tag:%s|", name);
}
static void XMLCALL my_CharacterDataHandler(
  void *userdata,
  const XML_Char *s,
  int len)
{
  printf("data:%.*s|", len, s);
}
int main()
{
  static const char str[] = "<str>Hello, world!</str>";
  int result;
  XML_Parser parser = XML_ParserCreate("utf-8");
  XML_SetElementHandler(parser, my_StartElementHandler, NULL);
  XML_SetCharacterDataHandler(parser, my_CharacterDataHandler);
  result = XML_Parse(parser, str, sizeof(str), 1);
  XML_ParserFree(parser);
  return result;
}
