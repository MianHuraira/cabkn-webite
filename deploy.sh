#!/bin/bash

# Perform git pull and capture the output
echo "Pulling latest changes..."
GIT_OUTPUT=$(git pull)

# Check for "Already up to date" or "Already up-to-date"
if [[ "$GIT_OUTPUT" == *"Already up to date."* || "$GIT_OUTPUT" == *"Already up-to-date."* ]]; then
  echo "No changes. Everything is up to date."
else
  echo "Changes detected. Rebuilding..."

  # Remove cached and node modules
  rm -rf node_modules/ .next/

  # Reinstall packages and rebuild
  npm install --force
  npm run build

  # Restart PM2 process
  pm2 restart ecosystem.config.js
fi

