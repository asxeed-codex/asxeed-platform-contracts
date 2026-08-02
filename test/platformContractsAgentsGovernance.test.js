const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const { test } = require("node:test");

const repositoryRoot = path.resolve(__dirname, "..");
const verifierPath = path.join(
  repositoryRoot,
  "scripts",
  "verify-platform-contracts-agents-governance.mjs",
);

function createFixture(t) {
  const root = fs.mkdtempSync(
    path.join(os.tmpdir(), "p0-t02a-agents-governance-"),
  );
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));

  fs.copyFileSync(
    path.join(repositoryRoot, "AGENTS.md"),
    path.join(root, "AGENTS.md"),
  );
  fs.copyFileSync(
    path.join(repositoryRoot, "README.md"),
    path.join(root, "README.md"),
  );
  fs.cpSync(path.join(repositoryRoot, "docs"), path.join(root, "docs"), {
    recursive: true,
  });
  fs.cpSync(path.join(repositoryRoot, "scripts"), path.join(root, "scripts"), {
    recursive: true,
  });
  return root;
}

function runVerifier(root) {
  const result = spawnSync(process.execPath, [verifierPath, "--root", root], {
    cwd: repositoryRoot,
    encoding: "utf8",
    maxBuffer: 8 * 1024 * 1024,
  });
  assert.notEqual(
    result.stdout,
    "",
    `verifier emitted no report\nstderr:\n${result.stderr}`,
  );
  return { result, report: JSON.parse(result.stdout) };
}

function profilePath(root) {
  return path.join(
    root,
    "docs",
    "architecture",
    "platform-contracts-agents-governance.json",
  );
}

function mutateProfile(root, mutate) {
  const filePath = profilePath(root);
  const profile = JSON.parse(fs.readFileSync(filePath, "utf8"));
  mutate(profile);
  fs.writeFileSync(filePath, `${JSON.stringify(profile, null, 2)}\n`);
}

function mutateAgents(root, mutate) {
  const filePath = path.join(root, "AGENTS.md");
  const original = fs.readFileSync(filePath, "utf8");
  const changed = mutate(original);
  assert.notEqual(changed, original, "test mutation did not change AGENTS.md");
  fs.writeFileSync(filePath, changed);
}

function assertFailedCheck(execution, checkName) {
  assert.notEqual(execution.result.status, 0, execution.result.stderr);
  assert.equal(execution.report.status, "fail");
  assert.ok(
    execution.report.errors.some((error) => error.check === checkName),
    JSON.stringify(execution.report, null, 2),
  );
}

test("valid Platform Contracts agent governance passes", (t) => {
  const execution = runVerifier(createFixture(t));
  assert.equal(
    execution.result.status,
    0,
    `${execution.result.stdout}\n${execution.result.stderr}`,
  );
  assert.equal(execution.report.status, "pass");
  assert.equal(execution.report.taskId, "P0-T02A");
  assert.equal(execution.report.currentState, "checkpoint-review-required");
});

test("missing ADR requirement fails closed", (t) => {
  const root = createFixture(t);
  mutateProfile(root, (profile) => profile.requiredAdrReferences.shift());
  assertFailedCheck(runVerifier(root), "adrRequirements");
});

test("incorrect authority order fails closed", (t) => {
  const root = createFixture(t);
  mutateProfile(root, (profile) => {
    [profile.authorityHierarchy[0], profile.authorityHierarchy[1]] = [
      profile.authorityHierarchy[1],
      profile.authorityHierarchy[0],
    ];
  });
  assertFailedCheck(runVerifier(root), "authorityHierarchy");
});

test("missing NEEDS_DESIGN_DECISION procedure fails closed", (t) => {
  const root = createFixture(t);
  mutateAgents(root, (content) =>
    content.replaceAll("NEEDS_DESIGN_DECISION", "DESIGN_PROCEDURE_REMOVED"),
  );
  assertFailedCheck(runVerifier(root), "stopConditions");
});

test("missing main merge prohibition fails closed", (t) => {
  const root = createFixture(t);
  mutateAgents(root, (content) =>
    content.replace(
      "Agents must not merge into main.",
      "The main merge rule was removed for this fixture.",
    ),
  );
  assertFailedCheck(runVerifier(root), "gitAuthority");
});

test("missing production prohibition fails closed", (t) => {
  const root = createFixture(t);
  mutateAgents(root, (content) =>
    content.replace(
      "Agents must not deploy to production, publish packages, approve a production release, approve Architecture Freeze or ADR changes, approve manufacturing knowledge, or approve manufacturing release.",
      "The production and release authority rule was removed for this fixture.",
    ),
  );
  assertFailedCheck(runVerifier(root), "releaseAuthority");
});

test("Platform Contracts claiming ADO ownership fails closed", (t) => {
  const root = createFixture(t);
  mutateProfile(root, (profile) => {
    profile.ownedResponsibilities.push("ADO runtime orchestration");
  });
  assertFailedCheck(runVerifier(root), "ownershipBoundaries");
});

test("Platform Contracts claiming Manufacturing OS ownership fails closed", (t) => {
  const root = createFixture(t);
  mutateProfile(root, (profile) => {
    profile.ownedResponsibilities.push(
      "Manufacturing OS Product DSL and manufacturing calculations",
    );
  });
  assertFailedCheck(runVerifier(root), "ownershipBoundaries");
});

test("missing domain-neutrality rule fails closed", (t) => {
  const root = createFixture(t);
  mutateProfile(root, (profile) => {
    profile.dependencyPolicy.domainNeutral = false;
  });
  assertFailedCheck(runVerifier(root), "domainNeutrality");
});

test("mutable authority reference fails closed", (t) => {
  const root = createFixture(t);
  mutateProfile(root, (profile) => {
    profile.authorityHierarchy[0].references[0] =
      "https://github.com/asxeed-codex/asxeed-platform-contracts/blob/main/docs/architecture/ASXEED_Architecture_Freeze_v1.1.md";
  });
  const execution = runVerifier(root);
  assertFailedCheck(execution, "immutableReferences");
  assert.ok(
    execution.report.errors.some(
      (error) => error.check === "authorityHierarchy",
    ),
  );
});

test("false successor-task start fails closed", (t) => {
  const root = createFixture(t);
  mutateProfile(root, (profile) => {
    profile.successorTasks["P0-T02D"] = "in-progress";
  });
  assertFailedCheck(runVerifier(root), "successorScope");
});

test("missing human checkpoint requirement fails closed", (t) => {
  const root = createFixture(t);
  mutateProfile(root, (profile) => {
    profile.humanCheckpointRequired = false;
  });
  assertFailedCheck(runVerifier(root), "humanCheckpoint");
});

test("missing confidentiality rule fails closed", (t) => {
  const root = createFixture(t);
  mutateAgents(root, (content) =>
    content.replace(
      "No secrets are permitted in files, prompts, logs, fixtures, artifacts, commits, or PR descriptions.",
      "The secret-handling rule was removed for this fixture.",
    ),
  );
  assertFailedCheck(runVerifier(root), "securityAndConfidentiality");
});

test("BLOCKED_EXTERNAL cannot replace architecture escalation", (t) => {
  const root = createFixture(t);
  mutateProfile(root, (profile) => {
    profile.requiredStopConditions.blockedExternalForArchitectureDecisions =
      true;
  });
  assertFailedCheck(runVerifier(root), "stopConditions");
});

test("missing README navigation fails closed", (t) => {
  const root = createFixture(t);
  const readmePath = path.join(root, "README.md");
  const content = fs.readFileSync(readmePath, "utf8");
  fs.writeFileSync(
    readmePath,
    content.replace(
      "[deterministic governance verifier](scripts/verify-platform-contracts-agents-governance.mjs)",
      "governance verifier navigation removed",
    ),
  );
  assertFailedCheck(runVerifier(root), "readmeNavigation");
});
