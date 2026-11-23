# LOAD — Week 2 · Part 2

Record from the analyzer (`npm run analyze`, filtered to client) and from DevTools.

| Route | Client JS for the route | Client components on first screen | Where `sanitize-html` lands (import chain) | Notes |
| ----- | ----------------------- | --------------------------------- | ------------------------------------------ | ----- |
| /load-lab/markdown-client |  |  |  |  |
| /load-lab/markdown-server |  |  |  |  |
| /load-lab/hydration?mode=client |  |  |  |  |
| /load-lab/hydration?mode=server |  |  |  |  |
| /load-lab/lazy-editor |  |  |  |  |

## Hydration click (6× CPU, click "Mark all read" as soon as the page appears)
| Mode | INP (ms) | input delay | processing | presentation | loadState |
| ---- | -------- | ----------- | ---------- | ------------ | --------- |
| client |  |  |  |  |  |
| server |  |  |  |  |  |

## Lazy editor (Slow 4G network throttling)
| warm | click → editor visible (ms) |
| ---- | --------------------------- |
| 0 |  |
| 1 (hover first) |  |

## Which means, in this code, I would…
-
