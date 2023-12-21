! example.f90
subroutine add_numbers(a, b, c)
    real, intent(in) :: a, b
    real, intent(out) :: c
    c = a + b
end subroutine add_numbers