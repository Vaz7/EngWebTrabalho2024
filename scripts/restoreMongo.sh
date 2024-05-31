#!/bin/bash

# Check if the dump directory exists and is not empty
if [ "$(ls -A /dump/acordaos)" ]; then
  echo "Dump directory is not empty. Restoring database..."

  echo "Processing directory /dump/acordaos"


  # Temporary directory for concatenated BSON files
  TEMP_BSON_DIR="/dump/acordaos_temp"
  mkdir -p "$TEMP_BSON_DIR"

  # Use an associative array to track the base names of collections
  declare -A collections

  # Iterate over all parts
  for collection_part in /dump/acordaos/*_part_*.bson; do
    collection_name=$(basename "$collection_part" | cut -d'_' -f1)
    
    # Check if we have seen this collection name before
    if [ -z "${collections[$collection_name]}" ]; then
      # If not, initialize the entry with an empty string
      collections[$collection_name]=""
    fi
  done

  # Concatenate the parts back into a single .bson file for each collection
  for collection_name in "${!collections[@]}"; do
    echo "Concatenating $collection_name"
    cat "/dump/acordaos/${collection_name}_part_"*.bson > "$TEMP_BSON_DIR/$collection_name.bson"
  done

  # Verify that all .bson files have been created
  for collection_name in "${!collections[@]}"; do
    if [ ! -f "$TEMP_BSON_DIR/$collection_name.bson" ]; then
      echo "Error: Failed to create $TEMP_BSON_DIR/$collection_name.bson"
      exit 1
    fi
  done

  # Restore the database from the temporary directory
  echo "Restoring MongoDB!"
  mongorestore --db acordaos --drop "$TEMP_BSON_DIR"

  # Verify the restore process
  if [ $? -ne 0 ]; then
    echo "Error: mongorestore failed"
    exit 1
  fi

  echo "Database restored, cleaning up!"
  # Clean up concatenated files after restore
  rm -rf "$TEMP_BSON_DIR"

  echo "Database restored from dump to acordaos"
else
  echo "Dump directory is empty. No data to restore."
fi
