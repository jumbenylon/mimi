#!/bin/bash
BACKUP_DIR="backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
FILENAME="mimi_v1.0_GOLD_MASTER_$TIMESTAMP.tar.gz"

# Create backup folder if not exists
mkdir -p $BACKUP_DIR

echo "📦 Zipping Project (Skipping junk files)..."

# Create the zip file, excluding heavy/temp folders
tar --exclude='node_modules' \
    --exclude='.next' \
    --exclude='__pycache__' \
    --exclude='.git' \
    --exclude='.DS_Store' \
    --exclude='venv' \
    -czf "$BACKUP_DIR/$FILENAME" client server

echo "✅ BACKUP COMPLETE!"
echo "📍 Location: $BACKUP_DIR/$FILENAME"
