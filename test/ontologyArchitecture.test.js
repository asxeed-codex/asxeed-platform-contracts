const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const { test } = require("node:test");

const repositoryRoot = path.resolve(__dirname, "..");
const verifierPath = path.join(repositoryRoot, "scripts", "verify-ontology-architecture.mjs");

function createFixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "oa00-ontology-architecture-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  for (const file of ["AGENTS.md", "README.md"]) fs.copyFileSync(path.join(repositoryRoot, file), path.join(root, file));
  for (const directory of ["docs", "scripts", "test", ".ado"]) fs.cpSync(path.join(repositoryRoot, directory), path.join(root, directory), { recursive: true });
  return root;
}

function runVerifier(root) {
  const result = spawnSync(process.execPath, [verifierPath, "--root", root], { cwd: repositoryRoot, encoding: "utf8", maxBuffer: 32 * 1024 * 1024 });
  assert.notEqual(result.stdout, "", `verifier emitted no report\nstderr:\n${result.stderr}`);
  return { result, report: JSON.parse(result.stdout) };
}

function assertFailed(execution, checkName) {
  assert.notEqual(execution.result.status, 0, execution.result.stderr);
  assert.equal(execution.report.status, "fail");
  assert.ok(execution.report.errors.some((error) => error.check === checkName), JSON.stringify(execution.report, null, 2));
}

function mutateText(root, relativePath, from, to) {
  const target = path.join(root, relativePath);
  const content = fs.readFileSync(target, "utf8");
  assert.ok(content.includes(from), `fixture text not found in ${relativePath}: ${from}`);
  fs.writeFileSync(target, content.replace(from, to));
}

function appendText(root, relativePath, value) {
  fs.appendFileSync(path.join(root, relativePath), value);
}

function mutateJson(root, relativePath, mutate) {
  const target = path.join(root, relativePath);
  const value = JSON.parse(fs.readFileSync(target, "utf8"));
  mutate(value);
  fs.writeFileSync(target, `${JSON.stringify(value, null, 2)}\n`);
}

const freezePath = "docs/architecture/ASXEED_Architecture_Freeze_v1.2.md";
const decisionPath = "docs/architecture/ADO_ONTOLOGY_ARCHITECTURE_DECISION_REPORT_v1.0.md";
const graphPath = "docs/plans/ADO_TASK_GRAPH_v1.3.json";
const manifestPath = "docs/architecture/ontology-architecture-manifest-v1.0.json";

test("valid OA-00 package passes", (t) => {
  const execution = runVerifier(createFixture(t));
  assert.equal(execution.result.status, 0, `${execution.result.stdout}\n${execution.result.stderr}`);
  assert.equal(execution.report.status, "pass");
  assert.equal(execution.report.architectureVersion, "1.2");
  assert.deepEqual(execution.report.metrics.taskGraph, { taskCount: 115, oldTaskIds: 103, oaTaskIds: 12, uniqueTaskIds: 115, missingDependencies: 0, cycles: 0, sprintOrderViolations: 0, topologicalOrderIds: 115 });
});

test("missing ADR fails", (t) => {
  const root = createFixture(t);
  fs.rmSync(path.join(root, "docs/architecture/adrs/ADR-030_SHARED_KNOWLEDGE_GRAPH_NAMESPACE_AND_ACCESS_CONTROL.md"));
  assertFailed(runVerifier(root), "adrSequence");
});

test("duplicate ADR fails", (t) => {
  const root = createFixture(t);
  mutateText(root, "docs/architecture/adrs/ADR-026_ADO_AS_ONTOLOGY_BUILDER_AND_KNOWLEDGE_ORCHESTRATOR.md", "# ADR-026", "# ADR-025");
  assertFailed(runVerifier(root), "adrSequence");
});

test("wrong Architecture Freeze version fails", (t) => {
  const root = createFixture(t);
  mutateText(root, freezePath, "# ASXEED Architecture Freeze v1.2", "# ASXEED Architecture Freeze v1.3");
  assertFailed(runVerifier(root), "architectureVersion");
});

test("v1.1 mutation fails", (t) => {
  const root = createFixture(t);
  appendText(root, "docs/architecture/ASXEED_Architecture_Freeze_v1.1.md", "\nmutation\n");
  assertFailed(runVerifier(root), "v11Preservation");
});

test("separate Knowledge OS ownership fails", (t) => {
  const root = createFixture(t);
  appendText(root, decisionPath, "\nSEPARATE_KNOWLEDGE_OS_AUTHORIZED\n");
  assertFailed(runVerifier(root), "noSeparateKnowledgeOs");
});

test("ADO Knowledge Core ownership missing fails", (t) => {
  const root = createFixture(t);
  mutateText(root, freezePath, "ADO owns the shared Knowledge Core runtime, Ontology Builder orchestration", "Ownership statement removed");
  assertFailed(runVerifier(root), "adoOwnership");
});

test("Manufacturing OS approval authority removed fails", (t) => {
  const root = createFixture(t);
  mutateText(root, freezePath, "Critical manufacturing knowledge requires genuine human approval", "Critical approval removed");
  assertFailed(runVerifier(root), "manufacturingAuthority");
});

test("AI final manufacturing approval allowed fails", (t) => {
  const root = createFixture(t);
  appendText(root, decisionPath, "\nAI_FINAL_MANUFACTURING_APPROVAL_ALLOWED\n");
  assertFailed(runVerifier(root), "manufacturingAuthority");
});

test("Ontology below DSL fails", (t) => {
  const root = createFixture(t);
  appendText(root, decisionPath, "\nONTOLOGY_BELOW_DSL\n");
  assertFailed(runVerifier(root), "ontologyAboveDsl");
});

test("Product DSL treated as knowledge source of truth fails", (t) => {
  const root = createFixture(t);
  appendText(root, decisionPath, "\nPRODUCT_DSL_IS_KNOWLEDGE_SOURCE_OF_TRUTH\n");
  assertFailed(runVerifier(root), "dslExecutionArtifact");
});

test("required DSL provenance removed fails", (t) => {
  const root = createFixture(t);
  mutateText(root, freezePath, "`ontologySnapshotId`", "`removedSnapshotId`");
  assertFailed(runVerifier(root), "dslProvenance");
});

test("rules embedded as product-name code allowed fails", (t) => {
  const root = createFixture(t);
  appendText(root, decisionPath, "\nPRODUCT_NAME_CODE_ALLOWED\n");
  assertFailed(runVerifier(root), "ruleArchitecture");
});

test("Rule Engine evaluator removed fails", (t) => {
  const root = createFixture(t);
  mutateText(root, freezePath, "Rule Engine evaluator behavior remains code", "RULE_ENGINE_EVALUATOR_REMOVED");
  assertFailed(runVerifier(root), "ruleArchitecture");
});

test("Graph Database prematurely approved fails", (t) => {
  const root = createFixture(t);
  appendText(root, decisionPath, "\nGRAPH_DATABASE_APPROVED\n");
  assertFailed(runVerifier(root), "storagePolicy");
});

test("organization isolation removed fails", (t) => {
  const root = createFixture(t);
  appendText(root, decisionPath, "\nORGANIZATION_ISOLATION_REMOVED\n");
  assertFailed(runVerifier(root), "organizationIsolation");
});

test("namespace authority removed fails", (t) => {
  const root = createFixture(t);
  appendText(root, decisionPath, "\nNAMESPACE_AUTHORITY_REMOVED\n");
  assertFailed(runVerifier(root), "namespaceAuthority");
});

test("Order Engine authority removed fails", (t) => {
  const root = createFixture(t);
  appendText(root, decisionPath, "\nORDER_ENGINE_AUTHORITY_REMOVED\n");
  assertFailed(runVerifier(root), "orderAuthority");
});

test("old task ID removed fails", (t) => {
  const root = createFixture(t);
  mutateJson(root, graphPath, (graph) => { graph.tasks = graph.tasks.filter((task) => task.id !== "P7-GATE"); graph.taskCount = graph.tasks.length; });
  assertFailed(runVerifier(root), "oldTaskIds");
});

test("unknown OA task added fails", (t) => {
  const root = createFixture(t);
  mutateJson(root, graphPath, (graph) => { graph.tasks.push({ ...graph.tasks.find((task) => task.id === "OA-07"), id: "OA-08" }); graph.taskCount = graph.tasks.length; });
  assertFailed(runVerifier(root), "oaTaskIds");
});

test("required OA task missing fails", (t) => {
  const root = createFixture(t);
  mutateJson(root, graphPath, (graph) => { graph.tasks = graph.tasks.filter((task) => task.id !== "OA-04"); graph.taskCount = graph.tasks.length; });
  assertFailed(runVerifier(root), "oaTaskIds");
});

test("dependency missing fails", (t) => {
  const root = createFixture(t);
  mutateJson(root, graphPath, (graph) => { graph.tasks.find((task) => task.id === "OA-01").dependsOn = ["OA-MISSING"]; });
  assertFailed(runVerifier(root), "dependencies");
});

test("cycle introduced fails", (t) => {
  const root = createFixture(t);
  mutateJson(root, graphPath, (graph) => { graph.tasks.find((task) => task.id === "OA-00").dependsOn = ["OA-GATE"]; });
  assertFailed(runVerifier(root), "cycles");
});

test("sprint-order violation fails", (t) => {
  const root = createFixture(t);
  mutateJson(root, graphPath, (graph) => { graph.tasks.find((task) => task.id === "OA-00").sprintId = "SPRINT-OA-09"; });
  assertFailed(runVerifier(root), "sprintOrder");
});

test("PR #26 incorrectly marked merged fails", (t) => {
  const root = createFixture(t);
  mutateText(root, "docs/plans/P0_T02C_ONTOLOGY_TRANSITION_PLAN_v1.0.md", "PR #26 remains open, Draft, and unchanged during OA-00", "PR #26 is merged");
  assertFailed(runVerifier(root), "pr26Control");
});

test("OA-01 incorrectly marked started fails", (t) => {
  const root = createFixture(t);
  mutateJson(root, graphPath, (graph) => { graph.tasks.find((task) => task.id === "OA-01").status = "in-progress"; });
  assertFailed(runVerifier(root), "successorStatus");
});

test("historical manifest mutation fails", (t) => {
  const root = createFixture(t);
  mutateJson(root, "docs/architecture/adoption-manifest.json", (manifest) => { manifest.oa00Mutation = true; });
  assertFailed(runVerifier(root), "historicalManifests");
});

test("manifest hash mismatch fails", (t) => {
  const root = createFixture(t);
  mutateJson(root, manifestPath, (manifest) => { manifest.documents[0].sha256 = "0".repeat(64); });
  assertFailed(runVerifier(root), "manifestHashes");
});

test("README navigation missing fails", (t) => {
  const root = createFixture(t);
  mutateText(root, "README.md", "scripts/verify-ontology-architecture.mjs", "missing-ontology-verifier");
  assertFailed(runVerifier(root), "readmeNavigation");
});

test("human checkpoint missing fails", (t) => {
  const root = createFixture(t);
  mutateText(root, freezePath, "Only human checkpoint review and merge", "No human checkpoint");
  assertFailed(runVerifier(root), "humanCheckpoint");
});
