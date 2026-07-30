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
