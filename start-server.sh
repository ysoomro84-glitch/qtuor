#!/bin/bash
cd /home/z/my-project/.next/standalone
while true; do
  NODE_ENV=production NODE_OPTIONS="--max-old-space-size=1024" node server.js
  echo "[watcher] Server crashed at $(date), restarting in 3s..."
  sleep 3
done
