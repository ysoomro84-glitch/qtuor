#!/bin/bash
cd /home/z/my-project/qtuor/.next/standalone/qtuor
export HOSTNAME=0.0.0.0
export PORT=3000
while true; do
  NODE_ENV=production NODE_OPTIONS="--max-old-space-size=512" node server.js
  echo "[watcher] Server crashed at $(date), restarting in 3s..."
  sleep 3
done
