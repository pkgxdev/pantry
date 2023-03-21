#include <stdio.h>
#include <stdlib.h>
#include <readline/readline.h>
int main() {
  printf("%s\\n", readline("test> "));
  return 0;
}
