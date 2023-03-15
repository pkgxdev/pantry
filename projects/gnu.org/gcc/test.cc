#include <iostream>
struct exception { };
int main()
{
  std::cout << "Hello, world!" << std::endl;
  try { throw exception{}; }
    catch (exception) { }
    catch (...) { }
  return 0;
}