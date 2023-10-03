#include <GLUT/glut.h>
#include <gl2ps.h>

int main(int argc, char *argv[])
{
    glutInit(&argc, argv);
    glutInitDisplayMode(GLUT_DEPTH);
    glutInitWindowSize(400, 400);
    glutInitWindowPosition(100, 100);
    glutCreateWindow(argv[0]);
    GLint viewport[4];
    glGetIntegerv(GL_VIEWPORT, viewport);
    FILE *fp = fopen("test.eps", "wb");
    GLint buffsize = 0, state = GL2PS_OVERFLOW;
    while( state == GL2PS_OVERFLOW ){
        buffsize += 1024*1024;
        gl2psBeginPage ( "Test", "Tea", viewport,
                        GL2PS_EPS, GL2PS_BSP_SORT, GL2PS_SILENT |
                        GL2PS_SIMPLE_LINE_OFFSET | GL2PS_NO_BLENDING |
                        GL2PS_OCCLUSION_CULL | GL2PS_BEST_ROOT,
                        GL_RGBA, 0, NULL, 0, 0, 0, buffsize,
                        fp, "test.eps" );
        gl2psText("Tea Test", "Courier", 12);
        state = gl2psEndPage();
}
fclose(fp);
return 0;
}