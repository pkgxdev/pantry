# Maskfile for testing

## echo

> This is the echo test

~~~sh
echo "Hello, World!"
~~~

## echoi (input)

> This is the echo test with input

~~~sh
echo "Hello, $input!"
~~~

## echoo [input]

> This is the echo test with optional input

~~~sh
if [ -z "$input" ]; then
  echo "Hello, World!"
else
  echo "Hello, $input!"
fi
~~~

## options

> This is the options test

**OPTIONS**
* input
  * flags: -i --input
  * type: string
  * desc: Input for the test

~~~sh
if [ -z "$input" ]; then
  echo "Hello, World!"
else
  echo "Hello, $input!"
fi
~~~

## nested

> This is the nested test

### echos

> This is an echo sub-command

~~~sh
echo "Hello, World!"
~~~

## node

> This is the node test

~~~js
console.log("Hello, World!");
~~~

## python

> This is the python test

~~~python
print("Hello, World!")
~~~

## ruby

> This is the ruby test

~~~ruby
puts "Hello, World!"
~~~

## php

> This is the php test

~~~php
echo "Hello, World!";
~~~

## self-call

> This is the self-call test

~~~sh
$MASK test1
~~~
