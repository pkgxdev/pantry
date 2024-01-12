#include "fb303/thrift/gen-cpp2/BaseService.h"
#include <iostream>
int main() {
    auto service = facebook::fb303::cpp2::BaseServiceSvIf();
    std::cout << service.getGeneratedName() << std::endl;
    return 0;
}