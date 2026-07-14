#!/bin/bash
while true; do
  # If server is down, restart it
  if ! curl -s -o /dev/null --max-time 5 http://localhost:3000 > /dev/null 2>&1; then
    cd /home/z/my-project/.next/standalone
    nohup env NODE_ENV=production NODE_OPTIONS="--max-old-space-size=3072" node server.js > /home/z/my-project/dev.log 2>&1 &
    cd /home/z/my-project
    sleep 5
  fi
  # Gentle ping to prevent idle
  curl -s -o /dev/null --max-time 5 http://localhost:3000 > /dev/null 2>&1
  sleep 30
done
