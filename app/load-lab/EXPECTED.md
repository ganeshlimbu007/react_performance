# EXPECTED — open only after LOAD.md is filled

- react.dev's own arithmetic for the markdown case: rendering it on the client ships `marked`
  (35.9 KB, 11.2 KB gzipped) and `sanitize-html` (206 KB, 63.3 KB gzipped) — about 75 KB gzipped
  "just to render static content that will not change". Rendered in a server component, neither
  library appears in the route's client JS. Your versions differ; check the analyzer.
- Hydration cost follows the number of client components, not the size of the HTML. A click that
  lands during hydration waits as **input delay**, so it shows up in INP, not LCP, and the
  attribution build reports a `loadState` other than `complete`. With `mode=server` there is
  almost nothing to hydrate, so the same early click should be quick.
- The lazy editor is a separate client chunk. A second `import()` of the same module returns the
  cached one, so warming on hover usually removes most of the wait on click.
- Not measured by the book's rig on this page; these are directions from the mechanism and from
  react.dev. Your numbers are the measurement.
