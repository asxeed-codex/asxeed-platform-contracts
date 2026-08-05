# ADR-029 — DSL as Versioned Execution Artifact

**Status:** Proposed; human direction approved in principle; formal adoption requires OA-00 human checkpoint review and merge

## Context

Architecture Freeze v1.1 treated Approved Product DSL as the primary manufacturing-knowledge asset. The selected Ontology architecture requires knowledge to be reusable independently of any one execution language while preserving existing DSL compatibility and deterministic engines.

## Decision

Plan DSL and Product DSL are immutable, versioned execution artifacts generated from approved Ontology Snapshots. Product DSL is not the persistent knowledge source of truth. Existing versions remain immutable and readable under their historical contracts.

## Mandatory rules

- Product DSL includes `ontologySnapshotId`, `ontologyVersion`, `ontologyContentHash`, `generatorVersion`, `evidenceReferences`, `ruleReferences`, `generatedAt`, `approvalState`, and `contentHash`.
- Generator versions and output schemas are pinned and compatibility-tested.
- Breaking changes require major-version migration, consumer evidence, rollback, Judge evidence when available, and human approval.
- Product DSL continues to exclude customer, order quantity, price, invoice, inventory, drawing/DXF/SVG/CAD commands, 3D coordinates, and renderer internals.
- Approved DSL is never mutated in place.

## Ownership

ADO owns Plan DSL generation. Manufacturing OS owns Product DSL generation and manufacturing validation. Platform Contracts owns domain-neutral provenance and compatibility contracts, not DSL content.

## Prohibited interpretations

- Generated DSL is not Ontology truth.
- The new provenance fields do not authorize operational order or customer data.
- “Rules are knowledge” does not remove deterministic Rule Engine code.
- Migration does not invalidate historical DSL or released packages.

## Security impact

DSL includes references and hashes, not unnecessary confidential source copies. Access follows organization and namespace policy. Approval state must be verified, not trusted from unvalidated input.

## Compatibility impact

ADR-001 versioning is preserved with a v1.2 interpretation update. ADR-012 input evolves through a versioned adapter from approved DSL to snapshot-derived approved DSL. ADR-019 hash-bound approvals remain mandatory.

## Migration impact

Use additive provenance, dual-read, deterministic regeneration comparison, and versioned adapters. Do not perform a big-bang rewrite or destructive data migration.

## Rollback impact

Deactivate the new generator version, continue reading preserved DSL versions, and issue corrected versions. Never alter an approved historical DSL in place.

## Alternatives considered

- **Retain DSL as primary knowledge truth:** rejected because it couples reusable knowledge to an execution projection.
- **Remove DSL:** rejected because deterministic engines need stable execution artifacts.
- **Rewrite all DSL immediately:** rejected as incompatible and destructive.

## Implementation consequences

Generators become controlled components with provenance contracts, equivalence tests, compatibility adapters, and human-gated release.

## Human approval requirement

Adoption and breaking Product DSL migrations require human approval. AI cannot declare equivalence or approval solely from confidence or Judge output.
