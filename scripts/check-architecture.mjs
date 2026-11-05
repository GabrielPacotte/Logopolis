import { readFileSync, readdirSync } from "node:fs";
import { extname, join, relative } from "node:path";

const root = process.cwd();
const packagesRoot = join(root, "packages");
const violations = [];

function inspect(directory, layer) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const file = join(directory, entry.name);
    if (entry.isDirectory()) {
      inspect(file, layer);
      continue;
    }
    if (extname(entry.name) !== ".ts") continue;
    const imports = readFileSync(file, "utf8").matchAll(
      /from\s+["']([^"']+)["']/g,
    );
    for (const imported of imports) {
      const target = imported[1];
      const forbidden =
        (layer === "domain" &&
          /(?:application|adapters|interfaces|apps)\//.test(target)) ||
        (layer === "application" &&
          /(?:adapters|interfaces|apps)\//.test(target));
      if (forbidden) violations.push(`${relative(root, file)} -> ${target}`);
    }
  }
}

for (const module of readdirSync(packagesRoot, { withFileTypes: true })) {
  if (
    !module.isDirectory() ||
    ["contracts", "test-support"].includes(module.name)
  )
    continue;
  for (const layer of ["domain", "application"]) {
    const path = join(packagesRoot, module.name, layer);
    try {
      inspect(path, layer);
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
  }
}

if (violations.length > 0) {
  console.error("Architecture boundary violations:");
  console.error(violations.join("\n"));
  process.exit(1);
}
console.log("Architecture boundaries verified.");
