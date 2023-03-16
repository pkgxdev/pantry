%module test
%inline %{
extern int add(int x, int y);
%}