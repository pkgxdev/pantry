#include <double-conversion/double-conversion.h>

int main() {
    double x = StringToDoubleConverter::StringToDouble("1 2 3 4")
    double y = 1234.0
    
    if (x == y)
    {
        return 0;
    }    
    return 1;
}