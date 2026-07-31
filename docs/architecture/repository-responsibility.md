# Repository responsibility and synchronization policy

**Status:** Adopted for P0-T01A checkpoint review

**Applies to:** `asxeed-codex/asxeed-platform-contracts`, `asxeed-codex/ado`, and `asxeed-codex/asxeed-manufacturing-os`

**Highest authority:** [ASXEED Architecture Freeze v1.1](ASXEED_Architecture_Freeze_v1.1.md)

## 1. Repository ownership

| Repository | Owns | Must not own |
|---|---|---|
| `asxeed-codex/asxeed-platform-contracts` | Canonical governance copies; versioned, domain-neutral shared contracts; reusable CI; shared API, event, artifact, trace, identity, organization, observability, infrastructure-module, and low-level UI primitive contracts | ADO orchestration or approval behavior; Manufacturing product rules, PUE behavior, parts, geometry, drawings, 3D, BOM, or manufacturing approvals; either domain's operational data |
| `asxeed-codex/ado` | Goals, plans, tasks, agents, Codex execution, five-layer Judge coordination, fix loops, human approval, automation, release coordination, and ADO UI | Manufacturing knowledge or artifacts as a source of truth; Manufacturing OS internals; shared-contract canonical definitions |
| `asxeed-codex/asxeed-manufacturing-os` | PUE, evidence, candidates, conflicts, Product DSL, deterministic rules, Product Instances, parts, geometry, drawings, 3D, BOM, manufacturing review, revision, approval, and release packages | ADO execution policy or internals; shared-contract canonical definitions |

The Manufacturing product UI belongs to Manufacturing OS. Platform Contracts may own only reusable design-system and low-level UI primitives, not manufacturing workflows or product semantics.

## 2. Permitted dependency direction

The only permitted code dependency direction is:

```text
ADO ----------------------\
                           > versioned @asxeed/* platform-contract packages
Manufacturing OS ---------/
```

Platform-contract packages must be domain-neutral and must not import ADO or Manufacturing OS internal packages. ADO and Manufacturing OS may communicate through versioned APIs, Temporal messages, CloudEvents-compatible domain events, and versioned artifacts defined by platform contracts. External integration begins with a versioned file adapter, then an API, then domain events as approved by the Architecture Freeze.

No repository may depend on an unversioned branch, mutable URL, or another repository's source tree for a shared contract.

## 3. Prohibited access

The following are prohibited:

- imports from another repository's internal domain packages or application modules;
- ADO SQL, ORM, migration, or database credentials that access a Manufacturing OS domain schema;
- Manufacturing OS SQL, ORM, migration, or database credentials that access an ADO domain schema;
- database joins, views, triggers, or stored procedures that cross the ADO and Manufacturing OS domain boundaries;
- duplicating a shared contract inside a consumer and allowing it to diverge;
- using a shared contract as a route to move domain behavior or a domain source of truth into Platform Contracts.

Cross-domain reads and writes use a versioned contract at an approved API, message, event, or artifact boundary. A transaction outbox is required where the Architecture Freeze requires domain events.

## 4. Shared-contract ownership

`asxeed-platform-contracts` owns the canonical schema, compatibility policy, package version, and reusable verification for shared contracts. ADO and Manufacturing OS own their domain semantics and propose the contract behavior they need; they do not publish independent competing definitions.

Compatible additions follow the contract's semantic-version policy. Breaking changes require an explicit migration plan, compatibility evidence, rollback plan, Architecture Judge result, and human approval. Codex must not publish packages or perform a major-version change.

## 5. ADR and architecture change ownership

The repository stores canonical adopted copies but does not unilaterally redefine architecture. Architecture Freeze or ADR changes are owned by AI CTO Design Review and require human approval from the architecture owner. Domain maintainers may submit evidence and proposals. Codex and individual implementation tasks may not amend, supersede, reinterpret, or silently work around an adopted ADR.

An approved architecture change must create a new version. Existing adopted versions and hashes remain immutable.

## 6. Document hierarchy

Conflicts are resolved in this order:

1. Architecture Freeze v1.1
2. [Architecture Freeze v1.1 Clarification 001](ARCHITECTURE_FREEZE_v1.1_CLARIFICATION_001.md)
3. ADR-001 through ADR-024 as incorporated by the Freeze
4. Technology Stack v1.0
5. Technology Version Matrix v1.0
6. Technology Selection Rationale v1.0
7. Deferred Technology v1.0
8. Master Implementation Plan v1.2
9. ADO Task Graph v1.2 Markdown and JSON
10. Sprint Execution Plan v1.0
11. System Responsibility Boundaries v1.0
12. Development Readiness Report v1.0
13. Phase 0 Architecture Adoption Codex Pack v1.3
14. Repository-specific governance, individual ADO tasks, and implementation

The [governance index](../README.md) links each adopted document. The [adoption manifest](adoption-manifest.json) is a verification record and does not override the documents it identifies.

## 7. Synchronization and version policy

Platform Contracts is the canonical repository for this adopted set. Every adopted document has an exact version, repository-relative path, immutable source path, adoption status, and SHA-256 in the manifest.

ADO and Manufacturing OS must use one of these offline-verifiable methods:

1. commit an approved synchronized copy whose bytes produce the same SHA-256; or
2. commit a stable reference manifest that pins the canonical repository, document version, canonical path, and SHA-256.

An unversioned URL is not an adoption record. Synchronization updates occur only through separately reviewed repository tasks and commits. P0-T01B and P0-T01C perform consumer adoption; P0-T01D verifies cross-repository agreement. This P0-T01A run does not modify either consumer.

The deterministic verifier must pass required-file, JSON, exact-version, SHA-256, and relative-link checks before an adoption change is approved.

## 8. `NEEDS_DESIGN_DECISION` escalation

Stop without changing the disputed architecture or shared contract and return `NEEDS_DESIGN_DECISION` when:

- repository reality materially conflicts with an authority document;
- authority documents conflict or leave a material decision ambiguous;
- a breaking shared-contract or responsibility-boundary change is required;
- an unapproved dependency, framework, service, database, queue, AI provider, or major-version substitution appears necessary; or
- synchronized copies differ materially rather than only being absent or stale.

The escalation must identify the conflicting documents and affected files, describe viable resolutions and risks, and recommend one option for AI CTO Design Review and human approval. Security, architecture, and manufacturing-critical failures remain fail-closed while the decision is pending.
