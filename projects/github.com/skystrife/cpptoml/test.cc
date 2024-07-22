#include "cpptoml.h"
#include <iostream>

int main() {
    auto tea = cpptoml::parse_file("pkgx.toml");
    auto s = tea->get_as<std::string>("str");

    if (s) {
        std::cout << *s << std::endl;
        return 0;
    }

    return 1;
}