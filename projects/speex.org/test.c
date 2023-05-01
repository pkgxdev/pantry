#include <speex/speex.h>

int main() {
    SpeexBits bits;
    void *enc_state;

    speex_bits_init(&bits);
    enc_state = speex_encoder_init(&speex_nb_mode);

    speex_bits_destroy(&bits);
    speex_encoder_destroy(enc_state);

    return 0;
}