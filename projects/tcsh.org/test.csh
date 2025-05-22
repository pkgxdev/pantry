#!/usr/bin/env -S tcsh -f

set ARRAY=( "t" "e" "s" "t" )
foreach i ( `seq $#ARRAY` )
  echo -n $ARRAY[$i]
end