#!/usr/bin/env node

import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const manifestPath = join(
  repositoryRoot,
  "docs/architecture/adoption-manifest.json",
);
const expectedRepository = "asxeed-codex/asxeed-platform-contracts";

const expectedDocuments = [
  {
    name: "ASXEED_Architecture_Freeze_v1.1.md",
    version: "1.1",
    filePath: "docs/architecture/ASXEED_Architecture_Freeze_v1.1.md",
    source: "_phase0_input/ASXEED_Architecture_Freeze_v1.1.md",
    heading: "# ASXEED Architecture Freeze v1.1",
  },
  {
    name: "ARCHITECTURE_FREEZE_v1.1_CLARIFICATION_001.md",
    version: "1.1-clarification-001",
    filePath:
      "docs/architecture/ARCHITECTURE_FREEZE_v1.1_CLARIFICATION_001.md",
    source: "architecture-owner-checkpoint-review/P0-T01A-R1",
    heading: "# ASXEED Architecture Freeze v1.1 Clarification 001",
  },
  {
    name: "TECHNOLOGY_STACK.md",
    version: "1.0",
    filePath: "docs/architecture/TECHNOLOGY_STACK.md",
    source: "_phase0_input/TECHNOLOGY_STACK.md",
    heading: "# ASXEED TECHNOLOGY STACK v1.0",
  },
  {
    name: "TECHNOLOGY_VERSION_MATRIX.md",
    version: "1.0",
    filePath: "docs/architecture/TECHNOLOGY_VERSION_MATRIX.md",
    source: "_phase0_input/TECHNOLOGY_VERSION_MATRIX.md",
    heading: "# ASXEED TECHNOLOGY VERSION MATRIX v1.0",
  },
  {
    name: "TECHNOLOGY_SELECTION_RATIONALE.md",
    version: "1.0",
    filePath: "docs/architecture/TECHNOLOGY_SELECTION_RATIONALE.md",
    source: "_phase0_input/TECHNOLOGY_SELECTION_RATIONALE.md",
    heading: "# ASXEED TECHNOLOGY SELECTION RATIONALE v1.0",
  },
  {
    name: "DEFERRED_TECHNOLOGY.md",
    version: "1.0",
    filePath: "docs/architecture/DEFERRED_TECHNOLOGY.md",
    source: "_phase0_input/DEFERRED_TECHNOLOGY.md",
    heading: "# ASXEED DEFERRED TECHNOLOGY v1.0",
  },
  {
    name: "MASTER_IMPLEMENTATION_PLAN_v1.2.md",
    version: "1.2",
    filePath: "docs/plans/MASTER_IMPLEMENTATION_PLAN_v1.2.md",
    source: "_phase0_input/MASTER_IMPLEMENTATION_PLAN_v1.2.md",
    heading: "# ASXEED MASTER IMPLEMENTATION PLAN v1.2",
  },
  {
    name: "ADO_TASK_GRAPH_v1.2.md",
    version: "1.2",
    filePath: "docs/plans/ADO_TASK_GRAPH_v1.2.md",
    source: "_phase0_input/ADO_TASK_GRAPH_v1.2.md",
    heading: "# ASXEED ADO TASK GRAPH v1.2",
  },
  {
    name: "ADO_TASK_GRAPH_v1.2.json",
    version: "1.2",
    filePath: "docs/plans/ADO_TASK_GRAPH_v1.2.json",
    source: "_phase0_input/ADO_TASK_GRAPH_v1.2.json",
    jsonVersionField: "graphVersion",
  },
  {
    name: "SPRINT_EXECUTION_PLAN_v1.0.md",
    version: "1.0",
    filePath: "docs/plans/SPRINT_EXECUTION_PLAN_v1.0.md",
    source: "_phase0_input/SPRINT_EXECUTION_PLAN_v1.0.md",
    heading: "# ASXEED SPRINT EXECUTION PLAN v1.0",
  },
  {
    name: "SYSTEM_RESPONSIBILITY_BOUNDARIES_v1.0.md",
    version: "1.0",
    filePath:
      "docs/architecture/SYSTEM_RESPONSIBILITY_BOUNDARIES_v1.0.md",
    source: "_phase0_input/SYSTEM_RESPONSIBILITY_BOUNDARIES_v1.0.md",
    heading: "# ASXEED SYSTEM RESPONSIBILITY BOUNDARIES v1.0",
  },
  {
    name: "ASXEED_DEVELOPMENT_READINESS_REPORT_v1.0.md",
    version: "1.0",
    filePath:
      "docs/reports/ASXEED_DEVELOPMENT_READINESS_REPORT_v1.0.md",
    source:
      "_phase0_input/ASXEED_DEVELOPMENT_READINESS_REPORT_v1.0.md",
    heading: "# ASXEED DEVELOPMENT READINESS REPORT v1.0",
  },
  {
    name: "PHASE_00_ARCHITECTURE_ADOPTION_CODEX_PACK_v1.3.md",
    version: "1.3",
    filePath:
      "docs/plans/PHASE_00_ARCHITECTURE_ADOPTION_CODEX_PACK_v1.3.md",
    source:
      "_phase0_input/PHASE_00_ARCHITECTURE_ADOPTION_CODEX_PACK_v1.3.md",
    heading: "# PHASE 00 ARCHITECTURE ADOPTION CODEX PACK v1.3",
  },
];

const expectedTopLevelVersions = {
  manifestVersion: "1.0",
  architectureFreezeVersion: "1.1",
  architectureClarificationVersion: "1.1-clarification-001",
  technologyBaselineVersion: "1.0",
  masterImplementationPlanVersion: "1.2",
  adoTaskGraphVersion: "1.2",
  sprintExecutionPlanVersion: "1.0",
  systemResponsibilityBoundariesVersion: "1.0",
  developmentReadinessReportVersion: "1.0",
  phase0CodexPackVersion: "1.3",
};

const errors = [];
const checks = {
  requiredFiles: { status: "pass", checked: 0 },
  jsonParsing: { status: "pass", checked: 0 },
  exactVersions: { status: "pass", checked: 0 },
  sha256Agreement: { status: "pass", checked: 0 },
  relativeLinks: { status: "pass", checked: 0 },
  taskGraphSemantics: { status: "pass", checked: 0, metrics: {} },
};

function fail(checkName, message) {
  checks[checkName].status = "fail";
  errors.push({ check: checkName, message });
}

function readJson(path, checkName) {
  checks[checkName].checked += 1;
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    fail(checkName, `${relative(repositoryRoot, path)}: ${error.message}`);
    return null;
  }
}

function sha256(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function checkTaskGraph(condition, message) {
  checks.taskGraphSemantics.checked += 1;
  if (!condition) {
    fail("taskGraphSemantics", message);
  }
}

function validateTaskGraph(graph, manifest) {
  if (!graph) {
    checkTaskGraph(false, "ADO Task Graph JSON could not be parsed");
    return;
  }

  const tasks = Array.isArray(graph.tasks) ? graph.tasks : [];
  checkTaskGraph(Array.isArray(graph.tasks), "tasks must be an array");
  checkTaskGraph(
    graph.taskCount === tasks.length,
    `taskCount must equal tasks.length; found ${graph.taskCount} and ${tasks.length}`,
  );

  const taskIds = tasks.map((task) => task.id);
  const uniqueTaskIds = new Set(taskIds);
  const duplicateTaskIds = taskIds.filter(
    (id, index) => taskIds.indexOf(id) !== index,
  );
  checkTaskGraph(
    uniqueTaskIds.size === taskIds.length,
    `task IDs must be unique; duplicates: ${[...new Set(duplicateTaskIds)].join(", ")}`,
  );

  const taskById = new Map(tasks.map((task) => [task.id, task]));
  const missingDependencies = [];
  let dependencyReferenceCount = 0;
  for (const task of tasks) {
    const dependencies = Array.isArray(task.dependsOn) ? task.dependsOn : [];
    dependencyReferenceCount += dependencies.length;
    for (const dependencyId of dependencies) {
      if (!taskById.has(dependencyId)) {
        missingDependencies.push(`${task.id}->${dependencyId}`);
      }
    }
  }
  checkTaskGraph(
    missingDependencies.length === 0,
    `every dependsOn ID must resolve; missing: ${missingDependencies.join(", ")}`,
  );

  const visitState = new Map();
  const cyclePaths = [];
  function visit(taskId, path) {
    const state = visitState.get(taskId);
    if (state === "visiting") {
      cyclePaths.push([...path, taskId].join("->"));
      return;
    }
    if (state === "visited") {
      return;
    }

    visitState.set(taskId, "visiting");
    const task = taskById.get(taskId);
    for (const dependencyId of task?.dependsOn ?? []) {
      if (taskById.has(dependencyId)) {
        visit(dependencyId, [...path, taskId]);
      }
    }
    visitState.set(taskId, "visited");
  }
  for (const taskId of taskIds) {
    visit(taskId, []);
  }
  checkTaskGraph(
    cyclePaths.length === 0,
    `dependency graph must be acyclic; cycles: ${cyclePaths.join(", ")}`,
  );

  const topologicalOrder = graph.validation?.topologicalOrder;
  checkTaskGraph(
    Array.isArray(topologicalOrder),
    "validation.topologicalOrder must be an array",
  );
  if (Array.isArray(topologicalOrder)) {
    const topologicalSet = new Set(topologicalOrder);
    const unknownTopologicalIds = topologicalOrder.filter(
      (id) => !taskById.has(id),
    );
    const duplicateTopologicalIds = topologicalOrder.filter(
      (id, index) => topologicalOrder.indexOf(id) !== index,
    );
    const omittedTaskIds = taskIds.filter((id) => !topologicalSet.has(id));
    checkTaskGraph(
      unknownTopologicalIds.length === 0,
      `every topologicalOrder ID must exist; unknown: ${unknownTopologicalIds.join(", ")}`,
    );
    checkTaskGraph(
      topologicalSet.size === topologicalOrder.length,
      `every topologicalOrder ID must appear once; duplicates: ${[...new Set(duplicateTopologicalIds)].join(", ")}`,
    );
    checkTaskGraph(
      omittedTaskIds.length === 0 && topologicalOrder.length === tasks.length,
      `topologicalOrder must contain every task exactly once; omitted: ${omittedTaskIds.join(", ")}`,
    );

    const positions = new Map(
      topologicalOrder.map((taskId, index) => [taskId, index]),
    );
    const orderViolations = [];
    for (const task of tasks) {
      for (const dependencyId of task.dependsOn ?? []) {
        if (
          positions.has(task.id) &&
          positions.has(dependencyId) &&
          positions.get(dependencyId) >= positions.get(task.id)
        ) {
          orderViolations.push(`${task.id}->${dependencyId}`);
        }
      }
    }
    checkTaskGraph(
      orderViolations.length === 0,
      `topologicalOrder must place dependencies first; violations: ${orderViolations.join(", ")}`,
    );
  }

  const requiredTaskFields = [
    "programId",
    "trackId",
    "sprintId",
    "status",
    "readiness",
  ];
  const missingRequiredFields = [];
  for (const task of tasks) {
    for (const field of requiredTaskFields) {
      if (typeof task[field] !== "string" || task[field].trim() === "") {
        missingRequiredFields.push(`${task.id}.${field}`);
      }
    }
  }
  checkTaskGraph(
    missingRequiredFields.length === 0,
    `every task must have required governance fields; missing: ${missingRequiredFields.join(", ")}`,
  );

  const sprints = Array.isArray(graph.sprints) ? graph.sprints : [];
  const sprintSequenceById = new Map(
    sprints.map((sprint) => [sprint.id, sprint.sequence]),
  );
  const missingTaskSprints = tasks
    .filter((task) => !sprintSequenceById.has(task.sprintId))
    .map((task) => `${task.id}->${task.sprintId}`);
  checkTaskGraph(
    missingTaskSprints.length === 0,
    `every task sprintId must resolve; missing: ${missingTaskSprints.join(", ")}`,
  );

  const sprintOrderViolations = [];
  for (const task of tasks) {
    const taskSequence = sprintSequenceById.get(task.sprintId);
    for (const dependencyId of task.dependsOn ?? []) {
      const dependency = taskById.get(dependencyId);
      const dependencySequence = sprintSequenceById.get(dependency?.sprintId);
      if (
        Number.isInteger(taskSequence) &&
        Number.isInteger(dependencySequence) &&
        dependencySequence > taskSequence
      ) {
        sprintOrderViolations.push(
          `${task.id}(${task.sprintId})->${dependencyId}(${dependency.sprintId})`,
        );
      }
    }
  }
  checkTaskGraph(
    sprintOrderViolations.length === 0,
    `sprint dependency order must have no violation; violations: ${sprintOrderViolations.join(", ")}`,
  );
  checkTaskGraph(
    graph.validation?.sprintDependencyOrderViolationCount === 0 &&
      Array.isArray(graph.validation?.sprintDependencyOrderViolations) &&
      graph.validation.sprintDependencyOrderViolations.length === 0,
    "recorded sprint dependency validation must report zero violations",
  );

  const sourceDocuments = Array.isArray(graph.sourceDocuments)
    ? graph.sourceDocuments
    : [];
  checkTaskGraph(
    Array.isArray(graph.sourceDocuments),
    "sourceDocuments must be an array",
  );
  checkTaskGraph(
    new Set(sourceDocuments).size === sourceDocuments.length,
    "sourceDocuments must not contain duplicate references",
  );
  const requiredSourceVersions = new Map([
    ["ASXEED_Architecture_Freeze_v1.1.md", "1.1"],
    ["TECHNOLOGY_STACK.md", "1.0"],
    ["TECHNOLOGY_VERSION_MATRIX.md", "1.0"],
    ["TECHNOLOGY_SELECTION_RATIONALE.md", "1.0"],
    ["DEFERRED_TECHNOLOGY.md", "1.0"],
    ["MASTER_IMPLEMENTATION_PLAN_v1.2.md", "1.2"],
    ["SPRINT_EXECUTION_PLAN_v1.0.md", "1.0"],
    ["SYSTEM_RESPONSIBILITY_BOUNDARIES_v1.0.md", "1.0"],
  ]);
  const manifestDocumentsByName = new Map(
    (manifest?.documents ?? []).map((document) => [document.name, document]),
  );
  const staleOrUnknownSources = sourceDocuments.filter((name) => {
    const expectedVersion = requiredSourceVersions.get(name);
    const adoptedDocument = manifestDocumentsByName.get(name);
    return !expectedVersion || adoptedDocument?.version !== expectedVersion;
  });
  const missingCurrentSources = [...requiredSourceVersions.keys()].filter(
    (name) => !sourceDocuments.includes(name),
  );
  checkTaskGraph(
    staleOrUnknownSources.length === 0 && missingCurrentSources.length === 0,
    `sourceDocuments must reference currently adopted versions; stale/unknown: ${staleOrUnknownSources.join(", ")}; missing: ${missingCurrentSources.join(", ")}`,
  );

  const p0T01 = taskById.get("P0-T01");
  const p0T01PlanOutputs = (p0T01?.outputs ?? []).filter((output) =>
    output.includes("MASTER_IMPLEMENTATION_PLAN"),
  );
  const expectedP0T01PlanOutput =
    "docs/plans/MASTER_IMPLEMENTATION_PLAN_v1.2.md";
  checkTaskGraph(Boolean(p0T01), "P0-T01 must exist");
  checkTaskGraph(
    p0T01PlanOutputs.length === 1 &&
      p0T01PlanOutputs[0] === expectedP0T01PlanOutput,
    `P0-T01 must output ${expectedP0T01PlanOutput}; found ${p0T01PlanOutputs.join(", ")}`,
  );

  const markdownGraphPath = join(
    repositoryRoot,
    "docs/plans/ADO_TASK_GRAPH_v1.2.md",
  );
  const markdownGraphHeading = readFileSync(markdownGraphPath, "utf8").split(
    /\r?\n/,
    1,
  )[0];
  checkTaskGraph(
    graph.graphVersion === "1.2",
    `JSON graphVersion must be 1.2; found ${graph.graphVersion}`,
  );
  checkTaskGraph(
    markdownGraphHeading === "# ASXEED ADO TASK GRAPH v1.2",
    `Markdown graph version must be 1.2; found ${markdownGraphHeading}`,
  );

  checks.taskGraphSemantics.metrics = {
    taskCount: tasks.length,
    uniqueTaskIds: uniqueTaskIds.size,
    dependencyReferences: dependencyReferenceCount,
    missingDependencyReferences: missingDependencies.length,
    dependencyCycles: cyclePaths.length,
    topologicalOrderIds: Array.isArray(topologicalOrder)
      ? topologicalOrder.length
      : 0,
    tasksWithRequiredGovernanceFields:
      tasks.length - new Set(missingRequiredFields.map((item) => item.split(".")[0])).size,
    sprintDependencyOrderViolations: sprintOrderViolations.length,
    sourceDocumentReferences: sourceDocuments.length,
    p0T01MasterPlanOutput: p0T01PlanOutputs[0] ?? null,
    markdownGraphVersion: markdownGraphHeading.endsWith("v1.2")
      ? "1.2"
      : null,
    jsonGraphVersion: graph.graphVersion,
  };
}

function collectMarkdownFiles(path) {
  if (!existsSync(path)) {
    return [];
  }

  if (statSync(path).isFile()) {
    return extname(path) === ".md" ? [path] : [];
  }

  return readdirSync(path, { withFileTypes: true })
    .sort((left, right) => left.name.localeCompare(right.name))
    .flatMap((entry) =>
      collectMarkdownFiles(join(path, entry.name)),
    );
}

checks.requiredFiles.checked += 1;
if (!existsSync(manifestPath)) {
  fail("requiredFiles", "docs/architecture/adoption-manifest.json is missing");
}

const manifest = existsSync(manifestPath)
  ? readJson(manifestPath, "jsonParsing")
  : null;

let parsedTaskGraph = null;

if (manifest) {
  for (const [field, expected] of Object.entries(expectedTopLevelVersions)) {
    checks.exactVersions.checked += 1;
    if (manifest[field] !== expected) {
      fail(
        "exactVersions",
        `manifest ${field} must be ${expected}; found ${JSON.stringify(manifest[field])}`,
      );
    }
  }

  checks.exactVersions.checked += 2;
  if (manifest.repository !== expectedRepository) {
    fail(
      "exactVersions",
      `manifest repository must be ${expectedRepository}`,
    );
  }
  if (manifest.adoptionStatus !== "adopted") {
    fail("exactVersions", "manifest adoptionStatus must be adopted");
  }

  if (!Array.isArray(manifest.documents)) {
    fail("requiredFiles", "manifest documents must be an array");
  } else {
    checks.requiredFiles.checked += 1;
    if (manifest.documents.length !== expectedDocuments.length) {
      fail(
        "requiredFiles",
        `manifest must contain exactly ${expectedDocuments.length} documents; found ${manifest.documents.length}`,
      );
    }

    checks.exactVersions.checked += 1;
    const expectedDocumentOrder = expectedDocuments.map(
      (document) => document.filePath,
    );
    const manifestDocumentOrder = manifest.documents.map(
      (document) => document.filePath,
    );
    if (
      JSON.stringify(manifestDocumentOrder) !==
      JSON.stringify(expectedDocumentOrder)
    ) {
      fail(
        "exactVersions",
        "manifest document order must follow the adopted authority hierarchy",
      );
    }

    const manifestByPath = new Map(
      manifest.documents.map((document) => [document.filePath, document]),
    );

    for (const expected of expectedDocuments) {
      const absolutePath = join(repositoryRoot, expected.filePath);
      const document = manifestByPath.get(expected.filePath);
      checks.requiredFiles.checked += 1;

      if (!existsSync(absolutePath)) {
        fail("requiredFiles", `${expected.filePath} is missing`);
        continue;
      }

      if (!document) {
        fail(
          "requiredFiles",
          `${expected.filePath} is missing from the adoption manifest`,
        );
        continue;
      }

      checks.exactVersions.checked += 6;
      const expectedFields = {
        name: expected.name,
        version: expected.version,
        filePath: expected.filePath,
        source: expected.source,
        repository: expectedRepository,
        adoptionStatus: "adopted",
      };
      for (const [field, expectedValue] of Object.entries(expectedFields)) {
        if (document[field] !== expectedValue) {
          fail(
            "exactVersions",
            `${expected.filePath} manifest ${field} must be ${expectedValue}`,
          );
        }
      }

      if (expected.heading) {
        checks.exactVersions.checked += 1;
        const firstLine = readFileSync(absolutePath, "utf8").split(/\r?\n/, 1)[0];
        if (firstLine !== expected.heading) {
          fail(
            "exactVersions",
            `${expected.filePath} heading must be ${expected.heading}`,
          );
        }
      }

      if (expected.jsonVersionField) {
        const parsedDocument = readJson(absolutePath, "jsonParsing");
        if (expected.name === "ADO_TASK_GRAPH_v1.2.json") {
          parsedTaskGraph = parsedDocument;
        }
        checks.exactVersions.checked += 1;
        if (
          parsedDocument &&
          parsedDocument[expected.jsonVersionField] !== expected.version
        ) {
          fail(
            "exactVersions",
            `${expected.filePath} ${expected.jsonVersionField} must be ${expected.version}`,
          );
        }
      }

      checks.sha256Agreement.checked += 1;
      const actualHash = sha256(absolutePath);
      if (document.sha256 !== actualHash) {
        fail(
          "sha256Agreement",
          `${expected.filePath} hash mismatch: expected ${document.sha256}, found ${actualHash}`,
        );
      }
    }
  }
}

validateTaskGraph(parsedTaskGraph, manifest);

const markdownFiles = [
  ...collectMarkdownFiles(join(repositoryRoot, "README.md")),
  ...collectMarkdownFiles(join(repositoryRoot, "docs")),
].sort((left, right) => left.localeCompare(right));
const markdownLinkPattern = /!?\[[^\]]*]\(([^)\s]+)(?:\s+["'][^"']*["'])?\)/g;

for (const markdownPath of markdownFiles) {
  const content = readFileSync(markdownPath, "utf8");
  for (const match of content.matchAll(markdownLinkPattern)) {
    let target = match[1].replace(/^<|>$/g, "");
    if (
      target.startsWith("#") ||
      target.startsWith("/") ||
      /^[a-z][a-z0-9+.-]*:/i.test(target)
    ) {
      continue;
    }

    target = target.split("#", 1)[0].split("?", 1)[0];
    if (!target) {
      continue;
    }

    checks.relativeLinks.checked += 1;
    let decodedTarget;
    try {
      decodedTarget = decodeURIComponent(target);
    } catch {
      fail(
        "relativeLinks",
        `${relative(repositoryRoot, markdownPath)} has invalid encoded link ${target}`,
      );
      continue;
    }

    const resolvedTarget = resolve(dirname(markdownPath), decodedTarget);
    if (!existsSync(resolvedTarget)) {
      fail(
        "relativeLinks",
        `${relative(repositoryRoot, markdownPath)} -> ${target} does not resolve`,
      );
    }
  }
}

const report = {
  status: errors.length === 0 ? "pass" : "fail",
  repository: expectedRepository,
  manifest: relative(repositoryRoot, manifestPath),
  documentCount: expectedDocuments.length,
  checks,
  errors,
};

console.log(JSON.stringify(report, null, 2));
process.exitCode = errors.length === 0 ? 0 : 1;
