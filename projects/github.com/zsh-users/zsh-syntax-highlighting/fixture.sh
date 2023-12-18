#!/bin/bash

# Receive the directory as the first command-line argument
directory="$1"

# Check if the directory is provided
if [ -z "$directory" ]; then
  echo "Directory parameter is missing."
  exit 1
fi

# Change to the specified directory
cd "$directory" || { echo "Failed to change to the specified directory."; exit 1; }

# Run the test & read the lines
output=$(zsh tests/test-highlighting.zsh main)
lines=()
while IFS= read -r line; do
  lines+=("$line")
done <<< "$output"

# If line has 'not ok', with no '#TODO' --> fail & exit
for line in "${lines[@]}"; do
  if [[ $line =~ ^(.*\bnot ok\b)(.*)$ && ! $line =~ "#TODO" ]]; then
    echo "Fail"
    exit 1
  fi
done

echo "Pass"
