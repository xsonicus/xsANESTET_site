#!/bin/sh
set -eu

backup_root=/var/backups/anestet
stamp=$(date -u +%Y%m%dT%H%M%SZ)
archive="$backup_root/anestet-data-$stamp.tar.gz"
list_file=$(mktemp)
trap 'rm -f "$list_file"' EXIT HUP INT TERM

install -d -o root -g root -m 0700 "$backup_root"
for name in catalog.json admin-audit.jsonl orders.jsonl callbacks.jsonl; do
  if [ -f "/var/lib/anestet/$name" ]; then
    printf '%s\n' "var/lib/anestet/$name" >> "$list_file"
  fi
done
for path in \
  etc/anestet/admin-api.env \
  etc/anestet/order-api.env \
  etc/nginx/sites-available/anestet.139-180-214-133.sslip.io \
  etc/systemd/system/anestet-admin-api.service \
  etc/systemd/system/anestet-order-api.service \
  etc/systemd/system/anestet-backup.service \
  etc/systemd/system/anestet-backup.timer; do
  if [ -f "/$path" ]; then
    printf '%s\n' "$path" >> "$list_file"
  fi
done

if [ ! -s "$list_file" ]; then
  echo "No ANESTET data files found; backup skipped." >&2
  exit 0
fi

tar -C / -czf "$archive.tmp" -T "$list_file"
chmod 0600 "$archive.tmp"
mv "$archive.tmp" "$archive"
find "$backup_root" -type f -name 'anestet-data-*.tar.gz' -mtime +30 -delete
echo "$archive"
