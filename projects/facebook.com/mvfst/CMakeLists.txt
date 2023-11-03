cmake_minimum_required(VERSION 3.20)
project(echo CXX)
set(CMAKE_CXX_STANDARD 17)

list(PREPEND CMAKE_MODULE_PATH "${CMAKE_CURRENT_SOURCE_DIR}/cmake")
find_package(fizz REQUIRED)
find_package(gflags REQUIRED)
find_package(GTest REQUIRED)
find_package(mvfst REQUIRED)

add_executable(echo
    quic/samples/echo/main.cpp
    quic/common/test/TestUtils.cpp
    quic/common/test/TestPacketBuilders.cpp
)
target_link_libraries(echo ${mvfst_LIBRARIES} fizz::fizz_test_support GTest::gmock)
target_include_directories(echo PRIVATE ${CMAKE_CURRENT_SOURCE_DIR})