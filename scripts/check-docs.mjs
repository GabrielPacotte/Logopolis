import { existsSync, readFileSync, readdirSync } from "node:fs";
import { extname, join, normalize, resolve } from "node:path";

const root = process.cwd();
const ignoredDirectories = new Set([
  ".git",
  "node_modules",
  "coverage",
  "dist",
  "build",
]);
const markdownFiles = [];

function collect(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!ignoredDirectories.has(entry.name))
        collect(join(directory, entry.name));
      continue;
    }
    if (extname(entry.name) === ".md")
      markdownFiles.push(join(directory, entry.name));
  }
}

collect(root);
const errors = [];
const markdownLink = /(?<!!)\[[^\]]+\]\(([^)#][^)]*)\)/g;

for (const file of markdownFiles) {
  const text = readFileSync(file, "utf8");
  for (const match of text.matchAll(markdownLink)) {
    const target = match[1].replace(/^<|>$/g, "");
    if (/^(https?:|mailto:|#)/.test(target)) continue;
    const withoutAnchor = target.split("#", 1)[0];
    const path = normalize(resolve(file, "..", withoutAnchor));
    if (!path.startsWith(root) || !existsSync(path)) {
      errors.push(`${file.slice(root.length + 1)} -> ${target}`);
    }
  }
}

if (errors.length > 0) {
  console.error("Broken or escaping Markdown links:");
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(
  `Documentation links verified (${markdownFiles.length} Markdown files).`,
);
