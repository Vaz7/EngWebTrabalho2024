#!/bin/bash

# Ensure the dump directory exists one level up from the current directory
mkdir -p ../dump/acordaos

# Run the mongodump command inside the container with a bind mount to the host directory
docker run --rm -v $(pwd)/../dump:/dump --network container:mongodb_container mongo \
    sh -c "mongodump --db acordaos --out /dump"

# Navigate to the database dump directory
cd ../dump/acordaos

# Split each BSON file into 40MB chunks
for file in *.bson; do
  base_name=$(basename "$file" .bson)
  split -b 40m "$file" "${base_name}_part_"
  rm "$file"  # Remove the original file after splitting

  # Rename the parts to add .bson extension
  for part in ${base_name}_part_*; do
    mv "$part" "${part}.bson"
  done
done

echo "Database dump completed, split into 40MB files, and saved to ../dump"
