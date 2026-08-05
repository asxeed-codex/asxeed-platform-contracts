# ASXEED Sprint Execution Plan v1.1

**Status:** Proposed with Architecture Freeze v1.2; human merge required
**Predecessor:** [Sprint Execution Plan v1.0](SPRINT_EXECUTION_PLAN_v1.0.md) remains immutable

## 1. Operating rules

- Dependency readiness, not calendar pressure, controls start.
- Every sprint ends with deterministic evidence and its stated human gate.
- OA-00A and later work stays `not-started` until predecessors complete.
- No sprint authorizes merge, production deployment, package publication, Graph Database introduction, runtime work outside its task, or fabricated approval.
- Existing v1.0 sprints continue after the Ontology Gate, shifted later without deleting their tasks.

## 2. Ontology sprint sequence

| Sequence | Sprint | Tasks | Exit gate |
|---:|---|---|---|
| 0 | OA Architecture Sprint | OA-00 | Architecture package verified, Draft PR, human merge |
| 1 | Consumer Adoption Sprint | OA-00A, OA-00B, OA-00C | Both consumers adopted at exact commits; cross-repository verifier passes |
| 2 | ADO Knowledge Core Sprint | OA-01 | Secure versioned minimal Knowledge Core, restore/rollback evidence |
| 3 | Ontology Builder Sprint | OA-02 | Evidence-linked proposal/conflict/question/approval-routing flow |
| 4 | Company Ontology Dogfood Sprint | OA-03 | Synthetic/non-confidential dogfood and operational evidence |
| 5 | Manufacturing Ontology Sprint | OA-04 | Manufacturing Pack semantics, Criticality, validation, approval policy |
| 6 | DSL Generator Sprint | OA-05 | Plan/Product DSL provenance, shadow comparison, dual-read compatibility |
| 7 | Engine Integration Sprint | OA-06 | Agent/Rule Engine integration with deterministic compatibility |
| 8 | Cross-domain Pilot Sprint | OA-07 | Controlled cross-domain pilot, external-reference boundary, rollback |
| 9 | Ontology Gate | OA-GATE | Zero Critical findings and human approval |

## 3. OA Architecture Sprint

OA-00 creates governance and verification only. Exit requires all requested documents, exactly 115 graph tasks, six sequential ADRs, matching manifest hashes, historical preservation, consumer/PR #26 read-only checks, complete local validation, commit/push/Draft PR, and human review.

## 4. Consumer Adoption Sprint

OA-00A and OA-00B may proceed independently after OA-00 merge. OA-00C waits for both. Consumer work is governance/verification scoped; it does not start runtime or data migration. PR #26 remains Draft until human review.

## 5. ADO Knowledge Core Sprint

Deliver the minimum PostgreSQL/Blob-compatible runtime and versioned contracts, with organization/namespace authorization, immutable snapshots, audit, no public endpoint, no Graph Database, tests, restore, and rollback.

## 6. Ontology Builder Sprint

Deliver PUE/candidate/proposal/conflict/question/Judge/approval-routing orchestration. Human Critical approval and domain authority must be demonstrable through negative tests.

## 7. Company Ontology Dogfood Sprint

Use synthetic or approved minimized non-confidential Company knowledge. Measure query/usefulness, change flow, agent-context provenance, revocation, latency, and operating burden.

## 8. Manufacturing Ontology Sprint

Deliver the Manufacturing OS-owned extension and validation pack on synthetic fixtures. Preserve Product Instance, Rule Engine, Parts, Geometry, Drawing, 3D, BOM, and release boundaries.

## 9. DSL Generator Sprint

Deliver pinned generators and all provenance fields. Preserve old DSL readers, compare regenerated artifacts, and fail closed on missing evidence/approval/conflict/compatibility.

## 10. Engine Integration Sprint

Integrate through versioned adapters. Verify typed AST, Decimal/units, dependency/cycle detection, `true / false / unknown`, Fail Closed, schema validation, trace, and no product-name code.

## 11. Cross-domain Pilot Sprint

Demonstrate Evidence-to-Ontology-to-DSL-to-Engine with namespace controls, Manufacturing human approval, Order Engine external references, immutable audit, revocation, traffic rollback, and no confidential data leakage.

## 12. Ontology Gate

OA-GATE requires Architecture, Security, Product, Test, and deterministic policy evidence; zero unresolved Critical findings; restore/rollback rehearsal; exact consumer adoption; and human approval. A Judge pass is not the human decision.

## 13. Preserved v1.0 sprints

All 12 v1.0 sprints and their task memberships remain after sequence 9 as sequences 10 through 21 in Task Graph v1.3. P0-T03 and P0-T04 are explicitly gated by OA-GATE; their dependent tasks remain transitively blocked. No existing task ID is deleted or renamed.

## 14. Sprint evidence

Each sprint records exact commits, changed files, commands, tests, verifiers, ADR compatibility, responsibility impact, contract version/migration, security/confidentiality, risks, rollback, unavailable checks, PR/release state, and human checkpoint. Evidence must contain actual results only.
