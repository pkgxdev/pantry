#define GLFW_INCLUDE_GLU
#include <GLFW/glfw3.h>
#include <stdlib.h>
int main()
{
    if (!glfwInit())
        exit(EXIT_FAILURE);
    glfwTerminate();
    return 0;
}