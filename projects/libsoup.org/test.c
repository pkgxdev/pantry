#include <libsoup/soup.h>

static gboolean
accept_certificate_callback(SoupMessage *msg, GTlsCertificate *certificate,
                            GTlsCertificateFlags tls_errors, gpointer user_data)
{
    // Here you can inspect @certificate or compare it against a trusted one
    // and you can see what is considered invalid by @tls_errors.
    // Returning TRUE trusts it anyway.
    return TRUE;
}
int main(int argc, char *argv[])
{
    SoupMessage *msg = soup_message_new(SOUP_METHOD_GET, "https://tea.xyz/");
    SoupSession *session = soup_session_new();
    g_signal_connect(msg, "accept-certificate", G_CALLBACK(accept_certificate_callback), NULL);
    GInputStream *in_stream = soup_session_send(session, msg, NULL, NULL);

    if (in_stream)
    {
        g_object_unref(in_stream);
    }

    return 0;
}
