# REA web reverse-engineering guides (vendored)

These guides are copied unchanged from **REA — Reverse Engineer Anything**
(https://github.com/morluto/rea, commit `2630eff`, rea-agents v6.9.0), MIT licensed —
see `LICENSE-REA` (Copyright (c) 2026 morluto). Only the website/JavaScript parts are
included; links inside them to other REA pages resolve in the upstream repo.

webbuild runs REA's live engine through `scripts/rea-teardown.sh`. Read these when you
need to go beyond its default capture:

| Guide | Read it when |
|---|---|
| `evidence-workflows.md` | Always, once: how REA separates observed facts, inferences and unknowns |
| `browser-observation.md` | Starting Chrome with CDP, capture options, what `inspect-web-page` records |
| `website-script-export.md` | Exporting captured scripts and analysing them statically |
| `javascript-applications.md` | `analyze-javascript-application` on exported scripts: routes, modules, tracing a feature |
| `website-module-trace.md` | Following the ES module import graph of a site |
| `web-source-location.md` | Mapping minified code back to source locations / source maps |
| `web-runtime.md` | Which code actually ran during a scroll or click; listeners on an element |
| `runtime-observation.md` | Watching behaviour over time (observe a session while scrolling) |

All REA commands work through the pinned runner used by the script:
`npx -y -p node@24.22.1 -p rea-agents@6.9.0 -- rea <command> --help`
