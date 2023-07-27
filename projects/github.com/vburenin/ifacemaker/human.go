package main

type Human struct {
	name string
}

// Returns the name of our Human.
func (h *Human) GetName() string {
	return h.name
}