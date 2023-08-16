#include <vulkan/vulkan_core.h>
int main() {
    uint32_t version;
    vkEnumerateInstanceVersion(&version);
    return (version >= VK_API_VERSION_1_1) ? 0 : 1;
}