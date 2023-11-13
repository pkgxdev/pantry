#include <libsoup/soup.h>

int main(int argc, char *argv[]) {
    SoupMessage *msg = soup_message_new(SOUP_METHOD_GET, "https://brew.sh");
    SoupSession *session = soup_session_new();
    GError *error = NULL;
    GBytes *bytes = soup_session_send_and_read(session, msg, NULL, &error); // blocks

    if(error) {
        g_error_free(error);
        return 1;
    }

    g_object_unref(msg);
    g_object_unref(session);
    return 0;
}