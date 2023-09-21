# Check that Itcl and Itk load, and that we can define, instantiate,
# and query the properties of a widget.

# If anything errors, just exit
catch {
    package require Itcl
    package require Itk

    # Define class
    itcl::class TestClass {
        inherit itk::Toplevel
        constructor {args} {
            itk_component add bye {
                button $itk_interior.bye -text "Bye"
            }
            eval itk_initialize $args
        }
    }

    # Create an instance
    set testobj [TestClass .#auto]

    # Check the widget has a bye component with text property "Bye"
    if {[[$testobj component bye] cget -text]=="Bye"} {
        puts "OK"
    }
}
exit