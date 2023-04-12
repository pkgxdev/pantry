#!/bin/sh

set -e
test -n "$VERBOSE" && set -x

# Initialize variables
MODEL_NAME=""
MODEL_DIR=$1
VERSION=$2

# Default to base
if [[ -z "$MODEL_NAME" ]]; then
  MODEL_NAME="base"
fi

# Function to fetch the model and return its directory
fetch_model() {
  local model_name="$1"

  echo "Fetching Model $model_name"
  
  # Execute the appropriate download script
  bash "$MODEL_DIR/download-ggml-model.sh" "$model_name.en"

  # Return the model directory
  echo "$MODEL_DIR/$model_name.en.bin"
}

# Return the model directory
fetch_model "$MODEL_NAME"
