# ASXEED System Responsibility Boundaries v1.1

**Status:** Proposed with Architecture Freeze v1.2; effective only after OA-00 human checkpoint review and merge
**Predecessor:** [System Responsibility Boundaries v1.0](SYSTEM_RESPONSIBILITY_BOUNDARIES_v1.0.md) remains immutable
**Authorities:** Architecture Freeze v1.2; ADR-001 through ADR-030

## 1. Boundary principles

ASXEED separates runtime ownership, domain semantic ownership, contract ownership, physical infrastructure, and human authority. One shared ADO Knowledge Core does not create a shared operational database or unrestricted cross-domain writes.

- Platform Contracts defines canonical domain-neutral governance and contracts.
- ADO owns company-wide knowledge runtime and development/agent orchestration.
- Manufacturing OS owns manufacturing semantics, deterministic execution, approval surfaces, and release.
- Order Engine owns customer, order, quantity, price, and invoice truth.
- Shared Platform infrastructure supplies neutral execution primitives.
- Humans retain protected architecture, Critical knowledge, manufacturing, release, and merge decisions.

## 2. Platform Contracts

**Owns:** Architecture Freeze and ADR representations; Technology Baseline records; Entity, Relationship, Assertion, Evidence, Conflict, Rule representation, Namespace, Version, Snapshot, Approval-envelope, ExternalReference, DSL provenance, API/event, compatibility, and migration contracts; deterministic cross-repository verification; canonical responsibility boundaries and hashes.

**Does not own:** operational ontology records; company or manufacturing knowledge; ADO query, traversal, proposal, Judge, approval-routing, Plan DSL, agent context, or task runtime; Manufacturing Ontology Pack; Product DSL content; Rule Engine; Product Instance; Parts, Geometry, Drawing, 3D, BOM, or releases; Order data; cloud deployment or application databases.

Platform Contracts must remain domain-neutral and cannot import consumer internals or depend on consumer source trees.

## 3. ADO

**Owns:** AI Company OS; Knowledge Core runtime; Company, Development, and Agent Ontology runtime; Goal, Plan, Task, Agent, Judge, Fix, and Codex orchestration; Plan DSL generation; knowledge-to-task reasoning; agent context generation; audit/trace coordination; approval routing and human-question coordination.

**Does not own:** final Critical manufacturing-knowledge approval; manufacturing semantic authority; deterministic manufacturing calculation; Product DSL Generator; Product Instance; Parts/Geometry/Drawing/3D/BOM; released manufacturing packages; manufacturing release; customer/order/quantity/price/invoice truth.

ADO may create manufacturing candidates and route review requests. It cannot represent Confidence or Ontology Judge output as Approval.

## 4. ADO Knowledge Core

**Owns runtime capabilities:** Entity and Relationship management; Assertion lifecycle; Evidence and Provenance links; Conflict representation; namespace registry; version history; immutable snapshot generation; query/traversal; revocation and supersession; versioned events and APIs.

**Boundary:** Runtime behavior and operational state remain in ADO. Domain policy and protected approval remain with the domain owner and humans. PostgreSQL schemas are access-controlled; co-location does not authorize cross-schema access.

## 5. ADO Ontology Builder

**Owns orchestration:** PUE/Understanding candidate intake; mapping; conflict detection; change proposals; Ontology Judge coordination; question generation; human review routing; approved-state reflection; snapshot requests; provenance and audit coordination.

**Does not own:** independent approval of protected domain knowledge, silent conflict resolution, direct mutation of immutable snapshots, or manufacturing release.

## 6. Manufacturing OS

**Owns:** Manufacturing Ontology Pack; manufacturing Entity/Relationship extensions; manufacturing semantic validation and Criticality; manufacturing approval requirements and UI; Product DSL Generator; Product Instance; deterministic Rule Engine and Rule Result; Parts, Geometry, Drawing, 3D, BOM; manufacturing release, manufacturing-start approval, and released manufacturing packages.

**Does not own:** ADO Knowledge Core runtime; ADO Goal/Plan/Task/Agent/Judge/Fix state; Codex execution; Platform Contracts; customer/order/price/invoice sources of truth.

Manufacturing OS receives approved or reviewable Manufacturing Ontology Snapshots through versioned contracts. It validates manufacturing semantics and binds approvals to entity/version/content/artifact hashes.

## 7. Manufacturing Ontology Pack

The Manufacturing Ontology Pack is a versioned Manufacturing OS-owned extension containing manufacturing concept definitions, relationship extensions, rule content, semantic validation, Criticality classification, approval policy, and generator mapping requirements.

It must not contain ADO runtime code, Order Engine operational data, credentials, real confidential fixtures, evaluator implementation code, or renderer commands. Distribution is through approved versioned packages or artifacts.

## 8. Order Engine

**Owns:** Customer, Order, Quantity, Price, Invoice, and their operational lifecycle.

Ontology and DSL may contain versioned external references required for traceability, but must not become the authoritative copy of Order Engine state. Manufacturing OS integrates via versioned file, API, or event adapters; direct database access remains prohibited.

## 9. Shared Platform infrastructure

**Owns:** Entra identity primitives; Managed Identity and Key Vault plumbing; PostgreSQL/Blob operation; Temporal runtime; transaction outbox and audit transport; OpenTelemetry; notification transport; Bicep/Container Apps/Front Door/WAF; reusable CI; registries; backup/restore/DR; low-level UI primitives.

**Does not own:** domain knowledge, Ontology approval, query semantics, manufacturing rules, ADO task policy, Product DSL content, or Order decisions.

## 10. Human and AI authority

| Action | AI authority | Human authority |
|---|---|---|
| Extract evidence and propose concepts | May perform | May direct/review |
| Generate candidates, conflicts, questions | May perform | May resolve/review |
| Deterministic contract validation | May perform | Reviews evidence |
| Ontology Judge recommendation | May recommend | Decides where protected |
| Critical manufacturing knowledge | Must not finally approve | Exclusive approval |
| Required Product DSL approval | Must not finally approve | Exclusive approval |
| Manufacturing release/start | Must not approve | Exclusive approval |
| Architecture Freeze / ADR adoption | May draft/recommend | Exclusive adoption |
| Merge / production release | Must not perform | Exclusive decision |
| Authority-boundary exception | Must stop and escalate | Exclusive decision |

AI must not fabricate, simulate, infer, or pre-populate a human decision.

## 11. Namespace write and approval boundaries

| Namespace | Runtime owner | Semantic/domain owner | Proposal authority | Protected approval authority |
|---|---|---|---|---|
| `shared.*` | ADO Knowledge Core | Platform contract-defined / designated steward | Authorized domains | Human-designated shared steward |
| `document.*` | ADO Knowledge Core | Source-owning domain | PUE / authorized users | Source/domain policy |
| `company.*` | ADO Knowledge Core | ADO / organization | Authorized ADO workflows | Organization policy / human when Critical |
| `development.*` | ADO Knowledge Core | ADO | ADO agents/users | ADO development policy / human checkpoint |
| `agent.*` | ADO Knowledge Core | ADO | Authorized ADO workflows | ADO policy / human when protected |
| `manufacturing.*` | ADO Knowledge Core | Manufacturing OS | ADO PUE, Manufacturing OS, humans | Manufacturing OS policy and humans |
| `external-reference.*` | ADO Knowledge Core | Referenced source owner | Authorized adapters | Referenced source/domain policy |

Read, proposal, approval, and write authorities are separate. All operations require verified `organizationId` and namespace scope.

## 12. Versioned integration boundaries

```text
ADO Knowledge Core <-> Manufacturing OS
Versioned Ontology API / message / CloudEvent / immutable Snapshot artifact

ADO / Manufacturing OS <-> Platform Contracts
Versioned package or immutable versioned artifact

Manufacturing OS <-> Order Engine
Versioned file adapter -> versioned API -> versioned domain event
```

State-changing APIs require idempotency. Events use an outbox. Artifacts carry version and SHA-256. Cross-repository imports use published versioned contracts, never internal application packages.

## 13. Prohibitions

- Direct SQL, ORM, view, trigger, stored-procedure, or credential access across domain databases.
- Consumer imports from another consumer's source tree or internal packages.
- Mutable branch, `latest`, or unversioned URL as shared authority.
- Platform Contracts operational data or application behavior.
- ADO authority escalation into manufacturing approval or release.
- Manufacturing OS authority escalation into ADO runtime or architecture adoption.
- Ontology duplication of customer/order/price/invoice truth.
- Public ontology endpoints, secrets in assertions, or Production-to-Development ontology copies.
- Approval inferred from confidence, timeouts, Judge results, or generator success.

## 14. Change and exception procedure

Boundary changes require an Architecture decision, compatibility impact, migration, rollback, security assessment, Judge evidence when available, and human approval. Agents stop with `NEEDS_DESIGN_DECISION` rather than silently crossing a boundary.
