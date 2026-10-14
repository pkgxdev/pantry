#include <mad.h>

int main(void) {
    struct mad_stream stream;
    mad_stream_init(&stream);
    mad_stream_finish(&stream);
    return 0;
}
