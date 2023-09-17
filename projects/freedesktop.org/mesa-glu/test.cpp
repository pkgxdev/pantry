#include <GL/glu.h>

int main(int argc, char* argv[]) {
static GLUtriangulatorObj *tobj;
GLdouble vertex[3], dx, dy, len;
int i = 0;
int count = 5;
tobj = gluNewTess();
gluBeginPolygon(tobj);
for (i = 0; i < count; i++) {
    vertex[0] = 1;
    vertex[1] = 2;
    vertex[2] = 0;
    gluTessVertex(tobj, vertex, 0);
}
gluEndPolygon(tobj);
return 0;
}