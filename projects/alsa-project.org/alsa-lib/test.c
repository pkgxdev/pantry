#include <alsa/asoundlib.h>
int main(void) {
    snd_ctl_card_info_t *info;
    snd_ctl_card_info_alloca(&info);
    return 0;
}