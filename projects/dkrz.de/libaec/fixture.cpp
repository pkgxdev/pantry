#include <cassert>
#include <cstddef>
#include <cstdlib>
#include <libaec.h>
int main() {
    unsigned char * data = (unsigned char *) calloc(1024, sizeof(unsigned char));
    unsigned char * compressed = (unsigned char *) calloc(1024, sizeof(unsigned char));
    for(int i = 0; i < 1024; i++) { data[i] = (unsigned char)(i); }
    struct aec_stream strm;
    strm.bits_per_sample = 16;
    strm.block_size      = 64;
    strm.rsi             = 129;
    strm.flags           = AEC_DATA_PREPROCESS | AEC_DATA_MSB;
    strm.next_in         = data;
    strm.avail_in        = 1024;
    strm.next_out        = compressed;
    strm.avail_out       = 1024;
    assert(aec_encode_init(&strm) == 0);
    assert(aec_encode(&strm, AEC_FLUSH) == 0);
    assert(strm.total_out > 0);
    assert(aec_encode_end(&strm) == 0);
    free(data);
    free(compressed);
    return 0;
}