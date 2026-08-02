# Platform Contracts agent governance

This file governs every human-assisted or autonomous agent operating anywhere in `asxeed-codex/asxeed-platform-contracts`. More specific task instructions may narrow the work, but they may not weaken or silently override this file or any higher authority below.

## Repository mission

Platform Contracts is ASXEED's canonical, domain-neutral repository for architecture governance and shared contracts. It preserves adopted architecture and technology records, defines versioned compatibility boundaries, and supplies deterministic cross-repository verification. It does not own the application behavior or domain state of ADO, Manufacturing OS, or another consumer.

## Human and agent roles

- **CEO / final business authority — human:** owns final business priorities and approval.
- **AI CTO / design-review support — ChatGPT:** analyzes architecture questions and prepares design-review recommendations; it does not replace human approval.
- **Architect Agent:** identifies applicable authorities and ADRs, analyzes boundaries, and proposes only architecture-compatible scoped work.
- **Implement Agent:** makes the smallest safe change authorized by the current task.
- **Judge Agent:** independently evaluates deterministic evidence, architecture compatibility, security, and contract impact.
- **Fix Agent:** corrects an identified implementation defect within the approved design and task scope; it does not make a new architecture decision.
- **Human reviewer:** reviews checkpoint evidence, approves or rejects architecture and contract impact, and exclusively decides whether protected changes merge or release.

Agents may analyze, propose, implement scoped changes, test, commit and push a task branch, and prepare a Draft PR. Humans retain final authority over merge, architecture approval, releases, manufacturing knowledge, and manufacturing release.

## Mandatory authority order

Apply these authorities in the exact order shown:

1. [Architecture Freeze v1.1](docs/architecture/ASXEED_Architecture_Freeze_v1.1.md)
2. [Architecture Freeze v1.1 Clarification 001](docs/architecture/ARCHITECTURE_FREEZE_v1.1_CLARIFICATION_001.md)
3. Adopted ADR-001 through ADR-024, incorporated into the Architecture Freeze
4. [Technology Stack v1.0](docs/architecture/TECHNOLOGY_STACK.md)
5. [Technology Version Matrix v1.0](docs/architecture/TECHNOLOGY_VERSION_MATRIX.md)
6. [Technology Selection Rationale v1.0](docs/architecture/TECHNOLOGY_SELECTION_RATIONALE.md)
7. [Deferred Technology v1.0](docs/architecture/DEFERRED_TECHNOLOGY.md)
8. [Master Implementation Plan v1.2](docs/plans/MASTER_IMPLEMENTATION_PLAN_v1.2.md)
9. [ADO Task Graph v1.2 Markdown](docs/plans/ADO_TASK_GRAPH_v1.2.md) and [JSON](docs/plans/ADO_TASK_GRAPH_v1.2.json)
10. [Sprint Execution Plan v1.0](docs/plans/SPRINT_EXECUTION_PLAN_v1.0.md)
11. [System Responsibility Boundaries v1.0](docs/architecture/SYSTEM_RESPONSIBILITY_BOUNDARIES_v1.0.md)
12. [Development Readiness Report v1.0](docs/reports/ASXEED_DEVELOPMENT_READINESS_REPORT_v1.0.md)
13. [Phase 0 Architecture Adoption Codex Pack v1.3](docs/plans/PHASE_00_ARCHITECTURE_ADOPTION_CODEX_PACK_v1.3.md)
14. Repository-specific task instructions and current implementation

Lower authorities cannot silently override higher authorities. The [adoption manifest](docs/architecture/adoption-manifest.json) and [cross-repository lock](docs/architecture/cross-repository-adoption-lock.json) are deterministic records of adopted authorities; they do not redefine them.

## Files to read before work

Before changing files, read:

1. this `AGENTS.md`;
2. the relevant Architecture Freeze sections and Clarification 001;
3. every ADR referenced by the task, using the adopted texts incorporated in the Architecture Freeze;
4. Technology Stack and Technology Version Matrix when technology is affected;
5. System Responsibility Boundaries when ownership is affected;
6. Master Plan, ADO Task Graph Markdown and JSON, and Sprint Plan when scheduling, readiness, dependency, or successor scope is affected;
7. the current task contract or task instructions; and
8. the relevant existing implementation, verification scripts, schemas, tests, workflows, and evidence conventions.

Do not assume this is a greenfield repository. Inspect branch, base commit, remote, worktree state, and existing user changes before implementation.

## ADR requirement

Every architecture-affecting task must identify all applicable ADR IDs, confirm the proposed change is compatible with them, and record those ADR references in completion evidence. If no approved ADR supports a required material architecture decision, stop with `NEEDS_DESIGN_DECISION`; do not invent, approve, reinterpret, amend, or supersede architecture. Creating or approving a new ADR is outside ordinary implementation authority.

P0-T02A requires `ADR-010` and `ADR-016`.

## Scope discipline

- Make the smallest safe change that satisfies the exact task scope.
- Do not perform opportunistic refactoring or unrelated dependency changes.
- Do not make hidden architecture decisions.
- Do not change another repository or consume another repository's dirty working-tree content.
- Do not implement later or successor tasks.
- Do not weaken, skip, delete, falsify, or rewrite tests or verification merely to make a task pass.
- Preserve unrelated uncommitted work and approved history.

## Platform Contracts protection

Platform Contracts owns only:

- canonical Architecture governance records;
- Architecture Freeze and adopted ADR representations;
- Technology Baseline records;
- domain-neutral shared contract definitions;
- versioned schemas and compatibility contracts;
- shared event, message, API, artifact, and approval-envelope contracts;
- cross-repository contract verification;
- canonical responsibility-boundary definitions; and
- canonical version and hash records.

Platform Contracts must remain domain-neutral. It must not own or contain:

- ADO runtime orchestration;
- ADO Goal, Plan, Task, Agent, Judge, Fix Loop, or approval-inbox runtime state;
- Codex execution coordination;
- Manufacturing OS Product DSL content;
- manufacturing rules or calculations;
- Evidence, Candidate, Conflict, Product Instance, parts, geometry, drawings, 3D, BOM, or manufacturing release packages;
- Product DSL product definitions or product-name-specific behavior;
- customer, order, quantity, price, invoice, payroll, inventory, or project operational data;
- repository-specific application behavior;
- direct application-database ownership; or
- production deployment ownership.

Shared contracts must not import ADO internal packages or Manufacturing OS internal packages and must not depend on either consumer's source tree. Consumers may depend only on versioned Platform Contracts packages or artifacts. No shared contract may rely on an unversioned branch, mutable URL, or latest-only reference. Cross-domain interaction must use approved versioned APIs, messages, events, artifacts, or platform-contract packages. Direct cross-domain database access is prohibited.

Do not copy secrets or real confidential production data into contracts, prompts, fixtures, logs, artifacts, commits, or PR descriptions. A shared contract must never become a route for application internals, application-domain behavior, operational data, or credentials.

## Contract change policy

Every shared-contract change requires:

- explicit version impact;
- compatibility analysis;
- a migration strategy for every breaking change;
- deterministic validation;
- consumer impact assessment;
- a rollback plan;
- an Architecture Judge result when available; and
- human checkpoint approval.

Compatible additions must follow the contract's semantic-version policy. Breaking changes fail closed until the migration, compatibility evidence, rollback plan, Judge result, and human approval are complete. Do not silently make a breaking change or independently publish a major version.

## Required artifacts and completion evidence

Completion evidence must report, without claiming checks that did not run:

- task ID;
- branch;
- base commit;
- changed files;
- commands executed;
- test results;
- verifier results;
- ADR references;
- responsibility-boundary impact;
- contract compatibility impact;
- risks;
- rollback plan;
- confirmation of unchanged protected areas;
- PR state; and
- the human checkpoint requirement.

Artifacts must be deterministic, valid, and machine-readable where the task specifies JSON. Record unavailable checks honestly. Never fabricate a pass, execution, result, approval, or artifact.

## `NEEDS_DESIGN_DECISION` stop procedure

Stop and return `NEEDS_DESIGN_DECISION` when:

- authoritative documents conflict;
- responsibility ownership is ambiguous;
- no approved ADR supports a material architecture decision;
- a breaking shared-contract change is required without an approved migration;
- completion requires changing the Architecture Freeze or an adopted ADR;
- completion requires weakening a security, compatibility, governance, or failure rule;
- completion would require ADO or Manufacturing OS domain logic in Platform Contracts; or
- repository reality materially contradicts the approved architecture.

The stop report must identify the conflicting sources and affected files or contracts, describe viable options and the risks of each option, recommend one option, and state the required human decision. Do not silently choose an architecture while stopped.

## `BLOCKED_EXTERNAL` procedure

Use `BLOCKED_EXTERNAL` only when a required repository, commit, credential, service, package registry, or external resource is unavailable after safe in-scope checks. State the unavailable dependency, checks attempted, and exact unblock requirement. Do not use `BLOCKED_EXTERNAL` for architecture ambiguity or an unresolved design decision; use `NEEDS_DESIGN_DECISION` for those cases.

## Git and PR authority

- Agents must work on a task branch.
- Agents may commit and push only scoped changes and may create a Draft PR.
- Agents must not merge into main.
- Agents must not force-push main.
- Agents must not delete protected branches.
- Agents must not enable auto-merge.
- Agents must not bypass required checks.
- Agents must not rewrite approved history.
- Agents must stop for human checkpoint review.

## Production and release authority

Agents must not deploy to production, publish packages, approve a production release, approve Architecture Freeze or ADR changes, approve manufacturing knowledge, or approve manufacturing release. Humans exclusively own these decisions.

## Validation policy

Run, as applicable to the task and repository state:

- the existing canonical verifier;
- the cross-repository verifier when relevant;
- focused tests;
- the complete deterministic test suite;
- JSON and schema validation;
- Markdown relative-link validation;
- `git diff --check`;
- changed-file scope inspection against the authorized base commit; and
- confirmation that protected canonical documents were not unintentionally changed.

Report every unavailable check honestly. Required verification fails closed if it cannot run or if evidence is missing or contradictory. Never weaken verification to obtain a pass.

## Security and confidentiality

- No secrets are permitted in files, prompts, logs, fixtures, artifacts, commits, or PR descriptions.
- Do not include confidential specification content unless explicitly approved, minimized, and redacted.
- Do not place credentials in shared contracts.
- Do not use production customer or order data in tests.
- Do not run destructive commands against unrelated or dirty working trees.
- Preserve uncommitted data unless the current task explicitly owns it.

## Task completion and checkpoint

An agent completes its authorized execution only after scoped implementation, deterministic validation, commit, push, and Draft PR creation. It then stops. The task remains `checkpoint-review-required` until a human reviews and merges it. A passing verifier or Judge report is evidence, not approval.

## P0-T02A controlled scope

- Task: `P0-T02A`, controlled sub-task of canonical task `P0-T02`.
- Required branch: `codex/P0-T02A-platform-contracts-agents-governance`.
- Authorized base commit: `c1bfd76b07b5cc98ffb4dc45f177f5027352fce2`.
- P0-T02A creates Platform Contracts governance only.
- P0-T02B ADO `AGENTS.md` remains `not-started`.
- P0-T02C Manufacturing OS `AGENTS.md` remains `not-started`.
- P0-T02D cross-repository governance verification remains `not-started`.
- P0-T03 and all later tasks remain `not-started`.

Do not modify ADO or Manufacturing OS, do not create their `AGENTS.md` files, and do not begin P0-T02B, P0-T02C, P0-T02D, P0-T03, or any later task.
