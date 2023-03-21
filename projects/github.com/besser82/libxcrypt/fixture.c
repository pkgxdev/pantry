#include <crypt.h>
#include <errno.h>
#include <stdio.h>
#include <string.h>
int main() {
  char *hash = crypt("abc", "$2b$05$abcdefghijklmnopqrstuu");
  if (errno) {
    fprintf(stderr, "Received error: %s", strerror(errno));
    return errno;
  }
  if (hash == NULL) {
    fprintf(stderr, "Hash is NULL");
    return -1;
  }
  if (strcmp(hash, "$2b$05$abcdefghijklmnopqrstuuRWUgMyyCUnsDr8evYotXg5ZXVF/HhzS")) {
    fprintf(stderr, "Unexpected hash output");
    return -1;
  }
  return 0;
}
