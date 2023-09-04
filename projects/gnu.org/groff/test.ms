.\" Sample groff input file
.\" This is a comment
.
.TH MySampleDocument "1" "August 2023" "Sample Document"
.SH NAME
MySampleDocument \- An example groff document
.SH DESCRIPTION
This is a sample groff document.
.PP
It demonstrates basic formatting using the groff typesetting system.
.PP
This is a new paragraph.
.SH EXAMPLES
Here are some examples of how to use groff:
.B
groff -Tps mydoc.groff > mydoc.ps
.I
groff -Thtml mydoc.groff > mydoc.html
.SH AUTHOR
John Doe (johndoe@example.com)
.SH SEE ALSO
man(1), groff(7)