#include <eden/common/utils/ProcessInfo.h>
#include <cstdlib>
#include <iostream>

using namespace facebook::eden;

int main(int argc, char **argv) {
  if (argc <= 1) return 1;
  int pid = std::atoi(argv[1]);
  std::cout << readProcessName(pid) << std::endl;
  return 0;
}