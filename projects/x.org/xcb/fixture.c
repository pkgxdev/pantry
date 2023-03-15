#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "xcb/xcb.h"
int main() {
  xcb_connection_t *connection;
  xcb_atom_t *atoms;
  xcb_intern_atom_cookie_t *cookies;
  int count, i;
  char **names;
  char buf[100];
  count = 200;
  connection = xcb_connect(NULL, NULL);
  atoms = (xcb_atom_t *) malloc(count * sizeof(atoms));
  names = (char **) malloc(count * sizeof(char *));
  for (i = 0; i < count; ++i) {
    sprintf(buf, "NAME%d", i);
    names[i] = strdup(buf);
    memset(buf, 0, sizeof(buf));
  }
  cookies = (xcb_intern_atom_cookie_t *) malloc(count * sizeof(xcb_intern_atom_cookie_t));
  for(i = 0; i < count; ++i) {
    cookies[i] = xcb_intern_atom(connection, 0, strlen(names[i]), names[i]);
  }
  for(i = 0; i < count; ++i) {
    xcb_intern_atom_reply_t *r;
    r = xcb_intern_atom_reply(connection, cookies[i], 0);
    if(r)
      atoms[i] = r->atom;
    free(r);
  }
  free(atoms);
  free(cookies);
  xcb_disconnect(connection);
  return 0;
}
