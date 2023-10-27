#include <X11/Xlib.h>
#include <X11/extensions/applewm.h>
#include <stdio.h>

int main(void)
{
    Display *disp = XOpenDisplay(NULL);
    if (disp == NULL)
    {
        fprintf(stderr, "Unable to connect to display\\n");
        return 0;
    }

    XAppleWMSetFrontProcess(disp);
    return 0;
}