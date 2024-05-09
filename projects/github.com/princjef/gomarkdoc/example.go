// Package example will show you the power of gomarkdoc.
package example

// Example is just magical.
type Example struct {
	// Foo is an int.
	Foo int

	// Bar is a string.
	Bar string
}

// New creates an instance of Example with sensible default values.
func New() *Example {
	return &Example{
		Foo: 42,
		Bar: "Baz",
	}
}
