#!/bin/bash
set -e

# Start MongoDB
mongod --bind_ip_all --fork --logpath /var/log/mongodb.log

# Check if the database is already initialized
if [ ! -f /data/db/.initialized ]; then
  echo "Initializing the database..."
  /scripts/restoreMongo.sh
  touch /data/db/.initialized
else
  echo "Database already initialized. Skipping restore."
fi

# Keep the container running
tail -f /dev/null
