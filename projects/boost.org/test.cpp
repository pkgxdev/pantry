#include <boost/algorithm/string.hpp>
#include <boost/iostreams/device/array.hpp>
#include <boost/iostreams/device/back_inserter.hpp>
#include <boost/iostreams/filter/zstd.hpp>
#include <boost/iostreams/filtering_stream.hpp>
#include <boost/iostreams/stream.hpp>
#include <string>
#include <iostream>
#include <vector>
#include <assert.h>

using namespace boost::algorithm;
using namespace boost::iostreams;
using namespace std;

int main() {
  string str("a,b");
  vector<string> strVec;
  split(strVec, str, is_any_of(","));
  assert(strVec.size()==2);
  assert(strVec[0]=="a");
  assert(strVec[1]=="b");
  // Test boost::iostreams::zstd_compressor() linking
  std::vector<char> v;
  back_insert_device<std::vector<char>> snk{v};
  filtering_ostream os;
  os.push(zstd_compressor());
  os.push(snk);
  os << "Boost" << std::flush;
  os.pop();
  array_source src{v.data(), v.size()};
  filtering_istream is;
  is.push(zstd_decompressor());
  is.push(src);
  std::string s;
  is >> s;
  assert(s == "Boost");
  return 0;
}
