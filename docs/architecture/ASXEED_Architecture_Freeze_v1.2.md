# ASXEED Architecture Freeze v1.2

**Architecture Version:** `1.2`
**Task:** `OA-00` — ADO Embedded Ontology Architecture Gate
**Status:** Human direction approved in principle; proposed for formal adoption
**Adoption condition:** Effective for new development only after human checkpoint review and merge
**Predecessor:** [Architecture Freeze v1.1](ASXEED_Architecture_Freeze_v1.1.md), including [Clarification 001](ARCHITECTURE_FREEZE_v1.1_CLARIFICATION_001.md)
**ADR register:** ADR-001 through ADR-030

## 1. Authority and preservation

This document is the proposed next version of ASXEED's highest implementation-design authority. The human CEO has approved the ADO-embedded Ontology direction in principle. This branch, its verifiers, its Judge results, and its Draft PR do not constitute formal adoption. Formal adoption occurs only when a human reviewer approves and merges OA-00.

After that merge, v1.2 supersedes v1.1 for new development. Architecture Freeze v1.1 and Clarification 001 remain immutable historical authorities for work performed under v1.1. All unaffected decisions in ADR-001 through ADR-024, the Technology Baseline v1.0, security controls, approval controls, rollback controls, and release controls remain in force.

The canonical texts for the six new decisions are:

- [ADR-025 — Ontology Core Embedded in ADO](adrs/ADR-025_ONTOLOGY_CORE_EMBEDDED_IN_ADO.md)
- [ADR-026 — ADO as Ontology Builder and Knowledge Orchestrator](adrs/ADR-026_ADO_AS_ONTOLOGY_BUILDER_AND_KNOWLEDGE_ORCHESTRATOR.md)
- [ADR-027 — Domain Ontology Ownership and Approval Boundaries](adrs/ADR-027_DOMAIN_ONTOLOGY_OWNERSHIP_AND_APPROVAL_BOUNDARIES.md)
- [ADR-028 — PUE, Ontology, and DSL Architecture](adrs/ADR-028_PUE_ONTOLOGY_DSL_ARCHITECTURE.md)
- [ADR-029 — DSL as Versioned Execution Artifact](adrs/ADR-029_DSL_AS_VERSIONED_EXECUTION_ARTIFACT.md)
- [ADR-030 — Shared Knowledge Graph Namespace and Access Control](adrs/ADR-030_SHARED_KNOWLEDGE_GRAPH_NAMESPACE_AND_ACCESS_CONTROL.md)

This Freeze summarizes those decisions; the linked ADR files are canonical where detail is required.

## 2. Integrated architecture

```text
Human direction / Documents
        |
        v
PUE / Company PUE / Understanding Agents
        |
        v
ADO Knowledge Core / Ontology
        |
        v
Approved immutable Domain Ontology Snapshot
        |
        v
Versioned DSL Generator
        |
        +--> Plan DSL ------> ADO Agent Engine
        |
        +--> Product DSL ---> Manufacturing OS Rule Engine
                                  |
                                  v
                         Parts / Geometry / Drawing / 3D / BOM
                                  |
                                  v
                      Human Review / Release / Manufacturing
```

ADO is the AI Company OS, Ontology Builder, Knowledge Core, Knowledge Orchestrator, and Agent Execution Platform. No separate Ontology OS or separate Knowledge OS product is authorized.

The architecture has three distinct layers:

1. **PUE / Understanding:** creates evidence-linked candidates and questions.
2. **Ontology / Persistent Knowledge:** stores reusable, versioned knowledge and produces immutable approved snapshots.
3. **DSL / Versioned Execution Artifact:** is generated for deterministic execution from an approved snapshot.

Ontology is above DSL in the knowledge flow. DSL is a versioned execution artifact. A DSL is not the persistent knowledge source of truth.

## 3. Absolute principles

- AI confidence, an Ontology Judge result, or deterministic validation must never be represented as human approval.
- Critical manufacturing knowledge requires genuine human approval under Manufacturing OS policy.
- Unknown, Conflict, revoked knowledge, and unapproved Critical assertions fail closed at release gates.
- ADO and Manufacturing OS must not access each other's domain databases directly.
- Platform Contracts remains domain-neutral and must not store operational ontology knowledge.
- Cross-domain interaction uses versioned APIs, messages, events, artifacts, or Platform Contracts packages.
- No new Graph Database is approved by OA-00. PostgreSQL and Blob remain the approved persistence architecture.
- Graph semantics must be independent of physical persistence.
- product-name-specific evaluator code, drawing code, 3D code, and calculation branches remain prohibited.
- Codex receives no production ontology, production data, production secrets, merge authority, package-publication authority, or production-deployment authority.
- Customer, order, quantity, price, invoice, inventory, and project operational sources of truth remain outside Ontology and Product DSL.

## 4. Source-of-truth matrix

| Information | Source of truth | Owner |
|---|---|---|
| Reusable approved knowledge | Approved versioned Ontology Snapshot | Owning domain through ADO Knowledge Core |
| Company Ontology runtime | ADO Knowledge Core | ADO |
| Development and Agent Ontology runtime | ADO Knowledge Core | ADO |
| Manufacturing Ontology Pack | Versioned manufacturing extension and validation package | Manufacturing OS |
| Critical manufacturing-knowledge approval | Human approval bound to version and content hash | Humans / Manufacturing OS approval surface |
| Product DSL | Immutable generated execution artifact | Manufacturing OS |
| Plan DSL | Immutable generated execution artifact | ADO |
| Source evidence | Evidence Artifact or ExternalReference | Source-owning domain |
| Manufacturing calculation | Immutable Rule Result | Manufacturing OS Rule Engine |
| Product Instance | Product Instance | Manufacturing OS |
| Parts / geometry / drawing / 3D / BOM | Existing designated models | Manufacturing OS |
| Released manufacturing package | Immutable Released Manufacturing Package | Manufacturing OS |
| Goal / Plan / Task / Agent / Judge / Fix | ADO domain state | ADO |
| Customer / order / quantity | Order Engine | asxeed-order-engine |
| Price / invoice | Order / Invoice Engine | asxeed-order-engine |
| File binary | Azure Blob Storage | Shared Platform infrastructure |
| Workflow history and audit | Temporal history plus append-only Audit Event | Shared Platform infrastructure / owning domain |

The v1.1 statement that Approved Product DSL is the manufacturing-knowledge source of truth is replaced for new v1.2 development by the approved versioned Ontology Snapshot. Existing approved Product DSL versions remain immutable, readable, and valid under their historical contracts until an approved migration supersedes them.

## 5. Ownership

### 5.1 ADO

ADO owns the shared Knowledge Core runtime, Ontology Builder orchestration, entity and relationship management, assertions, evidence and provenance linking, conflicts, namespaces, versioning, immutable snapshots, query and traversal, change proposals, Ontology Judge coordination, human-question generation, approval routing, Company / Development / Agent Ontologies, Plan DSL generation, knowledge-to-task reasoning, agent context generation, and existing Goal / Plan / Task / Agent / Judge / Fix / Codex orchestration.

ADO may create Manufacturing Ontology candidates. It must not approve Critical manufacturing knowledge, perform deterministic manufacturing calculations, release manufacturing artifacts, or own customer/order/price/invoice truth.

### 5.2 Platform Contracts

Platform Contracts owns canonical architecture governance and domain-neutral versioned contracts for Entity, Relationship, Assertion, Evidence, Conflict, Rule representation, Namespace, Snapshot, Version, Approval envelope, ExternalReference, DSL provenance, Ontology APIs, events, compatibility, and migration.

Platform Contracts must not execute ontology queries, store company or manufacturing knowledge, own consumer runtime behavior, or become a shared operational database.

### 5.3 Manufacturing OS

Manufacturing OS owns the Manufacturing Ontology Pack, manufacturing extensions, semantic validation, Criticality classification, approval requirements, Product DSL Generator, Product Instance, deterministic Rule Engine, Parts, Geometry, Drawing, 3D, BOM, manufacturing release, manufacturing-start approval, and released manufacturing packages.

Manufacturing OS receives approved or reviewable Manufacturing Ontology Snapshots through versioned contracts. It does not own the ADO Knowledge Core runtime.

### 5.4 Order Engine and shared infrastructure

The Order Engine retains customer, order, quantity, price, invoice, and related operational authority. Shared Platform infrastructure owns identity primitives, secure connectivity, PostgreSQL/Blob operation, Temporal runtime, audit transport, observability, notification transport, IaC, and deployment primitives without acquiring domain knowledge or approval authority.

## 6. Ontology Core

The domain-neutral conceptual vocabulary includes Entity, Relationship, Assertion, Evidence, Conflict, Rule, Namespace, Version, Snapshot, Approval, ExternalReference, Provenance, ValidityPeriod, Criticality, and OrganizationScope.

An Assertion must support subject, predicate, object or value, evidence references, source type, confidence, status, conflict state, approval state, validity period, version, organization scope, namespace, creator, timestamps, and content hash. Contract details are versioned in Platform Contracts; runtime data belongs to ADO or the owning consumer domain.

Approved snapshots are immutable, content-addressed, organization-scoped, namespace-authorized, and reproducible from versioned assertion history. Revocation and supersession create new state and audit events; they do not erase approved history.

## 7. Namespace and authority model

Required namespace families are `shared.*`, `document.*`, `company.*`, `development.*`, `agent.*`, `manufacturing.*`, and `external-reference.*`.

Every protected operation is evaluated using `organizationId`, namespace, domain owner, read authority, proposal authority, approval authority, and write authority. One shared Knowledge Core does not imply unrestricted cross-domain writes. ADO may propose manufacturing knowledge; Manufacturing OS policy and humans retain manufacturing approval authority. Cross-namespace references use approved versioned contracts and never direct database joins.

## 8. Product DSL and provenance

Product DSL is an immutable, versioned execution artifact derived from an approved Ontology Snapshot. It must carry:

- `ontologySnapshotId`
- `ontologyVersion`
- `ontologyContentHash`
- `generatorVersion`
- `evidenceReferences`
- `ruleReferences`
- `generatedAt`
- `approvalState`
- `contentHash`

Product DSL continues to exclude customer source-of-truth data, order quantity, price, invoice state, inventory state, drawing commands, DXF/SVG/CAD commands, 3D coordinates, and renderer-specific details.

## 9. Rule architecture

Rule content belongs in Ontology: dimensional conditions, material conditions, fire-rating conditions, component selection, product constraints, option conditions, process conditions, and company-specific manufacturing rules are versioned knowledge. Rule Engine evaluator behavior remains code: typed operators, Decimal behavior, units, dependency evaluation, cycle detection, `true / false / unknown`, deterministic execution, schema validation, trace generation, and Fail Closed behavior.

“Rules are not code” means product or company rule content is not embedded as product-name branches. It does not remove the deterministic evaluator.

## 10. Persistence and technology

Initial Ontology implementation must use the approved Azure Database for PostgreSQL Flexible Server and Azure Blob Storage architecture, with domain-separated schemas, immutable snapshots, SHA-256 content hashes, and append-only audit events. No Graph Database is adopted. PostgreSQL and Blob remain the approved persistence boundary, and graph semantics must be independent of physical persistence. A dedicated graph store remains deferred until measured workload evidence demonstrates PostgreSQL limitations and a new ADR covers tenancy, security, compatibility, migration, and rollback.

All other Technology Baseline v1.0 selections and Clarification 001's Japan East / Japan West decision remain unchanged.

## 11. Security, confidentiality, and isolation

- Enforce organization isolation and namespace authorization with least privilege.
- Expose no public Ontology endpoint.
- Store no secrets in assertions, prompts, fixtures, logs, artifacts, or contracts.
- Prefer Evidence references over unnecessary source duplication.
- Use approved Azure AI endpoints only for confidential source processing.
- Record immutable audit events for Critical changes.
- Do not copy Production Ontology data into Development.
- Give Codex no Production Ontology or secret access.
- Require Human Approval for Critical knowledge.
- Support revocation and supersession without deleting approved history.
- Fail closed when identity, authority, provenance, approval, or compatibility evidence is absent.

## 12. Compatibility and migration

ADR-001 through ADR-024 remain adopted. Their v1.2 interpretation is documented in the [compatibility matrix](ONTOLOGY_ARCHITECTURE_COMPATIBILITY_MATRIX_v1.0.md). The change from Product DSL as primary manufacturing knowledge asset to generated execution artifact is a controlled architecture migration, not an in-place rewrite.

Migration follows [Ontology Migration Strategy v1.0](ONTOLOGY_MIGRATION_STRATEGY_v1.0.md). Existing Product DSL data and releases remain readable; adapters and dual-read gates are introduced before any authority switch. Every breaking contract requires explicit version impact, compatibility evidence, migration, rollback, Architecture Judge evidence when available, and human approval.

## 13. Approval, Judge, release, and rollback

ADR-010, ADR-019, and ADR-021 remain fully effective. AI may extract, propose, validate, detect conflicts, ask questions, recommend, and prepare Draft PRs or release candidates. Humans exclusively own Architecture/ADR adoption, Critical manufacturing-knowledge approval, required Product DSL approval, manufacturing release, production release, merge, and authority-boundary exceptions.

Rollback uses version supersession, version deactivation, compatibility adapters, traffic rollback, and corrected versions. It must never delete approved historical knowledge. The canonical procedure is [Ontology Rollback Strategy v1.0](ONTOLOGY_ROLLBACK_STRATEGY_v1.0.md).

## 14. Controlled implementation order

```text
OA-00 -> OA-00A / OA-00B -> OA-00C -> OA-01 -> OA-02
      -> OA-03 / OA-04 -> OA-05 -> OA-06 -> OA-07 -> OA-GATE
```

OA-00 contains architecture documents and deterministic verification only. It does not authorize Ontology runtime, schema, generator, Rule Engine, consumer, cloud, data-migration, deployment, or package-publication implementation. OA-00A and every successor remain blocked until their dependencies and human gates are satisfied.

## 15. Adoption gate

OA-00 can be formally adopted only after:

1. deterministic OA-00 verification passes;
2. all 103 predecessor task IDs and exactly 12 OA tasks are validated;
3. historical v1.1 authorities and evidence are unchanged;
4. consumer commits and PR #26 state are verified read-only;
5. compatibility, migration, rollback, security, and ownership evidence is reviewed; and
6. a human reviewer approves and merges the Draft PR.

Until item 6 occurs, status remains `checkpoint-review-required`; it must not be described as merged, fully adopted, released, or approved by AI. Only human checkpoint review and merge can make Architecture Freeze v1.2 effective.
