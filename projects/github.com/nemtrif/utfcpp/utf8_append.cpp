#include <utf8.h>
int main() {
unsigned char u[5] = {0, 0, 0, 0, 0};
utf8::append(0x0448, u);
return (u[0] == 0xd1 && u[1] == 0x88 && u[2] == 0 && u[3] == 0 && u[4] == 0) ? 0 : 1;
}