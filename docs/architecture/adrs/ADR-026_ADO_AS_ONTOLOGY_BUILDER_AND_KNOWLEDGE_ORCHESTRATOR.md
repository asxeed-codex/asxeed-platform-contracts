# ADR-026 — ADO as Ontology Builder and Knowledge Orchestrator

**Status:** Proposed; human direction approved in principle; formal adoption requires OA-00 human checkpoint review and merge

## Context

ADO already owns Goal, Plan, Task, Agent, Judge, Fix, approval routing, Codex coordination, and audit orchestration. Turning understood evidence into reusable knowledge and then into agent context and Plan DSL is part of the same AI Company OS control loop.

## Decision

ADO is the Ontology Builder, Knowledge Orchestrator, and Agent Execution Platform. It coordinates candidate creation, evidence/provenance links, conflict management, change proposals, Ontology Judge execution, human questions, approval routing, snapshot generation, knowledge-to-task reasoning, agent context generation, and Plan DSL generation.

## Mandatory rules

- PUE and Understanding Agents produce evidence-linked candidates, not silent approved truth.
- ADO separates confidence, deterministic validation, Judge recommendation, and human approval.
- ADO may propose `manufacturing.*` knowledge but must route approval under manufacturing policy.
- ADO emits versioned snapshots and provenance-bearing artifacts through approved contracts.
- Goal/Plan/Task/Agent/Judge/Fix orchestration remains ADO-owned.

## Ownership

ADO owns orchestration and runtime state. Domain owners own domain semantic policy and protected approval. Platform Contracts owns shared contract shapes only.

## Prohibited interpretations

- ADO does not independently approve Critical manufacturing knowledge.
- ADO does not own manufacturing calculations, drawings, geometry, 3D, BOM, release, or manufacturing-start decisions.
- An Ontology Judge result is evidence, not human approval.

## Security impact

Agent contexts must be organization- and namespace-scoped, minimally disclosed, auditable, and free of secrets. Codex must not access Production Ontology or production credentials.

## Compatibility impact

ADR-006 role separation, ADR-010 Judge/Fix/approval, ADR-013 integration, ADR-014 trace, ADR-018 prompt/model governance, and ADR-021 escalation are preserved and extended to Ontology workflows.

## Migration impact

ADO first adopts governance and contracts in OA-00A, then implements Knowledge Core in OA-01 and Ontology Builder in OA-02. Existing development orchestration continues through compatible boundaries.

## Rollback impact

Disable new workflow routes and return to the last ADO revision while retaining proposal, evidence, and audit history. Do not convert rolled-back proposals into approvals.

## Alternatives considered

- **Separate orchestrator:** rejected as duplicate ADO responsibility.
- **Manufacturing OS as shared builder:** rejected because it would make a domain product own company-wide orchestration.
- **Uncoordinated per-domain builders:** rejected due inconsistent provenance and authority controls.

## Implementation consequences

ADO needs explicit Knowledge Core, Ontology Builder, snapshot, query, approval-routing, and agent-context modules behind versioned interfaces. OA-00 implements none of them.

## Human approval requirement

Human review and merge are required for adoption; protected knowledge and release decisions remain human-controlled after adoption.
