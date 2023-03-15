CHAR   [a-z][A-Z]
%%
{CHAR}+      printf("%s", yytext);
[ \t\n]+   printf("\n");
%%
int main()
{
  yyin = stdin;
  yylex();
}
