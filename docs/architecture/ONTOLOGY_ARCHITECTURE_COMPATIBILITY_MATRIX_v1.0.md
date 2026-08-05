# Ontology Architecture Compatibility Matrix v1.0

**Scope:** ADR-001 through ADR-024 against proposed Architecture Freeze v1.2 and ADR-025 through ADR-030
**Status:** OA-00 compatibility analysis; human checkpoint required

## Classification meanings

- **compatible unchanged:** decision and mandatory rules remain unchanged.
- **compatible with clarification:** decision remains; Ontology adds a non-breaking boundary clarification.
- **requires v1.2 interpretation update:** adopted decision remains, but its source/input wording changes under the new Freeze.
- **deferred follow-up required:** compatible direction, with implementation evidence required in a successor task.

## Matrix

| ADR | Classification | v1.2 analysis / required handling |
|---|---|---|
| ADR-001 Product DSL Versioning | requires v1.2 interpretation update | Semantic Versioning, immutable approved versions, extensions, and migration remain. Product DSL changes from primary knowledge truth to immutable snapshot-derived execution artifact; additive provenance and old-version readers are required. |
| ADR-002 Geometry Source of Truth | compatible unchanged | Geometry remains the 2D/3D shape truth. Ontology and DSL do not contain renderer coordinates or replace Geometry Model. |
| ADR-003 Drawing / DXF / Revision | compatible unchanged | Drawing Model, DXF scope, tolerances, immutable revisions, and release blocks remain. Snapshot revocation becomes another upstream invalidation input. |
| ADR-004 3D Engine | compatible unchanged | Geometry remains shape truth; no product-name-specific 3D code. Ontology contains semantics, not meshes or coordinates. |
| ADR-005 PUE / Evidence | compatible with clarification | PUE now targets evidence-linked Ontology candidates before DSL generation. Confidence/Approval separation, Critical Human Approval, conflict, locators, source hash, and model/provider versions remain mandatory. |
| ADR-006 AI Model Router | compatible with clarification | Understanding and Ontology roles use the router and structured outputs. Role separation, no silent Critical fallback, evaluation, Judge, and Human Approval remain. |
| ADR-007 Backend / Temporal | deferred follow-up required | ADO Knowledge Core and Ontology Builder must fit Node/Nest/Fastify/Temporal boundaries. Exact workflow design belongs to OA-01/OA-02 and must not add a second queue. |
| ADR-008 PostgreSQL / Blob / Audit | compatible with clarification | Ontology uses domain-separated PostgreSQL/Blob, immutable snapshots, hashes, and append-only audit. Graph semantics do not authorize a Graph Database or direct cross-schema access. |
| ADR-009 Security / AI Data | compatible with clarification | Organization/namespace authorization, no public endpoint, Evidence references, no Production-to-Development copy, approved Azure endpoints, and no Codex Production access extend existing controls. |
| ADR-010 Judge / Approval / Rollback | compatible with clarification | Ontology Judge is added as evidence; it never becomes human approval. Draft PR, required checks, bounded Fix, staged release, artifacts, rollback, and human authority remain. |
| ADR-011 UI / UX | deferred follow-up required | ADO Ontology Builder UI and Manufacturing approval UI remain separate business surfaces using shared primitives. Detailed UX requires successor design. |
| ADR-012 Deterministic Rule Engine | requires v1.2 interpretation update | Engine input becomes approved snapshot-derived Product DSL. Typed AST, Decimal, units, dependency/cycle handling, three-valued result, Fail Closed, and product-name-branch prohibition remain unchanged. |
| ADR-013 API / Event Integration | compatible with clarification | Ontology Snapshot/API/event contracts use OpenAPI/JSON Schema/CloudEvents/outbox/idempotency. Direct database access remains prohibited. |
| ADR-014 Observability | compatible with clarification | Trace spans evidence, assertion, approval, snapshot, generator, DSL, and engine. Confidential content still cannot be logged; Critical activity remains 100% traced. |
| ADR-015 Testing / Eval | compatible with clarification | Add ontology contract, authorization, snapshot determinism, provenance, migration, and negative authority tests. Golden expectations remain human-controlled. |
| ADR-016 Repositories / CI | compatible with clarification | ADO, Manufacturing OS, and Platform Contracts remain three repositories. No Knowledge OS repository. Contracts remain versioned packages/artifacts; Draft PR and no agent merge/publish/deploy remain. |
| ADR-017 IaC | compatible unchanged | Bicep remains the IaC source. OA-00 adds no cloud resources; later database/storage/identity changes require What-if, policy, and Human Approval. |
| ADR-018 PUE Reanalysis | compatible with clarification | Reanalysis creates versioned proposals and never overwrites approved Ontology Snapshots or DSL. Prompt/model/pipeline/schema versions and immutable run manifests remain. |
| ADR-019 Manufacturing Lifecycle | requires v1.2 interpretation update | Product Knowledge Approval binds to ontology entity/snapshot version and hash; Product DSL approval remains separate where required. Drawing Release and Manufacturing Start remain human-controlled. |
| ADR-020 Capacity | deferred follow-up required | `organizationId` isolation/fairness applies to ontology queries/builders. PostgreSQL limitations must be measured before any graph-store decision. |
| ADR-021 Notification / Escalation | compatible with clarification | Ontology questions and approvals use authenticated approval surfaces. Notification, timeout, Judge, or confidence never auto-approves. |
| ADR-022 DR / Continuity | compatible with clarification | PostgreSQL/Blob backup, restore drills, and human failover apply to ontology history/snapshots. Cloud outage prohibits new approval/snapshot/release. |
| ADR-023 External Integration | compatible with clarification | Order/customer/quantity/price/invoice stay external. ExternalReference and versioned adapters preserve ownership; no operational data enters Ontology or Product DSL. |
| ADR-024 Demo Governance | compatible unchanged | Public demo remains isolated with synthetic fixtures and no production ontology, confidential upload, or production release connection. |

## Compatibility conclusion

No adopted ADR is invalidated. ADR-001, ADR-012, and ADR-019 require explicit v1.2 interpretation updates because Product DSL changes position and knowledge approval binds to Ontology versions/hashes. All other changes are compatible clarifications or gated implementation follow-ups. Existing Product DSL, released packages, evidence, and approvals remain preserved until versioned migration and consumer approval complete.
