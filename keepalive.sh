#!/bin/bash
while true; do
  # If server is down, restart it
  if ! curl -s -o /dev/null --max-time 5 http://localhost:3000 > /dev/null 2>&1; then
    echo "[$(date)] Server down, restarting..."
    cd /home/z/my-project/qtuor/.next/standalone/qtuor
    env NODE_ENV=production NODE_OPTIONS="--max-old-space-size=512" nohup node server.js > /tmp/qtuor-server.log 2>&1 &
    cd /home/z/my-project/qtuor
    sleep 5
    echo "[$(date)] Server restarted, PID: $(lsof -ti :3000 2>/dev/null)"
  fi
  # Gentle ping to prevent idle
  curl -s -o /dev/null --max-time 5 http://localhost:3000 > /dev/null 2>&1
  sleep 30
done
