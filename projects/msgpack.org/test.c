#include <msgpack.h>
#include <stdio.h>

int main(void)
{
    msgpack_sbuffer* buffer = msgpack_sbuffer_new();
    msgpack_packer* pk = msgpack_packer_new(buffer, msgpack_sbuffer_write);
    msgpack_pack_int(pk, 1);
    msgpack_pack_int(pk, 2);
    msgpack_pack_int(pk, 3);

    /* deserializes these objects using msgpack_unpacker. */
    msgpack_unpacker pac;
    msgpack_unpacker_init(&pac, MSGPACK_UNPACKER_INIT_BUFFER_SIZE);

    /* feeds the buffer. */
    msgpack_unpacker_reserve_buffer(&pac, buffer->size);
    memcpy(msgpack_unpacker_buffer(&pac), buffer->data, buffer->size);
    msgpack_unpacker_buffer_consumed(&pac, buffer->size);

    /* now starts streaming deserialization. */
    msgpack_unpacked result;
    msgpack_unpacked_init(&result);

    while(msgpack_unpacker_next(&pac, &result)) {
        msgpack_object_print(stdout, result.data);
        puts("");
    }
}