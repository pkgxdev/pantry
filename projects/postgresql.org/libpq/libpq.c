#include <stdlib.h>
#include <stdio.h>
#include <libpq-fe.h>

int main()
{
    const char *conninfo;
    PGconn     *conn;

    conninfo = "dbname = postgres";

    conn = PQconnectdb(conninfo);

    if (PQstatus(conn) != CONNECTION_OK) // This should always fail
    {
        printf("Connection to database attempted and failed");
        PQfinish(conn);
        exit(0);
    }

    return 0;
}
