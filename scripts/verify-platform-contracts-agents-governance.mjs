#!/usr/bin/env node

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, extname, isAbsolute, join, relative, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const defaultRepositoryRoot = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "..",
);

const expectedIdentity = {
  schemaVersion: "1.0",
  repository: "asxeed-codex/asxeed-platform-contracts",
  taskId: "P0-T02A",
  canonicalTaskId: "P0-T02",
  branch: "codex/P0-T02A-platform-contracts-agents-governance",
  baseCommit: "c1bfd76b07b5cc98ffb4dc45f177f5027352fce2",
  riskLevel: "high",
  humanApproval: "checkpoint",
};

const expectedAdrReferences = ["ADR-010", "ADR-016"];

const expectedAuthorityHierarchy = [
  {
    precedence: 1,
    authority: "Architecture Freeze v1.1",
    references: ["docs/architecture/ASXEED_Architecture_Freeze_v1.1.md"],
  },
  {
    precedence: 2,
    authority: "Architecture Freeze v1.1 Clarification 001",
    references: [
      "docs/architecture/ARCHITECTURE_FREEZE_v1.1_CLARIFICATION_001.md",
    ],
  },
  {
    precedence: 3,
    authority: "Adopted ADR-001 through ADR-024",
    references: ["docs/architecture/ASXEED_Architecture_Freeze_v1.1.md"],
  },
  {
    precedence: 4,
    authority: "Technology Stack v1.0",
    references: ["docs/architecture/TECHNOLOGY_STACK.md"],
  },
  {
    precedence: 5,
    authority: "Technology Version Matrix v1.0",
    references: ["docs/architecture/TECHNOLOGY_VERSION_MATRIX.md"],
  },
  {
    precedence: 6,
    authority: "Technology Selection Rationale v1.0",
    references: ["docs/architecture/TECHNOLOGY_SELECTION_RATIONALE.md"],
  },
  {
    precedence: 7,
    authority: "Deferred Technology v1.0",
    references: ["docs/architecture/DEFERRED_TECHNOLOGY.md"],
  },
  {
    precedence: 8,
    authority: "Master Implementation Plan v1.2",
    references: ["docs/plans/MASTER_IMPLEMENTATION_PLAN_v1.2.md"],
  },
  {
    precedence: 9,
    authority: "ADO Task Graph v1.2 Markdown and JSON",
    references: [
      "docs/plans/ADO_TASK_GRAPH_v1.2.md",
      "docs/plans/ADO_TASK_GRAPH_v1.2.json",
    ],
  },
  {
    precedence: 10,
    authority: "Sprint Execution Plan v1.0",
    references: ["docs/plans/SPRINT_EXECUTION_PLAN_v1.0.md"],
  },
  {
    precedence: 11,
    authority: "System Responsibility Boundaries v1.0",
    references: [
      "docs/architecture/SYSTEM_RESPONSIBILITY_BOUNDARIES_v1.0.md",
    ],
  },
  {
    precedence: 12,
    authority: "Development Readiness Report v1.0",
    references: [
      "docs/reports/ASXEED_DEVELOPMENT_READINESS_REPORT_v1.0.md",
    ],
  },
  {
    precedence: 13,
    authority: "Phase 0 Architecture Adoption Codex Pack v1.3",
    references: [
      "docs/plans/PHASE_00_ARCHITECTURE_ADOPTION_CODEX_PACK_v1.3.md",
    ],
  },
  {
    precedence: 14,
    authority: "Repository-specific task instructions and current implementation",
    references: [],
  },
];

const expectedOwnedResponsibilities = [
  "canonical Architecture governance records",
  "Architecture Freeze and adopted ADR representations",
  "Technology Baseline records",
  "domain-neutral shared contract definitions",
  "versioned schemas and compatibility contracts",
  "shared event, message, API, artifact, and approval-envelope contracts",
  "cross-repository contract verification",
  "canonical responsibility-boundary definitions",
  "canonical version and hash records",
];

const expectedProhibitedResponsibilities = [
  "ADO runtime orchestration",
  "ADO Goal, Plan, Task, Agent, Judge, Fix Loop, or approval-inbox runtime state",
  "Codex execution coordination",
  "Manufacturing OS Product DSL content",
  "Product DSL product definitions or product-name-specific behavior",
  "manufacturing rules or calculations",
  "Evidence, Candidate, Conflict, Product Instance, parts, geometry, drawings, 3D, BOM, or manufacturing release packages",
  "customer, order, quantity, price, invoice, payroll, inventory, or project operational data",
  "repository-specific application behavior",
  "direct application-database ownership",
  "production deployment ownership",
];

const expectedContractChangeRequirements = [
  "explicit version impact",
  "compatibility analysis",
  "migration strategy for breaking changes",
  "deterministic validation",
  "consumer impact assessment",
  "rollback plan",
  "Architecture Judge result when available",
  "human checkpoint approval",
];

const expectedNeedsDesignDecision = [
  "authoritative documents conflict",
  "responsibility ownership is ambiguous",
  "no approved ADR supports a material architecture decision",
  "a breaking shared-contract change is required without an approved migration",
  "task completion requires changing Architecture Freeze or an adopted ADR",
  "task completion requires weakening a security, compatibility, governance, or failure rule",
  "task completion would require ADO or Manufacturing OS domain logic in Platform Contracts",
  "repository reality materially contradicts the approved architecture",
];

const expectedBlockedExternal = [
  "required repository is unavailable",
  "required commit is unavailable",
  "required credential is unavailable",
  "required service is unavailable",
  "required package registry is unavailable",
  "required external resource is unavailable",
];

const expectedProhibitedGitActions = [
  "merge into main",
  "force-push main",
  "delete protected branches",
  "enable auto-merge",
  "bypass required checks",
  "rewrite approved history",
];

const expectedProhibitedReleaseActions = [
  "deploy to production",
  "publish packages",
  "approve production release",
  "approve Architecture Freeze or ADR changes",
  "approve manufacturing knowledge",
  "approve manufacturing release",
];

const expectedValidation = [
  "existing canonical verifier",
  "cross-repository verifier when relevant",
  "focused tests",
  "complete deterministic test suite",
  "JSON and schema validation",
  "Markdown relative-link validation",
  "git diff --check",
  "changed-file scope inspection",
  "protected canonical document preservation inspection",
];

const expectedCompletionEvidence = [
  "task ID",
  "branch",
  "base commit",
  "changed files",
  "commands executed",
  "test results",
  "verifier results",
  "ADR references",
  "responsibility-boundary impact",
  "contract compatibility impact",
  "risks",
  "rollback plan",
  "confirmation of unchanged protected areas",
  "PR state",
  "human checkpoint requirement",
  "honest reporting of checks not run",
];

const expectedSecurityRules = [
  "no secrets in files, prompts, logs, fixtures, artifacts, commits, or PR descriptions",
  "no confidential specification content unless explicitly approved and redacted",
  "no credentials in shared contracts",
  "no production customer or order data in tests",
  "no destructive commands against unrelated or dirty working trees",
  "preserve uncommitted data unless the task explicitly owns it",
];

const expectedSuccessorTasks = {
  "P0-T02B": "not-started",
  "P0-T02C": "not-started",
  "P0-T02D": "not-started",
  "P0-T03": "not-started",
};

const requiredSections = [
  "Repository mission",
  "Human and agent roles",
  "Mandatory authority order",
  "Files to read before work",
  "ADR requirement",
  "Scope discipline",
  "Platform Contracts protection",
  "Contract change policy",
  "Required artifacts and completion evidence",
  "`NEEDS_DESIGN_DECISION` stop procedure",
  "`BLOCKED_EXTERNAL` procedure",
  "Git and PR authority",
  "Production and release authority",
  "Validation policy",
  "Security and confidentiality",
  "Task completion and checkpoint",
  "P0-T02A controlled scope",
];

function jsonEqual(actual, expected) {
  return JSON.stringify(actual) === JSON.stringify(expected);
}

function parseJson(path, fail) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    fail("jsonParsing", `${path}: ${error.message}`);
    return null;
  }
}

function hasMarkdownLink(content, labelFragment, target) {
  const escapedTarget = target.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(
    `\\[[^\\]]*${labelFragment}[^\\]]*\\]\\(${escapedTarget}\\)`,
    "i",
  );
  return pattern.test(content);
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
    .flatMap((entry) => collectMarkdownFiles(join(path, entry.name)));
}

function validateMarkdownRelativeLinks(root, markdownPaths, check) {
  const linkPattern = /!?\[[^\]]*\]\(([^)\s]+)(?:\s+["'][^"']*["'])?\)/g;
  for (const markdownPath of markdownPaths) {
    const content = readFileSync(markdownPath, "utf8");
    for (const match of content.matchAll(linkPattern)) {
      let target = match[1].replace(/^<|>$/g, "");
      if (
        target.startsWith("#") ||
        target.startsWith("/") ||
        /^[a-z][a-z0-9+.-]*:/i.test(target)
      ) {
        continue;
      }
      target = target.split("#", 1)[0].split("?", 1)[0];
      let decodedTarget;
      try {
        decodedTarget = decodeURIComponent(target);
      } catch {
        check(
          false,
          `${relative(root, markdownPath)} has an invalid encoded relative link: ${target}`,
        );
        continue;
      }
      check(
        existsSync(resolve(dirname(markdownPath), decodedTarget)),
        `${relative(root, markdownPath)} relative link does not resolve: ${target}`,
      );
    }
  }
}

export function verifyPlatformContractsAgentsGovernance({
  repositoryRoot = defaultRepositoryRoot,
} = {}) {
  const root = resolve(repositoryRoot);
  const agentsPath = join(root, "AGENTS.md");
  const governancePath = join(
    root,
    "docs/architecture/platform-contracts-agents-governance.json",
  );
  const readmePath = join(root, "README.md");
  const docsReadmePath = join(root, "docs/README.md");
  const verifierPath = join(
    root,
    "scripts/verify-platform-contracts-agents-governance.mjs",
  );

  const errors = [];
  const checks = {};
  function check(checkName, condition, message) {
    checks[checkName] ??= { status: "pass", checked: 0 };
    checks[checkName].checked += 1;
    if (!condition) {
      checks[checkName].status = "fail";
      errors.push({ check: checkName, message });
    }
  }
  const checkFor = (checkName) => (condition, message) =>
    check(checkName, condition, message);

  for (const [label, path] of [
    ["AGENTS.md", agentsPath],
    ["governance JSON", governancePath],
    ["README.md", readmePath],
    ["docs/README.md", docsReadmePath],
    ["governance verifier", verifierPath],
  ]) {
    check("requiredFiles", existsSync(path), `${label} is missing`);
  }

  const agentsText = existsSync(agentsPath)
    ? readFileSync(agentsPath, "utf8")
    : "";
  const readmeText = existsSync(readmePath)
    ? readFileSync(readmePath, "utf8")
    : "";
  const docsReadmeText = existsSync(docsReadmePath)
    ? readFileSync(docsReadmePath, "utf8")
    : "";
  const profile = existsSync(governancePath)
    ? parseJson(governancePath, (name, message) => check(name, false, message))
    : null;

  if (profile) {
    for (const [field, expectedValue] of Object.entries(expectedIdentity)) {
      check(
        "identity",
        profile[field] === expectedValue,
        `${field} must be ${expectedValue}`,
      );
    }
    check(
      "adrRequirements",
      jsonEqual(profile.requiredAdrReferences, expectedAdrReferences),
      "ADR-010 and ADR-016 must be mandatory and ordered",
    );
    check(
      "authorityHierarchy",
      jsonEqual(profile.authorityHierarchy, expectedAuthorityHierarchy),
      "authorityHierarchy must match the exact adopted 14-level order",
    );
    check(
      "ownershipBoundaries",
      jsonEqual(profile.ownedResponsibilities, expectedOwnedResponsibilities),
      "ownedResponsibilities must contain only the approved Platform Contracts responsibilities",
    );
    check(
      "ownershipBoundaries",
      jsonEqual(
        profile.prohibitedResponsibilities,
        expectedProhibitedResponsibilities,
      ),
      "prohibitedResponsibilities must preserve ADO, Manufacturing OS, operational-data, application, and production boundaries",
    );

    const ownedText = Array.isArray(profile.ownedResponsibilities)
      ? profile.ownedResponsibilities.join("\n")
      : "";
    check(
      "ownershipBoundaries",
      !/(ADO (runtime|Goal|Plan|Task|Agent|Judge|Fix Loop|approval)|Codex execution coordination)/i.test(
        ownedText,
      ),
      "Platform Contracts must not claim ADO ownership",
    );
    check(
      "ownershipBoundaries",
      !/(Manufacturing OS|Product DSL|manufacturing (rule|calculation|release)|Evidence|Candidate|Product Instance|geometry|drawing|\bBOM\b)/i.test(
        ownedText,
      ),
      "Platform Contracts must not claim Manufacturing OS ownership",
    );

    const dependency = profile.dependencyPolicy ?? {};
    check(
      "domainNeutrality",
      dependency.domainNeutral === true,
      "Platform Contracts must remain domain-neutral",
    );
    for (const [field, expectedValue] of Object.entries({
      adoInternalImports: "prohibited",
      manufacturingOsInternalImports: "prohibited",
      consumerSourceTreeDependencies: "prohibited",
      mutableOrUnversionedAuthorityReferences: "prohibited",
      directCrossDomainDatabaseAccess: "prohibited",
    })) {
      check(
        "dependencyBoundaries",
        dependency[field] === expectedValue,
        `dependencyPolicy.${field} must be ${expectedValue}`,
      );
    }
    check(
      "dependencyBoundaries",
      jsonEqual(dependency.approvedCrossDomainBoundaries, [
        "versioned APIs",
        "versioned messages",
        "versioned events",
        "versioned artifacts",
        "versioned platform-contract packages",
      ]),
      "only approved versioned cross-domain boundaries may be listed",
    );

    check(
      "contractChangePolicy",
      jsonEqual(
        profile.contractChangePolicy?.required,
        expectedContractChangeRequirements,
      ) &&
        profile.contractChangePolicy?.breakingChanges ===
          "fail-closed-until-approved",
      "contract changes must require version, compatibility, migration, validation, consumer impact, rollback, Judge, checkpoint, and fail-closed handling",
    );
    check(
      "stopConditions",
      jsonEqual(
        profile.requiredStopConditions?.NEEDS_DESIGN_DECISION,
        expectedNeedsDesignDecision,
      ),
      "NEEDS_DESIGN_DECISION conditions are incomplete or conflicting",
    );
    check(
      "stopConditions",
      jsonEqual(
        profile.requiredStopConditions?.BLOCKED_EXTERNAL,
        expectedBlockedExternal,
      ) &&
        profile.requiredStopConditions?.blockedExternalForArchitectureDecisions ===
          false,
      "BLOCKED_EXTERNAL must be limited to unavailable external dependencies and excluded from architecture decisions",
    );
    check(
      "gitAuthority",
      jsonEqual(profile.prohibitedGitActions, expectedProhibitedGitActions),
      "all prohibited Git actions must remain fail-closed",
    );
    check(
      "releaseAuthority",
      jsonEqual(
        profile.prohibitedReleaseActions,
        expectedProhibitedReleaseActions,
      ),
      "all prohibited production, package, architecture, and manufacturing approvals must remain fail-closed",
    );
    check(
      "validationPolicy",
      jsonEqual(profile.requiredValidation, expectedValidation),
      "requiredValidation is incomplete or reordered",
    );
    check(
      "completionEvidence",
      jsonEqual(profile.requiredCompletionEvidence, expectedCompletionEvidence),
      "requiredCompletionEvidence is incomplete or permits dishonest reporting",
    );
    check(
      "securityAndConfidentiality",
      jsonEqual(profile.securityAndConfidentiality, expectedSecurityRules),
      "security and confidentiality rules are incomplete",
    );
    check(
      "successorScope",
      jsonEqual(profile.successorTasks, expectedSuccessorTasks),
      "P0-T02B, P0-T02C, P0-T02D, and P0-T03 must remain not-started",
    );
    check(
      "humanCheckpoint",
      profile.humanCheckpointRequired === true &&
        profile.currentState === "checkpoint-review-required",
      "human checkpoint review must remain required",
    );

    const authorityReferences = Array.isArray(profile.authorityHierarchy)
      ? profile.authorityHierarchy.flatMap((entry) => entry.references ?? [])
      : [];
    for (const reference of authorityReferences) {
      check(
        "immutableReferences",
        typeof reference === "string" &&
          !isAbsolute(reference) &&
          !reference.includes("://") &&
          !/(^|\/)(main|master|latest)(\/|$)/i.test(reference) &&
          !/@latest(?:\/|$)/i.test(reference),
        `authority reference must be repository-relative, versioned, and immutable: ${reference}`,
      );
    }
  }

  for (const section of requiredSections) {
    check(
      "agentsSections",
      agentsText.includes(`## ${section}`),
      `AGENTS.md is missing required section: ${section}`,
    );
  }

  const markdownClauses = {
    mission: [
      /canonical, domain-neutral repository for architecture governance and shared contracts/i,
    ],
    roles: [
      /CEO \/ final business authority — human/,
      /AI CTO \/ design-review support — ChatGPT/,
      /Architect Agent/,
      /Implement Agent/,
      /Judge Agent/,
      /Fix Agent/,
      /Human reviewer/,
    ],
    authorityHierarchy: [
      /Lower authorities cannot silently override higher authorities\./,
      /Adopted ADR-001 through ADR-024/,
    ],
    adrRequirements: [
      /Every architecture-affecting task must identify all applicable ADR IDs/,
      /P0-T02A requires `ADR-010` and `ADR-016`\./,
    ],
    domainNeutrality: [/Platform Contracts must remain domain-neutral\./],
    dependencyBoundaries: [
      /must not import ADO internal packages or Manufacturing OS internal packages/,
      /must not depend on either consumer's source tree/,
      /unversioned branch, mutable URL, or latest-only reference/,
      /Direct cross-domain database access is prohibited\./,
    ],
    contractChangePolicy: [
      /Breaking changes fail closed until the migration, compatibility evidence, rollback plan, Judge result, and human approval are complete\./,
    ],
    stopConditions: [
      /Stop and return `NEEDS_DESIGN_DECISION` when:/,
      /conflicting sources and affected files or contracts/,
      /viable options and the risks of each option/,
      /Do not silently choose an architecture while stopped\./,
      /Do not use `BLOCKED_EXTERNAL` for architecture ambiguity or an unresolved design decision/,
    ],
    gitAuthority: [
      /Agents must work on a task branch\./,
      /Agents must not merge into main\./,
      /Agents must not force-push main\./,
      /Agents must not enable auto-merge\./,
      /Agents must not bypass required checks\./,
    ],
    releaseAuthority: [
      /Agents must not deploy to production, publish packages, approve a production release, approve Architecture Freeze or ADR changes, approve manufacturing knowledge, or approve manufacturing release\./,
    ],
    completionEvidence: [
      /without claiming checks that did not run/,
      /Never fabricate a pass, execution, result, approval, or artifact\./,
    ],
    validationPolicy: [
      /the existing canonical verifier/,
      /the cross-repository verifier when relevant/,
      /the complete deterministic test suite/,
      /Markdown relative-link validation/,
      /`git diff --check`/,
    ],
    securityAndConfidentiality: [
      /No secrets are permitted in files, prompts, logs, fixtures, artifacts, commits, or PR descriptions\./,
      /Do not include confidential specification content unless explicitly approved, minimized, and redacted\./,
      /Do not place credentials in shared contracts\./,
      /Do not use production customer or order data in tests\./,
    ],
    humanCheckpoint: [
      /The task remains `checkpoint-review-required` until a human reviews and merges it\./,
    ],
    successorScope: [
      /P0-T02B ADO `AGENTS\.md` remains `not-started`\./,
      /P0-T02C Manufacturing OS `AGENTS\.md` remains `not-started`\./,
      /P0-T02D cross-repository governance verification remains `not-started`\./,
      /P0-T03 and all later tasks remain `not-started`\./,
    ],
  };
  for (const [checkName, patterns] of Object.entries(markdownClauses)) {
    for (const pattern of patterns) {
      check(
        checkName,
        pattern.test(agentsText),
        `AGENTS.md is missing required governance clause: ${pattern.source}`,
      );
    }
  }

  check(
    "identity",
    agentsText.includes(expectedIdentity.branch) &&
      agentsText.includes(expectedIdentity.baseCommit) &&
      agentsText.includes("`P0-T02A`") &&
      agentsText.includes("`P0-T02`"),
    "AGENTS.md must record the task, canonical task, exact branch, and exact base commit",
  );

  validateMarkdownRelativeLinks(
    root,
    [
      ...collectMarkdownFiles(agentsPath),
      ...collectMarkdownFiles(readmePath),
      ...collectMarkdownFiles(join(root, "docs")),
    ].sort((left, right) => left.localeCompare(right)),
    checkFor("relativeLinks"),
  );

  const navigationChecks = [
    [readmeText, "AGENTS\\.md", "AGENTS.md", "README.md"],
    [
      readmeText,
      "agent-governance profile",
      "docs/architecture/platform-contracts-agents-governance.json",
      "README.md",
    ],
    [
      readmeText,
      "governance verifier",
      "scripts/verify-platform-contracts-agents-governance.mjs",
      "README.md",
    ],
    [docsReadmeText, "agent governance", "../AGENTS.md", "docs/README.md"],
    [
      docsReadmeText,
      "agent-governance profile",
      "architecture/platform-contracts-agents-governance.json",
      "docs/README.md",
    ],
    [
      docsReadmeText,
      "agent-governance verifier",
      "../scripts/verify-platform-contracts-agents-governance.mjs",
      "docs/README.md",
    ],
  ];
  for (const [content, label, target, source] of navigationChecks) {
    check(
      "readmeNavigation",
      hasMarkdownLink(content, label, target),
      `${source} must link to ${target}`,
    );
  }

  const conflictingAgentClauses = [
    /Agents may merge into main\./i,
    /Agents may force-push main\./i,
    /Agents may enable auto-merge\./i,
    /Agents may bypass required checks\./i,
    /Agents may deploy to production\./i,
    /Agents may publish packages\./i,
    /Platform Contracts owns ADO runtime orchestration\./i,
    /Platform Contracts owns Manufacturing OS domain logic\./i,
  ];
  for (const pattern of conflictingAgentClauses) {
    check(
      "conflictingGovernance",
      !pattern.test(agentsText),
      `AGENTS.md contains conflicting governance: ${pattern.source}`,
    );
  }

  return {
    status: errors.length === 0 ? "pass" : "fail",
    repository: expectedIdentity.repository,
    taskId: expectedIdentity.taskId,
    canonicalTaskId: expectedIdentity.canonicalTaskId,
    currentState: profile?.currentState ?? null,
    checks,
    errors,
  };
}

function parseCliRoot(arguments_) {
  if (arguments_.length === 0) {
    return defaultRepositoryRoot;
  }
  if (arguments_.length === 2 && arguments_[0] === "--root") {
    return resolve(arguments_[1]);
  }
  throw new Error("usage: verify-platform-contracts-agents-governance.mjs [--root <path>]");
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  let report;
  try {
    report = verifyPlatformContractsAgentsGovernance({
      repositoryRoot: parseCliRoot(process.argv.slice(2)),
    });
  } catch (error) {
    report = {
      status: "fail",
      repository: expectedIdentity.repository,
      taskId: expectedIdentity.taskId,
      errors: [{ check: "invocation", message: error.message }],
    };
  }
  console.log(JSON.stringify(report, null, 2));
  process.exitCode = report.status === "pass" ? 0 : 1;
}

export {
  expectedAdrReferences,
  expectedAuthorityHierarchy,
  expectedIdentity,
};
