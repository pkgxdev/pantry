%{ #include <iostream>
    using namespace std;
    extern void yyerror (char *s);
    extern int yylex ();
%}
%start prog
%%
prog:  //  empty
    |  prog expr '\n' { cout << "pass"; exit(0); }
    ;
expr: '(' ')'
    | '(' expr ')'
    |  expr expr
    ;
%%
char c;
void yyerror (char *s) { cout << "fail"; exit(0); }
int yylex () { cin.get(c); return c; }
int main() { yyparse(); }
