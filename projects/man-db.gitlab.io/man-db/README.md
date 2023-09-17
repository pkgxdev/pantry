man-db does not know about Xcode's manpages by default. You may want to add them to your MANPATH. Obtain the complete list of Xcode man directories with:

find $(xcode-select -p) -type d | /usr/bin/grep '/usr/share/man$' | /usr/bin/tr -s '\n' ':'; echo