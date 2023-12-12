#include <libsecret/secret.h>

const SecretSchema * example_get_schema (void) G_GNUC_CONST;

const SecretSchema *
example_get_schema (void)
{
    static const SecretSchema the_schema = {
        "org.example.Password", SECRET_SCHEMA_NONE,
        {
            {  "number", SECRET_SCHEMA_ATTRIBUTE_INTEGER },
            {  "string", SECRET_SCHEMA_ATTRIBUTE_STRING },
            {  "even", SECRET_SCHEMA_ATTRIBUTE_BOOLEAN },
            {  "NULL", 0 },
        }
    };
    return &the_schema;
}

int main()
{
    example_get_schema();
    return 0;
}