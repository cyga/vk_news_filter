#!/bin/bash
f="/tmp/vk_news_filter.zip"
rm -f "$f"
zip -r "$f"  assets LICENSE manifest.json README.md
echo "new file: $f"
