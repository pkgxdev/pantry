#include <epoxy/gl.h>
#ifdef OS_MAC
#include <OpenGL/CGLContext.h>
#include <OpenGL/CGLTypes.h>
#include <OpenGL/OpenGL.h>
#endif
int main()
{
    #ifdef OS_MAC
    CGLPixelFormatAttribute attribs[] = {0};
    CGLPixelFormatObj pix;
    int npix;
    CGLContextObj ctx;

    CGLChoosePixelFormat( attribs, &pix, &npix );
    CGLCreateContext(pix, (void*)0, &ctx);
    #endif

    glClear(GL_COLOR_BUFFER_BIT);
    #ifdef OS_MAC
    CGLReleasePixelFormat(pix);
    CGLReleaseContext(pix);
    #endif
    return 0;
}