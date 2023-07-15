use hdf5
integer(hid_t) :: f, dspace, dset
integer(hsize_t), dimension(2) :: dims = [2, 2]
integer :: error = 0, major, minor, rel

call h5open_f (error)
if (error /= 0) call abort
call h5fcreate_f ("test.h5", H5F_ACC_TRUNC_F, f, error)
if (error /= 0) call abort
call h5screate_simple_f (2, dims, dspace, error)
if (error /= 0) call abort
call h5dcreate_f (f, "data", H5T_NATIVE_INTEGER, dspace, dset, error)
if (error /= 0) call abort
call h5dclose_f (dset, error)
if (error /= 0) call abort
call h5sclose_f (dspace, error)
if (error /= 0) call abort
call h5fclose_f (f, error)
if (error /= 0) call abort
call h5close_f (error)
if (error /= 0) call abort
CALL h5get_libversion_f (major, minor, rel, error)
if (error /= 0) call abort
write (*,"(I0,'.',I0,'.',I0)") major, minor, rel
end