# PREDICTIONS — Week 2 · Part 3 (write before measuring)

Numbers where it asks for numbers; mechanism where it asks why.

## Shapes
- S1 cascade: heavy renders and interaction time for `derive`, `effect`, `layout-effect`.
  Which mode shows a stale frame, and which shows `nested-update`? Why?
- S2 remount: mounts vs renders per parent update for each mode. What happens to typed text?
  Which variants will the hooks lint flag, and which will the compiler report as compiled?
- S3 lazy in render: commit sequence per parent update for `inside` and `module`.
- S4 keys: row renders, mutation records by type, and update time for `index` vs `id` when
  prepending one row. What happens to the inputs' text?
- S5 context: for each mode and each button, which of ThemeReader / UserReader / NonReader /
  DispatchButton render?
- S6 state bailouts: commits and body runs for: set 0 (fresh) → set 1 → set 1 → set 1;
  and for repeated reducer `noop`. What does the Profiler show for each?

## Compiler
- C1: which bodies run per unrelated bump, compiled vs plain?
- C2: which of Control / WritesOutside / ReadsRef / NestedHooks compile? What happens to each
  one's Child on a bump? What will the build say about the ones that don't compile?

## Paint
- P1: total interaction and its three parts for container vs rows, with and without
  content-visibility. Which combination does content-visibility NOT help, and why?
- P2: ms per pass for interleave / batch / per-component.
- P3: mount ms, DOM nodes, theme-change ms for plain vs window. Find-in-page result?
- P4: which modes stay smooth when `busy=1`, and why?
