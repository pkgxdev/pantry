#include <iostream>
#include <tbb/blocked_range.h>
#include <tbb/parallel_reduce.h>

int main()
{
auto total = tbb::parallel_reduce(
    tbb::blocked_range<int>(0, 100),
    0.0,
    [&](tbb::blocked_range<int> r, int running_total)
    {
    for (int i=r.begin(); i < r.end(); ++i) {
        running_total += i + 1;
    }

    return running_total;
    }, std::plus<int>()
);

std::cout << total << std::endl;
return 0;
}