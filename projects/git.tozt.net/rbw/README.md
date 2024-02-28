# rbw

This is an unofficial command line client for Bitwarden.
Although it does come with its own command line client,
this client is limited by being stateless - to use it,
you're required to manually lock and unlock the client,
and pass the temporary keys around in environment variables,
which makes it very difficult to use.
This client avoids this problem by maintaining a background
process which is able to hold the keys in memory, similar
to the way that ssh-agent or gpg-agent work.
This allows the client to be used in a much simpler way,
with the background agent taking care of maintaining the necessary state.
