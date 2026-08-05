#!/usr/bin/env node

import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, extname, join, relative, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const defaultRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const expectedOaIds = Object.freeze(["OA-00", "OA-00A", "OA-00B", "OA-00C", "OA-01", "OA-02", "OA-03", "OA-04", "OA-05", "OA-06", "OA-07", "OA-GATE"]);
const expectedAdrFiles = Object.freeze([
  "docs/architecture/adrs/ADR-025_ONTOLOGY_CORE_EMBEDDED_IN_ADO.md",
  "docs/architecture/adrs/ADR-026_ADO_AS_ONTOLOGY_BUILDER_AND_KNOWLEDGE_ORCHESTRATOR.md",
  "docs/architecture/adrs/ADR-027_DOMAIN_ONTOLOGY_OWNERSHIP_AND_APPROVAL_BOUNDARIES.md",
  "docs/architecture/adrs/ADR-028_PUE_ONTOLOGY_DSL_ARCHITECTURE.md",
  "docs/architecture/adrs/ADR-029_DSL_AS_VERSIONED_EXECUTION_ARTIFACT.md",
  "docs/architecture/adrs/ADR-030_SHARED_KNOWLEDGE_GRAPH_NAMESPACE_AND_ACCESS_CONTROL.md",
]);
const requiredProvenance = Object.freeze(["ontologySnapshotId", "ontologyVersion", "ontologyContentHash", "generatorVersion", "evidenceReferences", "ruleReferences", "generatedAt", "approvalState", "contentHash"]);

const historicalHashes = Object.freeze({
  "docs/architecture/ASXEED_Architecture_Freeze_v1.1.md": "b58e7d1cd6fd3225f3d554ac01e5a97104094dc760a34f00f6ff3e61209977c0",
  "docs/architecture/ARCHITECTURE_FREEZE_v1.1_CLARIFICATION_001.md": "f5dbf974697c294c69ae18f1151935b9b1b5de3909197fd506be155a64497b9b",
  "docs/architecture/adoption-manifest.json": "4d6748e5df69a4e0d6de7f2879d022ca04b2db6e0ec9aa51f276ddca2d39f119",
  "docs/architecture/cross-repository-adoption-lock.json": "3308e5b295ad2c387cb92585668e1bd0895a26f8a09edfee73dbecb5d7c3f401",
  "docs/plans/MASTER_IMPLEMENTATION_PLAN_v1.2.md": "78e38828d22004f09885f9c44945cfb7b829edf7b4ff26b89d49999f306c943d",
  "docs/plans/ADO_TASK_GRAPH_v1.2.md": "b4e20cfa5390fad479eacc1080bc2f3e04d36ae0b204338b5485695b67ee32ff",
  "docs/plans/ADO_TASK_GRAPH_v1.2.json": "34efcebdf71abf12bfc91977d012604c7d83b9d719de7f4fb3a45ad70943634d",
  "docs/plans/SPRINT_EXECUTION_PLAN_v1.0.md": "47fa1df550585aef386291a17e15220687678cee8f6524f38f31a9c3c8275d46",
  "docs/architecture/SYSTEM_RESPONSIBILITY_BOUNDARIES_v1.0.md": "42d4c6e79882027cff9b51aa4c23d3df65f38954dccba43cb1b7b77137f4915f",
});

const requiredPackageFiles = Object.freeze([
  "AGENTS.md",
  "README.md",
  "docs/README.md",
  "docs/architecture/ASXEED_Architecture_Freeze_v1.2.md",
  ...expectedAdrFiles,
  "docs/architecture/SYSTEM_RESPONSIBILITY_BOUNDARIES_v1.1.md",
  "docs/architecture/ONTOLOGY_CORE_CONCEPTUAL_MODEL_v0.1.md",
  "docs/architecture/ADO_ONTOLOGY_ARCHITECTURE_DECISION_REPORT_v1.0.md",
  "docs/architecture/ONTOLOGY_ARCHITECTURE_COMPATIBILITY_MATRIX_v1.0.md",
  "docs/architecture/ONTOLOGY_MIGRATION_STRATEGY_v1.0.md",
  "docs/architecture/ONTOLOGY_ROLLBACK_STRATEGY_v1.0.md",
  "docs/plans/P0_T02C_ONTOLOGY_TRANSITION_PLAN_v1.0.md",
  "docs/plans/MASTER_IMPLEMENTATION_PLAN_v1.3.md",
  "docs/plans/ADO_TASK_GRAPH_v1.3.md",
  "docs/plans/ADO_TASK_GRAPH_v1.3.json",
  "docs/plans/SPRINT_EXECUTION_PLAN_v1.1.md",
  "docs/architecture/ontology-architecture-manifest-v1.0.json",
  "docs/architecture/platform-contracts-agents-governance.json",
  "scripts/verify-ontology-architecture.mjs",
  "scripts/verify-platform-contracts-agents-governance.mjs",
  "test/ontologyArchitecture.test.js",
  "test/platformContractsAgentsGovernance.test.js",
  ".ado/artifacts/OA-00/implementation-summary.json",
  ".ado/artifacts/OA-00/commands-executed.json",
  ".ado/artifacts/OA-00/changed-files.json",
  ".ado/artifacts/OA-00/test-results.json",
  ".ado/artifacts/OA-00/risk-report.json",
  ".ado/artifacts/OA-00/rollback-plan.json",
  ".ado/artifacts/OA-00/architecture-decision-report.json",
  ".ado/artifacts/OA-00/adr-compatibility-report.json",
  ".ado/artifacts/OA-00/responsibility-boundary-report.json",
  ".ado/artifacts/OA-00/ontology-model-report.json",
  ".ado/artifacts/OA-00/task-graph-report.json",
  ".ado/artifacts/OA-00/historical-preservation-report.json",
  ".ado/artifacts/OA-00/consumer-state-report.json",
  ".ado/artifacts/OA-00/pr26-transition-report.json",
  ".ado/artifacts/OA-00/security-and-confidentiality-report.json",
  ".ado/artifacts/OA-00/human-checkpoint-report.json",
]);

function sha256(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function jsonEqual(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function walk(root, predicate = () => true) {
  if (!existsSync(root)) return [];
  if (statSync(root).isFile()) return predicate(root) ? [root] : [];
  return readdirSync(root, { withFileTypes: true })
    .filter((entry) => ![".git", "node_modules"].includes(entry.name))
    .sort((left, right) => left.name.localeCompare(right.name))
    .flatMap((entry) => walk(join(root, entry.name), predicate));
}

function hasMarkdownLink(content, target) {
  const escaped = target.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`\\[[^\\]]+\\]\\(${escaped}\\)`).test(content);
}

function validateRelativeLinks(root, files, record) {
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
        record("markdownLinks", existsSync(resolve(dirname(file), decoded)), `${relative(root, file)} relative link does not resolve: ${target}`);
      } catch {
        record("markdownLinks", false, `${relative(root, file)} has invalid encoded link: ${target}`);
      }
    }
  }
}

function validateTaskGraph(root, graph, oldGraph, record, metrics) {
  const tasks = Array.isArray(graph?.tasks) ? graph.tasks : [];
  const oldTasks = Array.isArray(oldGraph?.tasks) ? oldGraph.tasks : [];
  const ids = tasks.map((task) => task.id);
  const uniqueIds = new Set(ids);
  const oldIds = oldTasks.map((task) => task.id);
  const oldIdSet = new Set(oldIds);
  const retainedOldIds = ids.filter((id) => oldIdSet.has(id));
  const oaIds = ids.filter((id) => /^OA-/.test(id));

  record("taskGraphCounts", graph?.graphVersion === "1.3" && graph?.taskCount === 115 && tasks.length === 115 && graph?.oldTaskCount === 103 && graph?.ontologyTaskCount === 12, "Task Graph v1.3 must contain 103 old + 12 OA = 115 tasks");
  record("taskIds", uniqueIds.size === ids.length, "task IDs must be unique");
  record("oldTaskIds", retainedOldIds.length === 103 && oldIds.every((id) => uniqueIds.has(id)), "all 103 predecessor task IDs must be preserved");
  record("oaTaskIds", jsonEqual(oaIds, expectedOaIds), `OA task IDs must be exactly: ${expectedOaIds.join(", ")}`);

  const requiredFields = ["id", "phase", "title", "repository", "agent", "dependsOn", "riskLevel", "humanApproval", "adrReferences", "outputs", "acceptanceCriteria", "requiredTests", "requiredArtifacts", "programId", "trackId", "sprintId", "readiness", "status"];
  const missingFields = [];
  for (const task of tasks) for (const field of requiredFields) if (task[field] === undefined || task[field] === null || task[field] === "") missingFields.push(`${task.id}.${field}`);
  record("taskFields", missingFields.length === 0, `tasks have missing governance fields: ${missingFields.join(", ")}`);

  const byId = new Map(tasks.map((task) => [task.id, task]));
  const missingDependencies = [];
  for (const task of tasks) for (const dependency of task.dependsOn ?? []) if (!byId.has(dependency)) missingDependencies.push(`${task.id}->${dependency}`);
  record("dependencies", missingDependencies.length === 0 && graph?.validation?.missingDependencyCount === 0, `missing dependencies: ${missingDependencies.join(", ")}`);

  const state = new Map();
  const cycles = [];
  function visit(id, chain) {
    if (state.get(id) === "visiting") { cycles.push([...chain, id].join("->")); return; }
    if (state.get(id) === "visited") return;
    state.set(id, "visiting");
    for (const dependency of byId.get(id)?.dependsOn ?? []) if (byId.has(dependency)) visit(dependency, [...chain, id]);
    state.set(id, "visited");
  }
  for (const id of ids) visit(id, []);
  record("cycles", cycles.length === 0 && graph?.validation?.cycleCount === 0, `dependency cycles: ${cycles.join(", ")}`);

  const topologicalOrder = graph?.validation?.topologicalOrder;
  const positions = new Map(Array.isArray(topologicalOrder) ? topologicalOrder.map((id, index) => [id, index]) : []);
  const topoViolations = [];
  if (Array.isArray(topologicalOrder)) {
    for (const task of tasks) for (const dependency of task.dependsOn ?? []) if (positions.get(dependency) >= positions.get(task.id)) topoViolations.push(`${task.id}->${dependency}`);
  }
  record("topologicalOrder", Array.isArray(topologicalOrder) && topologicalOrder.length === 115 && new Set(topologicalOrder).size === 115 && ids.every((id) => positions.has(id)) && topoViolations.length === 0, `topological order is invalid: ${topoViolations.join(", ")}`);

  const sprints = Array.isArray(graph?.sprints) ? graph.sprints : [];
  const sprintSequence = new Map(sprints.map((sprint) => [sprint.id, sprint.sequence]));
  const sprintViolations = [];
  for (const task of tasks) {
    if (!sprintSequence.has(task.sprintId)) sprintViolations.push(`${task.id}->missing:${task.sprintId}`);
    for (const dependency of task.dependsOn ?? []) if (sprintSequence.get(byId.get(dependency)?.sprintId) > sprintSequence.get(task.sprintId)) sprintViolations.push(`${task.id}->${dependency}`);
  }
  record("sprintOrder", sprintViolations.length === 0 && graph?.validation?.missingSprintAssignmentCount === 0 && graph?.validation?.sprintDependencyOrderViolationCount === 0, `sprint assignment/order violations: ${sprintViolations.join(", ")}`);

  const dependencies = Object.fromEntries(expectedOaIds.map((id) => [id, byId.get(id)?.dependsOn]));
  const expectedDependencies = {
    "OA-00": [], "OA-00A": ["OA-00"], "OA-00B": ["OA-00"], "OA-00C": ["OA-00A", "OA-00B"], "OA-01": ["OA-00C"], "OA-02": ["OA-01"], "OA-03": ["OA-02"], "OA-04": ["OA-01", "OA-02"], "OA-05": ["OA-03", "OA-04"], "OA-06": ["OA-05"], "OA-07": ["OA-06"], "OA-GATE": ["OA-07"],
  };
  record("oaDependencies", jsonEqual(dependencies, expectedDependencies), "OA dependency spine does not match the approved sequence");

  const successorIds = expectedOaIds.slice(1);
  record("successorStatus", byId.get("OA-00")?.status === "checkpoint-review-required" && successorIds.every((id) => byId.get(id)?.status === "not-started") && graph?.executionState?.["P0-T02C"] === "checkpoint-review-required" && graph?.executionState?.["P0-T02D"] === "blocked-by-ontology-architecture-migration" && graph?.executionState?.["P0-T03"] === "not-started", "OA-00/current P0 state or successor blocked state is false");

  metrics.taskGraph = { taskCount: tasks.length, oldTaskIds: retainedOldIds.length, oaTaskIds: oaIds.length, uniqueTaskIds: uniqueIds.size, missingDependencies: missingDependencies.length, cycles: cycles.length, sprintOrderViolations: sprintViolations.length, topologicalOrderIds: positions.size };
}

export function verifyOntologyArchitecture({ repositoryRoot = defaultRoot } = {}) {
  const root = resolve(repositoryRoot);
  const errors = [];
  const checks = {};
  const metrics = {};
  const record = (name, condition, message) => {
    checks[name] ??= { status: "pass", checked: 0 };
    checks[name].checked += 1;
    if (!condition) { checks[name].status = "fail"; errors.push({ check: name, message }); }
  };

  for (const file of requiredPackageFiles) record("requiredFiles", existsSync(join(root, file)), `${file} is missing`);

  const read = (file) => existsSync(join(root, file)) ? readFileSync(join(root, file), "utf8") : "";
  const freeze = read("docs/architecture/ASXEED_Architecture_Freeze_v1.2.md");
  const boundaries = read("docs/architecture/SYSTEM_RESPONSIBILITY_BOUNDARIES_v1.1.md");
  const conceptual = read("docs/architecture/ONTOLOGY_CORE_CONCEPTUAL_MODEL_v0.1.md");
  const decision = read("docs/architecture/ADO_ONTOLOGY_ARCHITECTURE_DECISION_REPORT_v1.0.md");
  const migration = read("docs/architecture/ONTOLOGY_MIGRATION_STRATEGY_v1.0.md");
  const rollback = read("docs/architecture/ONTOLOGY_ROLLBACK_STRATEGY_v1.0.md");
  const transition = read("docs/plans/P0_T02C_ONTOLOGY_TRANSITION_PLAN_v1.0.md");
  const allArchitectureText = [freeze, boundaries, conceptual, decision, migration, rollback, transition, ...expectedAdrFiles.map(read)].join("\n");

  record("architectureVersion", freeze.split(/\r?\n/, 1)[0] === "# ASXEED Architecture Freeze v1.2" && freeze.includes("**Architecture Version:** `1.2`") && !freeze.includes("**Architecture Version:** `1.1`"), "Architecture Freeze version must be exactly 1.2");
  record("architectureStatus", freeze.includes("human checkpoint review and merge") && freeze.includes("status remains `checkpoint-review-required`") && !/formal adoption:\s*(complete|merged|adopted)/i.test(freeze), "Architecture status must not claim merge/adoption before human merge");

  for (const [file, expected] of Object.entries(historicalHashes)) {
    const absolute = join(root, file);
    const name = file.endsWith("ASXEED_Architecture_Freeze_v1.1.md") ? "v11Preservation" : file.endsWith("adoption-manifest.json") || file.endsWith("cross-repository-adoption-lock.json") ? "historicalManifests" : "historicalPreservation";
    record(name, existsSync(absolute) && sha256(absolute) === expected, `${file} historical SHA-256 changed`);
  }

  const adrNumbers = [];
  for (const file of expectedAdrFiles) {
    const content = read(file);
    const match = content.match(/^# ADR-(\d{3})\b/m);
    if (match) adrNumbers.push(Number(match[1]));
    for (const section of ["Status", "Context", "Decision", "Mandatory rules", "Ownership", "Prohibited interpretations", "Security impact", "Compatibility impact", "Migration impact", "Rollback impact", "Alternatives considered", "Implementation consequences", "Human approval requirement"]) {
      record("adrSections", section === "Status" ? /\*\*Status:\*\*/.test(content) : content.includes(`## ${section}`), `${file} is missing ${section}`);
    }
  }
  record("adrSequence", jsonEqual(adrNumbers, [25, 26, 27, 28, 29, 30]) && new Set(adrNumbers).size === 6, `ADR IDs must be unique and sequential 025-030; found ${adrNumbers.join(",")}`);

  record("noSeparateKnowledgeOs", freeze.includes("No separate Ontology OS or separate Knowledge OS product is authorized.") && decision.includes("Rejected. A separate product") && !allArchitectureText.includes("SEPARATE_KNOWLEDGE_OS_AUTHORIZED"), "no separate Ontology/Knowledge OS may be authorized");
  record("adoOwnership", freeze.includes("ADO owns the shared Knowledge Core runtime, Ontology Builder orchestration") && boundaries.includes("ADO Knowledge Core") && boundaries.includes("ADO Ontology Builder"), "ADO Knowledge Core and Ontology Builder ownership is missing");
  record("platformNeutrality", freeze.includes("Platform Contracts remains domain-neutral") && freeze.includes("Platform Contracts must not execute ontology queries") && boundaries.includes("operational ontology records"), "Platform Contracts domain-neutrality or runtime prohibition is missing");
  record("manufacturingAuthority", freeze.includes("Manufacturing OS owns the Manufacturing Ontology Pack") && freeze.includes("Critical manufacturing knowledge requires genuine human approval") && boundaries.includes("Manufacturing OS policy and humans") && !allArchitectureText.includes("AI_FINAL_MANUFACTURING_APPROVAL_ALLOWED"), "Manufacturing OS validation/approval and human Critical authority must remain");

  record("ontologyAboveDsl", freeze.includes("Ontology is above DSL in the knowledge flow") && !allArchitectureText.includes("ONTOLOGY_BELOW_DSL"), "Ontology must remain above DSL");
  record("dslExecutionArtifact", freeze.includes("DSL is a versioned execution artifact") && freeze.includes("A DSL is not the persistent knowledge source of truth") && !allArchitectureText.includes("PRODUCT_DSL_IS_KNOWLEDGE_SOURCE_OF_TRUTH"), "Product DSL must be a generated execution artifact, not knowledge truth");
  for (const field of requiredProvenance) record("dslProvenance", freeze.includes(`\`${field}\``), `required DSL provenance field is missing: ${field}`);
  record("ruleArchitecture", freeze.includes("Rule content belongs in Ontology") && freeze.includes("Rule Engine evaluator behavior remains code") && freeze.includes("product-name-specific evaluator code") && !allArchitectureText.includes("PRODUCT_NAME_CODE_ALLOWED") && !allArchitectureText.includes("RULE_ENGINE_EVALUATOR_REMOVED"), "Rule content/evaluator separation or product-name prohibition is missing");

  record("storagePolicy", freeze.includes("No Graph Database is adopted") && freeze.includes("PostgreSQL and Blob") && freeze.includes("graph semantics must be independent of physical persistence") && !allArchitectureText.includes("GRAPH_DATABASE_APPROVED"), "Graph Database must remain unapproved and PostgreSQL/Blob compatible");
  record("organizationIsolation", freeze.includes("organization isolation") && conceptual.includes("organizationId") && !allArchitectureText.includes("ORGANIZATION_ISOLATION_REMOVED"), "organization isolation is missing");
  record("namespaceAuthority", freeze.includes("read authority, proposal authority, approval authority, and write authority") && conceptual.includes("Read, propose, approve, and write") && !allArchitectureText.includes("NAMESPACE_AUTHORITY_REMOVED"), "namespace authority separation is missing");
  record("orderAuthority", freeze.includes("customer, order, quantity, price, invoice") && boundaries.includes("Order Engine") && conceptual.includes("Customer, order, quantity, price, and invoice remain Order Engine truth") && !allArchitectureText.includes("ORDER_ENGINE_AUTHORITY_REMOVED"), "Order Engine authority must remain external");
  record("pr26Control", transition.includes("PR #26 remains open, Draft, and unchanged during OA-00") && transition.includes("Execution task:** OA-00B only") && !transition.includes("PR #26 is merged"), "PR #26 must remain transition-controlled and unmerged");
  record("migration", migration.includes("No old DSL is overwritten or deleted") && migration.includes("dual-read") && migration.includes("OA-GATE"), "migration must preserve old DSL, dual-read compatibility, and fail-closed gates");
  record("rollback", rollback.includes("must not delete approved historical knowledge") && rollback.includes("version supersession") && rollback.includes("traffic rollback"), "rollback must preserve history and use reversible mechanisms");
  record("humanCheckpoint", freeze.includes("Only human checkpoint review and merge") && expectedAdrFiles.every((file) => read(file).includes("## Human approval requirement")), "human checkpoint requirement is missing");

  let graph = null;
  let oldGraph = null;
  let manifest = null;
  for (const [label, file] of [["Task Graph v1.3", "docs/plans/ADO_TASK_GRAPH_v1.3.json"], ["Task Graph v1.2", "docs/plans/ADO_TASK_GRAPH_v1.2.json"], ["Ontology manifest", "docs/architecture/ontology-architecture-manifest-v1.0.json"]]) {
    try {
      const parsed = JSON.parse(read(file));
      if (label === "Task Graph v1.3") graph = parsed;
      else if (label === "Task Graph v1.2") oldGraph = parsed;
      else manifest = parsed;
    } catch (error) { record("jsonParsing", false, `${label}: ${error.message}`); }
  }
  if (graph && oldGraph) validateTaskGraph(root, graph, oldGraph, record, metrics);
  else record("taskGraphCounts", false, "task graphs could not be parsed");

  if (manifest) {
    record("manifestIdentity", manifest.packageId === "asxeed-ado-ontology-architecture" && manifest.packageVersion === "1.0" && manifest.architectureVersion === "1.2" && manifest.taskId === "OA-00" && manifest.branch === "codex/OA-00-ado-ontology-architecture" && manifest.baseCommit === "11410e1c4f882f059d75938d1314a5786c2e2a88", "Ontology manifest identity/version/base is invalid");
    record("manifestStatus", manifest.humanDirection === "approved-in-principle" && manifest.adoptionCondition === "human-checkpoint-review-and-merge" && manifest.formallyAdopted === false && manifest.merged === false, "manifest must not claim formal adoption or merge");
    record("manifestTaskCount", manifest.taskGraphVersion === "1.3" && manifest.taskCount === 115 && jsonEqual(manifest.newAdrIds, ["ADR-025", "ADR-026", "ADR-027", "ADR-028", "ADR-029", "ADR-030"]), "manifest task/ADR counts are invalid");
    const documents = Array.isArray(manifest.documents) ? manifest.documents : [];
    for (const document of documents) {
      const absolute = join(root, document.path ?? "");
      record("manifestHashes", existsSync(absolute) && /^[a-f0-9]{64}$/.test(document.sha256 ?? "") && sha256(absolute) === document.sha256, `manifest hash mismatch: ${document.path}`);
    }
    record("manifestHashes", documents.length >= 18 && new Set(documents.map((document) => document.path)).size === documents.length, "manifest must list unique hashes for every architecture/plan document");
    record("pr26Control", manifest.pr26State?.number === 26 && manifest.pr26State?.state === "open" && manifest.pr26State?.draft === true && manifest.pr26State?.unchangedByOa00 === true, "manifest PR #26 state must remain open Draft and unchanged");
    record("successorStatus", Object.values(manifest.successorState ?? {}).every((state) => state === "not-started" || state === "blocked-by-ontology-architecture-migration"), "manifest successor state must remain blocked/not-started");
  }

  const jsonFiles = walk(root, (file) => extname(file) === ".json");
  for (const file of jsonFiles) {
    try { JSON.parse(readFileSync(file, "utf8")); record("jsonParsing", true, ""); }
    catch (error) { record("jsonParsing", false, `${relative(root, file)}: ${error.message}`); }
  }
  metrics.jsonFiles = jsonFiles.length;

  const markdownFiles = [join(root, "README.md"), ...walk(join(root, "docs"), (file) => extname(file) === ".md")].filter(existsSync);
  validateRelativeLinks(root, markdownFiles, record);
  metrics.markdownFiles = markdownFiles.length;

  const rootReadme = read("README.md");
  const docsReadme = read("docs/README.md");
  const rootTargets = [
    "docs/architecture/ASXEED_Architecture_Freeze_v1.2.md",
    "docs/architecture/adrs/ADR-025_ONTOLOGY_CORE_EMBEDDED_IN_ADO.md",
    "docs/architecture/ONTOLOGY_CORE_CONCEPTUAL_MODEL_v0.1.md",
    "docs/architecture/SYSTEM_RESPONSIBILITY_BOUNDARIES_v1.1.md",
    "docs/architecture/ADO_ONTOLOGY_ARCHITECTURE_DECISION_REPORT_v1.0.md",
    "docs/architecture/ONTOLOGY_ARCHITECTURE_COMPATIBILITY_MATRIX_v1.0.md",
    "docs/architecture/ONTOLOGY_MIGRATION_STRATEGY_v1.0.md",
    "docs/architecture/ONTOLOGY_ROLLBACK_STRATEGY_v1.0.md",
    "docs/plans/MASTER_IMPLEMENTATION_PLAN_v1.3.md",
    "docs/plans/ADO_TASK_GRAPH_v1.3.md",
    "docs/plans/SPRINT_EXECUTION_PLAN_v1.1.md",
    "scripts/verify-ontology-architecture.mjs",
  ];
  for (const target of rootTargets) record("readmeNavigation", hasMarkdownLink(rootReadme, target), `README.md must link to ${target}`);
  record("readmeNavigation", hasMarkdownLink(docsReadme, "../scripts/verify-ontology-architecture.mjs") && hasMarkdownLink(docsReadme, "architecture/ASXEED_Architecture_Freeze_v1.2.md"), "docs/README.md Ontology navigation is incomplete");

  return { status: errors.length === 0 ? "pass" : "fail", repository: "asxeed-codex/asxeed-platform-contracts", taskId: "OA-00", architectureVersion: "1.2", currentState: "checkpoint-review-required", checks, metrics, errors };
}

function parseRoot(arguments_) {
  if (arguments_.length === 0) return defaultRoot;
  if (arguments_.length === 2 && arguments_[0] === "--root") return resolve(arguments_[1]);
  throw new Error("usage: verify-ontology-architecture.mjs [--root <path>]");
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  let report;
  try { report = verifyOntologyArchitecture({ repositoryRoot: parseRoot(process.argv.slice(2)) }); }
  catch (error) { report = { status: "fail", repository: "asxeed-codex/asxeed-platform-contracts", taskId: "OA-00", errors: [{ check: "invocation", message: error.message }] }; }
  console.log(JSON.stringify(report, null, 2));
  process.exitCode = report.status === "pass" ? 0 : 1;
}

export { expectedAdrFiles, expectedOaIds, historicalHashes, requiredPackageFiles, requiredProvenance };
