# ASXEED Master Implementation Plan v1.3

**Status:** Proposed with Architecture Freeze v1.2; formal adoption requires OA-00 human checkpoint review and merge
**Predecessor:** [Master Implementation Plan v1.2](MASTER_IMPLEMENTATION_PLAN_v1.2.md) remains immutable
**Task graph:** [ADO Task Graph v1.3](ADO_TASK_GRAPH_v1.3.md) / [JSON](ADO_TASK_GRAPH_v1.3.json)

## 1. Plan change

Version 1.3 preserves all 103 existing task IDs and every unaffected implementation track from v1.2. It inserts the controlled Ontology architecture, consumer adoption, runtime foundation, domain pilots, DSL generation, engine integration, and final gate before the previous large implementation resumes.

The v1.2 plan is historical and is not edited. Where v1.3 changes source-of-truth or ordering, Architecture Freeze v1.2 and the v1.3 task graph control after formal adoption.

## 2. Target architecture

```text
Documents / Human Input
-> PUE / Understanding Agents
-> ADO Knowledge Core / Ontology
-> approved immutable Domain Ontology Snapshot
-> versioned DSL Generator
-> Plan DSL / Product DSL
-> Agent Engine / deterministic Rule Engine
-> Review / Release / Manufacturing
```

Persistent knowledge lives in Ontology. DSL is a versioned execution artifact. Rule content lives in Ontology; deterministic evaluator behavior remains code.

## 3. Program boundaries

| Program/system | Plan responsibility |
|---|---|
| Platform Contracts | Architecture governance, neutral Ontology/DSL provenance contracts, compatibility verification |
| ADO | Knowledge Core, Ontology Builder, Company/Development/Agent Ontologies, Plan DSL, agent execution/orchestration |
| Manufacturing OS | Manufacturing Ontology Pack, validation/approval, Product DSL, deterministic execution, manufacturing artifacts/release |
| Order Engine | Customer/order/quantity/price/invoice operational truth |
| Shared Platform | Identity, PostgreSQL/Blob, Temporal, audit, observability, IaC without domain logic |
| Humans | Architecture, Critical knowledge, protected DSL, manufacturing/release/merge decisions |

## 4. Current execution state

- P0-T01A and P0-T01D: completed and merged.
- P0-T02A: completed and merged in Platform Contracts.
- P0-T02B: completed and merged in ADO.
- P0-T02C: implemented on Draft PR #26; `checkpoint-review-required`.
- P0-T02D: blocked by Ontology Architecture migration.
- P0-T03 and previous large implementation: not-started / blocked.
- OA-00: current critical Architecture Gate; pending human checkpoint and merge.
- OA-00A and every successor: not-started / blocked by dependencies.

## 5. Ontology implementation sequence

### OA-00 — Architecture package

Create v1.2, ADR-025–030, boundaries, conceptual model, decision/compatibility/migration/rollback reports, v1.3 plans, governance, verifier, tests, manifest, evidence, commit, push, and Draft PR. No runtime work.

### OA-00A / OA-00B — Consumer adoption

ADO adopts Knowledge Core/Builder ownership. Manufacturing OS transitions PR #26 governance to Manufacturing Ontology Pack and generated Product DSL boundaries. Both remain governance-only and human-gated.

### OA-00C — Cross-repository verification

Pin exact merge commits, versions, hashes, boundary clauses, successor states, and consumer verifiers. Phase/runtime work remains blocked on failure.

### OA-01 — ADO Knowledge Core

Implement the minimum domain-neutral runtime using approved PostgreSQL/Blob, organization/namespace isolation, versions, evidence/provenance, conflicts, approvals, immutable snapshots, audit, query contracts, restore, and rollback.

### OA-02 — ADO Ontology Builder

Implement candidate/proposal workflows, mapping, conflict/question flow, Ontology Judge coordination, human approval routing, snapshot requests, and trace. It must not self-approve protected knowledge.

### OA-03 — Company Ontology dogfooding

Use synthetic or approved non-confidential Company knowledge to validate authoring, query, version, approval, snapshot, revocation, agent-context, and operational usability.

### OA-04 — Manufacturing Ontology Pack

Implement Manufacturing OS-owned extensions, semantic validation, Criticality, approval policy, and synthetic fixtures. Do not cut over Product DSL generation yet.

### OA-05 — Ontology-to-DSL Generators

Implement pinned Plan DSL and Product DSL generators with required snapshot/evidence/rule/generator/approval/content provenance. Shadow and compare with preserved existing flows.

### OA-06 — Engine integration

Connect Plan DSL to Agent Engine and Product DSL to existing Rule Engine through versioned adapters. Preserve typed operators, Decimal/units, dependency/cycle logic, three-valued result, Fail Closed, trace, and existing manufacturing models.

### OA-07 — Cross-domain pilot

Run a controlled synthetic/non-confidential evidence-to-snapshot-to-DSL-to-engine flow across Company and Manufacturing namespaces, including Order Engine external references, revocation, rollback, and human gates.

### OA-GATE — Ontology completion gate

Require zero unresolved Critical architecture/security/compatibility issues, deterministic end-to-end evidence, restore and rollback rehearsal, consumer adoption, and human approval.

## 6. Minimum Ontology Pilot completion

The Minimum Ontology Pilot is complete only when:

1. organization and namespace isolation pass negative tests;
2. Entity, Relationship, Assertion, Evidence, Conflict, Rule, Namespace, Version, Snapshot, Approval, ExternalReference, Provenance, ValidityPeriod, Criticality, and OrganizationScope contracts are versioned;
3. evidence-linked candidates can be reviewed without fabricating approval;
4. approved immutable snapshots are reproducible and content-hashed;
5. revocation/supersession stops affected downstream use;
6. Company dogfood uses no secrets or production-confidential data;
7. Manufacturing Ontology Pack validation and human Critical approval work on synthetic fixtures;
8. Product DSL includes all required provenance fields and preserves exclusions;
9. existing Rule Engine behavior and traces remain deterministic;
10. legacy Product DSL remains readable and rollback is rehearsed; and
11. all gates have actual evidence and required human decisions.

## 7. Existing tracks preserved

| v1.2 track | v1.3 treatment |
|---|---|
| Architecture adoption / P0 | Continues after OA-GATE; P0-T03 onward remains blocked until then |
| Platform contracts / cloud foundation | Preserved; Ontology contracts and PostgreSQL evidence precede runtime expansion |
| Reference DSL / Rule / Parts / Geometry | Preserved; Product DSL source changes through versioned generator/adapter, deterministic engine unchanged |
| Drawing / 3D / Manufacturing UI | Preserved under Manufacturing OS; no authority moves to ADO |
| ADO Execution / Judge Loop | Preserved and extended by Knowledge Core/Builder; human/merge/release rules unchanged |
| PUE Safety / AI Integration | Preserved; PUE targets Ontology candidates before DSL generation |
| End-to-End Pilot | Preserved after OA pilot; requires new provenance and snapshot gates |
| Order Integration / Public Demo | Preserved; external authority and production/demo isolation unchanged |

All original task IDs, outputs, acceptance criteria, tests, and artifacts remain in [Task Graph v1.3 JSON](ADO_TASK_GRAPH_v1.3.json), except narrowly updated dependencies/readiness required to block unsafe execution before OA-GATE.

## 8. Consumer-adoption gates

- No v1.2 runtime contract is consumed before OA-00A/OA-00B merge and OA-00C pass.
- Consumers pin exact contract versions/hashes.
- Breaking contracts include dual-read/adapters, migration, rollback, consumer tests, Judge evidence when available, and human approval.
- Direct database access and internal source imports fail Architecture verification.

## 9. Security gates

- organization isolation and namespace authorization;
- no public Ontology endpoint;
- no secrets or unnecessary confidential duplication;
- approved Azure AI endpoints only;
- no Production Ontology in Development or Codex;
- immutable audit for Critical changes;
- Human Approval for Critical knowledge;
- revocation/supersession and downstream stop;
- restore/DR and access-control revalidation;
- external operational authority preserved.

## 10. Human gates

Human approval is mandatory for Architecture/ADR adoption, breaking contract changes, Critical manufacturing knowledge, required Product DSL approval, manufacturing release/start, production release, merge, region/database recovery, and authority exceptions. AI outputs remain recommendations or evidence.

## 11. Final cross-domain demonstration

The final demonstration uses synthetic or explicitly approved minimized data and shows:

```text
Evidence -> candidate -> conflict/question -> human-approved assertion
-> immutable snapshot -> Plan DSL and Product DSL with provenance
-> Agent Engine and deterministic Rule Engine
-> trace, revocation, rollback, and protected human release gate
```

It also proves that Order Engine truth is referenced rather than copied, Manufacturing OS retains manufacturing authority, Platform Contracts stores no operational knowledge, and no cross-domain database access occurs.

## 12. Change and rollback

Plan changes follow Architecture Change Procedure and semantic versioning. A blocked or failed OA task does not authorize an alternate framework, graph store, approval shortcut, consumer edit, or later task. Rollback follows [Ontology Rollback Strategy v1.0](../architecture/ONTOLOGY_ROLLBACK_STRATEGY_v1.0.md) and preserves immutable history.
