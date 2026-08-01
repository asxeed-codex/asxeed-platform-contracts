#!/usr/bin/env node

import { createHash } from "node:crypto";
import {
  mkdtempSync,
  readFileSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const scriptPath = fileURLToPath(import.meta.url);
const repositoryRoot = resolve(dirname(scriptPath), "..");
const defaultLockPath = join(
  repositoryRoot,
  "docs/architecture/cross-repository-adoption-lock.json",
);

const APPROVED = Object.freeze({
  platformContracts: Object.freeze({
    repository: "asxeed-codex/asxeed-platform-contracts",
    task: "P0-T01A",
    commit: "4cd5fcd4ffe64371ce5a51372459cd225a6176f7",
    manifestPath: "docs/architecture/adoption-manifest.json",
    verifierPath: "scripts/verify-architecture-adoption.mjs",
  }),
  ado: Object.freeze({
    repository: "asxeed-codex/ado",
    task: "P0-T01B",
    commit: "7e48d0ab23ea567be291cc49396f6a9e9ae2077c",
    manifestPath: "docs/governance/architecture-adoption-manifest.json",
    adoptionDocumentPath:
      "docs/governance/ASXEED_ARCHITECTURE_ADOPTION.md",
    verifierPath: "scripts/verify-architecture-adoption.mjs",
  }),
  manufacturingOs: Object.freeze({
    repository: "asxeed-codex/asxeed-manufacturing-os",
    task: "P0-T01C",
    commit: "49d74b915f7b0095b6b79202f29e474367049dba",
    manifestPath: "docs/governance/architecture-adoption-manifest.json",
    adoptionDocumentPath:
      "docs/governance/ASXEED_ARCHITECTURE_ADOPTION.md",
    verifierPath: "scripts/verify-architecture-adoption.mjs",
  }),
});

const EXPECTED_VERSIONS = Object.freeze({
  architectureFreezeVersion: "1.1",
  architectureClarificationVersion: "1.1-clarification-001",
  technologyBaselineVersion: "1.0",
  masterImplementationPlanVersion: "1.2",
  adoTaskGraphVersion: "1.2",
  sprintExecutionPlanVersion: "1.0",
  systemResponsibilityBoundariesVersion: "1.0",
  developmentReadinessReportVersion: "1.0",
  phase0CodexPackVersion: "1.3",
});

const CONSUMER_VERSION_FIELDS = Object.freeze({
  architectureFreeze: "architectureFreezeVersion",
  architectureClarification: "architectureClarificationVersion",
  technologyBaseline: "technologyBaselineVersion",
  masterImplementationPlan: "masterImplementationPlanVersion",
  adoTaskGraph: "adoTaskGraphVersion",
  sprintExecutionPlan: "sprintExecutionPlanVersion",
  systemResponsibilityBoundaries: "systemResponsibilityBoundariesVersion",
  developmentReadinessReport: "developmentReadinessReportVersion",
  phase0CodexPack: "phase0CodexPackVersion",
});

const EXPECTED_AUTHORITY_HIERARCHY = Object.freeze([
  "Architecture Freeze v1.1",
  "Architecture Freeze v1.1 Clarification 001",
  "Adopted ADR-001 through ADR-024",
  "Technology Stack v1.0",
  "Technology Version Matrix v1.0",
  "Technology Selection Rationale v1.0",
  "Deferred Technology v1.0",
  "Master Implementation Plan v1.2",
  "ADO Task Graph v1.2 Markdown and JSON",
  "Sprint Execution Plan v1.0",
  "System Responsibility Boundaries v1.0",
  "Development Readiness Report v1.0",
  "Phase 0 Architecture Adoption Codex Pack v1.3",
]);

const CANONICAL_AUTHORITY_MARKERS = Object.freeze([
  "Architecture Freeze v1.1",
  "Architecture Freeze v1.1 Clarification 001",
  "ADR-001 through ADR-024",
  "Technology Stack v1.0",
  "Technology Version Matrix v1.0",
  "Technology Selection Rationale v1.0",
  "Deferred Technology v1.0",
  "Master Implementation Plan v1.2",
  "ADO Task Graph v1.2",
  "Sprint Execution Plan v1.0",
  "System Responsibility Boundaries v1.0",
  "Development Readiness Report v1.0",
  "Phase 0 Architecture Adoption Codex Pack v1.3",
]);

const ADO_REQUIRED_STATEMENTS = Object.freeze([
  "ADO owns Goal Intake, plans, program/milestone/task graphs, agent routing, Codex execution coordination, verification artifacts, five-layer Judge coordination, deterministic policy gates, fix loops, development approvals, and development release orchestration.",
  "ADO must not own Product DSL content, manufacturing calculations, parts, geometry, drawings, 3D, BOM, manufacturing knowledge approval, manufacturing release approval, or customer/order/price/invoice sources of truth.",
  "ADO must not import Manufacturing OS internal packages or application modules.",
  "ADO must not query, join, migrate, or hold credentials for Manufacturing OS domain databases.",
  "ADO and Manufacturing OS may integrate only through versioned APIs, Temporal messages, CloudEvents-compatible events, versioned artifacts, and versioned platform-contract packages.",
  "Humans exclusively own merge decisions, production release decisions, and Architecture Freeze or ADR changes.",
]);

const MANUFACTURING_REQUIRED_STATEMENTS = Object.freeze({
  responsibilities: Object.freeze([
    "Manufacturing OS owns Evidence, Candidate, Conflict, Product DSL, Product Instance, deterministic manufacturing rules and results, parts, geometry, drawings, 3D, BOM, manufacturing knowledge approval, manufacturing release approval, and released manufacturing packages.",
    "Manufacturing OS must not own ADO Goal Intake; ADO program, milestone, or task orchestration; agent routing; Codex execution coordination; development Judge or Fix Loop ownership; GitHub PR coordination; the development approval inbox; customer, order, quantity, price, or invoice sources of truth; or platform-neutral shared contract ownership.",
    "Humans exclusively own merge decisions, production release decisions, Architecture Freeze or ADR changes, manufacturing knowledge approval, and manufacturing release approval.",
  ]),
  integrationBoundaries: Object.freeze([
    "Manufacturing OS must not import ADO internal packages or application modules.",
    "Manufacturing OS must not query, join, migrate, or hold credentials for ADO domain storage.",
    "Manufacturing OS may integrate with ADO, the order engine, and the common platform only through versioned APIs, Temporal messages, CloudEvents-compatible events, versioned artifacts, and versioned platform-contract packages.",
  ]),
  productDslProtection: Object.freeze([
    "Product DSL must not contain customer data, order quantity, prices, drawing commands, DXF or SVG commands, 3D coordinates, or engine-specific rendering instructions.",
    "Product-name-specific branching must not be used as the system architecture.",
  ]),
});

const PLATFORM_BOUNDARY_STATEMENTS = Object.freeze([
  "Canonical governance copies; versioned, domain-neutral shared contracts",
  "ADO orchestration or approval behavior; Manufacturing product rules",
  "Platform-contract packages must be domain-neutral and must not import ADO or Manufacturing OS internal packages.",
  "No repository may depend on an unversioned branch, mutable URL, or another repository's source tree for a shared contract.",
  "imports from another repository's internal domain packages or application modules",
  "ADO SQL, ORM, migration, or database credentials that access a Manufacturing OS domain schema",
  "Manufacturing OS SQL, ORM, migration, or database credentials that access an ADO domain schema",
  "Cross-domain reads and writes use a versioned contract at an approved API, message, event, or artifact boundary.",
]);

function runGit(repositoryPath, args, encoding = "utf8") {
  return spawnSync("git", ["-C", repositoryPath, ...args], {
    encoding,
    maxBuffer: 32 * 1024 * 1024,
  });
}

export function createGitObjectReader() {
  return {
    repositoryExists(repositoryPath) {
      return runGit(repositoryPath, ["rev-parse", "--git-dir"]).status === 0;
    },
    remoteUrl(repositoryPath) {
      const result = runGit(repositoryPath, ["config", "--get", "remote.origin.url"]);
      if (result.status !== 0) {
        throw new Error(result.stderr.trim() || "origin remote is unavailable");
      }
      return result.stdout.trim();
    },
    commitExists(repositoryPath, commit) {
      return runGit(repositoryPath, ["cat-file", "-e", `${commit}^{commit}`])
        .status === 0;
    },
    readFile(repositoryPath, commit, filePath) {
      const result = runGit(repositoryPath, ["show", `${commit}:${filePath}`], null);
      if (result.status !== 0) {
        const stderr = Buffer.isBuffer(result.stderr)
          ? result.stderr.toString("utf8").trim()
          : String(result.stderr ?? "").trim();
        throw new Error(stderr || `${filePath} is unavailable at ${commit}`);
      }
      return result.stdout;
    },
  };
}

function cloneAtCommit(sourcePath, destinationPath, commit) {
  const cloneResult = spawnSync(
    "git",
    ["clone", "--quiet", "--no-checkout", "--shared", "--", sourcePath, destinationPath],
    { encoding: "utf8", maxBuffer: 32 * 1024 * 1024 },
  );
  if (cloneResult.status !== 0) {
    throw new Error(
      `git clone failed for ${sourcePath}: ${cloneResult.stderr.trim()}`,
    );
  }
  const checkoutResult = runGit(destinationPath, [
    "-c",
    "core.hooksPath=/dev/null",
    "checkout",
    "--quiet",
    "--detach",
    commit,
  ]);
  if (checkoutResult.status !== 0) {
    throw new Error(
      `git checkout failed for ${commit}: ${checkoutResult.stderr.trim()}`,
    );
  }
}

function executeVerifier(label, root, verifierPath, canonicalRoot = null) {
  const args = [join(root, verifierPath)];
  if (canonicalRoot) {
    args.push("--repository-root", root, "--canonical-root", canonicalRoot);
  }
  const result = spawnSync(process.execPath, args, {
    cwd: root,
    encoding: "utf8",
    maxBuffer: 32 * 1024 * 1024,
  });
  let parsedReport = null;
  let parseError = null;
  try {
    parsedReport = JSON.parse(result.stdout);
  } catch (error) {
    parseError = error.message;
  }
  return {
    label,
    exitCode: result.status,
    status:
      result.status === 0 && parsedReport?.status === "pass" ? "pass" : "fail",
    report: parsedReport,
    parseError,
    stderr: result.stderr.trim(),
  };
}

export function runApprovedVerifierSuite({ repositoryRoots }) {
  const temporaryRoot = mkdtempSync(
    join(tmpdir(), "asxeed-p0-t01d-verification-"),
  );
  const extractedRoots = {
    platformContracts: join(temporaryRoot, "asxeed-platform-contracts"),
    ado: join(temporaryRoot, "ado"),
    manufacturingOs: join(temporaryRoot, "asxeed-manufacturing-os"),
  };

  try {
    for (const key of Object.keys(extractedRoots)) {
      cloneAtCommit(
        repositoryRoots[key],
        extractedRoots[key],
        APPROVED[key].commit,
      );
    }
    return {
      method: "temporary-detached-clones-from-approved-git-objects",
      workingTreeContentUsed: false,
      canonical: executeVerifier(
        "Platform Contracts canonical verifier",
        extractedRoots.platformContracts,
        APPROVED.platformContracts.verifierPath,
      ),
      ado: executeVerifier(
        "ADO consumer verifier",
        extractedRoots.ado,
        APPROVED.ado.verifierPath,
        extractedRoots.platformContracts,
      ),
      manufacturingOs: executeVerifier(
        "Manufacturing OS consumer verifier",
        extractedRoots.manufacturingOs,
        APPROVED.manufacturingOs.verifierPath,
        extractedRoots.platformContracts,
      ),
    };
  } finally {
    rmSync(temporaryRoot, { recursive: true, force: true });
  }
}

function createState() {
  const checks = {};
  const errors = [];
  function record(checkName, condition, message) {
    checks[checkName] ??= { status: "pass", checked: 0 };
    checks[checkName].checked += 1;
    if (!condition) {
      checks[checkName].status = "fail";
      errors.push({ check: checkName, message });
    }
    return condition;
  }
  function detail(checkName, name, value) {
    checks[checkName] ??= { status: "pass", checked: 0 };
    checks[checkName][name] = value;
  }
  return { checks, errors, record, detail };
}

function sameJson(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function sha256(content) {
  return createHash("sha256").update(content).digest("hex");
}

function parseJsonBuffer(content, label, checkName, state) {
  if (!content) {
    return null;
  }
  try {
    const parsed = JSON.parse(content.toString("utf8"));
    state.record(checkName, true, `${label} parses as JSON`);
    return parsed;
  } catch (error) {
    state.record(checkName, false, `${label} is invalid JSON: ${error.message}`);
    return null;
  }
}

function remoteMatchesRepository(remoteUrl, expectedRepository) {
  const normalized = remoteUrl
    .trim()
    .replace(/^git@github\.com:/i, "https://github.com/")
    .replace(/^ssh:\/\/git@github\.com\//i, "https://github.com/")
    .replace(/\.git$/i, "")
    .replace(/\/$/, "")
    .toLowerCase();
  return normalized === `https://github.com/${expectedRepository}`.toLowerCase();
}

function validateImmutableReferences(value, state, label, keyPath = []) {
  if (Array.isArray(value)) {
    value.forEach((entry, index) =>
      validateImmutableReferences(entry, state, label, [...keyPath, String(index)]),
    );
    return;
  }
  if (value && typeof value === "object") {
    for (const [key, entry] of Object.entries(value)) {
      validateImmutableReferences(entry, state, label, [...keyPath, key]);
    }
    return;
  }
  if (typeof value !== "string") {
    return;
  }

  const pathLabel = `${label}.${keyPath.join(".")}`;
  const finalKey = keyPath.at(-1) ?? "";
  const permittedTaskBranch =
    finalKey === "branch" &&
    (keyPath.at(-2) === "task" || keyPath.at(-2) === "verificationTask");

  if (!permittedTaskBranch && /(?:branch|ref|reference)$/i.test(finalKey)) {
    state.record(
      "immutableReferences",
      false,
      `${pathLabel} is a branch-only or unversioned authority reference`,
    );
  }

  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(value)) {
    const hasCommit = /[0-9a-f]{40}/i.test(value);
    const isMutable =
      /\/(?:blob|tree)\/(?:main|master|HEAD)(?:\/|$)|\/latest(?:\/|$)/i.test(
        value,
      );
    state.record(
      "immutableReferences",
      hasCommit && !isMutable,
      `${pathLabel} contains a mutable or unversioned URL`,
    );
  }
}

function validateLock(lock, state) {
  state.record("lock", lock?.lockVersion === "1.0", "lockVersion must be 1.0");
  state.record(
    "lock",
    lock?.verificationTask?.id === "P0-T01D",
    "verificationTask.id must be P0-T01D",
  );
  state.record(
    "lock",
    lock?.verificationTask?.branch ===
      "codex/P0-T01D-cross-repository-verification",
    "verificationTask.branch must identify the required branch",
  );
  state.record(
    "checkpoint",
    lock?.verificationTask?.state === "checkpoint-review-required" &&
      lock?.verificationState === "checkpoint-review-required",
    "P0-T01D must remain checkpoint-review-required",
  );
  state.record(
    "checkpoint",
    lock?.successorTasks?.["P0-T02"] === "not-started",
    "P0-T02 must remain not-started",
  );

  for (const [key, approved] of Object.entries(APPROVED)) {
    const repository = lock?.repositories?.[key];
    state.record(
      "repositoryCommitLock",
      repository?.repository === approved.repository,
      `${key}.repository must be ${approved.repository}`,
    );
    state.record(
      "repositoryCommitLock",
      repository?.approvedTask === approved.task,
      `${key}.approvedTask must be ${approved.task}`,
    );
    state.record(
      "repositoryCommitLock",
      repository?.commit === approved.commit,
      `${key}.commit must be ${approved.commit}`,
    );
    state.record(
      "repositoryCommitLock",
      repository?.adoptionManifestPath === approved.manifestPath,
      `${key}.adoptionManifestPath must be ${approved.manifestPath}`,
    );
    state.record(
      "repositoryCommitLock",
      repository?.verifierPath === approved.verifierPath,
      `${key}.verifierPath must be ${approved.verifierPath}`,
    );
    if (approved.adoptionDocumentPath) {
      state.record(
        "repositoryCommitLock",
        repository?.adoptionDocumentPath === approved.adoptionDocumentPath,
        `${key}.adoptionDocumentPath must be ${approved.adoptionDocumentPath}`,
      );
      state.record(
        "repositoryCommitLock",
        repository?.adoptionMethod === "stable-reference-manifest",
        `${key}.adoptionMethod must be stable-reference-manifest`,
      );
    }
  }

  for (const [field, expected] of Object.entries(EXPECTED_VERSIONS)) {
    state.record(
      "versions",
      lock?.versions?.[field] === expected,
      `lock versions.${field} must be ${expected}`,
    );
  }
  state.record(
    "authorityHierarchy",
    sameJson(lock?.authorityHierarchy, EXPECTED_AUTHORITY_HIERARCHY),
    "lock authorityHierarchy must match the adopted authority order",
  );
  state.record(
    "documents",
    Array.isArray(lock?.documents) && lock.documents.length === 13,
    "lock must contain exactly 13 canonical document representations",
  );
  state.record(
    "repositoryCommitLock",
    lock?.expectedConsumerManifestPaths?.ado === APPROVED.ado.manifestPath &&
      lock?.expectedConsumerManifestPaths?.manufacturingOs ===
        APPROVED.manufacturingOs.manifestPath,
    "expected consumer manifest paths must match the approved locations",
  );
  state.record(
    "repositoryCommitLock",
    lock?.expectedVerifierPaths?.platformContracts ===
      APPROVED.platformContracts.verifierPath &&
      lock?.expectedVerifierPaths?.ado === APPROVED.ado.verifierPath &&
      lock?.expectedVerifierPaths?.manufacturingOs ===
        APPROVED.manufacturingOs.verifierPath,
    "expected verifier paths must match the approved locations",
  );
  validateImmutableReferences(lock, state, "lock");
  state.record(
    "immutableReferences",
    true,
    "cross-repository lock immutable-reference scan completed",
  );
}

function validateTaskGraph(graph, state) {
  const tasks = Array.isArray(graph?.tasks) ? graph.tasks : [];
  const taskIds = tasks.map((task) => task?.id);
  const uniqueTaskIds = new Set(taskIds);
  const taskById = new Map(tasks.map((task) => [task?.id, task]));
  const missingDependencies = [];
  let dependencyReferences = 0;

  for (const task of tasks) {
    for (const dependency of task?.dependsOn ?? []) {
      dependencyReferences += 1;
      if (!taskById.has(dependency)) {
        missingDependencies.push(`${task?.id}->${dependency}`);
      }
    }
  }

  const visitState = new Map();
  const cycles = [];
  function visit(taskId, path) {
    if (visitState.get(taskId) === "visiting") {
      cycles.push([...path, taskId].join("->"));
      return;
    }
    if (visitState.get(taskId) === "visited") {
      return;
    }
    visitState.set(taskId, "visiting");
    for (const dependency of taskById.get(taskId)?.dependsOn ?? []) {
      if (taskById.has(dependency)) {
        visit(dependency, [...path, taskId]);
      }
    }
    visitState.set(taskId, "visited");
  }
  for (const taskId of taskIds) {
    visit(taskId, []);
  }

  const sprintSequence = new Map(
    (graph?.sprints ?? []).map((sprint) => [sprint.id, sprint.sequence]),
  );
  const missingSprintReferences = [];
  const sprintOrderViolations = [];
  for (const task of tasks) {
    if (!sprintSequence.has(task.sprintId)) {
      missingSprintReferences.push(`${task.id}->${task.sprintId}`);
    }
    for (const dependencyId of task.dependsOn ?? []) {
      const dependency = taskById.get(dependencyId);
      if (
        dependency &&
        Number.isInteger(sprintSequence.get(task.sprintId)) &&
        Number.isInteger(sprintSequence.get(dependency.sprintId)) &&
        sprintSequence.get(dependency.sprintId) >
          sprintSequence.get(task.sprintId)
      ) {
        sprintOrderViolations.push(`${task.id}->${dependencyId}`);
      }
    }
  }

  state.record(
    "taskGraph",
    graph?.taskCount === 103 && tasks.length === 103,
    `Task Graph must contain exactly 103 tasks; found taskCount=${graph?.taskCount}, tasks.length=${tasks.length}`,
  );
  state.record(
    "taskGraph",
    uniqueTaskIds.size === 103,
    `Task Graph must contain 103 unique task IDs; found ${uniqueTaskIds.size}`,
  );
  state.record(
    "taskGraph",
    missingDependencies.length === 0,
    `Task Graph has missing dependency references: ${missingDependencies.join(", ")}`,
  );
  state.record(
    "taskGraph",
    cycles.length === 0,
    `Task Graph has dependency cycles: ${cycles.join(", ")}`,
  );
  state.record(
    "taskGraph",
    missingSprintReferences.length === 0,
    `Task Graph has missing sprint references: ${missingSprintReferences.join(", ")}`,
  );
  state.record(
    "taskGraph",
    sprintOrderViolations.length === 0,
    `Task Graph has sprint-order violations: ${sprintOrderViolations.join(", ")}`,
  );
  state.detail("taskGraph", "metrics", {
    taskCount: tasks.length,
    uniqueTaskIds: uniqueTaskIds.size,
    dependencyReferences,
    missingDependencyReferences: missingDependencies.length,
    dependencyCycles: cycles.length,
    missingSprintReferences: missingSprintReferences.length,
    sprintOrderViolations: sprintOrderViolations.length,
  });
}

function validateCanonical(
  lock,
  canonicalManifest,
  canonicalDocuments,
  responsibilityPolicy,
  systemBoundaries,
  taskGraph,
  state,
) {
  state.record(
    "canonicalManifest",
    canonicalManifest?.repository === APPROVED.platformContracts.repository,
    "canonical manifest repository identity does not match Platform Contracts",
  );
  state.record(
    "canonicalManifest",
    canonicalManifest?.adoptionStatus === "adopted",
    "canonical manifest adoptionStatus must be adopted",
  );
  for (const [field, expected] of Object.entries(EXPECTED_VERSIONS)) {
    state.record(
      "versions",
      canonicalManifest?.[field] === expected,
      `canonical manifest ${field} must be ${expected}`,
    );
  }
  state.record(
    "documents",
    Array.isArray(canonicalManifest?.documents) &&
      canonicalManifest.documents.length === 13,
    "canonical manifest must contain exactly 13 document representations",
  );

  const lockDocuments = Array.isArray(lock?.documents) ? lock.documents : [];
  const canonicalEntries = Array.isArray(canonicalManifest?.documents)
    ? canonicalManifest.documents
    : [];
  const names = canonicalEntries.map((document) => document?.name);
  const paths = canonicalEntries.map((document) => document?.filePath);
  state.record(
    "documents",
    new Set(names).size === names.length && names.length === 13,
    "canonical document names must be unique",
  );
  state.record(
    "documents",
    new Set(paths).size === paths.length && paths.length === 13,
    "canonical document paths must be unique",
  );

  for (let index = 0; index < 13; index += 1) {
    const locked = lockDocuments[index];
    const manifested = canonicalEntries[index];
    for (const [lockField, manifestField] of [
      ["name", "name"],
      ["version", "version"],
      ["canonicalPath", "filePath"],
      ["sha256", "sha256"],
    ]) {
      state.record(
        "documents",
        locked?.[lockField] === manifested?.[manifestField],
        `canonical document ${index} ${manifestField} differs from the lock`,
      );
    }
    state.record(
      "documents",
      manifested?.repository === APPROVED.platformContracts.repository &&
        manifested?.adoptionStatus === "adopted",
      `canonical document ${index} repository or adoptionStatus differs`,
    );
    const content = canonicalDocuments[index];
    state.record(
      "documentHashes",
      Boolean(content) && sha256(content) === locked?.sha256,
      `${locked?.canonicalPath ?? `document ${index}`} SHA-256 differs from the lock`,
    );
  }

  let previousIndex = -1;
  for (const marker of CANONICAL_AUTHORITY_MARKERS) {
    const index = responsibilityPolicy.indexOf(marker, previousIndex + 1);
    state.record(
      "authorityHierarchy",
      index > previousIndex,
      `canonical authority marker is missing or out of order: ${marker}`,
    );
    if (index > previousIndex) {
      previousIndex = index;
    }
  }
  for (const statement of PLATFORM_BOUNDARY_STATEMENTS) {
    state.record(
      "platformBoundaries",
      responsibilityPolicy.includes(statement),
      `Platform Contracts boundary statement is missing: ${statement}`,
    );
  }
  state.record(
    "platformBoundaries",
    systemBoundaries.includes("ADOが所有するもの") &&
      systemBoundaries.includes("ADOが所有しないもの") &&
      systemBoundaries.includes("Product DSLの内容") &&
      systemBoundaries.includes("Manufacturing OSが所有するもの") &&
      systemBoundaries.includes("Manufacturing OSが所有しないもの") &&
      systemBoundaries.includes("ADO Goal／Task／Judgeの内部状態") &&
      systemBoundaries.includes("Platformが所有するもの") &&
      systemBoundaries.includes("Platformが所有しないもの"),
    "canonical System Responsibility Boundaries must preserve ADO, Manufacturing OS, and Platform ownership",
  );
  validateTaskGraph(taskGraph, state);
}

function validateConsumer(
  key,
  lock,
  manifest,
  adoptionDocument,
  state,
) {
  const approved = APPROVED[key];
  const expectedTail =
    key === "ado"
      ? "Repository-specific governance, individual ADO tasks, and implementation"
      : "Repository-specific governance, individual Manufacturing OS tasks, and implementation";
  state.record(
    `${key}Manifest`,
    manifest?.consumerRepository === approved.repository,
    `${key} consumerRepository must be ${approved.repository}`,
  );
  state.record(
    `${key}Manifest`,
    manifest?.adoptionMethod === "stable-reference-manifest",
    `${key} adoptionMethod must be stable-reference-manifest`,
  );
  state.record(
    `${key}Manifest`,
    manifest?.localAdoptionStatus === "adopted",
    `${key} localAdoptionStatus must be adopted`,
  );
  state.record(
    `${key}Manifest`,
    manifest?.canonicalSource?.repository === APPROVED.platformContracts.repository &&
      manifest?.canonicalSource?.commit === APPROVED.platformContracts.commit &&
      manifest?.canonicalSource?.p0T01ACanonicalMergeCommit ===
        APPROVED.platformContracts.commit,
    `${key} canonical repository or commit differs from Platform Contracts`,
  );
  state.record(
    `${key}Manifest`,
    manifest?.canonicalSource?.adoptionManifestPath ===
      APPROVED.platformContracts.manifestPath &&
      manifest?.canonicalSource?.verifierPath ===
        APPROVED.platformContracts.verifierPath,
    `${key} canonical manifest or verifier path differs`,
  );
  for (const [consumerField, lockField] of Object.entries(
    CONSUMER_VERSION_FIELDS,
  )) {
    state.record(
      "versions",
      manifest?.versions?.[consumerField] === lock?.versions?.[lockField],
      `${key} versions.${consumerField} differs from the canonical lock`,
    );
  }

  const documents = Array.isArray(manifest?.documents) ? manifest.documents : [];
  state.record(
    `${key}Documents`,
    documents.length === 13,
    `${key} manifest must contain exactly 13 documents`,
  );
  state.record(
    `${key}Documents`,
    new Set(documents.map((document) => document?.name)).size === 13,
    `${key} document names must be unique`,
  );
  for (let index = 0; index < 13; index += 1) {
    const locked = lock?.documents?.[index];
    const consumer = documents[index];
    for (const field of ["name", "version", "canonicalPath", "sha256"]) {
      state.record(
        `${key}Documents`,
        consumer?.[field] === locked?.[field],
        `${key} document ${index} ${field} differs from the canonical lock`,
      );
    }
    state.record(
      `${key}Documents`,
      consumer?.adoptionStatus === "adopted",
      `${key} document ${index} adoptionStatus must be adopted`,
    );
  }
  state.record(
    "authorityHierarchy",
    sameJson(manifest?.authorityHierarchy?.slice(0, 13), lock?.authorityHierarchy) &&
      manifest?.authorityHierarchy?.[13] === expectedTail &&
      manifest?.authorityHierarchy?.length === 14,
    `${key} authorityHierarchy differs from the canonical authority order`,
  );
  state.record(
    `${key}Manifest`,
    manifest?.task?.id === approved.task &&
      manifest?.task?.status === "checkpoint-review-required",
    `${key} approved task identity or checkpoint state differs`,
  );
  state.record(
    `${key}Manifest`,
    manifest?.successorTasks?.["P0-T01D"] === "not-started",
    `${key} approved commit must record P0-T01D as not-started`,
  );
  if (key === "manufacturingOs") {
    state.record(
      "manufacturingOsManifest",
      manifest?.predecessor?.repository === APPROVED.ado.repository &&
        manifest?.predecessor?.mergedCommit === APPROVED.ado.commit &&
        manifest?.predecessor?.access === "read-only",
      "Manufacturing OS predecessor lock must match the approved ADO commit",
    );
  }
  validateImmutableReferences(manifest, state, `${key}Manifest`);

  if (key === "ado") {
    for (const statement of ADO_REQUIRED_STATEMENTS) {
      state.record(
        "adoBoundaries",
        adoptionDocument.includes(statement),
        `ADO boundary statement is missing: ${statement}`,
      );
    }
    const conflictingClaims = [
      "ADO owns Product DSL",
      "ADO owns manufacturing results",
      "ADO owns manufacturing knowledge approval",
      "ADO owns manufacturing release approval",
    ].filter((claim) => adoptionDocument.includes(claim));
    state.record(
      "adoBoundaries",
      conflictingClaims.length === 0,
      `ADO claims Manufacturing OS ownership: ${conflictingClaims.join(", ")}`,
    );
  } else {
    for (const [checkName, statements] of Object.entries(
      MANUFACTURING_REQUIRED_STATEMENTS,
    )) {
      for (const statement of statements) {
        state.record(
          checkName,
          adoptionDocument.includes(statement),
          `Manufacturing OS statement is missing: ${statement}`,
        );
      }
    }
    const conflictingClaims = [
      "Manufacturing OS owns ADO Goal Intake",
      "Manufacturing OS owns ADO orchestration",
      "Manufacturing OS owns development Judge",
    ].filter((claim) => adoptionDocument.includes(claim));
    state.record(
      "responsibilities",
      conflictingClaims.length === 0,
      `Manufacturing OS claims ADO ownership: ${conflictingClaims.join(", ")}`,
    );
  }
}

export function verifyCrossRepositoryAdoption({
  lock,
  repositoryRoots,
  objectReader = createGitObjectReader(),
  verifierRunner = runApprovedVerifierSuite,
}) {
  const state = createState();
  validateLock(lock, state);

  const commitAvailable = {};
  for (const [key, approved] of Object.entries(APPROVED)) {
    const root = repositoryRoots[key];
    let repositoryExists = false;
    try {
      repositoryExists = objectReader.repositoryExists(root);
    } catch {
      repositoryExists = false;
    }
    state.record(
      "repositories",
      repositoryExists,
      `${key} repository is missing or is not a Git repository: ${root}`,
    );
    if (!repositoryExists) {
      commitAvailable[key] = false;
      continue;
    }

    try {
      const remoteUrl = objectReader.remoteUrl(root);
      state.record(
        "repositoryIdentity",
        remoteMatchesRepository(remoteUrl, approved.repository),
        `${key} origin does not identify ${approved.repository}: ${remoteUrl}`,
      );
    } catch (error) {
      state.record(
        "repositoryIdentity",
        false,
        `${key} origin could not be verified: ${error.message}`,
      );
    }

    commitAvailable[key] = objectReader.commitExists(root, approved.commit);
    state.record(
      "approvedCommits",
      commitAvailable[key],
      `${key} approved commit is missing: ${approved.commit}`,
    );
  }

  function readApprovedFile(key, filePath, checkName = "committedFiles") {
    if (!commitAvailable[key]) {
      return null;
    }
    try {
      const content = objectReader.readFile(
        repositoryRoots[key],
        APPROVED[key].commit,
        filePath,
      );
      state.record(
        checkName,
        true,
        `${key}:${APPROVED[key].commit}:${filePath} exists`,
      );
      return Buffer.isBuffer(content) ? content : Buffer.from(content);
    } catch (error) {
      state.record(
        checkName,
        false,
        `${key}:${APPROVED[key].commit}:${filePath}: ${error.message}`,
      );
      return null;
    }
  }

  const canonicalManifestBuffer = readApprovedFile(
    "platformContracts",
    APPROVED.platformContracts.manifestPath,
  );
  const canonicalManifest = parseJsonBuffer(
    canonicalManifestBuffer,
    "canonical adoption manifest",
    "jsonParsing",
    state,
  );
  const lockDocuments = Array.isArray(lock?.documents) ? lock.documents : [];
  const canonicalDocuments = lockDocuments.map((document) =>
    readApprovedFile("platformContracts", document?.canonicalPath),
  );
  const responsibilityPolicy =
    readApprovedFile(
      "platformContracts",
      "docs/architecture/repository-responsibility.md",
    )?.toString("utf8") ?? "";
  const systemBoundaries =
    readApprovedFile(
      "platformContracts",
      "docs/architecture/SYSTEM_RESPONSIBILITY_BOUNDARIES_v1.0.md",
    )?.toString("utf8") ?? "";
  const taskGraphBuffer = readApprovedFile(
    "platformContracts",
    "docs/plans/ADO_TASK_GRAPH_v1.2.json",
  );
  const taskGraph = parseJsonBuffer(
    taskGraphBuffer,
    "canonical ADO Task Graph",
    "jsonParsing",
    state,
  );

  validateCanonical(
    lock,
    canonicalManifest,
    canonicalDocuments,
    responsibilityPolicy,
    systemBoundaries,
    taskGraph,
    state,
  );

  for (const key of ["ado", "manufacturingOs"]) {
    const manifestBuffer = readApprovedFile(key, APPROVED[key].manifestPath);
    const manifest = parseJsonBuffer(
      manifestBuffer,
      `${key} adoption manifest`,
      "jsonParsing",
      state,
    );
    const adoptionDocument =
      readApprovedFile(key, APPROVED[key].adoptionDocumentPath)?.toString(
        "utf8",
      ) ?? "";
    validateConsumer(key, lock, manifest, adoptionDocument, state);
  }

  if (Object.values(commitAvailable).every(Boolean)) {
    try {
      const executions = verifierRunner({ repositoryRoots });
      state.detail("verifierExecutions", "method", executions.method);
      state.detail(
        "verifierExecutions",
        "workingTreeContentUsed",
        executions.workingTreeContentUsed,
      );
      for (const key of ["canonical", "ado", "manufacturingOs"]) {
        const execution = executions[key];
        state.record(
          "verifierExecutions",
          execution?.status === "pass" &&
            execution?.exitCode === 0 &&
            execution?.report?.status === "pass",
          `${execution?.label ?? key} failed: ${execution?.stderr || execution?.parseError || "no passing report"}`,
        );
        state.detail("verifierExecutions", key, {
          status: execution?.status ?? "fail",
          exitCode: execution?.exitCode ?? null,
          reportedStatus: execution?.report?.status ?? null,
        });
      }
      state.record(
        "committedObjectIsolation",
        executions.workingTreeContentUsed === false,
        "approved verifier execution must not use consumer working-tree content",
      );
    } catch (error) {
      state.record(
        "verifierExecutions",
        false,
        `unable to execute approved verifiers: ${error.message}`,
      );
    }
  } else {
    state.record(
      "verifierExecutions",
      false,
      "approved verifiers cannot run because a required commit is unavailable",
    );
  }

  state.detail("committedObjectIsolation", "method", [
    "git cat-file -e <approved-commit>^{commit}",
    "git show <approved-commit>:<path>",
    "temporary detached clones at approved commits for verifier execution",
  ]);
  state.detail("committedObjectIsolation", "workingTreesIgnored", true);

  return {
    status: state.errors.length === 0 ? "pass" : "fail",
    verificationTask: "P0-T01D",
    verificationState: lock?.verificationState ?? null,
    p0T02Status: lock?.successorTasks?.["P0-T02"] ?? null,
    repositoryCommits: Object.fromEntries(
      Object.entries(APPROVED).map(([key, value]) => [key, {
        repository: value.repository,
        commit: value.commit,
      }]),
    ),
    checks: state.checks,
    errors: state.errors,
  };
}

function parseOptions(args) {
  const options = {
    lockPath: defaultLockPath,
    platformContracts: repositoryRoot,
    ado: resolve(repositoryRoot, "..", "ado"),
    manufacturingOs: resolve(repositoryRoot, "..", "asxeed-manufacturing-os"),
  };
  const optionMap = {
    "--lock": "lockPath",
    "--platform-repository": "platformContracts",
    "--ado-repository": "ado",
    "--manufacturing-repository": "manufacturingOs",
  };
  for (let index = 0; index < args.length; index += 1) {
    const key = optionMap[args[index]];
    if (!key || !args[index + 1]) {
      throw new Error(`unknown or incomplete argument: ${args[index]}`);
    }
    options[key] = resolve(args[index + 1]);
    index += 1;
  }
  return options;
}

function runCli() {
  try {
    const options = parseOptions(process.argv.slice(2));
    const lock = JSON.parse(readFileSync(options.lockPath, "utf8"));
    const report = verifyCrossRepositoryAdoption({
      lock,
      repositoryRoots: {
        platformContracts: options.platformContracts,
        ado: options.ado,
        manufacturingOs: options.manufacturingOs,
      },
    });
    console.log(JSON.stringify(report, null, 2));
    process.exitCode = report.status === "pass" ? 0 : 1;
  } catch (error) {
    console.log(JSON.stringify({
      status: "fail",
      verificationTask: "P0-T01D",
      errors: [{ check: "verifier", message: error.message }],
    }, null, 2));
    process.exitCode = 1;
  }
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(scriptPath)) {
  runCli();
}
