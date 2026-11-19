#!/usr/bin/env bash
# frames.sh — turn a short video (AI-generated or filmed) into a scroll-scrub
# image sequence: numbered WebP frames + a phone-size set + a manifest.
#
# Usage: frames.sh <video> <out-dir> [fps=24] [width=1920] [quality=72]
#   frames.sh hero.mp4 public/frames/hero 24 1920
#
# Output:
#   <out-dir>/desktop/0001.webp ...   (width px wide)
#   <out-dir>/mobile/0001.webp ...    (half width, for phones)
#   <out-dir>/manifest.json           {"count":N,"fps":..,"desktop":"…/%04d.webp",...}
#
# Rules of thumb: 3–6 s of video, 90–180 frames, keep each desktop frame <80 KB.
# Requires ffmpeg (brew install ffmpeg).
set -euo pipefail
in="${1:?video path}"; out="${2:?output dir}"; fps="${3:-24}"; w="${4:-1920}"; q="${5:-72}"
command -v ffmpeg >/dev/null || { echo "ffmpeg not installed (brew install ffmpeg)"; exit 2; }
mkdir -p "$out/desktop" "$out/mobile"
mw=$(( w / 2 ))
ffmpeg -loglevel error -y -i "$in" -vf "fps=$fps,scale=$w:-2:flags=lanczos" -c:v libwebp -quality "$q" -compression_level 6 "$out/desktop/%04d.webp"
ffmpeg -loglevel error -y -i "$in" -vf "fps=$fps,scale=$mw:-2:flags=lanczos" -c:v libwebp -quality "$q" -compression_level 6 "$out/mobile/%04d.webp"
n=$(ls "$out/desktop" | wc -l | tr -d ' ')
kb=$(du -sk "$out/desktop" | cut -f1)
cat > "$out/manifest.json" <<EOF
{"count": $n, "fps": $fps, "desktop": "desktop/%04d.webp", "mobile": "mobile/%04d.webp", "desktopKB": $kb}
EOF
echo "✓ $n frames → $out (desktop set ${kb}KB, avg $(( kb / (n>0?n:1) ))KB/frame)"
[ "$n" -gt 200 ] && echo "⚠ $n frames is a lot — lower fps or trim the clip (aim 90–180)."
[ $(( kb / (n>0?n:1) )) -gt 90 ] && echo "⚠ frames are heavy — lower quality (arg 5) or width (arg 4)."
exit 0
