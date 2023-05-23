#!/bin/bash

# Receive the directory as the first command-line argument
directory="$1"

# Check if the directory is provided
if [ -z "$directory" ]; then
  echo "Directory parameter is missing."
  exit 1
fi

# Change to the specified directory
cd "$directory"

output=$(zsh tests/test-highlighting.zsh main)
lines=()

# Read the lines of the test
while IFS= read -r line; do
  lines+=("$line")
done <<< "$output"

# If line has not ok, with no TODO --> fail
for line in "${lines[@]}"; do
  if [[ $line =~ ^(.*\bnot ok\b)(.*)$ && ! $line =~ "#TODO" ]]; then
    echo "Fail"
    # Exit the loop if a failure is found (optional)
    exit 1
  fi
done

echo "Pass"
