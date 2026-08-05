#!/usr/bin/env node

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, extname, isAbsolute, join, relative, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const defaultRepositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const expectedOrigin = Object.freeze({
  taskId: "P0-T02A",
  mergeCommit: "11410e1c4f882f059d75938d1314a5786c2e2a88",
  evidencePath: ".ado/artifacts/P0-T02A/",
  preservation: "immutable",
});

const expectedRevision = Object.freeze({
  taskId: "OA-00",
  title: "ADO Embedded Ontology Architecture Gate",
  branch: "codex/OA-00-ado-ontology-architecture",
  baseCommit: "11410e1c4f882f059d75938d1314a5786c2e2a88",
  riskLevel: "critical",
  humanApproval: "mandatory-checkpoint",
  state: "checkpoint-review-required",
});

const expectedAdrReferences = Object.freeze(
  Array.from({ length: 30 }, (_, index) => `ADR-${String(index + 1).padStart(3, "0")}`),
);
const expectedProposedAdrs = Object.freeze(expectedAdrReferences.slice(24));
const expectedSuccessors = Object.freeze({
  "P0-T02D": "blocked-by-ontology-architecture-migration",
  "P0-T03": "not-started",
  "OA-00A": "not-started",
  "OA-00B": "not-started",
  "OA-00C": "not-started",
  "OA-01": "not-started",
  "OA-02": "not-started",
  "OA-03": "not-started",
  "OA-04": "not-started",
  "OA-05": "not-started",
  "OA-06": "not-started",
  "OA-07": "not-started",
  "OA-GATE": "not-started",
});

function jsonEqual(actual, expected) {
  return JSON.stringify(actual) === JSON.stringify(expected);
}

function collectMarkdownFiles(target) {
  if (!existsSync(target)) return [];
  if (statSync(target).isFile()) return extname(target) === ".md" ? [target] : [];
  return readdirSync(target, { withFileTypes: true })
    .sort((left, right) => left.name.localeCompare(right.name))
    .flatMap((entry) => collectMarkdownFiles(join(target, entry.name)));
}

function validateMarkdownLinks(root, files, check) {
  const pattern = /!?\[[^\]]*\]\(([^)\s]+)(?:\s+["'][^"']*["'])?\)/g;
  for (const file of files) {
    const content = readFileSync(file, "utf8");
    for (const match of content.matchAll(pattern)) {
      let target = match[1].replace(/^<|>$/g, "");
      if (target.startsWith("#") || target.startsWith("/") || /^[a-z][a-z0-9+.-]*:/i.test(target)) continue;
      target = target.split("#", 1)[0].split("?", 1)[0];
      if (!target) continue;
      try {
        const decoded = decodeURIComponent(target);
        check(existsSync(resolve(dirname(file), decoded)), `${relative(root, file)} relative link does not resolve: ${target}`);
      } catch {
        check(false, `${relative(root, file)} has an invalid encoded relative link: ${target}`);
      }
    }
  }
}

function hasLink(content, target) {
  const escaped = target.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`\\[[^\\]]+\\]\\(${escaped}\\)`).test(content);
}

export function verifyPlatformContractsAgentsGovernance({ repositoryRoot = defaultRepositoryRoot } = {}) {
  const root = resolve(repositoryRoot);
  const agentsPath = join(root, "AGENTS.md");
  const profilePath = join(root, "docs/architecture/platform-contracts-agents-governance.json");
  const readmePath = join(root, "README.md");
  const docsReadmePath = join(root, "docs/README.md");
  const errors = [];
  const checks = {};
  const record = (name, condition, message) => {
    checks[name] ??= { status: "pass", checked: 0 };
    checks[name].checked += 1;
    if (!condition) {
      checks[name].status = "fail";
      errors.push({ check: name, message });
    }
  };

  for (const [label, file] of [["AGENTS.md", agentsPath], ["governance profile", profilePath], ["README.md", readmePath], ["docs/README.md", docsReadmePath]]) {
    record("requiredFiles", existsSync(file), `${label} is missing`);
  }

  const agents = existsSync(agentsPath) ? readFileSync(agentsPath, "utf8") : "";
  const readme = existsSync(readmePath) ? readFileSync(readmePath, "utf8") : "";
  const docsReadme = existsSync(docsReadmePath) ? readFileSync(docsReadmePath, "utf8") : "";
  let profile = null;
  if (existsSync(profilePath)) {
    try {
      profile = JSON.parse(readFileSync(profilePath, "utf8"));
    } catch (error) {
      record("jsonParsing", false, error.message);
    }
  }

  if (profile) {
    record("identity", profile.schemaVersion === "1.1" && profile.repository === "asxeed-codex/asxeed-platform-contracts", "profile identity must be schema 1.1 for Platform Contracts");
    record("governanceOrigin", jsonEqual(profile.governanceOrigin, expectedOrigin), "P0-T02A governance origin and immutable evidence must be preserved");
    record("currentRevision", jsonEqual(profile.currentRevision, expectedRevision), "OA-00 current revision identity is incorrect");
    record("architectureStatus", profile.architectureStatus?.humanDirection === "approved-in-principle" && profile.architectureStatus?.formalAdoption === "pending-human-checkpoint-review-and-merge" && profile.architectureStatus?.agentApproval === false && profile.architectureStatus?.merged === false, "Architecture status must remain pending human merge without agent approval");
    record("authorityActivation", profile.authorityActivation?.beforeOa00HumanMerge?.[0] === "Architecture Freeze v1.1" && profile.authorityActivation?.afterOa00HumanMerge?.[0] === "Architecture Freeze v1.2" && profile.authorityActivation?.v11HistoricalAuthority === "immutable", "authority activation must preserve v1.1 before merge and activate v1.2 only after merge");
    record("adrRequirements", jsonEqual(profile.requiredAdrReferences, expectedAdrReferences) && jsonEqual(profile.proposedAdrIds, expectedProposedAdrs), "ADR-001 through ADR-030 and proposed ADR-025 through ADR-030 must be exact and ordered");

    const owned = (profile.ownedResponsibilities ?? []).join("\n");
    const prohibited = (profile.prohibitedResponsibilities ?? []).join("\n");
    record("domainNeutrality", profile.dependencyPolicy?.domainNeutral === true && /domain-neutral Ontology/.test(owned), "Platform Contracts must own neutral Ontology contracts and remain domain-neutral");
    record("ownershipBoundaries", !/(Knowledge Core runtime|Ontology Builder orchestration|Manufacturing Ontology Pack|Product DSL Generator)/i.test(owned) && /operational Ontology/.test(prohibited), "Platform Contracts must not claim consumer Ontology runtime or operational knowledge");
    record("dependencyBoundaries", profile.dependencyPolicy?.adoInternalImports === "prohibited" && profile.dependencyPolicy?.manufacturingOsInternalImports === "prohibited" && profile.dependencyPolicy?.consumerSourceTreeDependencies === "prohibited" && profile.dependencyPolicy?.mutableOrUnversionedAuthorityReferences === "prohibited" && profile.dependencyPolicy?.directCrossDomainDatabaseAccess === "prohibited", "versioned dependency and database boundaries must remain fail closed");

    const ontology = profile.ontologyOwnershipBoundaries ?? {};
    record("ontologyOwnership", ontology.adoOwns?.includes("Knowledge Core runtime") && ontology.adoOwns?.includes("Ontology Builder orchestration") && ontology.manufacturingOsOwns?.includes("Manufacturing Ontology Pack") && ontology.manufacturingOsOwns?.includes("Product DSL Generator") && ontology.noSeparateKnowledgeOs === true, "ADO and Manufacturing Ontology ownership or no-separate-Knowledge-OS decision is missing");
    record("humanAuthority", ontology.humanExclusive?.includes("Critical manufacturing-knowledge approval") && ontology.confidenceIsApproval === false && ontology.judgeResultIsHumanApproval === false, "Critical approval and AI non-approval boundaries are missing");
    record("orderAuthority", jsonEqual(ontology.orderEngineOwns, ["customer", "order", "quantity", "price", "invoice"]), "Order Engine authority must remain exact");

    record("storagePolicy", profile.storagePolicy?.approvedInitialPersistence?.includes("Azure Database for PostgreSQL Flexible Server") && profile.storagePolicy?.approvedInitialPersistence?.includes("Azure Blob Storage") && profile.storagePolicy?.graphSemanticsPersistenceIndependent === true && profile.storagePolicy?.newGraphDatabaseApproved === false, "PostgreSQL/Blob compatibility and no-new-Graph-Database policy are required");
    record("pr26Control", profile.pr26TransitionControl?.pullRequest === 26 && profile.pr26TransitionControl?.requiredStateDuringOa00 === "open-draft-unchanged" && profile.pr26TransitionControl?.transitionTask === "OA-00B", "PR #26 transition control is incomplete");
    record("successorScope", jsonEqual(profile.successorTasks, expectedSuccessors), "P0-T02D, P0-T03, and every OA successor must remain blocked/not-started");
    record("humanCheckpoint", profile.humanCheckpointRequired === true && profile.currentState === "checkpoint-review-required", "human checkpoint must remain required");

    for (const action of ["merge into main", "enable auto-merge", "bypass required checks", "rewrite approved history"]) {
      record("gitAuthority", profile.prohibitedGitActions?.includes(action), `missing prohibited Git action: ${action}`);
    }
    for (const action of ["deploy to production", "publish packages", "approve Architecture Freeze or ADR changes", "approve manufacturing knowledge", "represent AI output as human approval"]) {
      record("releaseAuthority", profile.prohibitedReleaseActions?.includes(action), `missing prohibited release/approval action: ${action}`);
    }
    record("stopConditions", profile.requiredStopConditions?.blockedExternalForArchitectureDecisions === false && profile.requiredStopConditions?.NEEDS_DESIGN_DECISION?.length >= 10 && profile.requiredStopConditions?.BLOCKED_EXTERNAL?.length >= 5, "stop conditions are incomplete or misuse BLOCKED_EXTERNAL");
    record("validationPolicy", profile.requiredValidation?.includes("Ontology architecture verifier") && profile.requiredValidation?.includes("manifest SHA-256 validation") && profile.requiredValidation?.includes("read-only consumer and PR #26 validation"), "OA-00 validation policy is incomplete");
    record("securityAndConfidentiality", profile.securityAndConfidentiality?.includes("organization isolation and namespace authorization") && profile.securityAndConfidentiality?.includes("no Production Ontology data in Development or Codex") && profile.securityAndConfidentiality?.some((rule) => rule.startsWith("no secrets")), "Ontology security and confidentiality controls are incomplete");
  }

  const requiredClauses = [
    ["governanceOrigin", "P0-T02A remains the origin of Platform Contracts agent governance"],
    ["currentRevision", "OA-00 is the current Architecture-governance revision"],
    ["authorityActivation", "After OA-00 human merge"],
    ["authorityActivation", "Architecture Freeze v1.2"],
    ["architectureStatus", "formally adopted only after human review and merge"],
    ["ontologyOwnership", "ADO owns the Knowledge Core runtime and Ontology Builder orchestration"],
    ["ontologyOwnership", "Manufacturing OS owns the Manufacturing Ontology Pack"],
    ["ontologyOwnership", "No separate Knowledge OS or Ontology OS is authorized"],
    ["storagePolicy", "No new Graph Database is approved by OA-00"],
    ["pr26Control", "P0-T02C remains `checkpoint-review-required` on Manufacturing OS Draft PR #26"],
    ["successorScope", "OA-00A, OA-00B, OA-00C, OA-01, OA-02, OA-03, OA-04, OA-05, OA-06, OA-07, and OA-GATE remain `not-started`"],
    ["gitAuthority", "Agents must not merge into main."],
    ["releaseAuthority", "Agents must not deploy to production, publish packages"],
    ["humanCheckpoint", "The task remains `checkpoint-review-required` until a human reviews and merges it."],
    ["securityAndConfidentiality", "No secrets are permitted in files, prompts, logs, fixtures, artifacts, commits, or PR descriptions."],
  ];
  for (const [name, clause] of requiredClauses) record(name, agents.includes(clause), `AGENTS.md is missing required clause: ${clause}`);

  record("readmeNavigation", hasLink(readme, "docs/architecture/platform-contracts-agents-governance.json") && hasLink(readme, "scripts/verify-platform-contracts-agents-governance.mjs"), "root README must preserve governance profile/verifier navigation");
  record("readmeNavigation", hasLink(docsReadme, "architecture/platform-contracts-agents-governance.json") && hasLink(docsReadme, "../scripts/verify-platform-contracts-agents-governance.mjs"), "docs README must preserve governance profile/verifier navigation");

  validateMarkdownLinks(root, [agentsPath, readmePath, ...collectMarkdownFiles(join(root, "docs"))].filter(existsSync), (condition, message) => record("relativeLinks", condition, message));

  return {
    status: errors.length === 0 ? "pass" : "fail",
    repository: "asxeed-codex/asxeed-platform-contracts",
    taskId: "OA-00",
    governanceOrigin: "P0-T02A",
    currentState: profile?.currentState ?? null,
    checks,
    errors,
  };
}

function parseRoot(arguments_) {
  if (arguments_.length === 0) return defaultRepositoryRoot;
  if (arguments_.length === 2 && arguments_[0] === "--root") return resolve(arguments_[1]);
  throw new Error("usage: verify-platform-contracts-agents-governance.mjs [--root <path>]");
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  let report;
  try {
    report = verifyPlatformContractsAgentsGovernance({ repositoryRoot: parseRoot(process.argv.slice(2)) });
  } catch (error) {
    report = { status: "fail", repository: "asxeed-codex/asxeed-platform-contracts", taskId: "OA-00", errors: [{ check: "invocation", message: error.message }] };
  }
  console.log(JSON.stringify(report, null, 2));
  process.exitCode = report.status === "pass" ? 0 : 1;
}

export { expectedAdrReferences, expectedOrigin, expectedProposedAdrs, expectedRevision, expectedSuccessors };
