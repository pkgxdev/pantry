#include <openssl/ssl.h>
#include <libwebsockets.h>

int main() {
  struct lws_context_creation_info info;
  memset(&info, 0, sizeof(info));
  struct lws_context *context;
  context = lws_create_context(&info);
  lws_context_destroy(context);
  return 0;
}
