# ADR-027 — Domain Ontology Ownership and Approval Boundaries

**Status:** Proposed; human direction approved in principle; formal adoption requires OA-00 human checkpoint review and merge

## Context

A shared runtime can centralize knowledge operations without centralizing semantic authority. Manufacturing knowledge has safety, confidentiality, and release implications that differ from Company, Development, and Agent knowledge.

## Decision

Namespace ownership, proposal authority, approval authority, and write authority are explicit and distinct. ADO operates the shared runtime. Manufacturing OS owns the Manufacturing Ontology Pack, manufacturing validation, Criticality, approval requirements, and manufacturing approval surfaces. Humans exclusively approve Critical manufacturing knowledge.

## Mandatory rules

- Every protected record carries `organizationId`, namespace, owner, version, provenance, Criticality, and approval state.
- ADO may propose manufacturing knowledge but cannot self-approve it.
- Manufacturing OS validates manufacturing semantics before protected approval or generation.
- Platform Contracts stores no operational domain knowledge.
- Authority exceptions require an explicit human architecture decision.
- Revocation and supersession preserve immutable history and stop affected downstream releases.

## Ownership

ADO: runtime and orchestration. Manufacturing OS: manufacturing extension/policy/validation/approval surfaces. Other domain owners: their extensions and approval policy. Humans: Critical and final protected decisions. Platform Contracts: neutral contracts.

## Prohibited interpretations

- Confidence is not Approval.
- Judge recommendation is not Approval.
- Shared storage infrastructure is not shared domain authority.
- ADO runtime ownership is not Manufacturing Ontology ownership.
- Manufacturing OS approval authority is not ADO Knowledge Core ownership.

## Security impact

Least privilege, namespace authorization, tenant isolation, separation of duties, immutable Critical audit, no public ontology endpoints, and environment isolation are mandatory.

## Compatibility impact

ADR-005 Evidence/Confidence separation, ADR-009 security, ADR-010 human checkpoints, ADR-019 manufacturing lifecycle, ADR-020 organization fairness, and ADR-021 human escalation remain effective.

## Migration impact

Authority is introduced through explicit policy and compatibility adapters. Existing approved Product DSL remains valid until linked to approved snapshots or superseded through a human-approved migration.

## Rollback impact

Rollback deactivates new policies or versions without deleting approvals or evidence. A revoked permission cannot be restored merely by traffic rollback.

## Alternatives considered

- **ADO approves all domains:** rejected as unsafe authority escalation.
- **Each domain owns a separate runtime:** rejected because it duplicates Knowledge Core behavior.
- **Confidence threshold approval:** rejected because it fabricates human authority.

## Implementation consequences

Contracts and policy evaluation must model read, proposal, approval, and write separately. Cross-namespace references require explicit versioned contracts.

## Human approval requirement

Humans approve this ADR, Critical manufacturing knowledge, authority exceptions, and protected releases. AI may only recommend.
