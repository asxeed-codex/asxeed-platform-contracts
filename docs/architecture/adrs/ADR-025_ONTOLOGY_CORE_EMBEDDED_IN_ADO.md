# ADR-025 — Ontology Core Embedded in ADO

**Status:** Proposed; human direction approved in principle; formal adoption requires OA-00 human checkpoint review and merge

## Context

ASXEED needs persistent, reusable knowledge for company, development, agent, and manufacturing domains. Treating generated DSL as that knowledge source makes reuse, evidence, conflicts, cross-artifact provenance, and controlled change difficult. A separate Ontology OS or Knowledge OS would add a fourth product boundary and divide ADO's AI Company OS mission.

## Decision

The shared Knowledge Core and Ontology runtime are embedded in ADO. No separate Ontology OS or separate Knowledge OS product will be created. Graph semantics are modeled through domain-neutral contracts and remain independent of persistence technology.

## Mandatory rules

- ADO owns Knowledge Core runtime behavior, Ontology query/traversal, versioning, and immutable snapshot generation.
- Platform Contracts owns only domain-neutral Ontology contracts and governance.
- Operational knowledge remains in consumer-owned storage, never Platform Contracts.
- Initial persistence remains compatible with PostgreSQL and Blob.
- No Graph Database is approved by this ADR.
- Domain writes and approvals remain namespace- and organization-authorized.

## Ownership

ADO owns the runtime. Platform Contracts owns contracts. Domain owners own domain extensions, policy, approval, and operational knowledge. Humans retain protected approvals.

## Prohibited interpretations

- A shared Knowledge Core is not unrestricted cross-domain write authority.
- Embedding Ontology in ADO does not transfer manufacturing approval or execution to ADO.
- This ADR does not authorize a new repository, database, public endpoint, or runtime implementation in OA-00.

## Security impact

Organization isolation, namespace authorization, least privilege, environment separation, immutable Critical audit events, and no Codex access to Production Ontology are mandatory.

## Compatibility impact

ADR-008 PostgreSQL/Blob persistence, ADR-009 security, ADR-013 versioned integration, ADR-016 repository separation, ADR-020 tenancy/capacity, and ADR-022 recovery remain effective.

## Migration impact

Consumers adopt the v1.2 contracts in OA-00A through OA-00C before runtime work. No operational data is migrated by this ADR.

## Rollback impact

Before runtime adoption, revert the architecture package. After runtime adoption, deactivate the new runtime version, retain immutable history, and return traffic to the last compatible revision.

## Alternatives considered

- **Separate Knowledge OS / Ontology OS:** rejected because it fragments ADO ownership and adds premature product and operational boundaries.
- **Manufacturing-only ontology:** rejected because Company, Development, and Agent Ontologies are ADO capabilities.
- **DSL-only knowledge:** rejected because DSL is an execution projection, not reusable knowledge truth.

## Implementation consequences

ADO becomes foundational for Knowledge Core and Ontology Builder work. Versioned contracts, authorization, snapshots, audit, and migration gates precede domain pilots.

## Human approval requirement

Only human checkpoint review and merge can adopt this ADR. A verifier, Judge, agent, or Draft PR cannot approve it.
