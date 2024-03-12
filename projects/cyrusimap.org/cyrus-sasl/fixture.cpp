#include <sasl/saslutil.h>
#include <assert.h>
#include <stdio.h>

int main(void) {
	char buf[123] = "\\0";
	unsigned len = 0;
	int ret = sasl_encode64("Hello, world!", 13, buf, sizeof buf, &len);
	assert(ret == SASL_OK);
	printf("%u %s", len, buf);
	return 0;
}