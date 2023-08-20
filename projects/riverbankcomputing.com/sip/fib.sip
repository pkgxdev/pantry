// Define the SIP wrapper to the (theoretical) fib library.

%Module(name=fib, language="C")

int fib_n(int n);
%MethodCode
    if (a0 <= 0)
    {
        sipRes = 0;
    }
    else
    {
        int a = 0, b = 1, c, i;

        for (i = 2; i <= a0; i++)
        {
            c = a + b;
            a = b;
            b = c;
        }

        sipRes = b;
    }
%End