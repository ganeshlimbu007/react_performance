# Ch. 3 — Four causes

Four things make a component render, and each one reaches a different set of components.

| cause | who runs |
|---|---|
| 1 · its own state changed | itself, and everything under it that does not bail out |
| 2 · its parent rendered | the subtree, until a `memo` boundary with unchanged props holds |
| 3 · a context it reads changed | only readers, through any number of `memo` boundaries |
| 4 · a store it subscribes to changed | only the subscribers |

The tree under test, mounted once:

    <Shell>                       own state + the context value (memoised)
      <Ctx.Provider value={theme}>
        <Wall>                    React.memo, props never change
          <Reader />              useContext
          <Subscriber />          useSyncExternalStore
          <Quiet />               reads nothing
        </Wall>
      </Ctx.Provider>
      <Plain />                   no memo, holds its own state
    </Shell>

## Measured reach, one press at a time

| press | Shell | Wall | Reader | Subscriber | Quiet | Plain |
|---|---|---|---|---|---|---|
| re-render the parent | 1 | 0 | 0 | 0 | 0 | 1 |
| change the context value | 1 | 0 | **1** | 0 | 0 | 1 |
| write to the store | 0 | 0 | 0 | **1** | 0 | 0 |
| Plain's own state | 0 | 0 | 0 | 0 | 0 | **1** |

The context row also moves Shell and Plain, because changing the value means changing Shell's
state. The news in that row is `Reader`: it ran alone, from under a `memo` boundary that held for
everything beside it. Context is not a prop, so `memo` does not stand in its way.

Chain A → B → C: setting A runs three components, B runs two, C runs one. Nothing above a piece
of state ever runs because of it, which is why moving state down a tree is the cheapest
optimisation there is.

## Corrections

| id | the sentence | verdict | measured |
|---|---|---|---|
| C3.5 | "a component re-renders when its props change" | **wrong** | five renders out of five with every prop identical; props cannot change without the parent rendering, which is already cause 2 |
