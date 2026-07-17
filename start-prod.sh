#!/bin/bash
cd /home/z/my-project/qtuor
export NODE_OPTIONS="--max-old-space-size=512"
exec npx next start -p 3000
