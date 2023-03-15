#include <X11/Xlib.h>
#include <stdio.h>
int main() {
  Display* disp = XOpenDisplay(NULL);
  if (disp == NULL)
  {
    fprintf(stderr, "Unable to connect to display\\n");
    return 0;
  }
  int screen_num = DefaultScreen(disp);
  unsigned long background = BlackPixel(disp, screen_num);
  unsigned long border = WhitePixel(disp, screen_num);
  int width = 60, height = 40;
  Window win = XCreateSimpleWindow(disp, DefaultRootWindow(disp), 0, 0, width, height, 2, border, background);
  XSelectInput(disp, win, ButtonPressMask|StructureNotifyMask);
  XMapWindow(disp, win); // display blank window
  XGCValues values;
  values.foreground = WhitePixel(disp, screen_num);
  values.line_width = 1;
  values.line_style = LineSolid;
  GC pen = XCreateGC(disp, win, GCForeground|GCLineWidth|GCLineStyle, &values);
  // draw two diagonal lines
  XDrawLine(disp, win, pen, 0, 0, width, height);
  XDrawLine(disp, win, pen, width, 0, 0, height);
  return 0;
}
