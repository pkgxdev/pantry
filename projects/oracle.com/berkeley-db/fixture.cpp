#include <assert.h>
#include <string.h>
#include <db_cxx.h>
int main() {
  Db db(NULL, 0);
  assert(db.open(NULL, "test.db", NULL, DB_BTREE, DB_CREATE, 0) == 0);
  const char *project = "Homebrew";
  const char *stored_description = "The missing package manager for macOS";
  Dbt key(const_cast<char *>(project), strlen(project) + 1);
  Dbt stored_data(const_cast<char *>(stored_description), strlen(stored_description) + 1);
  assert(db.put(NULL, &key, &stored_data, DB_NOOVERWRITE) == 0);
  Dbt returned_data;
  assert(db.get(NULL, &key, &returned_data, 0) == 0);
  assert(strcmp(stored_description, (const char *)(returned_data.get_data())) == 0);
  assert(db.close(0) == 0);
}
