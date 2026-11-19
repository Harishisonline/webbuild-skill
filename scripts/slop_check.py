#!/usr/bin/env python3
"""
slop_check.py — static "AI slop" + ship-readiness linter for a website build.

Scans HTML / CSS / JS / JSX / TSX / Astro / Vue / Svelte / MDX files under a
directory and reports the tell-tale patterns that make a site look
machine-generated, plus the basics a business site needs before it is pitched.

Usage:
    python3 slop_check.py <site-dir> [--json] [--strict]

Exit code: 0 = clean or warnings only, 1 = at least one FAIL (or any finding with --strict).

It is a heuristic, not a judge: a hit means "look at this", not "this is wrong".
Pure standard library so it runs anywhere.
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

EXTS = {".html", ".htm", ".css", ".scss", ".js", ".mjs", ".jsx", ".ts", ".tsx",
        ".astro", ".vue", ".svelte", ".mdx"}  # plain .md = notes/reports, not site content
SKIP_DIRS = {"node_modules", ".git", "dist", "build", ".next", ".astro", ".vercel",
             ".output", "coverage", ".turbo", ".cache", "frames", "public/frames"}

# ---------------------------------------------------------------- copy slop
SLOP_PHRASES = [
    r"unlock the (full )?(power|potential)", r"elevate your", r"revolutioni[sz]e (the way|your)",
    r"seamless(ly)? integrat", r"cutting[- ]edge", r"next[- ]level", r"game[- ]chang",
    r"in today'?s (fast[- ]paced|digital) (world|landscape)", r"take (it|your \w+) to the next level",
    r"empower(ing)? (you|your|businesses)", r"supercharge", r"harness the power",
    r"we('re| are) passionate about", r"one[- ]stop[- ]shop", r"world[- ]class",
    r"state[- ]of[- ]the[- ]art", r"transform your (business|life|space)", r"unleash",
    r"designed (with you in mind|for the modern)", r"your journey (starts|begins) here",
    r"lorem ipsum", r"dolor sit amet", r"\bjohn doe\b", r"\bjane doe\b", r"acme (inc|corp)",
    r"\[(your|company|business) name\]", r"example\.com", r"555-\d{4}", r"\(555\)",
    r"trusted by (thousands|millions)", r"10,?000\+ (happy )?(customers|clients)",
    r"delve", r"tapestry", r"in the realm of", r"embark on",
]

# ---------------------------------------------------------------- visual slop
VISUAL = [
    ("purple/indigo→blue/pink default gradient",
     r"(from-(purple|violet|indigo|fuchsia)-\d{3}[^\"'`]{0,60}(to|via)-(blue|pink|cyan|purple|violet|indigo)-\d{3})"
     r"|linear-gradient\([^)]*(#6366f1|#8b5cf6|#a855f7|#7c3aed|#4f46e5)[^)]*\)"),
    ("gradient text on headline (bg-clip-text) — use sparingly",
     r"bg-clip-text\s+text-transparent|background-clip:\s*text"),
    ("glassmorphism (backdrop-blur) — overused tell",
     r"backdrop-blur|backdrop-filter:\s*blur"),
    ("emoji used as icon/bullet",
     r"[\U0001F680\U00002728\U0001F4A1\U0001F525\U000026A1\U0001F3AF\U0001F4C8\U0001F512\U0001F31F\U00002705\U0001F48E\U0001F4AA]"),
    ("default 'blob' decoration (blur-3xl orbs)",
     r"blur-3xl[^\"'`]{0,80}rounded-full|rounded-full[^\"'`]{0,80}blur-3xl"),
]

FONT_DEFAULTS = re.compile(r"\b(Inter|Roboto|Open Sans|Arial|Poppins|Montserrat|system-ui)\b")
FONT_DECL = re.compile(r"(font-family\s*:\s*[^;]+;|--[\w-]*(?:font|display|text|heading|body|serif|sans)[\w-]*\s*:\s*\"[^;]+;|fonts\.googleapis\.com/css2\?family=[^\"'&]+|api\.fontshare\.com/v2/css\?[^\"']+|next/font/google[^\n]*|@fontsource(-variable)?/[\w-]+)")


def iter_files(root: Path):
    for p in root.rglob("*"):
        if not p.is_file() or p.suffix.lower() not in EXTS:
            continue
        rel = p.relative_to(root).as_posix()
        if any(part in SKIP_DIRS for part in p.relative_to(root).parts) or "/frames/" in rel:
            continue
        if p.stat().st_size > 1_500_000:  # skip bundles / minified vendor
            continue
        yield p


def line_of(text: str, idx: int) -> int:
    return text.count("\n", 0, idx) + 1


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("site_dir")
    ap.add_argument("--json", action="store_true")
    ap.add_argument("--strict", action="store_true")
    a = ap.parse_args()
    root = Path(a.site_dir).resolve()
    if not root.exists():
        print(f"no such dir: {root}", file=sys.stderr)
        return 2

    findings: list[dict] = []

    def add(level, rule, file=None, line=None, detail=""):
        findings.append({"level": level, "rule": rule, "file": file, "line": line, "detail": detail})

    files = list(iter_files(root))
    if not files:
        add("FAIL", "no source files found", detail=str(root))

    corpus = {}
    for f in files:
        try:
            corpus[f] = f.read_text(encoding="utf-8", errors="ignore")
        except Exception:
            continue
    all_text = "\n".join(corpus.values())
    html_text = "\n".join(t for f, t in corpus.items() if f.suffix in {".html", ".htm", ".astro", ".tsx", ".jsx"})

    # copy slop
    for f, t in corpus.items():
        rel = f.relative_to(root).as_posix()
        for pat in SLOP_PHRASES:
            for m in re.finditer(pat, t, re.I):
                level = "FAIL" if re.search(r"lorem|dolor|doe|acme|\[|example\.com|555", m.group(0), re.I) else "WARN"
                add(level, "generic / placeholder copy", rel, line_of(t, m.start()), m.group(0))
        for name, pat in VISUAL:
            hits = list(re.finditer(pat, t, re.I))
            if hits:
                add("WARN", name, rel, line_of(t, hits[0].start()), f"{len(hits)} occurrence(s)")

    # unreplaced starter tokens / template placeholders
    for f, t in corpus.items():
        rel = f.relative_to(root).as_posix()
        if "--accent: #0000ee" in t or "--bg: #fefefe" in t:
            add("FAIL", "starter colour tokens never customised", rel)
        m = re.search(r"\{\{[^}]{1,80}\}\}", t)
        if m:
            add("FAIL", "unfilled {{placeholder}}", rel, line_of(t, m.start()), m.group(0))
        if re.search(r"(#f[0-9a-f]ef[0-9a-f]e[0-9a-f]|#f4f1ea|#faf7f2|cream)[\s\S]{0,600}(#c[0-9a-f]5[0-9a-f]3d|terracotta)", t, re.I):
            add("WARN", "cream + terracotta palette — the 2026 'tasteful AI' default", rel)

    # fonts: only default fonts declared?
    decls = FONT_DECL.findall(all_text)
    decl_text = " ".join(d[0] if isinstance(d, tuple) else d for d in decls)
    if decls:
        named = set(re.findall(r"[A-Z][A-Za-z]+(?:[ +][A-Z][A-Za-z]+)*", decl_text))
        named |= {w.replace("-", " ").title() for w in re.findall(r"f\[\]=([a-z0-9-]+)", decl_text)}
        non_default = {n for n in named if not FONT_DEFAULTS.search(n) and n not in {"Sans", "Serif", "Mono"}}
        if not non_default:
            add("WARN", "only default fonts (Inter/Roboto/Poppins/system) — pick a characterful pairing", detail=decl_text[:160])
    else:
        add("WARN", "no font choice found — browser default / framework default font")

    # 2026 "tasteful AI" tells
    caps = len(re.findall(r"text-transform:\s*uppercase[^}]{0,120}letter-spacing|letter-spacing[^}]{0,120}text-transform:\s*uppercase|uppercase tracking-(wide|wider|widest)", all_text))
    if caps >= 3:
        add("WARN", f"{caps} ALL-CAPS letter-spaced micro-label styles — the 2026 eyebrow tell; keep one at most")
    dots = len(re.findall(r">[^<]{2,40} · [^<]{2,40} · [^<]{2,40}<", html_text))
    if dots >= 2:
        add("WARN", f"{dots} middle-dot meta strings (\"A · B · C\") — a 2026 tell")
    if re.search(r"<h1[^>]*>[\s\S]{0,200}<(em|i)\b", html_text):
        add("WARN", "accented/italic word inside the h1 — common AI flourish; make sure it's earned")

    # 3-identical-feature-cards hero pattern (very rough)
    if re.search(r"grid-cols-3[\s\S]{0,400}(rounded-(xl|2xl)[\s\S]{0,300}){3}", all_text) and \
       len(re.findall(r"(Fast|Secure|Reliable|Scalable|Easy to use|24/7 Support)", all_text)) >= 2:
        add("WARN", "3 generic feature cards (Fast / Secure / Reliable…) — say something specific to this business")

    # ---------------------------------------------------------- ship-readiness
    if html_text:
        if not re.search(r"<title>[^<]{3,}</title>|title\s*[:=]", html_text):
            add("FAIL", "missing <title>")
        if not re.search(r"name=[\"']description[\"']|description\s*:", html_text):
            add("FAIL", "missing meta description")
        if not re.search(r"og:image|openGraph", html_text):
            add("WARN", "missing Open Graph image (link previews will be blank when you send the pitch link)")
        if not re.search(r"name=[\"']viewport[\"']|viewport", html_text):
            add("FAIL", "missing viewport meta (mobile will break)")
        if not re.search(r"application/ld\+json", html_text):
            add("WARN", "no JSON-LD schema (LocalBusiness/Organization) — free local SEO win")
        if not re.search(r"\blang=[\"'][a-z]{2}", html_text):
            add("WARN", "missing <html lang>")
        imgs = re.findall(r"<img\b[^>]*>", html_text, re.I)
        no_alt = [i for i in imgs if not re.search(r"\balt=", i)]
        if no_alt:
            add("FAIL", f"{len(no_alt)} <img> without alt", detail=no_alt[0][:100])
        if not re.search(r"href=[\"'](tel:|mailto:|https?://(www\.)?(calendly\.com|cal\.com|wa\.me|api\.whatsapp\.com|ig\.me|m\.me|t\.me|youtube\.com/@[^\"']*sub_confirmation|youtube\.com/channel/[^\"']*sub_confirmation))|<form\b", html_text, re.I):
            add("FAIL", "no primary action link (tel:, mailto:, form, booking, DM link, or YouTube subscribe link)")
        if re.search(r"href=[\"']#[\"']", html_text):
            add("WARN", "dead links (href=\"#\")")

    WEBGL = r"from\s+[\"']three[\"'/]|[\"']three/addons|THREE\.|@react-three|WebGLRenderer|getContext\([\"']webgl2?[\"']\)"
    uses_motion = re.search(r"gsap|ScrollTrigger|@react-three|lenis|framer-motion|motion/react|@keyframes|animate-|" + WEBGL, all_text)
    if uses_motion and not re.search(r"prefers-reduced-motion|useReducedMotion|reducedMotion", all_text):
        add("FAIL", "animations present but no prefers-reduced-motion handling")
    if re.search(WEBGL, all_text):
        if not re.search(r"setPixelRatio\(\s*Math\.min|dpr=\{?\[|dpr:\s*\[", all_text):
            add("WARN", "WebGL without a DPR cap (Math.min(devicePixelRatio, 2) / dpr={[1,2]}) — phones will cook")
        if not re.search(r"matchMedia|innerWidth|isMobile|useMediaQuery|@media", all_text):
            add("WARN", "WebGL with no mobile/low-power fallback detected")

    # ---------------------------------------------------------- report
    order = {"FAIL": 0, "WARN": 1}
    findings.sort(key=lambda x: (order[x["level"]], x["rule"]))
    fails = sum(1 for x in findings if x["level"] == "FAIL")
    warns = len(findings) - fails
    if a.json:
        print(json.dumps({"fails": fails, "warns": warns, "findings": findings}, indent=2))
    else:
        print(f"slop_check: {len(files)} files scanned in {root}")
        seen = set()
        for x in findings:
            key = (x["level"], x["rule"], x["file"])
            if key in seen:
                continue
            seen.add(key)
            loc = f"  {x['file']}:{x['line']}" if x["file"] else ""
            det = f"  — {x['detail']}" if x["detail"] else ""
            print(f"[{x['level']}] {x['rule']}{loc}{det}")
        print(f"\n{fails} FAIL, {warns} WARN" + ("  ✓ ship-ready by this check" if fails == 0 else ""))
    return 1 if fails or (a.strict and findings) else 0


if __name__ == "__main__":
    sys.exit(main())
