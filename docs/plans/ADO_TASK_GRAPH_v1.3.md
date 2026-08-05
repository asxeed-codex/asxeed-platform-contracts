# ASXEED ADO Task Graph v1.3

**Status:** Proposed; human direction approved in principle; formal adoption requires OA-00 human checkpoint review and merge
**Machine-readable source:** [ADO Task Graph v1.3 JSON](ADO_TASK_GRAPH_v1.3.json)
**Historical predecessor:** [ADO Task Graph v1.2](ADO_TASK_GRAPH_v1.2.md) / [JSON](ADO_TASK_GRAPH_v1.2.json)

## 1. Scope and truthfulness

Version 1.3 preserves all 103 committed predecessor task IDs and adds exactly 12 Ontology tasks. It does not claim Architecture v1.2 is merged. OA-00 is `checkpoint-review-required`; OA-00A and every later OA task are `not-started` and dependency-blocked.

## 2. Counts and validation

| Metric | Value |
|---|---:|
| Predecessor task IDs | 103 |
| Added OA task IDs | 12 |
| Total task IDs | 115 |
| Missing dependencies | 0 |
| Dependency cycles | 0 |
| Missing sprint assignments | 0 |
| Sprint-order violations | 0 |

## 3. Actual P0/OA state

| Work | State |
|---|---|
| `P0-T01A` | `completed` |
| `P0-T01D` | `completed` |
| `P0-T02A` | `completed` |
| `P0-T02B` | `completed` |
| `P0-T02C` | `checkpoint-review-required` |
| `P0-T02D` | `blocked-by-ontology-architecture-migration` |
| `P0-T03` | `not-started` |
| `OA-00` | `checkpoint-review-required` |
| `OA-00A` | `not-started` |
| `OA-00B` | `not-started` |
| `OA-00C` | `not-started` |
| `OA-01` | `not-started` |
| `OA-02` | `not-started` |
| `OA-03` | `not-started` |
| `OA-04` | `not-started` |
| `OA-05` | `not-started` |
| `OA-06` | `not-started` |
| `OA-07` | `not-started` |
| `OA-GATE` | `not-started` |

## 4. Preserved predecessor IDs

The complete v1.2 task definitions are carried into the JSON graph. P0-T03 and P0-T04 gain an OA-GATE dependency; all other changes are status/readiness and sprint-sequence reconciliation required to prevent unsafe successor execution.

```text
P0-T01 P0-T02 P0-T03 P0-T04 P0-T05 P0-T06 P0-GATE P1-T01 P1-T02 P1-T03 P1-T04 P1-T05 P1-T06 P1-T07 P1-T08 P1-T09 P1-T10 P1-T11 P1-T12 P1-T13 P1-T14 P1-T15 P1-T16 P1-T17 P1-TS01 P1-TS02 P1-TS03 P1-TS04 P1-TS05 P1-TS06 P1-TS07 P1-GATE P2-T01 P2-T02 P2-T03 P2-T04 P2-T05 P2-T06 P2-T07 P2-T08 P2-T09 P2-T10 P2-T11 P2-GATE P3-T01 P3-T02 P3-T03 P3-T04 P3-T05 P3-T06 P3-T07 P3-T08 P3-T09 P3-T10 P3-T11 P3-T12 P3-T13 P3-GATE P4-T01 P4-T02 P4-T03 P4-T04 P4-T05 P4-T06 P4-T07 P4-T08 P4-T09 P4-T10 P4-T11 P4-T12 P4-GATE P5-T01 P5-T02 P5-T03 P5-T04 P5-T05 P5-T06 P5-T07 P5-T08 P5-T09 P5-T10 P5-T11 P5-T12 P5-GATE P6-T01 P6-T02 P6-T03 P6-T04 P6-T05 P6-T06 P6-T07 P6-T08 P6-T09 P6-GATE P7-T01 P7-T02 P7-T03 P7-T04 P7-T05 P7-T06 P7-T07 P7-T08 P7-GATE
```

## 5. Ontology dependency spine

```text
OA-00
├─ OA-00A ─┐
└─ OA-00B ─┴─> OA-00C -> OA-01 -> OA-02
                                   ├─> OA-03 ─┐
                                   └─> OA-04 ─┴─> OA-05 -> OA-06 -> OA-07 -> OA-GATE
```

## 6. Ontology task registry

| ID | Title | Repository | Agent | Depends on | Risk | Human approval | Sprint | Status |
|---|---|---|---|---|---|---|---|---|
| `OA-00` | ADO Embedded Ontology Architecture Gate | `platform-contracts` | `architect` | none | `critical` | `mandatory` | `SPRINT-OA-00` | `checkpoint-review-required` |
| `OA-00A` | ADO Architecture v1.2 Adoption | `ado` | `architect` | `OA-00` | `critical` | `mandatory` | `SPRINT-OA-01` | `not-started` |
| `OA-00B` | Manufacturing OS Ontology Transition | `manufacturing-os` | `architect` | `OA-00` | `critical` | `mandatory` | `SPRINT-OA-01` | `not-started` |
| `OA-00C` | Cross-repository Architecture v1.2 Verification | `platform-contracts` | `judge` | `OA-00A`, `OA-00B` | `critical` | `mandatory` | `SPRINT-OA-01` | `not-started` |
| `OA-01` | ADO Knowledge Core | `ado` | `implementer` | `OA-00C` | `critical` | `mandatory` | `SPRINT-OA-02` | `not-started` |
| `OA-02` | ADO Ontology Builder | `ado` | `implementer` | `OA-01` | `critical` | `mandatory` | `SPRINT-OA-03` | `not-started` |
| `OA-03` | Company Ontology Dogfooding | `ado` | `implementer` | `OA-02` | `high` | `mandatory` | `SPRINT-OA-04` | `not-started` |
| `OA-04` | Manufacturing Ontology Pack | `manufacturing-os` | `implementer` | `OA-01`, `OA-02` | `critical` | `mandatory` | `SPRINT-OA-05` | `not-started` |
| `OA-05` | Ontology-to-DSL Generators | `ado / manufacturing-os` | `implementer` | `OA-03`, `OA-04` | `critical` | `mandatory` | `SPRINT-OA-06` | `not-started` |
| `OA-06` | Agent and Rule Engine Integration | `ado / manufacturing-os` | `implementer` | `OA-05` | `critical` | `mandatory` | `SPRINT-OA-07` | `not-started` |
| `OA-07` | Cross-domain Ontology Pilot | `ado / manufacturing-os / platform-contracts` | `judge` | `OA-06` | `critical` | `mandatory` | `SPRINT-OA-08` | `not-started` |
| `OA-GATE` | Ontology Architecture and Pilot Gate | `platform-contracts` | `judge` | `OA-07` | `critical` | `mandatory` | `SPRINT-OA-09` | `not-started` |

## 7. Ontology task contracts

### OA-00 — ADO Embedded Ontology Architecture Gate

- **Repository / agent:** `platform-contracts` / `architect`
- **Depends on:** none
- **Risk / approval:** `critical` / `mandatory`
- **Readiness / status:** `active` / `checkpoint-review-required`
- **ADR references:** `ADR-001`, `ADR-005`, `ADR-006`, `ADR-008`, `ADR-009`, `ADR-010`, `ADR-012`, `ADR-013`, `ADR-015`, `ADR-016`, `ADR-018`, `ADR-019`, `ADR-020`, `ADR-021`, `ADR-022`, `ADR-025`, `ADR-026`, `ADR-027`, `ADR-028`, `ADR-029`, `ADR-030`
- **Objective:** Formalize the human-selected ADO-embedded Ontology Architecture as a controlled, verified, reversible package without runtime implementation.
- **Outputs:**
  - Architecture Freeze v1.2
  - ADR-025 through ADR-030
  - Ontology architecture manifest
  - Task Graph v1.3
  - OA-00 evidence
  - Draft PR
- **Acceptance criteria:**
  - All required OA-00 documents and evidence exist
  - Historical v1.1 authorities remain unchanged
  - Exactly 103 old and 12 OA task IDs are valid
  - Consumer and PR #26 states are verified read-only
  - Human checkpoint and merge remain pending
- **Required tests:**
  - ontology architecture verifier
  - focused and full deterministic tests
  - JSON and Markdown validation
- **Required artifacts:**
  - implementation-summary.json
  - architecture-decision-report.json
  - human-checkpoint-report.json

### OA-00A — ADO Architecture v1.2 Adoption

- **Repository / agent:** `ado` / `architect`
- **Depends on:** `OA-00`
- **Risk / approval:** `critical` / `mandatory`
- **Readiness / status:** `blocked` / `not-started`
- **ADR references:** `ADR-010`, `ADR-016`, `ADR-025`, `ADR-026`, `ADR-027`, `ADR-028`, `ADR-030`
- **Objective:** Adopt ADO Knowledge Core, Ontology Builder, namespace, approval, and no-separate-Knowledge-OS governance boundaries without starting runtime work.
- **Outputs:**
  - ADO governance v1.2 adoption
  - ADO verifier and evidence
- **Acceptance criteria:**
  - ADO ownership is explicit
  - Manufacturing approval remains external
  - No runtime implementation starts
  - Human checkpoint passes
- **Required tests:**
  - ADO architecture and governance verifier
  - ADO full tests
- **Required artifacts:**
  - consumer-adoption-report.json
  - rollback-plan.json

### OA-00B — Manufacturing OS Ontology Transition

- **Repository / agent:** `manufacturing-os` / `architect`
- **Depends on:** `OA-00`
- **Risk / approval:** `critical` / `mandatory`
- **Readiness / status:** `blocked` / `not-started`
- **ADR references:** `ADR-001`, `ADR-005`, `ADR-009`, `ADR-012`, `ADR-019`, `ADR-027`, `ADR-028`, `ADR-029`, `ADR-030`
- **Objective:** Transition P0-T02C governance to Manufacturing Ontology Pack and generated Product DSL boundaries while preserving runtime, evidence, approval, and PR history.
- **Outputs:**
  - PR #26 transition governance
  - Manufacturing verifier and evidence
- **Acceptance criteria:**
  - Product DSL becomes snapshot-derived execution artifact
  - Manufacturing validation and Human Critical approval remain
  - P0-T02C validation reruns
  - PR remains Draft until human review
- **Required tests:**
  - Manufacturing governance tests
  - Manufacturing full tests and build
  - safe CLI smoke
- **Required artifacts:**
  - consumer-adoption-report.json
  - product-dsl-compatibility-report.json

### OA-00C — Cross-repository Architecture v1.2 Verification

- **Repository / agent:** `platform-contracts` / `judge`
- **Depends on:** `OA-00A`, `OA-00B`
- **Risk / approval:** `critical` / `mandatory`
- **Readiness / status:** `blocked` / `not-started`
- **ADR references:** `ADR-010`, `ADR-013`, `ADR-015`, `ADR-016`, `ADR-025`, `ADR-027`, `ADR-029`, `ADR-030`
- **Objective:** Pin and verify exact v1.2 adoption commits, hashes, authority order, ownership, compatibility, and blocked successor state across all repositories.
- **Outputs:**
  - cross-repository v1.2 adoption lock
  - deterministic verification report
- **Acceptance criteria:**
  - Exact commits and hashes match
  - Zero boundary conflicts
  - Consumer verifiers pass
  - Human gate evidence is truthful
- **Required tests:**
  - cross-repository verifier
  - tamper tests
- **Required artifacts:**
  - cross-repository-verification-report.json
  - repository-commit-lock.json

### OA-01 — ADO Knowledge Core

- **Repository / agent:** `ado` / `implementer`
- **Depends on:** `OA-00C`
- **Risk / approval:** `critical` / `mandatory`
- **Readiness / status:** `blocked` / `not-started`
- **ADR references:** `ADR-007`, `ADR-008`, `ADR-009`, `ADR-013`, `ADR-014`, `ADR-015`, `ADR-020`, `ADR-022`, `ADR-025`, `ADR-027`, `ADR-030`
- **Objective:** Implement the minimum PostgreSQL and Blob compatible Knowledge Core with isolation, versioning, provenance, conflict, snapshots, audit, query, restore, and rollback.
- **Outputs:**
  - Knowledge Core runtime
  - versioned contracts
  - migration and rollback evidence
- **Acceptance criteria:**
  - Organization and namespace isolation pass
  - Snapshots are immutable and reproducible
  - No public endpoint or Graph Database
  - Restore and rollback are rehearsed
- **Required tests:**
  - unit/integration/property/security tests
  - restore test
  - load baseline
- **Required artifacts:**
  - knowledge-core-report.json
  - security-report.json
  - rollback-report.json

### OA-02 — ADO Ontology Builder

- **Repository / agent:** `ado` / `implementer`
- **Depends on:** `OA-01`
- **Risk / approval:** `critical` / `mandatory`
- **Readiness / status:** `blocked` / `not-started`
- **ADR references:** `ADR-005`, `ADR-006`, `ADR-009`, `ADR-010`, `ADR-014`, `ADR-018`, `ADR-021`, `ADR-026`, `ADR-027`, `ADR-028`
- **Objective:** Implement evidence-linked candidate, proposal, conflict, question, Judge, approval-routing, and snapshot-request workflows.
- **Outputs:**
  - Ontology Builder workflows
  - review surfaces
  - trace evidence
- **Acceptance criteria:**
  - Confidence and Approval remain separate
  - Critical manufacturing approval routes to humans
  - Conflicts and unknowns fail closed
  - No protected self-approval
- **Required tests:**
  - workflow tests
  - authorization tests
  - AI evaluation
- **Required artifacts:**
  - ontology-builder-report.json
  - approval-boundary-report.json

### OA-03 — Company Ontology Dogfooding

- **Repository / agent:** `ado` / `implementer`
- **Depends on:** `OA-02`
- **Risk / approval:** `high` / `mandatory`
- **Readiness / status:** `blocked` / `not-started`
- **ADR references:** `ADR-009`, `ADR-014`, `ADR-015`, `ADR-020`, `ADR-025`, `ADR-026`, `ADR-030`
- **Objective:** Validate the Knowledge Core and Builder with synthetic or approved non-confidential Company Ontology knowledge.
- **Outputs:**
  - Company Ontology pilot
  - operational measurements
  - dogfood report
- **Acceptance criteria:**
  - No secrets or production data
  - Change, query, snapshot, revocation, and agent context pass
  - Human review evidence exists
  - Rollback is proven
- **Required tests:**
  - dogfood E2E
  - authorization and revocation tests
- **Required artifacts:**
  - company-ontology-pilot-report.json

### OA-04 — Manufacturing Ontology Pack

- **Repository / agent:** `manufacturing-os` / `implementer`
- **Depends on:** `OA-01`, `OA-02`
- **Risk / approval:** `critical` / `mandatory`
- **Readiness / status:** `blocked` / `not-started`
- **ADR references:** `ADR-005`, `ADR-009`, `ADR-012`, `ADR-015`, `ADR-019`, `ADR-027`, `ADR-028`, `ADR-030`
- **Objective:** Implement Manufacturing OS owned extensions, semantic validation, Criticality, approval policy, and synthetic fixtures without generator cutover.
- **Outputs:**
  - Manufacturing Ontology Pack
  - validation policy
  - synthetic fixtures
- **Acceptance criteria:**
  - Manufacturing semantic ownership remains local
  - Human Critical approval is mandatory
  - No confidential rules are committed
  - Existing runtime remains compatible
- **Required tests:**
  - contract tests
  - semantic validation tests
  - approval negative tests
- **Required artifacts:**
  - manufacturing-ontology-report.json
  - confidentiality-report.json

### OA-05 — Ontology-to-DSL Generators

- **Repository / agent:** `ado / manufacturing-os` / `implementer`
- **Depends on:** `OA-03`, `OA-04`
- **Risk / approval:** `critical` / `mandatory`
- **Readiness / status:** `blocked` / `not-started`
- **ADR references:** `ADR-001`, `ADR-005`, `ADR-012`, `ADR-013`, `ADR-015`, `ADR-018`, `ADR-019`, `ADR-028`, `ADR-029`
- **Objective:** Implement pinned Plan DSL and Product DSL generators with snapshot provenance, deterministic output, shadow comparison, and legacy compatibility.
- **Outputs:**
  - Plan DSL Generator
  - Product DSL Generator
  - compatibility adapters
- **Acceptance criteria:**
  - All provenance fields exist
  - Generated output is deterministic
  - Old DSL remains readable
  - Product DSL exclusions remain
  - Human gates pass
- **Required tests:**
  - schema tests
  - determinism tests
  - old/new equivalence tests
  - migration tests
- **Required artifacts:**
  - dsl-generator-report.json
  - compatibility-report.json

### OA-06 — Agent and Rule Engine Integration

- **Repository / agent:** `ado / manufacturing-os` / `implementer`
- **Depends on:** `OA-05`
- **Risk / approval:** `critical` / `mandatory`
- **Readiness / status:** `blocked` / `not-started`
- **ADR references:** `ADR-010`, `ADR-012`, `ADR-013`, `ADR-014`, `ADR-015`, `ADR-029`
- **Objective:** Connect generated Plan DSL and Product DSL to existing engines through versioned adapters while retaining deterministic evaluator behavior.
- **Outputs:**
  - engine adapters
  - integration traces
  - rollback selector
- **Acceptance criteria:**
  - Typed Rule Engine behavior is unchanged
  - Unknown and conflicts fail closed
  - No product-name code
  - Traffic rollback passes
- **Required tests:**
  - engine regression
  - integration E2E
  - rollback test
- **Required artifacts:**
  - engine-integration-report.json

### OA-07 — Cross-domain Ontology Pilot

- **Repository / agent:** `ado / manufacturing-os / platform-contracts` / `judge`
- **Depends on:** `OA-06`
- **Risk / approval:** `critical` / `mandatory`
- **Readiness / status:** `blocked` / `not-started`
- **ADR references:** `ADR-009`, `ADR-010`, `ADR-013`, `ADR-014`, `ADR-015`, `ADR-019`, `ADR-021`, `ADR-022`, `ADR-023`, `ADR-027`, `ADR-028`, `ADR-029`, `ADR-030`
- **Objective:** Demonstrate a controlled evidence-to-snapshot-to-DSL-to-engine flow across Company and Manufacturing namespaces with external Order references.
- **Outputs:**
  - cross-domain pilot
  - security and rollback evidence
  - human review package
- **Acceptance criteria:**
  - No cross-domain database access
  - Order authority remains external
  - Critical manufacturing approval is genuine
  - Revocation and rollback stop downstream use
  - Zero unresolved Critical findings
- **Required tests:**
  - cross-domain E2E
  - security test
  - DR and rollback rehearsal
- **Required artifacts:**
  - cross-domain-pilot-report.json
  - human-approval-evidence.json

### OA-GATE — Ontology Architecture and Pilot Gate

- **Repository / agent:** `platform-contracts` / `judge`
- **Depends on:** `OA-07`
- **Risk / approval:** `critical` / `mandatory`
- **Readiness / status:** `blocked` / `not-started`
- **ADR references:** `ADR-010`, `ADR-015`, `ADR-019`, `ADR-022`, `ADR-025`, `ADR-026`, `ADR-027`, `ADR-028`, `ADR-029`, `ADR-030`
- **Objective:** Determine whether Ontology architecture, consumers, pilot, security, migration, and rollback evidence support resuming the preserved implementation plan.
- **Outputs:**
  - OA gate report
  - human checkpoint package
- **Acceptance criteria:**
  - All predecessor evidence passes
  - Zero unresolved Critical issues
  - Consumer adoption is exact
  - Restore and rollback are rehearsed
  - Human approval is complete
- **Required tests:**
  - complete cross-repository regression
  - Architecture and Security Judge
- **Required artifacts:**
  - judge-summary.json
  - rollback-plan.json
  - human-checkpoint-report.json

## 8. Sprint mapping

| Sequence | Sprint | Tasks |
|---:|---|---|
| 0 | `SPRINT-OA-00` OA Architecture Sprint | `OA-00` |
| 1 | `SPRINT-OA-01` Consumer Adoption Sprint | `OA-00A`, `OA-00B`, `OA-00C` |
| 2 | `SPRINT-OA-02` ADO Knowledge Core Sprint | `OA-01` |
| 3 | `SPRINT-OA-03` Ontology Builder Sprint | `OA-02` |
| 4 | `SPRINT-OA-04` Company Ontology Dogfood Sprint | `OA-03` |
| 5 | `SPRINT-OA-05` Manufacturing Ontology Sprint | `OA-04` |
| 6 | `SPRINT-OA-06` DSL Generator Sprint | `OA-05` |
| 7 | `SPRINT-OA-07` Engine Integration Sprint | `OA-06` |
| 8 | `SPRINT-OA-08` Cross-domain Pilot Sprint | `OA-07` |
| 9 | `SPRINT-OA-09` Ontology Gate | `OA-GATE` |
| 10 | `SPRINT-00` Architecture Operational | `P0-T01`, `P0-T02`, `P0-T03`, `P0-T04`, `P0-T05`, `P0-T06`, `P0-GATE` |
| 11 | `SPRINT-01` Platform Contracts and Technology Validation | `P1-T01`, `P1-T02`, `P1-T03`, `P1-T04`, `P1-T05`, `P1-T06`, `P1-T07`, `P1-TS01`, `P1-TS02`, `P1-TS03`, `P1-TS04`, `P1-TS05`, `P1-TS06`, `P1-TS07` |
| 12 | `SPRINT-02` Cloud, Security and Workflow Foundation | `P1-T08`, `P1-T09`, `P1-T10`, `P1-T11`, `P1-T12`, `P1-T13`, `P1-T14`, `P1-T15`, `P1-T16`, `P1-T17`, `P1-GATE` |
| 13 | `SPRINT-03` DSL and ADO Execution Foundations | `P2-T01`, `P2-T02`, `P2-T03`, `P2-T04`, `P2-T05`, `P2-T06`, `P2-T07`, `P4-T01`, `P4-T02`, `P4-T03`, `P4-T04` |
| 14 | `SPRINT-04` Parts, Geometry, Judges and PUE Intake | `P2-T08`, `P2-T09`, `P2-T10`, `P2-T11`, `P2-GATE`, `P4-T05`, `P4-T06`, `P4-T07`, `P5-T01`, `P5-T02`, `P5-T03`, `P5-T04`, `P5-T05` |
| 15 | `SPRINT-05` Drawing, 3D, Product UI and Approval Loop | `P3-T01`, `P3-T02`, `P3-T03`, `P3-T04`, `P3-T05`, `P3-T06`, `P3-T07`, `P3-T08`, `P3-T09`, `P3-T10`, `P4-T08`, `P4-T09`, `P4-T10`, `P4-T11`, `P4-T12`, `P4-GATE`, `P5-T06`, `P5-T07`, `P5-T08`, `P5-T09`, `P5-T10` |
| 16 | `SPRINT-06` Visual Manufacturing and Safe PUE Integration | `P3-T11`, `P3-T12`, `P3-T13`, `P3-GATE`, `P5-T11`, `P5-T12`, `P5-GATE` |
| 17 | `SPRINT-07` Pilot Readiness and Baseline Run | `P6-T01`, `P6-T02`, `P6-T03` |
| 18 | `SPRINT-08` Pilot Quality, Resilience and Security | `P6-T04`, `P6-T05`, `P6-T06`, `P6-T07`, `P6-T08` |
| 19 | `SPRINT-09` Operational UAT and Practical Prototype Gate | `P6-T09`, `P6-GATE` |
| 20 | `SPRINT-10` Order Integration and Public Demo Build | `P7-T01`, `P7-T02`, `P7-T03`, `P7-T04`, `P7-T05`, `P7-T06` |
| 21 | `SPRINT-11` Customer Demonstration and Beta Readiness | `P7-T07`, `P7-T08`, `P7-GATE` |

## 9. Execution rule

No task may start from this document alone. Readiness requires all `dependsOn` tasks to be complete, exact consumer adoption where applicable, required deterministic evidence, and the stated human approval. A passing verifier or Judge is evidence, not approval.
