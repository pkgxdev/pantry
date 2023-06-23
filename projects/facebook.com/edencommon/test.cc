#include <eden/common/utils/ProcessNameCache.h>
#include <cstdlib>
#include <iostream>

using namespace facebook::eden;
      
ProcessNameCache& getProcessNameCache() {
  static auto* pnc = new ProcessNameCache;
  return *pnc;
}

ProcessNameHandle lookupProcessName(pid_t pid) {
  return getProcessNameCache().lookup(pid);
}

int main() {
int pid = getpid();
std::cout << lookupProcessName(pid).get() << std::endl;
  return 0;
}