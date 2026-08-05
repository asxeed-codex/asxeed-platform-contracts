# ADR-030 — Shared Knowledge Graph Namespace and Access Control

**Status:** Proposed; human direction approved in principle; formal adoption requires OA-00 human checkpoint review and merge

## Context

Company-wide graph semantics create valuable cross-domain references but can also create tenant leakage, authority escalation, direct database coupling, and confidential-data duplication if namespace boundaries are implicit.

## Decision

The Knowledge Core uses explicit namespace and organization boundaries. Required families are `shared.*`, `document.*`, `company.*`, `development.*`, `agent.*`, `manufacturing.*`, and `external-reference.*`. Read, proposal, approval, and write authorities are evaluated separately.

## Mandatory rules

- Every protected object is scoped by `organizationId` and namespace.
- Namespace metadata declares domain owner and read/proposal/approval/write policy.
- Approved snapshots are immutable and content-hashed.
- Cross-namespace references use versioned contracts and explicit authorization.
- Direct cross-domain database access is prohibited.
- No public Ontology endpoint is authorized.
- No Graph Database is approved; PostgreSQL/Blob compatibility is mandatory.

## Ownership

ADO operates access-controlled Knowledge Core traversal. Platform Contracts defines neutral namespace and authorization contracts. Domain owners define domain policy. Shared infrastructure enforces identity primitives without owning domain authority.

## Prohibited interpretations

- “Shared graph” does not mean global write access.
- Read access does not imply proposal, approval, or write access.
- A cross-namespace edge does not transfer source-of-truth ownership.
- Physical co-location in PostgreSQL does not authorize direct schema access.

## Security impact

Organization isolation, least privilege, environment separation, immutable Critical audit, revocation, supersession, and confidential-reference minimization are required. Development must not access Production Ontology data.

## Compatibility impact

ADR-008 domain schema separation, ADR-009 security, ADR-013 versioned boundaries, ADR-016 repository separation, ADR-020 organization fairness, and ADR-022 recovery remain unchanged.

## Migration impact

Namespaces and organization scope are introduced additively. Records lacking verified scope fail closed and require controlled remediation; they are not assigned a guessed tenant or authority.

## Rollback impact

Rollback may disable new cross-namespace traversal or policies, but must retain audit history, approved snapshots, revoked grants, and source ownership metadata.

## Alternatives considered

- **Unrestricted shared graph:** rejected due security and authority escalation.
- **Direct database joins:** rejected by ADR-013 and domain separation.
- **Dedicated Graph Database now:** rejected because workload and tenancy evidence do not yet justify a new technology decision.

## Implementation consequences

Queries, mutations, snapshots, events, and generators must carry organization and namespace context. Authorization is deterministic and independently testable.

## Human approval requirement

Human checkpoint merge adopts this ADR. Humans also approve authority-boundary exceptions and Critical domain knowledge.
