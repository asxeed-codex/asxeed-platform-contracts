const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const { test } = require("node:test");

const repositoryRoot = path.resolve(__dirname, "..");
const verifierPath = path.join(repositoryRoot, "scripts", "verify-platform-contracts-agents-governance.mjs");

function createFixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "oa00-platform-governance-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.copyFileSync(path.join(repositoryRoot, "AGENTS.md"), path.join(root, "AGENTS.md"));
  fs.copyFileSync(path.join(repositoryRoot, "README.md"), path.join(root, "README.md"));
  fs.cpSync(path.join(repositoryRoot, "docs"), path.join(root, "docs"), { recursive: true });
  fs.cpSync(path.join(repositoryRoot, "scripts"), path.join(root, "scripts"), { recursive: true });
  return root;
}

function runVerifier(root) {
  const result = spawnSync(process.execPath, [verifierPath, "--root", root], { cwd: repositoryRoot, encoding: "utf8", maxBuffer: 16 * 1024 * 1024 });
  assert.notEqual(result.stdout, "", `verifier emitted no report\nstderr:\n${result.stderr}`);
  return { result, report: JSON.parse(result.stdout) };
}

function profilePath(root) {
  return path.join(root, "docs", "architecture", "platform-contracts-agents-governance.json");
}

function mutateProfile(root, mutate) {
  const target = profilePath(root);
  const value = JSON.parse(fs.readFileSync(target, "utf8"));
  mutate(value);
  fs.writeFileSync(target, `${JSON.stringify(value, null, 2)}\n`);
}

function mutateAgents(root, from, to) {
  const target = path.join(root, "AGENTS.md");
  const value = fs.readFileSync(target, "utf8");
  assert.ok(value.includes(from), `fixture clause not found: ${from}`);
  fs.writeFileSync(target, value.replace(from, to));
}

function assertFailed(execution, checkName) {
  assert.notEqual(execution.result.status, 0, execution.result.stderr);
  assert.equal(execution.report.status, "fail");
  assert.ok(execution.report.errors.some((error) => error.check === checkName), JSON.stringify(execution.report, null, 2));
}

test("valid OA-00 Platform Contracts governance passes", (t) => {
  const execution = runVerifier(createFixture(t));
  assert.equal(execution.result.status, 0, `${execution.result.stdout}\n${execution.result.stderr}`);
  assert.equal(execution.report.status, "pass");
  assert.equal(execution.report.taskId, "OA-00");
  assert.equal(execution.report.governanceOrigin, "P0-T02A");
  assert.equal(execution.report.currentState, "checkpoint-review-required");
});

test("P0-T02A governance origin mutation fails closed", (t) => {
  const root = createFixture(t);
  mutateProfile(root, (profile) => { profile.governanceOrigin.taskId = "REMOVED"; });
  assertFailed(runVerifier(root), "governanceOrigin");
});

test("missing ADR reference fails closed", (t) => {
  const root = createFixture(t);
  mutateProfile(root, (profile) => { profile.requiredAdrReferences.splice(24, 1); });
  assertFailed(runVerifier(root), "adrRequirements");
});

test("false Architecture merge state fails closed", (t) => {
  const root = createFixture(t);
  mutateProfile(root, (profile) => { profile.architectureStatus.merged = true; });
  assertFailed(runVerifier(root), "architectureStatus");
});

test("incorrect post-merge authority order fails closed", (t) => {
  const root = createFixture(t);
  mutateProfile(root, (profile) => { profile.authorityActivation.afterOa00HumanMerge[0] = "Architecture Freeze v1.1"; });
  assertFailed(runVerifier(root), "authorityActivation");
});

test("separate Knowledge OS authorization fails closed", (t) => {
  const root = createFixture(t);
  mutateProfile(root, (profile) => { profile.ontologyOwnershipBoundaries.noSeparateKnowledgeOs = false; });
  assertFailed(runVerifier(root), "ontologyOwnership");
});

test("ADO Knowledge Core ownership removal fails closed", (t) => {
  const root = createFixture(t);
  mutateProfile(root, (profile) => { profile.ontologyOwnershipBoundaries.adoOwns.shift(); });
  assertFailed(runVerifier(root), "ontologyOwnership");
});

test("Manufacturing Ontology ownership removal fails closed", (t) => {
  const root = createFixture(t);
  mutateProfile(root, (profile) => { profile.ontologyOwnershipBoundaries.manufacturingOsOwns.shift(); });
  assertFailed(runVerifier(root), "ontologyOwnership");
});

test("AI approval escalation fails closed", (t) => {
  const root = createFixture(t);
  mutateProfile(root, (profile) => { profile.ontologyOwnershipBoundaries.judgeResultIsHumanApproval = true; });
  assertFailed(runVerifier(root), "humanAuthority");
});

test("premature Graph Database approval fails closed", (t) => {
  const root = createFixture(t);
  mutateProfile(root, (profile) => { profile.storagePolicy.newGraphDatabaseApproved = true; });
  assertFailed(runVerifier(root), "storagePolicy");
});

test("Platform Contracts runtime ownership fails closed", (t) => {
  const root = createFixture(t);
  mutateProfile(root, (profile) => { profile.ownedResponsibilities.push("Knowledge Core runtime"); });
  assertFailed(runVerifier(root), "ownershipBoundaries");
});

test("missing domain-neutrality fails closed", (t) => {
  const root = createFixture(t);
  mutateProfile(root, (profile) => { profile.dependencyPolicy.domainNeutral = false; });
  assertFailed(runVerifier(root), "domainNeutrality");
});

test("PR #26 transition control mutation fails closed", (t) => {
  const root = createFixture(t);
  mutateProfile(root, (profile) => { profile.pr26TransitionControl.requiredStateDuringOa00 = "merged"; });
  assertFailed(runVerifier(root), "pr26Control");
});

test("successor task start fails closed", (t) => {
  const root = createFixture(t);
  mutateProfile(root, (profile) => { profile.successorTasks["OA-01"] = "in-progress"; });
  assertFailed(runVerifier(root), "successorScope");
});

test("missing human checkpoint fails closed", (t) => {
  const root = createFixture(t);
  mutateProfile(root, (profile) => { profile.humanCheckpointRequired = false; });
  assertFailed(runVerifier(root), "humanCheckpoint");
});

test("missing main merge prohibition fails closed", (t) => {
  const root = createFixture(t);
  mutateAgents(root, "Agents must not merge into main.", "Main merge prohibition removed.");
  assertFailed(runVerifier(root), "gitAuthority");
});

test("missing production and publication prohibition fails closed", (t) => {
  const root = createFixture(t);
  mutateAgents(root, "Agents must not deploy to production, publish packages", "Agents may deploy to production and publish packages");
  assertFailed(runVerifier(root), "releaseAuthority");
});

test("BLOCKED_EXTERNAL cannot replace architecture escalation", (t) => {
  const root = createFixture(t);
  mutateProfile(root, (profile) => { profile.requiredStopConditions.blockedExternalForArchitectureDecisions = true; });
  assertFailed(runVerifier(root), "stopConditions");
});

test("missing confidentiality clause fails closed", (t) => {
  const root = createFixture(t);
  mutateAgents(root, "No secrets are permitted in files, prompts, logs, fixtures, artifacts, commits, or PR descriptions.", "Secret rule removed.");
  assertFailed(runVerifier(root), "securityAndConfidentiality");
});

test("missing README governance navigation fails closed", (t) => {
  const root = createFixture(t);
  const target = path.join(root, "README.md");
  fs.writeFileSync(target, fs.readFileSync(target, "utf8").replace("scripts/verify-platform-contracts-agents-governance.mjs", "missing-governance-verifier"));
  assertFailed(runVerifier(root), "readmeNavigation");
});
