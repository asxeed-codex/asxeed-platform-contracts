# PHASE 00 ARCHITECTURE ADOPTION CODEX PACK v1.3

**Project:** ASXEED / ADO / Manufacturing OS  
**Phase:** P0 - Architecture Adoption  
**Authority:** `ASXEED_Architecture_Freeze_v1.1.md`  
**Plan:** `MASTER_IMPLEMENTATION_PLAN_v1.2.md`  
**Task graph:** `ADO_TASK_GRAPH_v1.2.md` / `ADO_TASK_GRAPH_v1.2.json`  
**Status:** Ready for execution  
**Owner:** レウ  
**AI CTO:** ぴーちゃん  
**Baseline date:** 2026-07-30

---

## 1. Purpose

This pack turns Architecture Freeze v1.1 into enforceable repository rules, machine-readable task contracts, an Architecture Judge, and a GitHub merge gate.

Phase 0 is complete only when the following flow actually works:

```text
Architecture Freeze + Technology Baseline
→ Repository governance documents
→ AGENTS.md constraints
→ Machine-readable ADO Task Contract
→ Architecture Rule Catalog
→ Architecture Judge
→ GitHub Required Check
→ Human-approved M0 Gate
```

Phase 1 must not begin before `P0-GATE` is approved.

---

## 2. Authority hierarchy

Codex must apply the following order of precedence.

1. `ASXEED_Architecture_Freeze_v1.1.md`
2. Adopted ADR-001 through ADR-024
3. `TECHNOLOGY_STACK.md`, `TECHNOLOGY_VERSION_MATRIX.md`, `TECHNOLOGY_SELECTION_RATIONALE.md`, `DEFERRED_TECHNOLOGY.md`
4. `MASTER_IMPLEMENTATION_PLAN_v1.2.md`
5. `ADO_TASK_GRAPH_v1.2.md` and `ADO_TASK_GRAPH_v1.2.json`
6. This Phase 0 Codex Pack
7. Individual ADO task instructions
8. Existing implementation

When a lower-level instruction conflicts with a higher-level document, Codex must stop and return:

```text
NEEDS_DESIGN_DECISION
```

Codex must identify the conflicting documents, affected files, possible resolutions, risks, and a recommended option. It must not silently choose a new architecture.

---

## 3. Repositories and ownership

Phase 0 covers three repositories.

| Repository | Domain ownership | Phase 0 responsibility |
|---|---|---|
| `asxeed-codex/asxeed-platform-contracts` | Shared contracts and reusable CI | Canonical governance copies, task schema, rule catalog, reusable workflow |
| `asxeed-codex/ado` | Goal, task, Codex execution, Judge, approval | Architecture Judge skeleton and report generation |
| `asxeed-codex/asxeed-manufacturing-os` | PUE, DSL, rules, parts, geometry, drawings, 3D | Governance adoption and architecture-check consumer |

The repositories must not import each other's internal domain packages. Shared contracts must flow through versioned platform-contract packages.

Codex must confirm the active repository, branch, remote, and clean/dirty state before changing files. It must never assume that a similarly named directory is the correct repository.

---

## 4. Phase graph and execution order

```text
P0-T01
├─ P0-T02
├─ P0-T03 ─┐
└─ P0-T04 ─┴→ P0-T05

P0-T02 + P0-T05
        ↓
      P0-T06
        ↓
      P0-GATE
```

Execution rules:

- Start only with `P0-T01`.
- After `P0-T01` approval, `P0-T03` and `P0-T04` may run in parallel.
- `P0-T02` may also begin after `P0-T01`, but it must be reviewed before `P0-T06`.
- `P0-T05` requires both `P0-T03` and `P0-T04`.
- `P0-T06` requires both `P0-T02` and `P0-T05`.
- `P0-GATE` is a Judge and human approval task, not an implementation task.

One Codex task must modify only the repository named by that task unless the task explicitly describes a documentation synchronization operation. Cross-repository work must be split into separate commits or pull requests.

---

## 5. Global Codex execution rules

### 5.1 Required behavior

For every task, Codex must:

1. Read the relevant Architecture Freeze and ADR sections.
2. Inspect the existing repository before proposing a file structure.
3. Preserve existing working behavior unless the task explicitly replaces it.
4. Make the smallest coherent change that satisfies the task.
5. Add or update tests for executable behavior.
6. Produce the required machine-readable verification artifacts.
7. Report changed files and commands executed.
8. Provide a rollback plan.
9. Stop at the required approval point.

### 5.2 Forbidden behavior

Codex must not:

- Merge to `main`.
- Deploy to Production.
- access Production data or Production secrets.
- add a new external service, database, queue, model provider, or major framework.
- change an adopted ADR.
- bypass failing tests, Judge checks, or security checks.
- update Golden Fixture expectations merely to make tests pass.
- create product-specific drawing, 3D, dimension, or parts-generation branches.
- add customer, project, quantity, price, invoice, inventory, CAD command, or coordinate fields to Product DSL Core.
- add independent dimension calculation to Drawing or 3D adapters.
- use `eval`, `new Function`, dynamic module execution, or arbitrary rule code.
- treat model confidence as human approval.

### 5.3 Mandatory stop conditions

Return `NEEDS_DESIGN_DECISION` and stop when:

- Architecture Freeze and repository reality materially conflict.
- An ADR is ambiguous for the proposed implementation.
- a breaking shared contract change is required.
- a new dependency or service materially changes the architecture.
- the requested check cannot be implemented without unacceptable false positives.
- a task requires write access outside its authorized repository.

Return `BLOCKED_EXTERNAL` when credentials, GitHub settings, or unavailable external systems prevent completion.

---

## 6. Standard task evidence

Every implementation task must emit the following files under a repository-local verification directory such as:

```text
.ado/artifacts/<task-id>/
```

Minimum evidence:

```text
implementation-summary.json
commands-executed.json
changed-files.json
test-results.json
risk-report.json
rollback-plan.json
```

Task-specific evidence is added to this set.

### 6.1 `implementation-summary.json`

```json
{
  "taskId": "P0-T01",
  "status": "completed",
  "repository": "platform-contracts",
  "branch": "codex/P0-T01-architecture-docs",
  "summary": "Architecture governance documents were installed.",
  "adrReferences": ["ADR-016"],
  "outputs": [],
  "knownLimitations": []
}
```

### 6.2 `commands-executed.json`

```json
{
  "taskId": "P0-T01",
  "commands": [
    {
      "command": "pnpm test",
      "exitCode": 0,
      "purpose": "Run repository tests"
    }
  ]
}
```

Secrets and confidential content must never be recorded in this artifact.

### 6.3 `changed-files.json`

```json
{
  "taskId": "P0-T01",
  "files": [
    {
      "path": "docs/architecture/ASXEED_Architecture_Freeze_v1.1.md",
      "changeType": "added",
      "reason": "Install canonical architecture reference"
    }
  ]
}
```

### 6.4 `test-results.json`

```json
{
  "taskId": "P0-T01",
  "overall": "pass",
  "suites": [],
  "failures": [],
  "skipped": []
}
```

### 6.5 `risk-report.json`

```json
{
  "taskId": "P0-T01",
  "riskLevel": "medium",
  "risks": [],
  "securityImpact": "none",
  "dataMigration": false,
  "breakingChange": false,
  "humanApprovalRequired": true
}
```

### 6.6 `rollback-plan.json`

```json
{
  "taskId": "P0-T01",
  "rollbackType": "git-revert",
  "steps": [
    "Revert the task commit",
    "Verify the previous documentation paths remain valid"
  ],
  "dataLossRisk": "none"
}
```

---

# 7. Task Pack: P0-T01

## Architecture Freeze v1.1 and Technology Baseline in three repositories

### Task metadata

| Field | Value |
|---|---|
| Task ID | `P0-T01` |
| Agent | `architect` |
| Primary repository | `platform-contracts` |
| Dependencies | none |
| Risk | medium |
| Approval | checkpoint |
| ADR | ADR-016 |
| Readiness | ready |

### Objective

Install the adopted Architecture Freeze, Technology Baseline, Master Implementation Plan, task graph reference, and repository responsibility boundaries in stable, documented locations that all three repositories can reference.

### Required inputs

- `ASXEED_Architecture_Freeze_v1.1.md`
- `TECHNOLOGY_STACK.md`
- `TECHNOLOGY_VERSION_MATRIX.md`
- `TECHNOLOGY_SELECTION_RATIONALE.md`
- `DEFERRED_TECHNOLOGY.md`
- `MASTER_IMPLEMENTATION_PLAN_v1.2.md`
- `ADO_TASK_GRAPH_v1.2.md`
- `ADO_TASK_GRAPH_v1.2.json`
- `SPRINT_EXECUTION_PLAN_v1.0.md`
- `SYSTEM_RESPONSIBILITY_BOUNDARIES_v1.0.md`
- `ASXEED_DEVELOPMENT_READINESS_REPORT_v1.0.md`
- current repository README and documentation structure

### Required outputs

Canonical platform-contracts files:

```text
docs/architecture/ASXEED_Architecture_Freeze_v1.1.md
docs/architecture/TECHNOLOGY_STACK.md
docs/architecture/TECHNOLOGY_VERSION_MATRIX.md
docs/architecture/TECHNOLOGY_SELECTION_RATIONALE.md
docs/architecture/DEFERRED_TECHNOLOGY.md
docs/plans/MASTER_IMPLEMENTATION_PLAN_v1.2.md
docs/plans/ADO_TASK_GRAPH_v1.2.md
docs/plans/ADO_TASK_GRAPH_v1.2.json
docs/plans/SPRINT_EXECUTION_PLAN_v1.0.md
docs/architecture/SYSTEM_RESPONSIBILITY_BOUNDARIES_v1.0.md
docs/reports/ASXEED_DEVELOPMENT_READINESS_REPORT_v1.0.md
docs/architecture/repository-responsibility.md
```

Each consumer repository must receive either:

- an approved synchronized copy with the same version and SHA-256 hash; or
- a stable reference manifest that identifies the canonical package/version and local adopted version.

The chosen method must work offline during Codex execution and must not depend on an unversioned URL.

### Repository responsibility document

`repository-responsibility.md` must define:

- domain ownership for all three repositories;
- permitted dependency direction;
- prohibited cross-domain imports and database access;
- location of shared contracts;
- ownership of ADR changes;
- conflict escalation procedure;
- document hierarchy;
- synchronization/version policy.

### Implementation procedure

1. Inspect existing `docs/`, root governance files, and package structure.
2. Select stable paths consistent with the repository.
3. copy the eleven approved baseline and planning documents without altering their substance.
4. compute and record document hashes in an adoption manifest.
5. create `repository-responsibility.md`.
6. add navigation links from the repository README or governance index.
7. define how ADO and Manufacturing OS will verify they adopted the same Freeze version.
8. run link, JSON, and basic repository checks.
9. generate standard task evidence.
10. stop for checkpoint approval.

### Suggested adoption manifest

```json
{
  "architectureFreezeVersion": "1.1",
  "status": "adopted",
  "documents": [
    {
      "name": "ASXEED_Architecture_Freeze_v1.1.md",
      "sha256": "<computed>",
      "source": "platform-contracts"
    },
    {
      "name": "TECHNOLOGY_STACK.md",
      "sha256": "<computed>",
      "source": "platform-contracts"
    },
    {
      "name": "TECHNOLOGY_VERSION_MATRIX.md",
      "sha256": "<computed>",
      "source": "platform-contracts"
    },
    {
      "name": "TECHNOLOGY_SELECTION_RATIONALE.md",
      "sha256": "<computed>",
      "source": "platform-contracts"
    },
    {
      "name": "DEFERRED_TECHNOLOGY.md",
      "sha256": "<computed>",
      "source": "platform-contracts"
    },
    {
      "name": "MASTER_IMPLEMENTATION_PLAN_v1.2.md",
      "sha256": "<computed>",
      "source": "platform-contracts"
    },
    {
      "name": "ADO_TASK_GRAPH_v1.2.md",
      "sha256": "<computed>",
      "source": "platform-contracts"
    },
    {
      "name": "ADO_TASK_GRAPH_v1.2.json",
      "sha256": "<computed>",
      "source": "platform-contracts"
    },
    {
      "name": "SPRINT_EXECUTION_PLAN_v1.0.md",
      "sha256": "<computed>",
      "source": "platform-contracts"
    },
    {
      "name": "SYSTEM_RESPONSIBILITY_BOUNDARIES_v1.0.md",
      "sha256": "<computed>",
      "source": "platform-contracts"
    },
    {
      "name": "ASXEED_DEVELOPMENT_READINESS_REPORT_v1.0.md",
      "sha256": "<computed>",
      "source": "platform-contracts"
    }
  ],
  "adoptedAt": "<ISO-8601>",
  "repository": "<repository-name>"
}
```

### Acceptance criteria

- All three repositories can identify Architecture Freeze version 1.1 and Technology Baseline version 1.0.
- The Freeze content is identical or verified against the canonical hash.
- The Master Plan and Task Graph are discoverable from governance documentation.
- repository ownership and dependency rules are explicit.
- conflict handling says to stop and return to AI CTO Design Review.
- no architectural content has been silently rewritten.

### Verification

Run the repository's existing checks and add deterministic document checks for:

- required files exist;
- JSON parses successfully;
- manifest hashes match actual files;
- relative links resolve;
- Architecture Freeze version is exactly `1.1`, Technology Baseline version is exactly `1.0`, and Master Plan / Task Graph versions are exactly `1.2`.

### Task-specific artifacts

```text
architecture-adoption-report.json
document-hashes.json
```

### Stop conditions

Stop if the three repositories already contain materially different adopted architecture documents. Report the differences rather than overwriting them.

### Ready-to-run Codex prompt

```text
Execute ADO task P0-T01: Architecture Freeze and Technology Baseline documents in three repositories.

Use ASXEED_Architecture_Freeze_v1.1.md as the highest implementation authority. Inspect the current platform-contracts repository before changing it. Install the approved Architecture Freeze, all four Technology Baseline documents, Master Implementation Plan v1.2, ADO Task Graph v1.2 Markdown and JSON, Sprint Execution Plan v1.0, System Responsibility Boundaries v1.0, Development Readiness Report v1.0, and a repository responsibility document in stable documentation paths. Define a deterministic version/hash adoption mechanism for ADO and Manufacturing OS. Do not alter the substance of the adopted documents. Do not merge or deploy.

Produce all standard Phase 0 verification artifacts plus architecture-adoption-report.json and document-hashes.json. Run deterministic existence, JSON, hash, link, and existing repository checks. Stop for checkpoint approval. If existing governance documents conflict materially with the Freeze, return NEEDS_DESIGN_DECISION with a structured conflict report instead of overwriting them.
```

---

# 8. Task Pack: P0-T02

## Update all `AGENTS.md` governance documents

### Task metadata

| Field | Value |
|---|---|
| Task ID | `P0-T02` |
| Agent | `architect` |
| Primary repository | `platform-contracts` |
| Dependencies | `P0-T01` |
| Risk | high |
| Approval | checkpoint |
| ADR | ADR-010, ADR-016 |

### Objective

Make Codex behavior repository-specific while enforcing one common architecture constitution.

### Required outputs

```text
ado/AGENTS.md
asxeed-manufacturing-os/AGENTS.md
asxeed-platform-contracts/AGENTS.md
```

If root `AGENTS.md` already exists, update it surgically and preserve valid existing instructions.

### Common mandatory sections

Every `AGENTS.md` must contain:

1. Repository mission and owned domain.
2. Authority hierarchy.
3. required ADR references in every implementation task.
4. allowed and forbidden dependency directions.
5. Source of Truth rules.
6. prohibited patterns.
7. required tests and verification artifacts.
8. architecture decision stop conditions.
9. security and confidential-data restrictions.
10. Git and pull-request rules.
11. Judge and human approval behavior.
12. task completion checklist.

### Repository-specific requirements

#### ADO

- Owns Goal, Plan, Task, Codex run, Judge, approval, release orchestration.
- Must not import Manufacturing OS internal packages or query its domain tables.
- Judge context must be separate from implementation context.
- Codex must not receive merge, Production deploy, Production data, or Production secret access.

#### Manufacturing OS

- Owns PUE, Evidence, Candidate, Product DSL, Rule Result, Parts, Geometry, Drawing, 3D, and manufacturing approval.
- Must not import ADO internal packages or query ADO domain tables.
- Geometry is the sole shape Source of Truth.
- Product-specific drawing, 3D, parts, and dimension code is prohibited.
- PUE may create only Draft DSL; Critical knowledge requires human approval.

#### Platform Contracts

- Owns shared contracts and reusable CI only.
- Must not contain ADO or Manufacturing business logic.
- Breaking contract changes require versioning, compatibility plan, migration, Judge, and human approval.

### Acceptance criteria

- Every implementation task must name relevant ADRs.
- Codex is instructed to stop on architecture ambiguity.
- Main merge and Production privileges are explicitly prohibited.
- standard evidence and rollback artifacts are required.
- each repository has a clearly bounded responsibility.
- existing valid repository instructions are not lost.

### Verification

Add a governance lint or deterministic script that verifies required headings and key prohibitions are present without requiring exact prose matching.

### Task-specific artifacts

```text
agents-governance-report.json
```

### Ready-to-run Codex prompt

```text
Execute ADO task P0-T02: update AGENTS.md for ADO, Manufacturing OS, and Platform Contracts.

Read the adopted Architecture Freeze and repository-responsibility document first. Preserve valid existing AGENTS.md instructions and add the required common and repository-specific governance sections. Explicitly require ADR references, Source of Truth compliance, verification artifacts, stop-on-design-ambiguity behavior, and the prohibition on Codex merge/Production privileges.

Do not introduce implementation architecture beyond the adopted ADRs. Add a deterministic governance lint and produce all standard task artifacts plus agents-governance-report.json. Stop for checkpoint approval.
```

---

# 9. Task Pack: P0-T03

## ADO Task Contract v1

### Task metadata

| Field | Value |
|---|---|
| Task ID | `P0-T03` |
| Agent | `architect` |
| Repository | `platform-contracts` |
| Dependencies | `P0-T01` |
| Risk | high |
| Approval | checkpoint |
| ADR | ADR-010, ADR-013 |
| Parallel group | P0-A |

### Objective

Define a JSON Schema 2020-12 contract that makes task identity, dependencies, ADRs, risk, approvals, acceptance criteria, verification evidence, and rollback machine-readable.

### Required outputs

Recommended paths:

```text
packages/ado-task-contract/schema/ado-task.v1.schema.json
packages/ado-task-contract/examples/ado-task.example.json
packages/ado-task-contract/examples/ado-task.invalid.example.json
packages/ado-task-contract/README.md
```

### Required task fields

The schema must require at least:

```text
id
title
phase
repository
agent
dependsOn
riskLevel
humanApproval
adrReferences
objective
outputs
acceptanceCriteria
requiredTests
requiredArtifacts
rollback
status
readiness
```

Recommended controlled values:

```text
riskLevel: low | medium | high | critical
humanApproval: auto | checkpoint | mandatory
status: planned | assigned | running | completed | judging | review | approved | merged | blocked
readiness: ready | blocked
```

`dependsOn` must be an array of stable Task IDs. Human-readable task titles must never be used as dependency identifiers.

### Rollback contract

```json
{
  "rollback": {
    "required": true,
    "strategy": "git-revert",
    "steps": ["Revert the task commit"],
    "dataLossRisk": "none"
  }
}
```

### Validation requirements

- valid example passes;
- invalid example fails for known reasons;
- duplicate IDs are rejected at graph-validation level;
- unresolved dependency IDs are rejected at graph-validation level;
- cycles are rejected at graph-validation level;
- every ADR reference matches `ADR-001` through `ADR-024`;
- mandatory approval is required for high-impact categories when policy evaluation is added.

JSON Schema validates a task object. Graph-level uniqueness, reference resolution, and cycle detection must be defined as a separate validator contract rather than forced into a single-object schema.

### Acceptance criteria

- `dependsOn` is always an ID array.
- ADR, risk, approval, artifacts, and rollback are required.
- examples are validated in CI.
- schema uses JSON Schema 2020-12.
- schema has a stable `$id` and explicit version.
- future compatible additions are possible without silently changing v1 meaning.

### Task-specific artifacts

```text
schema-validation-report.json
```

### Ready-to-run Codex prompt

```text
Execute ADO task P0-T03: define ADO Task Contract v1.

Create a JSON Schema 2020-12 task contract in platform-contracts. Make stable Task ID, dependsOn ID array, ADR references, repository, agent, risk, human approval, outputs, acceptance criteria, required tests, required artifacts, status, readiness, and rollback mandatory. Include valid and invalid examples and deterministic validation tests. Keep graph-level duplicate, unresolved-reference, and cycle validation separate from the single-task schema, but document the required graph validator behavior.

Do not change existing ADO lifecycle semantics without a design decision. Produce all standard artifacts plus schema-validation-report.json and stop for checkpoint approval.
```

---

# 10. Task Pack: P0-T04

## Architecture Rule Catalog

### Task metadata

| Field | Value |
|---|---|
| Task ID | `P0-T04` |
| Agent | `architect` |
| Repository | `platform-contracts` |
| Dependencies | `P0-T01` |
| Risk | high |
| Approval | checkpoint |
| ADR | ADR-001, ADR-002, ADR-009, ADR-012, ADR-013 |
| Parallel group | P0-A |

### Objective

Define stable rule IDs, severity, scope, rationale, detection strategy, exclusions, and remediation for the first enforceable Architecture rules.

### Required outputs

```text
packages/architecture-rules/architecture-rules.json
packages/architecture-rules/prohibited-patterns.md
packages/architecture-rules/schema/architecture-rule.schema.json
packages/architecture-rules/fixtures/
```

### Initial mandatory rules, including Technology Governance

| Rule ID | Rule | Default severity |
|---|---|---|
| `ASX-ARCH-001` | ADO imports Manufacturing internal package | error |
| `ASX-ARCH-002` | Manufacturing imports ADO internal package | error |
| `ASX-ARCH-003` | Product-name branching in drawing, 3D, dimensions, or parts generation | error |
| `ASX-ARCH-004` | Product DSL Core contains prohibited business or CAD fields | error |
| `ASX-ARCH-005` | Drawing or 3D performs independent manufacturing dimension calculation | error |
| `ASX-ARCH-006` | Candidate enters downstream flow without Evidence | critical |
| `ASX-ARCH-007` | Rule Engine uses `eval`, `new Function`, or arbitrary executable rule code | critical |
| `ASX-ARCH-008` | Direct cross-domain database access between ADO and Manufacturing | critical |
| `ASX-ARCH-009` | Golden Fixture expectation changed without approval metadata | error |
| `ASX-ARCH-010` | Public Demo references Production endpoint, storage, or release capability | critical |
| `ASX-ARCH-011` | Selected technology is replaced or duplicated without approved Design Review | error |
| `ASX-ARCH-012` | Major version or frozen version line is changed without Version Matrix approval | error |
| `ASX-ARCH-013` | Manufacturing PDF uses browser print or host-installed fonts | critical |
| `ASX-ARCH-014` | Critical AI processing silently changes region, provider, or quality tier | critical |

The first Judge skeleton may implement a reliable subset, but the catalog must distinguish:

```text
enforcement: implemented | planned | manual-review
```

### Rule object requirements

```json
{
  "id": "ASX-ARCH-003",
  "title": "Product-specific generation branch",
  "severity": "error",
  "status": "active",
  "enforcement": "implemented",
  "repositories": ["asxeed-manufacturing-os"],
  "appliesTo": ["drawing", "3d", "dimensions", "parts"],
  "adrReferences": ["ADR-002", "ADR-004", "ADR-012"],
  "rationale": "Products must be generated from DSL and shared models.",
  "detection": {
    "type": "ast-pattern",
    "patterns": []
  },
  "exclusions": [],
  "remediation": "Move product variation into Product DSL rules or profiles."
}
```

### Detection quality rules

- Prefer AST or structured manifest inspection over raw regular expressions.
- Regex may be used for high-confidence secret or forbidden API patterns, not broad semantic conclusions.
- Every implemented rule needs at least one passing and one failing fixture.
- False-positive exclusions must be narrow, documented, versioned, and reviewable.
- Rule disabling requires reason, owner, expiration, and human approval.

### Acceptance criteria

- At least ten active rules exist; fourteen are recommended above.
- every rule has stable ID, severity, affected scope, ADR, rationale, detection, exclusion policy, and remediation.
- catalog validates against its schema.
- implemented rules have positive and negative fixtures.
- manual-review rules are not falsely reported as automatically enforced.

### Task-specific artifacts

```text
architecture-rule-catalog-report.json
```

### Ready-to-run Codex prompt

```text
Execute ADO task P0-T04: define the Architecture Rule Catalog.

Create a versioned, JSON-Schema-validated rule catalog in platform-contracts. Include at least ASX-ARCH-001 through ASX-ARCH-010 from the Phase 0 Codex Pack. Each rule must declare stable ID, severity, repository scope, ADR references, rationale, detection method, enforcement status, exclusions, and remediation. Prefer AST and structured validation over broad regex. Add positive and negative fixtures for every rule marked implemented.

Do not claim automatic enforcement for a rule that the initial Judge cannot reliably detect. Produce all standard artifacts plus architecture-rule-catalog-report.json and stop for checkpoint approval.
```

---

# 11. Task Pack: P0-T05

## Architecture Judge skeleton

### Task metadata

| Field | Value |
|---|---|
| Task ID | `P0-T05` |
| Agent | `implementer` |
| Repository | `ado` |
| Dependencies | `P0-T03`, `P0-T04` |
| Risk | high |
| Approval | checkpoint |
| ADR | ADR-010, ADR-015 |

### Objective

Implement a deterministic Architecture Judge that examines repository changes, runs supported Architecture rules, and emits a schema-valid report without modifying source code.

### Required behavior

```text
Rule Catalog
＋ Repository metadata
＋ Base/head Git diff
＋ relevant files
↓
Architecture Judge
↓
architecture-report.json
↓
PASS or FAIL_ARCHITECTURE
```

The Judge must be read-only. It must never automatically fix Architecture violations in Phase 0.

### Recommended package boundary

Use the current ADO structure when possible. A suitable conceptual boundary is:

```text
packages/architecture-judge/
├─ src/
│  ├─ catalog-loader
│  ├─ diff-reader
│  ├─ detectors
│  ├─ report-builder
│  └─ cli
├─ fixtures/
└─ tests/
```

Do not restructure the entire ADO repository merely to match this example.

### Minimum implemented detection

The first skeleton must reliably detect:

1. prohibited direct ADO-to-Manufacturing internal imports;
2. prohibited direct Manufacturing-to-ADO internal imports;
3. high-confidence product-name branches in generation code;
4. prohibited Product DSL Core fields;
5. `eval`, `new Function`, or equivalent arbitrary rule execution;
6. direct cross-domain database access patterns when represented by known schemas/imports;
7. fixture changes requiring explicit manual-review metadata.

Candidate-without-Evidence and independent dimension calculations may initially require structured manifests or manual review if reliable static detection is not yet possible. The report must state enforcement coverage honestly.

### Report contract

```json
{
  "schemaVersion": "1.0.0",
  "taskId": "P0-T05",
  "repository": "ado",
  "baseRef": "origin/main",
  "headRef": "HEAD",
  "status": "FAIL_ARCHITECTURE",
  "summary": {
    "rulesEvaluated": 7,
    "violations": 1,
    "errors": 1,
    "critical": 0
  },
  "violations": [
    {
      "ruleId": "ASX-ARCH-003",
      "severity": "error",
      "file": "src/example.ts",
      "line": 12,
      "message": "Product-specific generation branch detected.",
      "evidence": "if (productName === ...)",
      "remediation": "Move the variation into Product DSL rules."
    }
  ],
  "coverage": [],
  "errors": []
}
```

### Exit codes

```text
0 = PASS
2 = FAIL_ARCHITECTURE
3 = invalid configuration or report failure
4 = NEEDS_HUMAN_REVIEW
```

### Tests

Required:

- catalog parsing;
- valid repository fixture passes;
- each implemented violation fixture fails with the expected Rule ID;
- exclusions are narrowly honored;
- malformed catalog fails closed;
- report validates against schema;
- Judge does not change the fixture repository;
- exit codes are stable.

### Required artifacts

```text
architecture-report.json
architecture-judge-coverage.json
```

### Acceptance criteria

- direct domain imports are detected.
- product-name generation branches are detected at high confidence.
- prohibited fields and arbitrary executable rules are detected.
- output validates against the Architecture Report schema.
- the Judge reports unsupported/manual rules as coverage gaps rather than PASSing them silently.
- no source code is modified.

### Ready-to-run Codex prompt

```text
Execute ADO task P0-T05: implement the Architecture Judge skeleton in the ADO repository.

Consume ADO Task Contract v1 and the versioned Architecture Rule Catalog. Implement a deterministic, read-only Judge over a base/head Git diff and relevant repository files. Emit schema-valid architecture-report.json, stable exit codes, per-rule evidence, remediation, and explicit enforcement coverage. Implement only rules that can be detected reliably; report unsupported rules as manual-review coverage gaps rather than silently passing them.

Add fixture-based positive and negative tests, malformed-catalog fail-closed tests, schema validation, and a test proving the Judge does not modify repositories. Do not add automatic fixes. Produce all standard artifacts plus architecture-report.json and architecture-judge-coverage.json. Stop for checkpoint approval.
```

---

# 12. Task Pack: P0-T06

## GitHub Required Architecture Check

### Task metadata

| Field | Value |
|---|---|
| Task ID | `P0-T06` |
| Agent | `implementer` |
| Primary repository | `platform-contracts` |
| Dependencies | `P0-T02`, `P0-T05` |
| Risk | high |
| Approval | mandatory |
| ADR | ADR-010, ADR-016 |

### Objective

Make Architecture Judge execution a reusable GitHub Actions check for all three repositories and document the protected-branch configuration required to block violating pull requests.

### Required outputs

Recommended paths:

```text
.github/workflows/reusable-architecture-check.yml
docs/ci/architecture-check-consumer-guide.md
docs/ci/branch-protection-setup.md
examples/workflows/architecture-check.yml
```

Consumer repositories should use a thin caller workflow pinned to a reviewed version or commit of the reusable workflow.

### Workflow requirements

- run for every pull request targeting `main`;
- check out sufficient history to compute an accurate base/head diff;
- install dependencies with locked versions;
- run the Architecture Judge;
- upload `architecture-report.json` even on failure;
- publish a concise GitHub summary;
- return a successful explicit `not-applicable` result when no relevant files changed;
- never leave the required check in pending state because of path filtering;
- use minimum `GITHUB_TOKEN` permissions;
- not expose secrets to pull requests;
- fail closed when the report cannot be generated or validated.

### Required check name

Use a stable check name, recommended:

```text
ado/architecture
```

Changing the check name after branch protection is configured requires an explicit migration plan.

### Branch protection guide

The guide must require:

- pull request before merge;
- required status check `ado/architecture`;
- required current branch state before merge;
- direct push prohibition;
- Codex and ADO bots without merge permission;
- human merge authority;
- documented temporary bypass procedure for emergencies with Audit and expiry.

GitHub settings may require human action. The task must distinguish files implemented by Codex from settings that the repository administrator must apply.

### Smoke tests

At minimum demonstrate:

1. compliant fixture PR returns PASS;
2. violating fixture PR returns FAIL_ARCHITECTURE;
3. documentation-only or irrelevant change returns explicit success;
4. malformed configuration fails;
5. report Artifact is uploaded in all outcomes.

### Task-specific artifacts

```text
ci-check-evidence.json
workflow-smoke-results.json
```

### Acceptance criteria

- all three repositories can call the same reusable check.
- the check always reaches a terminal status.
- violating PRs cannot satisfy the required check.
- not-applicable changes finish successfully and explicitly.
- branch-protection human steps are documented.
- no Production credential or broad write permission is introduced.

### Ready-to-run Codex prompt

```text
Execute ADO task P0-T06: make the Architecture Judge a reusable GitHub Required Check.

Implement a reusable GitHub Actions workflow in platform-contracts and thin consumer examples for ADO and Manufacturing OS. The stable check name is ado/architecture. It must run or explicitly return not-applicable for every pull request to main, upload architecture-report.json in every outcome, use least privilege, fail closed on invalid Judge output, and never remain pending because of path filtering.

Create a branch-protection setup guide that separates repository-code changes from administrator-only GitHub settings. Add smoke tests for compliant, violating, irrelevant, and malformed cases. Do not grant Codex or ADO merge rights. Produce all standard artifacts plus ci-check-evidence.json and workflow-smoke-results.json. Stop for mandatory human approval before branch protection is changed.
```

---

# 13. Gate Pack: P0-GATE

## M0 Architecture Operational Gate

### Task metadata

| Field | Value |
|---|---|
| Task ID | `P0-GATE` |
| Agent | `judge` |
| Repository | `platform-contracts` |
| Dependencies | `P0-T06` |
| Risk | high |
| Approval | mandatory |
| ADR | ADR-010, ADR-015 |

### Objective

Independently verify that architecture governance is operational across all three repositories before Phase 1 begins.

### Gate inputs

- Architecture Freeze and document adoption manifests;
- three `AGENTS.md` files and governance lint results;
- ADO Task Contract schema and examples;
- Architecture Rule Catalog and fixtures;
- Architecture Judge package and reports;
- reusable GitHub workflow and smoke results;
- branch-protection evidence or administrator confirmation;
- all Phase 0 verification artifacts.

### Mandatory cross-repository scenarios

The Gate Judge must independently test:

1. a compliant change passes in each repository;
2. ADO importing Manufacturing internals fails;
3. Manufacturing importing ADO internals fails;
4. product-specific generation branch fails;
5. prohibited Product DSL field fails;
6. arbitrary executable rule code fails;
7. invalid Task Contract fails;
8. unresolved dependency in a task graph fails;
9. architecture report schema failure blocks the check;
10. documentation-only changes return terminal success;
11. unapproved technology substitution fails;
12. frozen major-version change fails;
13. browser-print manufacturing PDF policy violation fails;
14. silent critical AI fallback fails.

### Gate result states

```text
PASS_NEEDS_APPROVAL
FAIL_ARCHITECTURE
FAIL_TEST
FAIL_SECURITY
NEEDS_DESIGN_DECISION
BLOCKED_EXTERNAL
```

The Gate Judge must not return `PASS_AUTO_CONTINUE` because human approval is mandatory.

### Required outputs

```text
.ado/artifacts/P0-GATE/judge-summary.json
.ado/artifacts/P0-GATE/rollback-plan.json
.ado/artifacts/P0-GATE/cross-repository-smoke.json
```

### Gate acceptance criteria

- all three repositories reference Freeze v1.1 and Technology Baseline v1.0 deterministically;
- `AGENTS.md` governance is present and linted;
- ADO Task Contract validates;
- the initial Rule Catalog is versioned and validated;
- Architecture Judge blocks known violations;
- GitHub check reaches a terminal result for all PR categories;
- required branch-protection settings are applied or explicitly blocked for administrator action;
- all task artifacts exist and validate;
- rollback procedures exist;
- human approval is recorded against the Gate evidence hash.

### Ready-to-run Judge prompt

```text
Execute P0-GATE: M0 Architecture Operational Gate.

Do not trust Phase 0 implementation summaries without independent verification. Validate the adopted document hashes, AGENTS.md governance, ADO Task Contract, Architecture Rule Catalog, Judge report schema, implemented detectors, reusable GitHub workflow, and branch-protection evidence. Run the mandatory cross-repository compliant and violating scenarios listed in the Phase 0 Codex Pack.

Return PASS_NEEDS_APPROVAL only if every mandatory criterion passes. Otherwise return the most specific failure state. Emit judge-summary.json, rollback-plan.json, and cross-repository-smoke.json. Do not start Phase 1 and do not approve on behalf of the human owner.
```

---

## 14. Phase 0 Definition of Done

Phase 0 is Done only when all of the following are true:

- `P0-T01` through `P0-T06` are completed with required evidence.
- Architecture Freeze v1.1 and all four Technology Baseline documents are deterministically adopted by all three repositories.
- every repository has an Architecture-compliant `AGENTS.md`.
- ADO Task Contract v1 is machine-validatable.
- Architecture Rule Catalog has stable IDs and explicit enforcement coverage.
- Architecture Judge detects the initial supported violations and emits schema-valid reports.
- GitHub check `ado/architecture` terminates for every PR and blocks known violations.
- Cross-repository smoke tests pass.
- Human owner reviews the M0 evidence and approves `P0-GATE`.
- Phase 1 remains blocked until that approval is recorded.

---

## 15. Phase 0 rollback strategy

Phase 0 introduces governance and CI behavior, not production data migrations.

Rollback order:

1. disable the required check only through an audited human emergency action if it blocks all repository work due to a Judge defect;
2. revert the consumer workflow version;
3. revert the Architecture Judge package change;
4. retain the Architecture Freeze and governance documents unless a superseding ADR is formally approved;
5. create an Incident and correction task;
6. restore the required check after smoke verification.

A rollback must never silently remove Architecture governance. Temporary bypasses require owner, reason, expiry, affected repositories, and follow-up task.

---


## 16. Formal Technology Baseline Adoption

Phase 0 must distribute and hash-pin the following documents in all three repositories:

```text
TECHNOLOGY_STACK.md
TECHNOLOGY_VERSION_MATRIX.md
TECHNOLOGY_SELECTION_RATIONALE.md
DEFERRED_TECHNOLOGY.md
```

### Required checks

- Root Node.js and pnpm pins match the Version Matrix.
- No overlapping Framework, Queue, Database, ORM, State Library, PDF, DXF, or Logger is introduced.
- Package additions declare responsibility, license, security review, and ADR / Technology reference.
- Major upgrades and substitutions return `NEEDS_DESIGN_DECISION`.
- Phase 1 technology-spike tasks `P1-TS01` through `P1-TS07` exist in the approved Task Graph.

### Technology adoption artifact

```text
technology-adoption-report.json
```

The report must include document hashes, frozen platform versions, detected deviations, repository, commit, and approval status.


### Additional adopted planning documents

- `SPRINT_EXECUTION_PLAN_v1.0.md`
- `SYSTEM_RESPONSIBILITY_BOUNDARIES_v1.0.md`
- `ASXEED_DEVELOPMENT_READINESS_REPORT_v1.0.md`

P0-T01 must place these documents with the Architecture Freeze and Technology Baseline. Their hashes must be included in the adoption manifest.

## 17. Handoff to Phase 1

After `P0-GATE` approval, create Phase 1 work only from the approved `ADO_TASK_GRAPH_v1.2.json` nodes whose dependencies are satisfied.

The first Phase 1 task is:

```text
P1-T01 - Platform Contracts Repository foundation
```

Technology validation tasks `P1-TS01` through `P1-TS07` must be scheduled according to `ADO_TASK_GRAPH_v1.2.json` and must pass before `P1-GATE`.

No Phase 1 Codex Pack may weaken Phase 0 governance. If a Phase 1 implementation reveals an Architecture gap, create a new Design Review item rather than bypassing `ado/architecture`.

