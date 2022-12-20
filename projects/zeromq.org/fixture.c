#include <assert.h>
#include <zmq.h>
int main() {
  zmq_msg_t query;
  assert(0 == zmq_msg_init_size(&query, 1));
  return 0;
}
