#!/usr/bin/env node

import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const scriptPath = fileURLToPath(import.meta.url);
const repositoryRoot = resolve(dirname(scriptPath), "..");
const defaultLockPath = join(repositoryRoot, "docs/architecture/cross-repository-v1.2-adoption-lock.json");
const defaultGateMetadataPath = join(repositoryRoot, "docs/architecture/oa-00c-gate-metadata.json");

const EXPECTED = Object.freeze({
  taskId: "OA-00C",
  architectureVersion: "1.2",
  branch: "codex/OA-00C-cross-repository-v1-2-verification",
  baseBranch: "main",
  title: "OA-00C: verify cross-repository Architecture v1.2 adoption",
  repositories: Object.freeze({
    platformContracts: Object.freeze({
      repository: "asxeed-codex/asxeed-platform-contracts",
      commitField: "architectureCommit",
      commit: "a6445ec5a7fa2e27dabcd49bc494da4b0a5c6672",
      evidencePath: ".ado/artifacts/OA-00",
      evidenceLockField: "platformOa00EvidenceTree",
    }),
    ado: Object.freeze({
      repository: "asxeed-codex/ado",
      commitField: "adoptionCommit",
      commit: "53dfe785de99425e22add7ab3e300ba9d3d75c1d",
      evidencePath: ".ado/artifacts/OA-00A",
      evidenceLockField: "adoOa00aEvidenceTree",
    }),
    manufacturingOs: Object.freeze({
      repository: "asxeed-codex/asxeed-manufacturing-os",
      commitField: "adoptionCommit",
      commit: "c34bb03766683dc5d14b3093c23313312cccbcaf",
      evidencePath: ".ado/artifacts/OA-00B",
      evidenceLockField: "manufacturingOa00bEvidenceTree",
      additionalEvidencePath: ".ado/artifacts/OA-00B-POSTMERGE-FIX",
      additionalEvidenceLockField: "manufacturingPostMergeFixEvidenceTree",
    }),
  }),
});

const AUTHORITY_HIERARCHY = Object.freeze([
  "Architecture Freeze v1.2",
  "Adopted ADR-001 through ADR-030",
  "Technology Stack v1.0",
  "Technology Version Matrix v1.0",
  "Technology Selection Rationale v1.0",
  "Deferred Technology v1.0",
  "Master Implementation Plan v1.3",
  "ADO Task Graph v1.3 Markdown and JSON",
  "Sprint Execution Plan v1.1",
  "System Responsibility Boundaries v1.1",
  "Ontology Core Conceptual Model v0.1",
  "Ontology Architecture Compatibility Matrix v1.0",
  "Ontology Migration Strategy v1.0",
  "Ontology Rollback Strategy v1.0",
  "Development Readiness Report v1.0 and Phase 0 Architecture Adoption Codex Pack v1.3, interpreted through v1.2",
  "Repository-specific AGENTS.md rules, current task instructions, and existing implementation",
]);

const NAMESPACES = Object.freeze([
  "shared.*", "document.*", "company.*", "development.*", "agent.*", "manufacturing.*", "external-reference.*",
]);
const PROVENANCE = Object.freeze([
  "ontologySnapshotId", "ontologyVersion", "ontologyContentHash", "generatorVersion", "evidenceReferences", "ruleReferences", "generatedAt", "approvalState", "contentHash",
]);
const INTEGRATION_BOUNDARIES = Object.freeze([
  "versioned APIs", "versioned messages", "versioned events", "versioned artifacts", "versioned Platform Contracts packages",
]);

function run(command, args, options = {}) {
  return spawnSync(command, args, {
    cwd: options.cwd,
    encoding: options.encoding ?? "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
}

function runGit(root, args, encoding = "utf8") {
  return run("git", ["-C", root, ...args], { encoding });
}

function stderrText(result) {
  if (Buffer.isBuffer(result?.stderr)) return result.stderr.toString("utf8").trim();
  return String(result?.stderr ?? "").trim();
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function sameJson(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function clone(value) {
  return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
}

function normalizeRemote(remote) {
  return String(remote ?? "")
    .trim()
    .replace(/^git@github\.com:/i, "https://github.com/")
    .replace(/^ssh:\/\/git@github\.com\//i, "https://github.com/")
    .replace(/\.git$/i, "")
    .replace(/\/$/, "")
    .toLowerCase();
}

function remoteMatches(remote, repository) {
  return normalizeRemote(remote) === `https://github.com/${repository}`.toLowerCase();
}

function parseJsonText(text, label) {
  try {
    return { value: JSON.parse(text), error: null };
  } catch (error) {
    return { value: null, error: `${label}: ${error.message}` };
  }
}

function readGitFile(root, commit, path, encoding = "utf8") {
  const result = runGit(root, ["show", `${commit}:${path}`], encoding);
  if (result.status !== 0) throw new Error(stderrText(result) || `${path} is unavailable at ${commit}`);
  return result.stdout;
}

function gitTree(root, reference, path = null) {
  const target = path ? `${reference}:${path}` : `${reference}^{tree}`;
  const result = runGit(root, ["rev-parse", target]);
  return result.status === 0 ? result.stdout.trim() : null;
}

function sourceRecords(lock, key) {
  if (key === "platformContracts") {
    return [lock.platformContracts?.architectureManifest, lock.platformContracts?.ontologyVerifier, ...(lock.canonicalDocuments ?? [])].filter(Boolean);
  }
  const consumer = lock[key] ?? {};
  return [consumer.adoptionDocument, consumer.adoptionManifest, consumer.mergeReceipt, consumer.governanceProfile, ...(consumer.verifiers ?? [])].filter(Boolean);
}

function collectRepository(root, key, lock) {
  const expected = EXPECTED.repositories[key];
  const locked = lock[key] ?? {};
  const commit = locked[expected.commitField];
  const repositoryResult = runGit(root, ["rev-parse", "--git-dir"]);
  const repositoryExists = repositoryResult.status === 0;
  const result = {
    root,
    repositoryExists,
    remote: null,
    remoteMatched: false,
    commitExists: false,
    head: null,
    headDescendsFromPinned: false,
    committedDrift: true,
    worktreeDrift: true,
    pinnedHashes: {},
    evidenceTrees: {},
  };
  if (!repositoryExists) return result;

  const remote = runGit(root, ["config", "--get", "remote.origin.url"]);
  result.remote = remote.status === 0 ? remote.stdout.trim() : null;
  result.remoteMatched = remote.status === 0 && remoteMatches(result.remote, expected.repository);
  result.commitExists = runGit(root, ["cat-file", "-e", `${commit}^{commit}`]).status === 0;
  const head = runGit(root, ["rev-parse", "HEAD"]);
  result.head = head.status === 0 ? head.stdout.trim() : null;
  if (result.commitExists && result.head) {
    result.headDescendsFromPinned = runGit(root, ["merge-base", "--is-ancestor", commit, result.head]).status === 0;
    const paths = [...new Set(sourceRecords(lock, key).map((entry) => entry.path))];
    result.committedDrift = runGit(root, ["diff", "--quiet", commit, result.head, "--", ...paths]).status !== 0;
    const status = runGit(root, ["status", "--porcelain=v1", "--untracked-files=all", "--", ...paths]);
    result.worktreeDrift = status.status !== 0 || status.stdout !== "";
    for (const record of sourceRecords(lock, key)) {
      try {
        result.pinnedHashes[record.path] = sha256(readGitFile(root, commit, record.path, null));
      } catch {
        result.pinnedHashes[record.path] = null;
      }
    }
    result.evidenceTrees[expected.evidencePath] = gitTree(root, result.head, expected.evidencePath);
    if (expected.additionalEvidencePath) result.evidenceTrees[expected.additionalEvidencePath] = gitTree(root, result.head, expected.additionalEvidencePath);
  }
  return result;
}

function executeVerifier(label, root, path, args = []) {
  const result = run(process.execPath, [join(root, path), ...args], { cwd: root });
  let report = null;
  let parseError = null;
  try { report = JSON.parse(result.stdout); }
  catch (error) { parseError = error.message; }
  return {
    label,
    status: result.status === 0 && report?.status === "pass" ? "pass" : "fail",
    exitCode: result.status,
    reportedStatus: report?.status ?? null,
    parseError,
    stderr: stderrText(result),
    metrics: report?.metrics ?? null,
  };
}

export function runConsumerVerifierSuite({ repositoryRoots }) {
  const platform = repositoryRoots.platformContracts;
  const ado = repositoryRoots.ado;
  const manufacturing = repositoryRoots.manufacturingOs;
  return {
    platformArchitecture: executeVerifier("Platform historical Architecture verifier", platform, "scripts/verify-architecture-adoption.mjs"),
    platformHistoricalCrossRepository: executeVerifier("Platform historical v1.1 cross-repository verifier", platform, "scripts/verify-cross-repository-architecture-adoption.mjs", ["--manufacturing-repository", manufacturing]),
    platformGovernance: executeVerifier("Platform governance verifier", platform, "scripts/verify-platform-contracts-agents-governance.mjs"),
    platformOntology: executeVerifier("Platform Ontology verifier", platform, "scripts/verify-ontology-architecture.mjs"),
    adoArchitecture: executeVerifier("ADO historical Architecture verifier", ado, "scripts/verify-architecture-adoption.mjs"),
    adoGovernance: executeVerifier("ADO governance verifier", ado, "scripts/verify-ado-agents-governance.mjs"),
    adoOntology: executeVerifier("ADO Ontology adoption verifier", ado, "scripts/verify-ado-ontology-architecture-adoption.mjs", ["--canonical-root", platform]),
    manufacturingArchitecture: executeVerifier("Manufacturing historical Architecture verifier", manufacturing, "scripts/verify-architecture-adoption.mjs"),
    manufacturingGovernance: executeVerifier("Manufacturing governance verifier", manufacturing, "scripts/verify-manufacturing-os-agents-governance.mjs"),
    manufacturingOntology: executeVerifier("Manufacturing Ontology adoption verifier", manufacturing, "scripts/verify-manufacturing-os-ontology-architecture-adoption.mjs", ["--canonical-root", platform, "--ado-root", ado, "--source-repository-root", manufacturing]),
  };
}

function collectPr(repository, number, fixturePath = null) {
  if (fixturePath) {
    const parsed = parseJsonText(readFileSync(resolve(fixturePath), "utf8"), `PR fixture ${fixturePath}`);
    return parsed.error ? { collectionError: parsed.error } : parsed.value;
  }
  const fields = "number,state,isDraft,baseRefName,headRefName,headRefOid,headRepository,autoMergeRequest,mergedAt,mergedBy,mergeCommit,url,title";
  let baseOidSource = "gh-pr-view";
  let view = run("gh", ["pr", "view", String(number), "--repo", repository, "--json", `${fields},baseRefOid`]);
  if (view.status !== 0 && /unknown json field.*baserefoid/i.test(stderrText(view))) {
    view = run("gh", ["pr", "view", String(number), "--repo", repository, "--json", fields]);
    baseOidSource = null;
  }
  if (view.status !== 0) return { collectionError: stderrText(view) || `unable to inspect PR #${number}` };
  const parsed = parseJsonText(view.stdout, `${repository} PR #${number}`);
  if (parsed.error) return { collectionError: parsed.error };
  if (typeof parsed.value.baseRefOid !== "string" || parsed.value.baseRefOid.length === 0) {
    const baseOid = run("gh", ["api", `repos/${repository}/pulls/${number}`, "--jq", ".base.sha"]);
    if (baseOid.status !== 0 || baseOid.stdout.trim().length === 0) {
      return { ...parsed.value, collectionError: stderrText(baseOid) || "unable to prove the PR base OID" };
    }
    parsed.value.baseRefOid = baseOid.stdout.trim();
    baseOidSource = "github-rest-api";
  }
  const timeline = run("gh", ["api", `repos/${repository}/issues/${number}/timeline?per_page=100`]);
  if (timeline.status !== 0) return { ...parsed.value, collectionError: stderrText(timeline) || "unable to inspect PR timeline" };
  const events = parseJsonText(timeline.stdout, `${repository} PR #${number} timeline`);
  if (events.error || !Array.isArray(events.value)) return { ...parsed.value, collectionError: events.error ?? "PR timeline is not an array" };
  return {
    ...parsed.value,
    baseOidSource,
    autoMergeWasEnabled: events.value.some((event) => event?.event === "auto_merge_enabled"),
  };
}

function resolveCommitTree(root, repository, oid) {
  if (!oid) return null;
  const local = gitTree(root, oid);
  if (local) return local;
  const remote = run("gh", ["api", `repos/${repository}/git/commits/${oid}`, "--jq", ".tree.sha"]);
  return remote.status === 0 ? remote.stdout.trim() : null;
}

function enrichPrTrees(pr, root, repository) {
  if (!pr || pr.collectionError) return pr;
  const mergeOid = pr.mergeCommit?.oid ?? null;
  return {
    ...pr,
    headTreeOid: pr.headTreeOid ?? resolveCommitTree(root, repository, pr.headRefOid),
    mergeTreeOid: pr.mergeTreeOid ?? resolveCommitTree(root, repository, mergeOid),
  };
}

function commitParents(root, oid) {
  if (!oid) return null;
  const result = runGit(root, ["show", "-s", "--format=%P", oid]);
  if (result.status !== 0) return null;
  const output = result.stdout.trim();
  return output.length === 0 ? [] : output.split(/\s+/);
}

function commitCount(root, base, head) {
  if (!base || !head) return null;
  const result = runGit(root, ["rev-list", "--count", `${base}..${head}`]);
  if (result.status !== 0 || !/^\d+$/.test(result.stdout.trim())) return null;
  return Number.parseInt(result.stdout.trim(), 10);
}

function ancestorState(root, ancestor, descendant) {
  if (!ancestor || !descendant) return null;
  if (runGit(root, ["cat-file", "-e", `${ancestor}^{commit}`]).status !== 0) return null;
  if (runGit(root, ["cat-file", "-e", `${descendant}^{commit}`]).status !== 0) return null;
  const result = runGit(root, ["merge-base", "--is-ancestor", ancestor, descendant]);
  if (result.status === 0) return true;
  if (result.status === 1) return false;
  return null;
}

function fingerprintOriginalCheckout(root) {
  const result = runGit(root, ["status", "--porcelain=v1", "-z", "--untracked-files=all"], null);
  return result.status === 0 ? sha256(result.stdout) : null;
}

function parsePinnedJson(root, commit, path) {
  try { return JSON.parse(readGitFile(root, commit, path)); }
  catch { return null; }
}

function readPinnedText(root, commit, path) {
  try { return readGitFile(root, commit, path); }
  catch { return ""; }
}

export function collectObservations({
  lock,
  gateMetadata,
  repositoryRoots,
  originalManufacturingRoot,
  gatePrFixturePath = null,
  verifierRunner = runConsumerVerifierSuite,
}) {
  const repositories = {
    platformContracts: collectRepository(repositoryRoots.platformContracts, "platformContracts", lock),
    ado: collectRepository(repositoryRoots.ado, "ado", lock),
    manufacturingOs: collectRepository(repositoryRoots.manufacturingOs, "manufacturingOs", lock),
  };
  const platformCommit = EXPECTED.repositories.platformContracts.commit;
  const adoCommit = EXPECTED.repositories.ado.commit;
  const manufacturingCommit = EXPECTED.repositories.manufacturingOs.commit;

  const gatePr = enrichPrTrees(
    collectPr(EXPECTED.repositories.platformContracts.repository, gateMetadata.pullRequestNumber, gatePrFixturePath),
    repositoryRoots.platformContracts,
    EXPECTED.repositories.platformContracts.repository,
  );
  const adoptionPrs = {
    platformContracts: enrichPrTrees(collectPr(EXPECTED.repositories.platformContracts.repository, lock.adoptionProvenance.platformContracts.pullRequest), repositoryRoots.platformContracts, EXPECTED.repositories.platformContracts.repository),
    ado: enrichPrTrees(collectPr(EXPECTED.repositories.ado.repository, lock.adoptionProvenance.ado.pullRequest), repositoryRoots.ado, EXPECTED.repositories.ado.repository),
    manufacturingOs: enrichPrTrees(collectPr(EXPECTED.repositories.manufacturingOs.repository, lock.adoptionProvenance.manufacturingOs.pullRequest), repositoryRoots.manufacturingOs, EXPECTED.repositories.manufacturingOs.repository),
  };

  const platformRoot = repositoryRoots.platformContracts;
  const authorizedBase = gateMetadata.authorizedBaseCommit;
  const prHeadOid = gatePr?.headRefOid ?? null;
  const mergeOid = gatePr?.mergeCommit?.oid ?? null;
  const prHeadExists = prHeadOid ? runGit(platformRoot, ["cat-file", "-e", `${prHeadOid}^{commit}`]).status === 0 : false;
  const mergeCommitExists = mergeOid ? runGit(platformRoot, ["cat-file", "-e", `${mergeOid}^{commit}`]).status === 0 : false;
  const mergeParentOids = mergeCommitExists ? commitParents(platformRoot, mergeOid) : null;
  const gateGit = {
    prBaseMatchesAuthorizedBase: gatePr?.baseRefOid === authorizedBase,
    prHeadExists,
    prHeadDescendsFromBase: prHeadOid ? ancestorState(platformRoot, authorizedBase, prHeadOid) === true : false,
    prHeadAncestorOfCurrent: prHeadOid && repositories.platformContracts.head ? ancestorState(platformRoot, prHeadOid, repositories.platformContracts.head) === true : false,
    prCommitCountFromBase: prHeadExists ? commitCount(platformRoot, authorizedBase, prHeadOid) : null,
    mergeCommitExists,
    mergeDescendsFromBase: mergeOid ? ancestorState(platformRoot, authorizedBase, mergeOid) === true : false,
    mergeAncestorOfCurrent: mergeOid && repositories.platformContracts.head ? ancestorState(platformRoot, mergeOid, repositories.platformContracts.head) === true : false,
    mergeParentOids,
    mergeParentCount: Array.isArray(mergeParentOids) ? mergeParentOids.length : null,
    mergeCommitCountFromBase: mergeCommitExists ? commitCount(platformRoot, authorizedBase, mergeOid) : null,
    prHeadAncestorOfMerge: prHeadExists && mergeCommitExists ? ancestorState(platformRoot, prHeadOid, mergeOid) : null,
  };

  return {
    repositories,
    canonicalManifest: parsePinnedJson(repositoryRoots.platformContracts, platformCommit, lock.platformContracts.architectureManifest.path),
    taskGraph: parsePinnedJson(repositoryRoots.platformContracts, platformCommit, "docs/plans/ADO_TASK_GRAPH_v1.3.json"),
    platformTexts: {
      freeze: readPinnedText(repositoryRoots.platformContracts, platformCommit, "docs/architecture/ASXEED_Architecture_Freeze_v1.2.md"),
      boundaries: readPinnedText(repositoryRoots.platformContracts, platformCommit, "docs/architecture/SYSTEM_RESPONSIBILITY_BOUNDARIES_v1.1.md"),
    },
    ado: {
      manifest: parsePinnedJson(repositoryRoots.ado, adoCommit, lock.ado.adoptionManifest.path),
      profile: parsePinnedJson(repositoryRoots.ado, adoCommit, lock.ado.governanceProfile.path),
      adoptionDocument: readPinnedText(repositoryRoots.ado, adoCommit, lock.ado.adoptionDocument.path),
    },
    manufacturingOs: {
      manifest: parsePinnedJson(repositoryRoots.manufacturingOs, manufacturingCommit, lock.manufacturingOs.adoptionManifest.path),
      profile: parsePinnedJson(repositoryRoots.manufacturingOs, manufacturingCommit, lock.manufacturingOs.governanceProfile.path),
      mergeReceipt: parsePinnedJson(repositoryRoots.manufacturingOs, manufacturingCommit, lock.manufacturingOs.mergeReceipt.path),
      adoptionDocument: readPinnedText(repositoryRoots.manufacturingOs, manufacturingCommit, lock.manufacturingOs.adoptionDocument.path),
    },
    verifierResults: verifierRunner({ repositoryRoots }),
    adoptionPrs,
    gatePr,
    gateGit,
    navigation: {
      rootReadme: existsSync(join(repositoryRoots.platformContracts, "README.md")) ? readFileSync(join(repositoryRoots.platformContracts, "README.md"), "utf8") : "",
      docsReadme: existsSync(join(repositoryRoots.platformContracts, "docs/README.md")) ? readFileSync(join(repositoryRoots.platformContracts, "docs/README.md"), "utf8") : "",
    },
    originalManufacturingFingerprint: fingerprintOriginalCheckout(originalManufacturingRoot),
  };
}

function createState() {
  const checks = {};
  const errors = [];
  const record = (name, condition, message) => {
    checks[name] ??= { status: "pass", checked: 0 };
    checks[name].checked += 1;
    if (!condition) {
      checks[name].status = "fail";
      errors.push({ check: name, message });
    }
  };
  const detail = (name, key, value) => {
    checks[name] ??= { status: "pass", checked: 0 };
    checks[name][key] = value;
  };
  return { checks, errors, record, detail };
}

function hasLink(content, target) {
  const escaped = target.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`\\[[^\\]]+\\]\\(${escaped}\\)`).test(content);
}

function normalizePueTarget(value = "") {
  return value
    .toLowerCase()
    .replace("ado knowledge core / ontology", "ado knowledge core / manufacturing ontology")
    .replace("manufacturing os product dsl generator", "manufacturing product dsl generator")
    .replace(/\s+/g, " ")
    .trim();
}

function validateTaskGraph(graph, state) {
  const tasks = Array.isArray(graph?.tasks) ? graph.tasks : [];
  const byId = new Map(tasks.map((task) => [task.id, task]));
  const ids = tasks.map((task) => task.id);
  const missing = [];
  for (const task of tasks) for (const dependency of task.dependsOn ?? []) if (!byId.has(dependency)) missing.push(`${task.id}->${dependency}`);
  const visits = new Map();
  const cycles = [];
  function visit(id, path) {
    if (visits.get(id) === "visiting") { cycles.push([...path, id].join("->")); return; }
    if (visits.get(id) === "visited") return;
    visits.set(id, "visiting");
    for (const dependency of byId.get(id)?.dependsOn ?? []) if (byId.has(dependency)) visit(dependency, [...path, id]);
    visits.set(id, "visited");
  }
  for (const id of ids) visit(id, []);
  const sprintSequence = new Map((graph?.sprints ?? []).map((sprint) => [sprint.id, sprint.sequence]));
  const sprintViolations = [];
  for (const task of tasks) {
    if (!sprintSequence.has(task.sprintId)) sprintViolations.push(`${task.id}->missing:${task.sprintId}`);
    for (const dependency of task.dependsOn ?? []) if (sprintSequence.get(byId.get(dependency)?.sprintId) > sprintSequence.get(task.sprintId)) sprintViolations.push(`${task.id}->${dependency}`);
  }
  const oaIds = ids.filter((id) => id.startsWith("OA-"));
  state.record("taskGraph", graph?.taskCount === 115 && tasks.length === 115 && new Set(ids).size === 115, "Task Graph must contain 115 unique tasks");
  state.record("taskGraph", oaIds.length === 12 && graph?.oldTaskCount === 103 && graph?.ontologyTaskCount === 12, "Task Graph must contain 103 predecessor and 12 OA tasks");
  state.record("taskGraph", missing.length === 0 && cycles.length === 0 && sprintViolations.length === 0, `Task Graph dependency/sprint failure: ${[...missing, ...cycles, ...sprintViolations].join(", ")}`);
  state.record("successorSourceState", byId.get("OA-00C")?.status === "not-started" && byId.get("OA-01")?.status === "not-started" && byId.get("OA-02")?.status === "not-started", "historical Task Graph must not claim OA-00C/OA-01/OA-02 runtime progress");
  state.detail("taskGraph", "metrics", { taskCount: tasks.length, predecessorTaskIds: ids.length - oaIds.length, oaTaskIds: oaIds.length, missingDependencies: missing.length, cycles: cycles.length, sprintOrderViolations: sprintViolations.length });
}

function validateRepositoryObservations(lock, observations, state) {
  for (const [key, expected] of Object.entries(EXPECTED.repositories)) {
    const locked = lock[key];
    const observed = observations.repositories?.[key] ?? {};
    state.record("repositoryIdentity", locked?.repository === expected.repository && observed.repositoryExists && observed.remoteMatched, `${key} repository identity is unavailable or incorrect`);
    state.record("repositoryCommitLock", locked?.[expected.commitField] === expected.commit && observed.commitExists, `${key} pinned commit is incorrect or unavailable`);
    state.record("repositoryAncestry", observed.headDescendsFromPinned === true, `${key} HEAD is not the pinned commit or a descendant`);
    state.record("committedCanonicalDrift", observed.committedDrift === false, `${key} immutable adoption source has committed drift`);
    state.record("uncommittedCanonicalDrift", observed.worktreeDrift === false, `${key} immutable adoption source has uncommitted drift`);
    for (const record of sourceRecords(lock, key)) {
      state.record("sourceHashes", observed.pinnedHashes?.[record.path] === record.sha256, `${key}:${record.path} hash differs from the lock`);
    }
    const evidenceTree = observed.evidenceTrees?.[expected.evidencePath];
    state.record("historicalEvidence", evidenceTree === lock.historicalPreservation?.[expected.evidenceLockField], `${key} historical evidence tree changed`);
    if (expected.additionalEvidencePath) {
      state.record("historicalEvidence", observed.evidenceTrees?.[expected.additionalEvidencePath] === lock.historicalPreservation?.[expected.additionalEvidenceLockField], `${key} post-merge evidence tree changed`);
    }
  }
}

function validateAdoptionPr(key, pr, locked, state) {
  const expectedRepository = EXPECTED.repositories[key].repository;
  const mergeOid = pr?.mergeCommit?.oid ?? null;
  state.record("humanAdoptionProvenance", !pr?.collectionError && pr?.number === locked.pullRequest && pr?.state === "MERGED" && pr?.isDraft === false && pr?.baseRefName === "main", `${key} adoption PR identity/state is invalid`);
  state.record("humanAdoptionProvenance", pr?.headRepository?.nameWithOwner === expectedRepository && pr?.headRefOid === locked.finalHead && mergeOid === locked.mergeCommit && pr?.mergedAt === locked.mergedAt, `${key} adoption PR head/merge provenance differs`);
  state.record("humanAdoptionProvenance", pr?.headTreeOid === locked.headTree && pr?.mergeTreeOid === locked.mergeTree && locked.headTree === locked.mergeTree, `${key} adoption squash tree provenance differs`);
  state.record("humanAdoptionProvenance", pr?.mergedBy?.is_bot === false && pr?.mergedBy?.login === locked.humanMergerLogin, `${key} adoption merger metadata is absent or bot-owned`);
  state.record("humanAdoptionProvenance", pr?.autoMergeRequest === null && pr?.autoMergeWasEnabled === false && locked.autoMergeUsed === false, `${key} adoption must not use auto-merge`);
}

function validateArchitecture(lock, observations, state) {
  const canonicalDocuments = observations.canonicalManifest?.documents?.map(({ name, path, version, sha256: hash }) => ({ name, path, version, sha256: hash }));
  state.record("canonicalDocuments", observations.canonicalManifest?.taskId === "OA-00" && observations.canonicalManifest?.architectureVersion === "1.2" && observations.canonicalManifest?.documents?.length === 18, "canonical OA-00 manifest identity/count is invalid");
  state.record("canonicalDocuments", sameJson(canonicalDocuments, lock.canonicalDocuments), "canonical 18-document path/version/hash order differs from the lock");
  state.record("historicalManifestTruth", observations.canonicalManifest?.formallyAdopted === false && observations.canonicalManifest?.merged === false, "historical OA-00 pre-merge flags must remain unchanged");

  const adoManifest = observations.ado?.manifest;
  const manufacturingManifest = observations.manufacturingOs?.manifest;
  state.record("consumerDocuments", sameJson(adoManifest?.documents?.map(({ name, canonicalPath: path, version, sha256: hash }) => ({ name, path, version, sha256: hash })), lock.canonicalDocuments), "ADO canonical documents differ");
  state.record("consumerDocuments", sameJson(manufacturingManifest?.documents?.map(({ name, canonicalPath: path, version, sha256: hash }) => ({ name, path, version, sha256: hash })), lock.canonicalDocuments), "Manufacturing canonical documents differ");
  state.record("historicalManifestTruth", adoManifest?.localAdoptionStatus === "checkpoint-review-required" && manufacturingManifest?.localAdoptionStatus === "checkpoint-review-required", "consumer pre-merge manifests must remain immutable historical records");

  const adoHierarchy = observations.ado?.profile?.authorityHierarchy?.map((entry) => entry.authority) ?? adoManifest?.authorityHierarchy;
  const manufacturingHierarchy = observations.manufacturingOs?.profile?.authorityHierarchy?.map((entry) => entry.authority) ?? manufacturingManifest?.authorityHierarchy;
  state.record("authorityHierarchy", sameJson(lock.authorityHierarchy, AUTHORITY_HIERARCHY) && sameJson(adoManifest?.authorityHierarchy, AUTHORITY_HIERARCHY) && sameJson(manufacturingManifest?.authorityHierarchy, AUTHORITY_HIERARCHY) && sameJson(adoHierarchy, AUTHORITY_HIERARCHY) && sameJson(manufacturingHierarchy, AUTHORITY_HIERARCHY), "the exact 16-level authority hierarchy must match everywhere");
}

function validateBoundaries(lock, observations, state) {
  const adoManifest = observations.ado?.manifest ?? {};
  const adoProfile = observations.ado?.profile ?? {};
  const manufacturingManifest = observations.manufacturingOs?.manifest ?? {};
  const manufacturingProfile = observations.manufacturingOs?.profile ?? {};
  const platformText = `${observations.platformTexts?.freeze ?? ""}\n${observations.platformTexts?.boundaries ?? ""}`;

  state.record("platformNeutrality", platformText.includes("Platform Contracts remains domain-neutral") && platformText.includes("must not execute ontology queries") && lock.ownershipLock?.platformContractsDoesNotOwn?.includes("operational Ontology runtime or data"), "Platform Contracts domain-neutral boundary is missing");
  state.record("adoOwnership", adoProfile.ownedResponsibilities?.includes("Knowledge Core runtime responsibility") && adoProfile.ownedResponsibilities?.includes("Ontology Builder and Knowledge Orchestrator orchestration") && adoProfile.adoKnowledgeCoreResponsibilities?.includes("Ontology query and traversal responsibility") && adoProfile.ontologyBuilderResponsibilities?.includes("Ontology Judge coordination"), "ADO Knowledge Core or Ontology Builder ownership is incomplete");
  state.record("adoOwnership", !adoProfile.ownedResponsibilities?.includes("Product DSL Generator ownership") && adoProfile.prohibitedManufacturingResponsibilities?.includes("Product DSL Generator ownership") && adoProfile.prohibitedManufacturingResponsibilities?.includes("Critical manufacturing-knowledge approval"), "ADO escalates into Manufacturing ownership");
  state.record("manufacturingOwnership", manufacturingProfile.ownedResponsibilities?.includes("Manufacturing Ontology Pack") && manufacturingProfile.ownedResponsibilities?.includes("manufacturing semantic validation") && manufacturingProfile.ownedResponsibilities?.includes("Product DSL Generator") && manufacturingProfile.ownedResponsibilities?.includes("deterministic Rule Engine and Rule Results"), "Manufacturing ownership is incomplete");
  state.record("manufacturingOwnership", manufacturingProfile.prohibitedResponsibilities?.includes("ADO Knowledge Core runtime") && manufacturingProfile.prohibitedResponsibilities?.includes("ADO Ontology Builder orchestration"), "Manufacturing OS escalates into ADO ownership");

  const approval = manufacturingProfile.manufacturingApprovalPolicy ?? {};
  state.record("humanApproval", approval.humanExclusive?.includes("Critical manufacturing-knowledge approval") && approval.adoCriticalManufacturingApproval === false && approval.oa00bMergeIsManufacturingApproval === false && adoProfile.approvalTruthfulness?.criticalManufacturingApprovalOwner === "human" && lock.humanApprovalLock?.judgeOutputIsApproval === false, "Critical manufacturing approval must remain genuinely human");

  const adoNamespace = adoProfile.namespaceAndOrganizationPolicy ?? {};
  const manufacturingNamespace = manufacturingProfile.namespaceAndOrganizationPolicy ?? {};
  state.record("namespacePolicy", sameJson(lock.namespaceLock?.families, NAMESPACES) && sameJson(adoNamespace.namespaceFamilies, NAMESPACES) && sameJson(manufacturingNamespace.namespaceFamilies, NAMESPACES), "namespace families differ");
  state.record("organizationIsolation", adoNamespace.organizationIdRequired === true && adoNamespace.explicitNamespaceRequired === true && manufacturingNamespace.organizationIdRequired === true && manufacturingNamespace.explicitNamespaceRequired === true, "organization or explicit namespace isolation is missing");
  state.record("namespacePolicy", adoNamespace.readProposalApprovalWriteSeparated === true && manufacturingNamespace.readProposalApprovalWriteSeparated === true && lock.namespaceLock?.unrestrictedSharedWriteAllowed === false, "read/proposal/approval/write separation is missing");

  const adoProduct = adoProfile.productDslPosition ?? {};
  const manufacturingProduct = manufacturingProfile.productDslTransitionPolicy ?? {};
  state.record("productDsl", adoProduct.artifactType === "immutable-versioned-execution-artifact" && adoProduct.persistentKnowledgeTruth === false && adoProduct.generatorOwner === "Manufacturing OS" && manufacturingProduct.position === "immutable-versioned-execution-artifact" && manufacturingProduct.persistentKnowledgeTruth === false && manufacturingProduct.generatorOwner === "Manufacturing OS", "Product DSL position or generator owner conflicts");
  state.record("productDsl", adoProduct.historicalVersionsImmutableAndReadable === true && manufacturingProduct.legacyImmutableAndReadable === true && manufacturingProduct.futureProvenanceRequiredOnLegacyNow === false && manufacturingProduct.migration === "additive-dual-read-reversible-human-gated" && sameJson(adoProduct.requiredProvenance, PROVENANCE) && sameJson(manufacturingProduct.futureRequiredProvenance, PROVENANCE), "Product DSL legacy/provenance/migration policy conflicts");

  const adoRule = adoProfile.ruleBoundary ?? {};
  const manufacturingRule = manufacturingProfile.ruleTransitionPolicy ?? {};
  state.record("ruleEngine", adoRule.ruleContentLocation === "Ontology" && adoRule.deterministicEvaluatorLocation === "Manufacturing OS code" && adoRule.deterministicRuleEnginePreserved === true && manufacturingRule.deterministicEvaluatorLocation === "Manufacturing OS code" && manufacturingRule.deterministicRuleEnginePreserved === true && manufacturingRule.typedOperatorsPreserved === true && manufacturingRule.decimalAndUnitBehaviorPreserved === true && manufacturingRule.dependencyAndCycleBehaviorPreserved === true && manufacturingRule.threeValuedResultsPreserved === true && manufacturingRule.failClosedPreserved === true, "Rule content/evaluator separation is incomplete");
  state.record("ruleEngine", manufacturingRule.currentRuleEngineReadsOntology === false && manufacturingRule.currentRuleEngineBehaviorChangedByOa00b === false, "current Rule Engine is falsely marked Ontology-backed or changed");

  const pue = manufacturingProfile.pueBoundary ?? {};
  state.record("pueState", pue.currentRuntimeFlow === "PUE -> existing Product DSL pipeline" && pue.currentPueReadsOrWritesOntology === false && pue.currentPueBehaviorChangedByOa00b === false && pue.ontologyIntegrationStatus === "not-started", "current PUE is falsely marked Ontology-backed or changed");
  state.record("pueState", normalizePueTarget(pue.targetFlow) === normalizePueTarget(lock.pueLock?.targetFlow) && lock.pueLock?.targetImplemented === false, "PUE target flow differs or is falsely implemented");

  const adoStorage = adoProfile.storagePolicy ?? {};
  const manufacturingStorage = manufacturingProfile.storagePolicy ?? {};
  state.record("storagePolicy", sameJson(adoStorage.approvedInitialPersistence, ["PostgreSQL", "Blob"]) && sameJson(manufacturingStorage.approvedInitialPersistence, ["PostgreSQL", "Blob"]) && adoStorage.graphSemanticsPersistenceIndependent === true && manufacturingStorage.graphSemanticsPersistenceIndependent === true && adoStorage.graphDatabaseApproved === false && manufacturingStorage.graphDatabaseApproved === false, "PostgreSQL/Blob or no-Graph-Database policy conflicts");

  const adoDependency = adoProfile.dependencyPolicy ?? {};
  const manufacturingDependency = manufacturingProfile.dependencyPolicy ?? {};
  state.record("integrationPolicy", adoDependency.directCrossDomainSqlOrmViewsTriggersStoredProcedures === "prohibited" && manufacturingDependency.directCrossDomainSqlOrmViewsTriggersStoredProcedures === "prohibited" && manufacturingDependency.adoDomainStorageAccess === "prohibited" && adoDependency.manufacturingOsDomainStorageAccess === "prohibited", "direct cross-domain database access is not prohibited");
  const normalizeBoundary = (value) => value.toLowerCase().replace("platform-contract", "platform contracts");
  const normalizedExpected = INTEGRATION_BOUNDARIES.map(normalizeBoundary);
  state.record("integrationPolicy", sameJson(manufacturingDependency.approvedIntegrationBoundaries?.map(normalizeBoundary), normalizedExpected) && sameJson(adoDependency.approvedIntegrationBoundaries?.map(normalizeBoundary), normalizedExpected), "approved versioned integration boundaries differ");

  state.record("orderAuthority", sameJson(adoManifest.ownershipSummary?.orderEngineOwns, ["customer", "order", "quantity", "price", "invoice", "inventory"]) && sameJson(manufacturingManifest.ownershipSummary?.orderEngineOwns, ["customer", "order", "quantity", "price", "invoice", "inventory"]), "Order Engine operational authority is missing");
  state.record("noAuthorityEscalation", adoManifest.prohibitedAuthorityEscalation?.separateKnowledgeOsAuthorized === false && adoManifest.prohibitedAuthorityEscalation?.separateOntologyOsAuthorized === false && manufacturingManifest.prohibitedAuthorityEscalation?.adoManufacturingSemanticOwnership === false && lock.prohibitedAuthorityEscalation?.generatedArtifactHumanApproval === false, "prohibited authority escalation changed");
}

function validateMergeReceipt(lock, observations, state) {
  const receipt = observations.manufacturingOs?.mergeReceipt ?? {};
  const provenance = lock.adoptionProvenance?.manufacturingOs ?? {};
  state.record("manufacturingMergeReceipt", receipt.taskId === "OA-00B" && receipt.pullRequest === 26 && receipt.repository === EXPECTED.repositories.manufacturingOs.repository && receipt.finalPrHead === provenance.finalHead && receipt.mergeCommit === provenance.mergeCommit && receipt.mergedAt === provenance.mergedAt, "Manufacturing merge receipt identity/provenance differs");
  state.record("manufacturingMergeReceipt", receipt.mergedBy?.isBot === false && receipt.mergedBy?.login === provenance.humanMergerLogin && receipt.mergedByHuman === true && receipt.treeEquivalenceVerified === true, "Manufacturing merge receipt lacks truthful human/tree evidence");
  state.record("manufacturingMergeReceipt", receipt.contentHashes?.finalPrHeadTree?.value === provenance.headTree && receipt.contentHashes?.mergeCommitTree?.value === provenance.mergeTree && provenance.headTree === provenance.mergeTree, "PR #26 tree provenance differs");
  state.record("manufacturingMergeReceipt", receipt.humanApprovalStatement?.includes("does not approve manufacturing knowledge"), "Architecture merge must not imply manufacturing approval");
}

function validateGateMetadata(gateMetadata, state) {
  state.record("gateMetadata", gateMetadata?.metadataVersion === "1.0" && gateMetadata?.taskId === EXPECTED.taskId && gateMetadata?.repository === EXPECTED.repositories.platformContracts.repository, "OA-00C gate metadata identity is invalid");
  state.record("gateMetadata", Number.isInteger(gateMetadata?.pullRequestNumber) && gateMetadata.pullRequestNumber > 0 && gateMetadata?.baseBranch === EXPECTED.baseBranch && gateMetadata?.headBranch === EXPECTED.branch, "OA-00C gate PR/base/head identity is invalid");
  state.record("gateMetadata", gateMetadata?.authorizedBaseCommit === EXPECTED.repositories.platformContracts.commit && gateMetadata?.mergeMethodPolicy === "squash" && gateMetadata?.humanApprovalRequired === true && gateMetadata?.autoMergeAllowed === false, "OA-00C gate policy is invalid");
  for (const forbidden of ["state", "isDraft", "checkpointReviewRequired", "merged", "mergeCommit", "mergedAt", "reviewStatus"]) {
    state.record("gateMetadata", gateMetadata?.[forbidden] === undefined, `gate metadata must not store temporary field ${forbidden}`);
  }
}

function validateGateLifecycle(gateMetadata, observations, state) {
  const pr = observations.gatePr ?? {};
  const git = observations.gateGit ?? {};
  const baseIdentity = !pr.collectionError && pr.number === gateMetadata.pullRequestNumber && pr.title === EXPECTED.title && pr.baseRefName === gateMetadata.baseBranch && pr.headRefName === gateMetadata.headBranch && pr.headRepository?.nameWithOwner === gateMetadata.repository;
  state.record("gateIdentity", baseIdentity, "OA-00C PR is missing, unrelated, or targets the wrong repository/base/head");
  state.record("autoMerge", pr.autoMergeRequest === null && pr.autoMergeWasEnabled === false && gateMetadata.autoMergeAllowed === false, "OA-00C auto-merge is enabled or was used");

  const postMerge = pr.state === "MERGED";
  if (!postMerge) {
    state.record("frozenBase", pr.baseRefOid === gateMetadata.authorizedBaseCommit && git.prBaseMatchesAuthorizedBase === true, "OA-00C PR base OID must remain the exact frozen authorized base before merge");
    state.record("preMergeGate", pr.state === "OPEN" && pr.isDraft === true && pr.mergedAt === null && pr.mergeCommit === null, "pre-merge OA-00C PR must be open, Draft, and unmerged");
    state.record("preMergeGate", git.prHeadExists === true && git.prHeadDescendsFromBase === true && git.prHeadAncestorOfCurrent === true, "pre-merge local HEAD must be the PR head or a clean descendant of it and the authorized base");
  } else {
    state.record("postMergeGate", pr.isDraft === false && typeof pr.mergedAt === "string" && typeof pr.mergeCommit?.oid === "string", "post-merge OA-00C metadata is incomplete");
    state.record("postMergeGate", pr.mergedBy?.is_bot === false && typeof pr.mergedBy?.login === "string" && pr.mergedBy.login.length > 0, "post-merge OA-00C merger must be a non-bot GitHub user");
    state.record("postMergeGate", git.mergeCommitExists === true && git.mergeDescendsFromBase === true && git.mergeAncestorOfCurrent === true, "post-merge current HEAD must be the merge commit or its descendant from the authorized base");
    state.record("squashHistory", git.mergeParentCount === 1 && sameJson(git.mergeParentOids, [gateMetadata.authorizedBaseCommit]) && git.mergeCommitCountFromBase === 1, "OA-00C squash merge must have the frozen authorized base as its sole parent and be exactly one commit beyond it");
    state.record("prHeadAncestry", git.prHeadExists === true && git.prHeadAncestorOfMerge === false, "the multi-commit OA-00C PR head must not be an ancestor of its squash merge commit");
    state.record("squashTree", typeof pr.headTreeOid === "string" && pr.headTreeOid === pr.mergeTreeOid, "OA-00C PR head tree must equal the squash merge tree");
    state.detail("squashHistory", "observed", { parentCount: git.mergeParentCount ?? null, parentOids: git.mergeParentOids ?? null, commitsFromAuthorizedBase: git.mergeCommitCountFromBase ?? null });
    state.detail("prHeadAncestry", "observedAncestor", git.prHeadAncestorOfMerge ?? null);
  }
  const validPostMerge = postMerge && state.errors.length === 0;
  const successor = validPostMerge ? { oa00c: "formally-adopted", oa01: "eligible-ready", oa02AndLater: "dependency-blocked" } : { oa00c: "checkpoint-review-required", oa01: "blocked", oa02AndLater: "blocked" };
  state.detail("successorGate", "lifecycle", postMerge ? "post-merge" : "pre-merge");
  state.detail("successorGate", "derivedState", successor);
  state.detail("successorGate", "exactMergeProvenanceValid", validPostMerge);
  return { postMerge, validPostMerge, successor };
}

export function verifyCrossRepositoryOntologyAdoption({ lock, gateMetadata, observations }) {
  const state = createState();
  state.record("lockIdentity", lock?.lockVersion === "1.0" && lock?.taskId === EXPECTED.taskId && lock?.architectureVersion === EXPECTED.architectureVersion, "OA-00C lock identity/version is invalid");
  state.record("lockIdentity", lock?.platformContracts?.repository === EXPECTED.repositories.platformContracts.repository && lock?.ado?.repository === EXPECTED.repositories.ado.repository && lock?.manufacturingOs?.repository === EXPECTED.repositories.manufacturingOs.repository, "OA-00C lock repository identities are invalid");
  state.record("canonicalDocuments", Array.isArray(lock?.canonicalDocuments) && lock.canonicalDocuments.length === 18 && new Set(lock.canonicalDocuments.map((entry) => entry.path)).size === 18, "lock must contain exactly 18 unique canonical document hashes");
  state.record("authorityHierarchy", sameJson(lock?.authorityHierarchy, AUTHORITY_HIERARCHY), "lock authority hierarchy differs from the approved exact order");
  state.record("namespacePolicy", sameJson(lock?.namespaceLock?.families, NAMESPACES), "lock namespace families differ");
  state.record("productDsl", sameJson(lock?.productDslLock?.futureProvenance, PROVENANCE), "lock Product DSL provenance differs");

  validateGateMetadata(gateMetadata, state);
  validateRepositoryObservations(lock, observations, state);
  validateArchitecture(lock, observations, state);
  validateBoundaries(lock, observations, state);
  validateMergeReceipt(lock, observations, state);
  validateTaskGraph(observations.taskGraph, state);

  for (const [key, provenance] of Object.entries(lock.adoptionProvenance ?? {})) validateAdoptionPr(key, observations.adoptionPrs?.[key], provenance, state);
  for (const [key, result] of Object.entries(observations.verifierResults ?? {})) {
    state.record("consumerVerifiers", result?.status === "pass" && result?.exitCode === 0 && result?.reportedStatus === "pass", `${key} failed: ${result?.stderr || result?.parseError || "no passing result"}`);
  }
  state.detail("consumerVerifiers", "results", Object.fromEntries(Object.entries(observations.verifierResults ?? {}).map(([key, result]) => [key, result?.status ?? "missing"])));

  const navigationTargets = [
    "docs/architecture/CROSS_REPOSITORY_ARCHITECTURE_V1_2_VERIFICATION.md",
    "docs/architecture/cross-repository-v1.2-adoption-lock.json",
    "docs/architecture/oa-00c-gate-metadata.json",
    "scripts/verify-cross-repository-ontology-adoption.mjs",
  ];
  for (const target of navigationTargets) state.record("readmeNavigation", hasLink(observations.navigation?.rootReadme ?? "", target), `README.md must link to ${target}`);
  for (const target of ["architecture/CROSS_REPOSITORY_ARCHITECTURE_V1_2_VERIFICATION.md", "architecture/cross-repository-v1.2-adoption-lock.json", "architecture/oa-00c-gate-metadata.json", "../scripts/verify-cross-repository-ontology-adoption.mjs"]) state.record("readmeNavigation", hasLink(observations.navigation?.docsReadme ?? "", target), `docs/README.md must link to ${target}`);

  state.record("originalCheckoutPreservation", observations.originalManufacturingFingerprint === lock.historicalPreservation?.originalManufacturingCheckoutFingerprint, "original Manufacturing checkout fingerprint changed or is unavailable");
  const lifecycle = validateGateLifecycle(gateMetadata, observations, state);

  return {
    status: state.errors.length === 0 ? "pass" : "fail",
    taskId: EXPECTED.taskId,
    architectureVersion: EXPECTED.architectureVersion,
    gateLifecycle: lifecycle.postMerge ? "post-merge" : "pre-merge",
    oa00cState: lifecycle.successor.oa00c,
    oa01State: lifecycle.successor.oa01,
    oa02AndLaterState: lifecycle.successor.oa02AndLater,
    repositoryCommits: Object.fromEntries(Object.entries(EXPECTED.repositories).map(([key, value]) => [key, { repository: value.repository, commit: value.commit }])),
    checks: state.checks,
    errors: state.errors,
  };
}

function parseOptions(args) {
  const options = {
    lockPath: defaultLockPath,
    gateMetadataPath: defaultGateMetadataPath,
    platformContracts: repositoryRoot,
    ado: resolve(repositoryRoot, "..", "ado"),
    manufacturingOs: resolve(repositoryRoot, "..", "asxeed-manufacturing-os-oa00c-precheck"),
    originalManufacturing: resolve(repositoryRoot, "..", "asxeed-manufacturing-os"),
    gatePrFixturePath: null,
  };
  const mappings = {
    "--lock": "lockPath",
    "--gate-metadata": "gateMetadataPath",
    "--platform-repository": "platformContracts",
    "--ado-repository": "ado",
    "--manufacturing-repository": "manufacturingOs",
    "--original-manufacturing-repository": "originalManufacturing",
    "--gate-pr-state-json": "gatePrFixturePath",
  };
  for (let index = 0; index < args.length; index += 1) {
    const field = mappings[args[index]];
    const value = args[index + 1];
    if (!field || !value) throw new Error(`unknown or incomplete argument: ${args[index]}`);
    options[field] = resolve(value);
    index += 1;
  }
  return options;
}

function runCli() {
  try {
    const options = parseOptions(process.argv.slice(2));
    const lock = JSON.parse(readFileSync(options.lockPath, "utf8"));
    const gateMetadata = JSON.parse(readFileSync(options.gateMetadataPath, "utf8"));
    const repositoryRoots = {
      platformContracts: options.platformContracts,
      ado: options.ado,
      manufacturingOs: options.manufacturingOs,
    };
    const observations = collectObservations({
      lock,
      gateMetadata,
      repositoryRoots,
      originalManufacturingRoot: options.originalManufacturing,
      gatePrFixturePath: options.gatePrFixturePath,
    });
    const report = verifyCrossRepositoryOntologyAdoption({ lock, gateMetadata, observations });
    console.log(JSON.stringify(report, null, 2));
    process.exitCode = report.status === "pass" ? 0 : 1;
  } catch (error) {
    console.log(JSON.stringify({ status: "fail", taskId: EXPECTED.taskId, errors: [{ check: "invocation", message: error.message }] }, null, 2));
    process.exitCode = 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) runCli();

export { AUTHORITY_HIERARCHY, EXPECTED, INTEGRATION_BOUNDARIES, NAMESPACES, PROVENANCE, clone };
