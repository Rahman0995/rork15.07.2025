#!/bin/bash

echo "🔧 Fixing file watcher limits..."

# Increase file watcher limit temporarily
echo "Setting fs.inotify.max_user_watches to 524288"
echo 524288 | sudo tee /proc/sys/fs/inotify/max_user_watches

# Make it permanent
echo "Making the change permanent..."
echo "fs.inotify.max_user_watches=524288" | sudo tee -a /etc/sysctl.conf

echo "✅ File watcher limits increased!"
echo "Current limit: $(cat /proc/sys/fs/inotify/max_user_watches)"