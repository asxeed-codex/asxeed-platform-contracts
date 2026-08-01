const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const { spawnSync } = require("node:child_process");
const { test } = require("node:test");

const repositoryRoot = path.resolve(__dirname, "..");
const verifierPath = path.join(
  repositoryRoot,
  "scripts",
  "verify-cross-repository-architecture-adoption.mjs",
);
const lockPath = path.join(
  repositoryRoot,
  "docs",
  "architecture",
  "cross-repository-adoption-lock.json",
);
const repositoryRoots = {
  platformContracts: repositoryRoot,
  ado: path.resolve(repositoryRoot, "..", "ado"),
  manufacturingOs: path.resolve(repositoryRoot, "..", "asxeed-manufacturing-os"),
};
const approvedCommits = {
  platformContracts: "4cd5fcd4ffe64371ce5a51372459cd225a6176f7",
  ado: "7e48d0ab23ea567be291cc49396f6a9e9ae2077c",
  manufacturingOs: "49d74b915f7b0095b6b79202f29e474367049dba",
};
const verifierModule = import(pathToFileURL(verifierPath).href);

function readLock() {
  return JSON.parse(fs.readFileSync(lockPath, "utf8"));
}

function runCli(extraArguments = []) {
  return spawnSync(process.execPath, [verifierPath, ...extraArguments], {
    cwd: repositoryRoot,
    encoding: "utf8",
    maxBuffer: 32 * 1024 * 1024,
  });
}

function parseReport(result) {
  assert.notEqual(
    result.stdout,
    "",
    `verifier emitted no report\nstderr:\n${result.stderr}`,
  );
  return JSON.parse(result.stdout);
}

function passingVerifierRunner() {
  const result = (label) => ({
    label,
    exitCode: 0,
    status: "pass",
    report: { status: "pass" },
    parseError: null,
    stderr: "",
  });
  return {
    method: "test-approved-verifier-fixture",
    workingTreeContentUsed: false,
    canonical: result("Platform Contracts canonical verifier"),
    ado: result("ADO consumer verifier"),
    manufacturingOs: result("Manufacturing OS consumer verifier"),
  };
}

async function verifyWith({ lock = readLock(), objectReader, roots = repositoryRoots } = {}) {
  const verifier = await verifierModule;
  return verifier.verifyCrossRepositoryAdoption({
    lock,
    repositoryRoots: roots,
    objectReader: objectReader ?? verifier.createGitObjectReader(),
    verifierRunner: passingVerifierRunner,
  });
}

async function readerWithFileOverride(repositoryKey, filePath, mutate) {
  const verifier = await verifierModule;
  const base = verifier.createGitObjectReader();
  return {
    repositoryExists: (root) => base.repositoryExists(root),
    remoteUrl: (root) => base.remoteUrl(root),
    commitExists: (root, commit) => base.commitExists(root, commit),
    readFile(root, commit, requestedPath) {
      const content = base.readFile(root, commit, requestedPath);
      if (
        root === repositoryRoots[repositoryKey] &&
        commit === approvedCommits[repositoryKey] &&
        requestedPath === filePath
      ) {
        return Buffer.from(mutate(content.toString("utf8")));
      }
      return content;
    },
  };
}

function assertFailedCheck(report, checkName) {
  assert.equal(report.status, "fail");
  assert.ok(
    report.errors.some((error) => error.check === checkName),
    JSON.stringify(report, null, 2),
  );
}

test("valid three-repository committed-object verification passes", () => {
  const result = runCli();
  const report = parseReport(result);

  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  assert.equal(report.status, "pass");
  assert.equal(report.verificationState, "checkpoint-review-required");
  assert.equal(report.p0T02Status, "not-started");
  assert.deepEqual(report.checks.taskGraph.metrics, {
    taskCount: 103,
    uniqueTaskIds: 103,
    dependencyReferences: 192,
    missingDependencyReferences: 0,
    dependencyCycles: 0,
    missingSprintReferences: 0,
    sprintOrderViolations: 0,
  });
  assert.equal(report.checks.verifierExecutions.canonical.status, "pass");
  assert.equal(report.checks.verifierExecutions.ado.status, "pass");
  assert.equal(report.checks.verifierExecutions.manufacturingOs.status, "pass");
});

test("wrong ADO merge commit fails closed", async () => {
  const lock = readLock();
  lock.repositories.ado.commit = "0000000000000000000000000000000000000000";
  assertFailedCheck(await verifyWith({ lock }), "repositoryCommitLock");
});

test("wrong Manufacturing OS merge commit fails closed", async () => {
  const lock = readLock();
  lock.repositories.manufacturingOs.commit =
    "0000000000000000000000000000000000000000";
  assertFailedCheck(await verifyWith({ lock }), "repositoryCommitLock");
});

test("wrong canonical Platform Contracts commit fails closed", async () => {
  const lock = readLock();
  lock.repositories.platformContracts.commit =
    "0000000000000000000000000000000000000000";
  assertFailedCheck(await verifyWith({ lock }), "repositoryCommitLock");
});

test("mismatched canonical document hash fails closed", async () => {
  const lock = readLock();
  lock.documents[0].sha256 = "0".repeat(64);
  const report = await verifyWith({ lock });
  assertFailedCheck(report, "documents");
  assert.ok(report.errors.some((error) => error.check === "documentHashes"));
});

test("mismatched consumer authority hierarchy fails closed", async () => {
  const reader = await readerWithFileOverride(
    "ado",
    "docs/governance/architecture-adoption-manifest.json",
    (content) => {
      const manifest = JSON.parse(content);
      [manifest.authorityHierarchy[0], manifest.authorityHierarchy[1]] = [
        manifest.authorityHierarchy[1],
        manifest.authorityHierarchy[0],
      ];
      return `${JSON.stringify(manifest, null, 2)}\n`;
    },
  );
  assertFailedCheck(
    await verifyWith({ objectReader: reader }),
    "authorityHierarchy",
  );
});

test("ADO claiming Manufacturing OS ownership fails closed", async () => {
  const reader = await readerWithFileOverride(
    "ado",
    "docs/governance/ASXEED_ARCHITECTURE_ADOPTION.md",
    (content) => content.replace(
      "ADO must not own Product DSL content, manufacturing calculations, parts, geometry, drawings, 3D, BOM, manufacturing knowledge approval, manufacturing release approval, or customer/order/price/invoice sources of truth.",
      "ADO owns Product DSL and manufacturing results.",
    ),
  );
  assertFailedCheck(await verifyWith({ objectReader: reader }), "adoBoundaries");
});

test("Manufacturing OS missing Product DSL protection fails closed", async () => {
  const reader = await readerWithFileOverride(
    "manufacturingOs",
    "docs/governance/ASXEED_ARCHITECTURE_ADOPTION.md",
    (content) => content.replace(
      "Product DSL must not contain customer data, order quantity, prices, drawing commands, DXF or SVG commands, 3D coordinates, or engine-specific rendering instructions.",
      "The Product DSL protection statement was removed for this fixture.",
    ),
  );
  assertFailedCheck(
    await verifyWith({ objectReader: reader }),
    "productDslProtection",
  );
});

test("mutable or unversioned authority reference fails closed", async () => {
  const reader = await readerWithFileOverride(
    "ado",
    "docs/governance/architecture-adoption-manifest.json",
    (content) => {
      const manifest = JSON.parse(content);
      manifest.canonicalSource.authorityUrl =
        "https://github.com/asxeed-codex/asxeed-platform-contracts/blob/main/docs/architecture/adoption-manifest.json";
      return `${JSON.stringify(manifest, null, 2)}\n`;
    },
  );
  assertFailedCheck(
    await verifyWith({ objectReader: reader }),
    "immutableReferences",
  );
});

test("missing repository or approved commit fails closed", async (t) => {
  await t.test("missing repository", async () => {
    const roots = {
      ...repositoryRoots,
      ado: path.join(os.tmpdir(), "p0-t01d-missing-ado-repository"),
    };
    assertFailedCheck(await verifyWith({ roots }), "repositories");
  });

  await t.test("missing approved commit", async () => {
    const verifier = await verifierModule;
    const base = verifier.createGitObjectReader();
    const reader = {
      repositoryExists: (root) => base.repositoryExists(root),
      remoteUrl: (root) => base.remoteUrl(root),
      commitExists(root, commit) {
        if (
          root === repositoryRoots.manufacturingOs &&
          commit === approvedCommits.manufacturingOs
        ) {
          return false;
        }
        return base.commitExists(root, commit);
      },
      readFile: (root, commit, filePath) =>
        base.readFile(root, commit, filePath),
    };
    assertFailedCheck(await verifyWith({ objectReader: reader }), "approvedCommits");
  });
});

test("dirty unrelated Manufacturing OS working-tree files do not affect verification", () => {
  const temporaryRoot = fs.mkdtempSync(
    path.join(os.tmpdir(), "p0-t01d-dirty-manufacturing-os-"),
  );
  const dirtyRepository = path.join(temporaryRoot, "asxeed-manufacturing-os");
  try {
    const clone = spawnSync(
      "git",
      ["clone", "--quiet", "--shared", repositoryRoots.manufacturingOs, dirtyRepository],
      { encoding: "utf8" },
    );
    assert.equal(clone.status, 0, clone.stderr);
    const checkout = spawnSync(
      "git",
      ["-C", dirtyRepository, "checkout", "--quiet", "--detach", approvedCommits.manufacturingOs],
      { encoding: "utf8" },
    );
    assert.equal(checkout.status, 0, checkout.stderr);
    const remote = spawnSync(
      "git",
      ["-C", dirtyRepository, "remote", "set-url", "origin", "https://github.com/asxeed-codex/asxeed-manufacturing-os.git"],
      { encoding: "utf8" },
    );
    assert.equal(remote.status, 0, remote.stderr);

    const unrelatedPath = path.join(dirtyRepository, ".ado", "unrelated-runtime-record.json");
    fs.writeFileSync(unrelatedPath, '{"authority":"working-tree-only"}\n');
    const before = spawnSync(
      "git",
      ["-C", dirtyRepository, "status", "--porcelain=v1", "--untracked-files=all"],
      { encoding: "utf8" },
    );
    assert.match(before.stdout, /unrelated-runtime-record\.json/);

    const result = runCli([
      "--manufacturing-repository",
      dirtyRepository,
    ]);
    const report = parseReport(result);
    assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
    assert.equal(report.status, "pass");
    assert.equal(report.checks.committedObjectIsolation.workingTreesIgnored, true);

    const after = spawnSync(
      "git",
      ["-C", dirtyRepository, "status", "--porcelain=v1", "--untracked-files=all"],
      { encoding: "utf8" },
    );
    assert.equal(after.stdout, before.stdout);
  } finally {
    fs.rmSync(temporaryRoot, { recursive: true, force: true });
  }
});
