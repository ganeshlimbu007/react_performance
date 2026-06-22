# Render Lab — profiling exercise

A plausible Contacts / CRM dashboard at **`/render-lab`**. It contains a curated
set of render-performance problems for you to find with the React DevTools
Profiler. No hints in the code — diagnose it yourself, fill in `BASELINE.md`,
then grade against `ANSWER_KEY.md`.

The data is generated in memory with a fixed seed (`data.ts`, ~5,000 contacts),
so every run profiles identically. There is no network fetching.

## How to run

Always profile a **production build** — `next dev` inflates timings and
StrictMode double-renders everything:

```bash
npm run build && npm start
# open http://localhost:3000/render-lab
```

## How to profile

1. Install the **React Developer Tools** browser extension.
2. **Components** tab → gear icon → enable **"Highlight updates when components
   render"**. Interact with the page and watch what flashes — a naked-eye pass.
3. **Profiler** tab → gear icon → enable **"Record why each component
   rendered."**
4. Record **one interaction at a time**, then stop:
   - type a few characters in the search box
   - toggle the theme
   - select a contact
   - let the page sit idle and watch the per-second activity
5. For each recording, read:
   - the **commit timeline** (how *often* things render),
   - the **flamegraph** (what rendered and its cost),
   - the **ranked** chart (worst self-time first).
   Click each suspect and read **"Why did this render?"**.
6. Write your findings in **`BASELINE.md`**.
7. **Only then** open **`ANSWER_KEY.md`** to check yourself.

The site-wide **Web Vitals dashboard** (bottom-right) stays mounted here too —
watch **INP** as you later apply fixes.

> Tip: the five Profiler "Why did this render?" causes — *first mount*, *hooks
> changed*, *the parent component rendered*, *props changed*, *context changed* —
> are all observable on this page if you profile the right interaction.
