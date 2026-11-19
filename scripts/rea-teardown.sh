#!/usr/bin/env bash
# rea-teardown.sh — deep, evidence-grade teardown of a reference website using REA's
# browser engine (github.com/morluto/rea, MIT). Use it when scripts/teardown.mjs can't
# tell how something is built (obfuscated bundles, custom shaders, odd scroll engines).
#
# Usage: rea-teardown.sh <url> [out-dir=./reference/rea-<host>] [observe-ms=4000]
#
# What it does:
#   1. starts a throwaway headless Chrome with a loopback DevTools port (temp profile,
#      none of your cookies or logins)
#   2. rea inspect-web-page   → capture.json   (DOM, accessibility, scripts + sources,
#                                               network, console, workers)
#   3. rea analyze-web-bundle → bundle.json    (chunk graph, vendor fingerprints,
#                                               endpoints, routes)
#   4. rea export-web-scripts → scripts/       (every retained script on disk, + manifest,
#                                               ready to grep for shaders, easing, timelines)
#   5. rea capture-web-screenshot → screenshot.png
#
# REA runs from npx at a pinned version on its own Node 24 (no global install, and your
# system Node is left alone). First run downloads ~100 MB into the npx cache.
# Needs: Node/npx, python3, and Google Chrome or Playwright's Chromium.
set -euo pipefail

REA_VERSION="${REA_VERSION:-6.9.0}"
NODE_FOR_REA="${NODE_FOR_REA:-24.22.1}"
url="${1:?usage: rea-teardown.sh <url> [out-dir] [observe-ms]}"
host=$(python3 -c 'import sys,urllib.parse;print(urllib.parse.urlparse(sys.argv[1]).hostname.removeprefix("www."))' "$url")
out="${2:-./reference/rea-$host}"
observe="${3:-4000}"
mkdir -p "$out"; out=$(cd "$out" && pwd)

rea() { npx -y -p "node@$NODE_FOR_REA" -p "rea-agents@$REA_VERSION" -- rea "$@" 2> >(grep -v "npm warn" >&2); }

# --- find a Chrome
chrome=""
for c in "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
         "/Applications/Chromium.app/Contents/MacOS/Chromium" \
         "$(command -v google-chrome 2>/dev/null || true)" "$(command -v chromium 2>/dev/null || true)" \
         $(ls -d "$HOME"/Library/Caches/ms-playwright/chromium_headless_shell-*/chrome-*/*headless_shell "$HOME"/.cache/ms-playwright/chromium_headless_shell-*/chrome-*/*headless_shell 2>/dev/null | sort -r); do
  [ -n "$c" ] && [ -x "$c" ] && { chrome="$c"; break; }
done
[ -z "$chrome" ] && { echo "No Chrome found. Install Google Chrome, or: npx playwright install chromium"; exit 2; }

# --- throwaway browser on a free loopback port
port=$(python3 -c 'import socket;s=socket.socket();s.bind(("127.0.0.1",0));print(s.getsockname()[1])')
profile=$(mktemp -d "${TMPDIR:-/tmp}/rea-profile.XXXXXX")
"$chrome" --headless=new --remote-debugging-port="$port" --remote-debugging-address=127.0.0.1 \
  --user-data-dir="$profile" --no-first-run --no-default-browser-check \
  --window-size=1440,900 --use-gl=angle --enable-webgl --ignore-gpu-blocklist "$url" >/dev/null 2>&1 &
cpid=$!
cleanup() { kill "$cpid" 2>/dev/null || true; wait "$cpid" 2>/dev/null || true; sleep 0.5; rm -rf "$profile" 2>/dev/null || true; }
trap cleanup EXIT

ep="http://127.0.0.1:$port"
for _ in $(seq 1 50); do curl -sf "$ep/json/version" >/dev/null && break; sleep 0.2; done
sleep 3 # let the page load and its intro animation start

target=$(curl -sf "$ep/json/list" | python3 -c 'import sys,json
t=[x for x in json.load(sys.stdin) if x.get("type")=="page"]
print(t[0]["id"] if t else "")')
[ -z "$target" ] && { echo "No page target found on $ep"; exit 1; }
echo "• browser $ep  target $target"

echo "• inspect-web-page (${observe} ms)…"
rea inspect-web-page "$ep" "$target" --observation-ms "$observe" \
  --include-script-sources --include-console-text --include-accessibility-text \
  --format json > "$out/capture.json"

echo "• analyze-web-bundle…"
rea analyze-web-bundle "$ep" "$target" --observation-ms 1500 \
  --format json > "$out/bundle.json" || echo "  (bundle analysis incomplete — see bundle.json)"

echo "• export-web-scripts…"
rm -rf "$out/scripts"
rea export-web-scripts "$out/capture.json" "$out/scripts" --format json > "$out/scripts-manifest.json" \
  || echo "  (no retained scripts to export)"

echo "• capture-web-screenshot…"
rea capture-web-screenshot "$ep" "$target" --format json > "$out/screenshot.json" || true
python3 -c 'import json,sys,base64
d=json.load(open(sys.argv[1])); b=d.get("normalized_result",{}).get("artifact",{}).get("data_base64")
b and open(sys.argv[2],"wb").write(base64.b64decode(b))' "$out/screenshot.json" "$out/screenshot.png" 2>/dev/null || true

# --- quick human summary from the evidence
python3 - "$out" <<'PY'
import json, os, re, sys
out = sys.argv[1]
def load(n):
    try: return json.load(open(os.path.join(out, n)))
    except Exception: return None
text = ""
for n in ("capture.json", "bundle.json"):
    p = os.path.join(out, n)
    if os.path.exists(p): text += open(p, errors="ignore").read()
sd = os.path.join(out, "scripts")
for root, _, files in os.walk(sd):
    for f in files:
        if f.endswith((".js", ".mjs")):
            try: text += open(os.path.join(root, f), errors="ignore").read()
            except Exception: pass
sig = {
 "GSAP": r"gsap\.(to|from|timeline)|GreenSockGlobals", "ScrollTrigger": r"ScrollTrigger", "SplitText": r"SplitText",
 "Lenis": r"\blenis\b", "three.js": r"WebGLRenderer|PerspectiveCamera", "React Three Fiber": r"@react-three/fiber|__r3f",
 "raw WebGL2": r"getContext\(\\?[\"']webgl2", "custom shaders": r"gl_FragColor|precision (highp|mediump) float",
 "Spline": r"splinetool", "Unicorn Studio": r"unicornstudio", "Framer Motion": r"framer-motion|motion/react",
 "Lottie": r"lottie|bodymovin", "Rive": r"@rive-app", "Next.js": r"_next/static", "Astro": r"astro-island|_astro/",
}
found = [k for k, r in sig.items() if re.search(r, text)]
uni = sorted(set(re.findall(r"uniform\s+\w+\s+(u[A-Z]\w*)", text)))[:40]
eases = sorted(set(re.findall(r"ease\s*:\s*[\"']([\w.()-]+)[\"']", text)))[:20]
scrub = sorted(set(re.findall(r"scrub\s*:\s*([\d.]+|true)", text)))
nscripts = sum(len(f) for _, _, f in os.walk(sd)) if os.path.isdir(sd) else 0
b = (load("bundle.json") or {}).get("normalized_result", {})
vend = sorted({f"{i['value']} ({i.get('confidence','?')})" for i in b.get("inferences", []) if i.get("kind") == "vendor_fingerprint"})
nunk = len(b.get("unknowns", []) or [])
md = f"""# REA teardown

_Evidence from REA {os.environ.get('REA_VERSION','6.9.0')} via scripts/rea-teardown.sh. Files: capture.json (page),
bundle.json (bundle analysis: chunks, vendor fingerprints, endpoints), scripts/ (exported sources), screenshot.png._

- REA vendor fingerprints (observed): {', '.join(vend) or '—'}
- Pattern matches in sources (inference): {', '.join(found) or 'none'}
- REA-reported unknowns: {nunk} (see bundle.json → normalized_result.unknowns)
- Scripts exported: {nscripts}
- Shader uniforms: {', '.join(uni) or '—'}
- GSAP eases: {', '.join(eases) or '—'}
- Scrub values: {', '.join(scrub) or '—'}

Next: grep scripts/ for the effect you care about (e.g. `grep -rn "uniform\\|ScrollTrigger.create" scripts`),
then write OBSERVED → INFERENCE → DECISION in BUILD_NOTES.md. Learn the technique; don't copy the code.
"""
open(os.path.join(out, "REA-TEARDOWN.md"), "w").write(md)
print(md)
PY
echo "✓ REA evidence in $out"
