import { existsSync, readFileSync } from "node:fs";

const requiredFiles = [
  "AGENTS.md",
  "docs/engineering/AI_RESOURCE_POLICY.md",
  "docs/governance/AGENT_ROLES.md",
  "docs/governance/WORKFLOW.md",
];

for (const file of requiredFiles) {
  if (!existsSync(file)) {
    console.error(`Missing agent-governance document: ${file}`);
    process.exit(1);
  }
}

const agents = readFileSync("AGENTS.md", "utf8");
const policy = readFileSync("docs/engineering/AI_RESOURCE_POLICY.md", "utf8");
const unsupportedRepositoryConfig = [
  ".codex/config.toml",
  ".codex/agents/developer.toml",
  ".codex/agents/qa-security.toml",
];

if (!agents.includes("AI Resource Efficiency")) {
  console.error("AGENTS.md does not expose the shared resource policy.");
  process.exit(1);
}

if (!policy.includes("Aucune optimisation ne doit masquer une erreur")) {
  console.error("The resource policy does not preserve error visibility.");
  process.exit(1);
}

for (const file of unsupportedRepositoryConfig) {
  if (existsSync(file)) {
    console.error(`Unsupported repository Codex configuration found: ${file}`);
    process.exit(1);
  }
}

console.log("Agent governance verified; no unsupported repository TOML found.");
