program hello
use mpi_f08
integer rank, size, tag, status(MPI_STATUS_SIZE)
call MPI_INIT()
call MPI_COMM_SIZE(MPI_COMM_WORLD, size)
call MPI_COMM_RANK(MPI_COMM_WORLD, rank)
print*, 'node', rank, ': Hello Fortran world'
call MPI_FINALIZE()
end