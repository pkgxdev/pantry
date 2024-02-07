#include "kml/regionator/regionator_qid.h"
#include "gtest/gtest.h"

namespace kmlregionator {
    // This class is the unit test fixture for the KmlHandler class.
    class RegionatorQidTest : public testing::Test {
        protected:
        virtual void SetUp() {
        root_ = Qid::CreateRoot();
        }

        Qid root_;
    };

    // This tests the CreateRoot(), depth(), and str() methods of class Qid.
    TEST_F(RegionatorQidTest, TestRoot) {
        ASSERT_EQ(static_cast<size_t>(1), root_.depth());
        ASSERT_EQ(string("q0"), root_.str());
    }
}

int main(int argc, char** argv) {
    testing::InitGoogleTest(&argc, argv);
    return RUN_ALL_TESTS();
}