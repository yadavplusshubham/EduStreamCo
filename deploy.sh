#!/bin/bash
set -e

VPS_IP="72.60.102.13"
VPS_USER="root"
SSH_KEY="$HOME/.ssh/edustream-deploy"
REMOTE_DIR="/opt/edustream"

echo "==> Syncing code to VPS..."
rsync -avz --exclude='.git' \
  --exclude='frontend/node_modules' \
  --exclude='frontend-next/node_modules' \
  --exclude='frontend-next/.next' \
  --exclude='__pycache__' \
  --exclude='*.pyc' \
  --exclude='.env.local' \
  -e "ssh -i $SSH_KEY -o StrictHostKeyChecking=no" \
  . $VPS_USER@$VPS_IP:$REMOTE_DIR/

echo "==> Deploying on VPS..."
ssh -i $SSH_KEY -o StrictHostKeyChecking=no $VPS_USER@$VPS_IP << 'ENDSSH'
  set -e
  cd /opt/edustream

  # Build and start containers
  docker compose pull mongo 2>/dev/null || true
  docker compose build --no-cache
  docker compose up -d

  # Show status
  echo ""
  echo "==> Container status:"
  docker compose ps

  echo ""
  echo "==> EduStream is live!"
  echo "    Frontend: http://localhost:3010"
  echo "    Backend:  http://localhost:8011"
ENDSSH

echo ""
echo "==> Deploy complete. Add nginx/edustream-site.conf to your Nginx and reload."
