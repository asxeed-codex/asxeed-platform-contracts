# ADO Ontology Architecture Decision Report v1.0

**Task:** OA-00
**Decision status:** Human direction approved in principle; formal adoption awaits human checkpoint review and merge

## 1. Question

Where should ASXEED's reusable company, development, agent, and manufacturing knowledge capability live, and how should it relate to PUE, DSL, deterministic engines, domain authority, and Platform Contracts?

## 2. Previous alternatives

### Separate Knowledge OS / Ontology OS

Rejected. A separate product would duplicate ADO's orchestration, approval routing, agent context, audit, and workflow responsibilities; introduce a fourth repository/product boundary; and create new ownership, deployment, tenancy, and operational coordination costs before workload evidence exists.

### Manufacturing OS as the knowledge platform

Rejected. Manufacturing OS is the manufacturing domain execution product and should not own Company, Development, or Agent knowledge or ADO runtime behavior.

### Product DSL as the long-term knowledge source

Rejected as the forward architecture. Product DSL remains necessary, but it is an execution projection tied to a deterministic consumer. Reusable knowledge needs evidence, conflict, namespace, version, and multi-artifact provenance independent of one DSL.

### Independent domain knowledge services

Deferred/rejected for the initial architecture. Separate runtimes duplicate common lifecycle and access-control behavior. Domain semantic packs and policies remain separate without duplicating the shared runtime.

## 3. Selected direction

Embed Ontology as a core capability of ADO. ADO becomes:

```text
AI Company OS
+ Ontology Builder
+ Knowledge Core
+ Knowledge Orchestrator
+ Agent Execution Platform
```

Platform Contracts owns neutral Ontology contracts and canonical governance. Manufacturing OS owns the Manufacturing Ontology Pack, manufacturing validation and approvals, Product DSL Generator, deterministic execution, and manufacturing release. No separate Knowledge OS is created.

## 4. Why this matches ADO's mission

ADO's mission is the human-controlled AI company execution loop. Persistent knowledge is the bridge between understanding and repeatable planning/execution. The same system that converts direction into Goal/Plan/Task and assembles agent context should coordinate evidence-linked knowledge proposals, conflict resolution, snapshot generation, and Plan DSL without acquiring protected domain approval authority.

## 5. Benefits

- One coherent evidence-to-knowledge-to-task trace.
- Reusable knowledge independent of an execution DSL.
- Company, Development, Agent, and Manufacturing namespaces on a common controlled lifecycle.
- Existing ADO Judge, Fix, approval-routing, audit, and human-question capabilities can be extended rather than duplicated.
- Manufacturing authority and deterministic execution remain isolated.
- Platform Contracts remains a neutral contract/governance repository.
- PostgreSQL/Blob compatibility avoids premature technology expansion.

## 6. Risks and controls

| Risk | Control |
|---|---|
| ADO becomes over-centralized | Separate runtime ownership from domain semantic/approval authority |
| Tenant or namespace leakage | organizationId, namespace policy, least privilege, environment isolation |
| AI confidence becomes approval | Independent fields, human-bound approval evidence, fail-closed gates |
| Ontology becomes operational data warehouse | ExternalReference and explicit source-of-truth boundaries |
| Manufacturing authority drifts to ADO | Manufacturing OS validation/approval surfaces and human Critical approval |
| Graph technology is introduced prematurely | PostgreSQL/Blob baseline; graph store deferred to evidence and new ADR |
| Existing Product DSL breaks | Additive provenance, dual-read, versioned adapters, no destructive migration |
| Knowledge rollback deletes history | Supersession/deactivation and immutable audit/snapshots |

## 7. Constraints

- OA-00 is architecture/governance only.
- No runtime, schema, cloud, dependency, generator, evaluator, or consumer change starts here.
- No public Ontology API.
- No secrets, production data, or confidential manufacturing content in contracts or fixtures.
- No direct cross-domain database access.
- Human decisions remain genuine, attributable, and hash-bound.

## 8. Human decision

The human CEO selected the ADO-embedded direction and rejected a separate Knowledge OS in principle. Formal Architecture adoption remains pending. Only human checkpoint review and merge can activate Architecture Freeze v1.2 and ADR-025 through ADR-030.

## 9. Open implementation questions

These do not block the architecture but require successor-task evidence:

- canonical JSON Schema shapes and semantic-version boundaries;
- PostgreSQL table/index/partition design and query benchmarks;
- snapshot canonicalization and maximum size;
- namespace policy language and cache behavior;
- ontology query API pagination and authorization traces;
- equivalence thresholds for old/new DSL generation;
- Criticality taxonomy per domain;
- retention values and legal requirements;
- operational SLOs and capacity thresholds;
- conditions that would justify a dedicated graph database ADR.

Successor agents must not silently decide these when material; they stop for design review where existing ADRs do not decide them.

## 10. Adoption condition

OA-00 verifier/test evidence, historical preservation, consumer-state verification, compatibility/migration/rollback evidence, Draft PR review, and human merge are all required. A passing verifier is evidence, not adoption.

## 11. Impact on Manufacturing OS PR #26

PR #26 remains open, Draft, and unchanged during OA-00. Its governance is based on v1.1 and treats Product DSL as the primary manufacturing knowledge asset. OA-00 does not modify or invalidate the PR. OA-00B will later transition that branch or successor work to v1.2: Product DSL becomes a snapshot-derived execution artifact; Manufacturing Ontology Pack ownership and provenance fields are added; existing PUE, Evidence, Confidence, Conflict, approval, confidentiality, CLI/runtime, and tests are preserved and revalidated before human review.
