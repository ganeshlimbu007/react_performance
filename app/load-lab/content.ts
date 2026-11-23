import { makeWords, mulberry32 } from "../_lab-kit/seeded";

/**
 * A deterministic markdown document of roughly 25–30 KB, generated from the
 * seeded PRNG. Same bytes every run, no network.
 *
 * Both markdown stations render exactly this string, so the only difference
 * between them is *where* it is turned into HTML.
 */
function build(): string {
  const rand = mulberry32(99);
  const words = makeWords(900, 99);
  const pick = () => words[Math.floor(rand() * words.length)];
  const sentence = (n: number) => {
    const parts: string[] = [];
    for (let i = 0; i < n; i++) parts.push(pick());
    const s = parts.join(" ");
    return s.charAt(0).toUpperCase() + s.slice(1) + ".";
  };
  const para = (n: number) => {
    const out: string[] = [];
    for (let i = 0; i < n; i++) out.push(sentence(8 + Math.floor(rand() * 10)));
    return out.join(" ");
  };

  const out: string[] = [];
  out.push("# " + sentence(4).replace(".", ""));
  out.push("");
  out.push(para(3));
  out.push("");

  for (let section = 1; section <= 20; section++) {
    out.push(`## ${section}. ${sentence(3).replace(".", "")}`);
    out.push("");
    out.push(para(4));
    out.push("");

    out.push(`### ${sentence(2).replace(".", "")}`);
    out.push("");
    out.push(
      `${para(2)} See [${pick()}](https://example.com/${pick()}) for the **${pick()}** case, or the _${pick()}_ note.`,
    );
    out.push("");

    out.push("- " + sentence(6));
    out.push("- " + sentence(7));
    out.push("- " + sentence(5));
    out.push(`- \`${pick()}\` — ` + sentence(6));
    out.push("");

    out.push("1. " + sentence(5));
    out.push("2. " + sentence(6));
    out.push("3. " + sentence(4));
    out.push("");

    if (section % 3 === 1) {
      out.push("```ts");
      out.push(`export function ${pick()}(${pick()}: number) {`);
      out.push(`  const ${pick()} = ${pick()} * ${section};`);
      out.push(`  return ${pick()};`);
      out.push("}");
      out.push("```");
      out.push("");
    }

    out.push("> " + sentence(9));
    out.push("");
    out.push(para(3));
    out.push("");
  }

  return out.join("\n");
}

export const ARTICLE_MARKDOWN = build();

/** Shared sanitize-html options, so both stations sanitise identically. */
export const SANITIZE_OPTIONS = {
  allowedTags: [
    "h1", "h2", "h3", "h4", "p", "a", "ul", "ol", "li", "strong", "em",
    "blockquote", "code", "pre", "hr", "br",
  ],
  allowedAttributes: { a: ["href", "title"] },
};
