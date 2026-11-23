#!/usr/bin/env node
/**
 * compiler-report — what React Compiler 1.0 does to the lab files.
 *
 * Runs @babel/core over every .tsx under app/compiler-lab/ and
 * app/shapes-lab/remount/ with babel-plugin-react-compiler in annotation mode,
 * and prints what the plugin's logger reported for each function.
 *
 * Usage:
 *   node scripts/compiler-report.mjs
 *   node scripts/compiler-report.mjs --emit app/compiler-lab/parent/ParentCompiled.tsx
 *
 * Always exits 0: this is a report to read, not a gate.
 *
 * Event shapes come from babel-plugin-react-compiler's own types
 * (dist/index.d.ts): CompileSuccess carries fnName and memoSlots, while
 * CompileError and CompileSkip do not carry a function name at all — only an
 * fnLoc — so names for those are recovered from the source line.
 */

import { transformAsync } from "@babel/core";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

const ROOTS = ["app/compiler-lab", "app/shapes-lab/remount"];

// app/render-lab is deliberately never visited: Part 1 must stay untouched.
const EXCLUDE = ["app/render-lab"];

async function walk(dir) {
  const out = [];
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (EXCLUDE.some((x) => full.startsWith(x))) continue;
    if (e.isDirectory()) out.push(...(await walk(full)));
    else if (e.name.endsWith(".tsx")) out.push(full);
  }
  return out;
}

/** Recover a function name from a source location, for events that lack one. */
function nameAt(source, loc) {
  if (!loc?.start?.line) return null;
  const lines = source.split("\n");
  for (let i = loc.start.line - 1; i >= 0 && i > loc.start.line - 4; i--) {
    const line = lines[i] ?? "";
    const m =
      line.match(/function\s+([A-Za-z0-9_$]+)/) ||
      line.match(/(?:const|let|var)\s+([A-Za-z0-9_$]+)\s*=/);
    if (m) return m[1];
  }
  return null;
}

function describe(event, source) {
  const kind = event.kind;
  if (kind === "CompileSuccess") {
    return {
      name: event.fnName ?? nameAt(source, event.fnLoc) ?? "(anonymous)",
      kind,
      detail: `memoSlots ${event.memoSlots}, blocks ${event.memoBlocks}, values ${event.memoValues}`,
    };
  }
  if (kind === "CompileError" || kind === "CompileDiagnostic") {
    const d = event.detail ?? {};
    const category = d.category ?? "(no category)";
    const reason = d.reason ?? d.description ?? "";
    return {
      name: nameAt(source, event.fnLoc) ?? "(anonymous)",
      kind,
      detail: `${category}: ${String(reason).replace(/\s+/g, " ").slice(0, 150)}`,
    };
  }
  if (kind === "CompileSkip") {
    return {
      name: nameAt(source, event.fnLoc) ?? "(anonymous)",
      kind,
      detail: String(event.reason ?? "").replace(/\s+/g, " ").slice(0, 150),
    };
  }
  if (kind === "PipelineError") {
    return {
      name: nameAt(source, event.fnLoc) ?? "(anonymous)",
      kind,
      detail: String(event.data ?? "").slice(0, 150),
    };
  }
  return null; // TimingEvent and the AutoDeps events are not interesting here.
}

async function run() {
  const emitIndex = process.argv.indexOf("--emit");
  const emitFile = emitIndex > -1 ? process.argv[emitIndex + 1] : null;

  const files = [];
  for (const root of ROOTS) files.push(...(await walk(root)));
  files.sort();

  let rows = [];
  let emitted = null;

  for (const file of files) {
    const source = await readFile(file, "utf8");
    const events = [];

    let result;
    try {
      result = await transformAsync(source, {
        filename: file,
        babelrc: false,
        configFile: false,
        sourceType: "module",
        plugins: [
          ["@babel/plugin-syntax-typescript", { isTSX: true }],
          [
            "babel-plugin-react-compiler",
            {
              target: "19",
              compilationMode: "annotation",
              logger: {
                logEvent(filename, event) {
                  events.push(event);
                },
              },
            },
          ],
        ],
      });
    } catch (err) {
      rows.push({
        file,
        name: "(whole file)",
        kind: "TransformError",
        detail: String(err?.message ?? err).split("\n")[0].slice(0, 150),
      });
      continue;
    }

    if (emitFile && path.normalize(emitFile) === path.normalize(file)) {
      emitted = result?.code ?? "(no output)";
    }

    const described = events
      .map((e) => describe(e, source))
      .filter(Boolean);

    if (described.length === 0) {
      rows.push({
        file,
        name: "—",
        kind: "NotCompiled",
        detail: "no 'use memo' directive in this file",
      });
    } else {
      for (const d of described) rows.push({ file, ...d });
    }
  }

  // Collapse identical (file, function, kind, detail) rows — the plugin logs
  // one event per error detail, so a single function can report the same
  // category several times.
  const seen = new Map();
  for (const r of rows) {
    const key = `${r.file}|${r.name}|${r.kind}|${r.detail}`;
    const hit = seen.get(key);
    if (hit) hit.n += 1;
    else seen.set(key, { ...r, n: 1 });
  }
  rows = [...seen.values()].map((r) =>
    r.n > 1 ? { ...r, detail: `${r.detail}  (×${r.n})` } : r,
  );

  // ---- print the table ----
  const head = ["File", "Function", "Event", "Category / reason"];
  const widths = [
    Math.max(head[0].length, ...rows.map((r) => r.file.length)),
    Math.max(head[1].length, ...rows.map((r) => r.name.length)),
    Math.max(head[2].length, ...rows.map((r) => r.kind.length)),
  ];
  const pad = (s, w) => String(s).padEnd(w);

  console.log("");
  console.log(
    `${pad(head[0], widths[0])}  ${pad(head[1], widths[1])}  ${pad(head[2], widths[2])}  ${head[3]}`,
  );
  console.log(
    `${"-".repeat(widths[0])}  ${"-".repeat(widths[1])}  ${"-".repeat(widths[2])}  ${"-".repeat(20)}`,
  );
  for (const r of rows) {
    console.log(
      `${pad(r.file, widths[0])}  ${pad(r.name, widths[1])}  ${pad(r.kind, widths[2])}  ${r.detail}`,
    );
  }
  console.log("");
  const counts = rows.reduce((acc, r) => {
    acc[r.kind] = (acc[r.kind] ?? 0) + 1;
    return acc;
  }, {});
  console.log(
    "summary: " +
      Object.entries(counts)
        .map(([k, v]) => `${k} ${v}`)
        .join(", "),
  );

  if (emitFile) {
    console.log("");
    if (emitted === null) {
      console.log(
        `--emit: ${emitFile} was not one of the scanned files. Scanned roots: ${ROOTS.join(", ")}`,
      );
    } else {
      console.log(`----- compiled output for ${emitFile} -----`);
      console.log(emitted);
    }
  }
}

run().then(
  () => process.exit(0),
  (err) => {
    console.error("compiler-report failed:", err?.message ?? err);
    process.exit(0); // still 0: the report never fails a build
  },
);
