#include <mpi.h>
#include <stdio.h>

int main() {
  int size, rank, nameLen;
  char name[MPI_MAX_PROCESSOR_NAME];
  MPI_Init(NULL, NULL);
  MPI_Comm_size(MPI_COMM_WORLD, &size);
  MPI_Comm_rank(MPI_COMM_WORLD, &rank);
  MPI_Get_processor_name(name, &nameLen);
  printf("[%d/%d] Hello, world! My name is %s.\\n", rank, size, name);
  MPI_Finalize();
  return 0;
}