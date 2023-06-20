#include <json/json.h>
int main() {
    Json::Value root;
    Json::CharReaderBuilder builder;
    std::string errs;
    std::istringstream stream1;
    stream1.str("[1, 2, 3]");
    return Json::parseFromStream(builder, stream1, &root, &errs) ? 0: 1;
}