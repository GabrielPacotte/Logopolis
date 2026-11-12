import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const root = process.cwd();
const ignoredDirectories = new Set([
  ".git",
  ".next",
  "node_modules",
  "coverage",
  "dist",
  "build",
]);
const ignoredFiles = new Set(["package-lock.json"]);
const patterns = [
  ["GitHub token", /gh[pousr]_[A-Za-z0-9_]{20,}/],
  ["GitHub fine-grained token", /github_pat_[A-Za-z0-9_]{20,}/],
  ["AWS access key", /AKIA[0-9A-Z]{16}/],
  ["private key", /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],
  [
    "generic credential assignment",
    /(?:password|secret|token|api[_-]?key)\s*=\s*["'][^"']{8,}["']/i,
  ],
];
const findings = [];

function scan(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const file = join(directory, entry.name);
    if (entry.isDirectory()) {
      if (!ignoredDirectories.has(entry.name)) scan(file);
      continue;
    }
    if (ignoredFiles.has(entry.name) || statSync(file).size > 1_000_000)
      continue;
    const text = readFileSync(file, "utf8");
    for (const [name, pattern] of patterns) {
      if (pattern.test(text)) findings.push(`${relative(root, file)}: ${name}`);
    }
  }
}

scan(root);
if (findings.length > 0) {
  console.error("Potential secrets detected:");
  console.error(findings.join("\n"));
  process.exit(1);
}
console.log("Secret scan completed: no configured pattern matched.");
