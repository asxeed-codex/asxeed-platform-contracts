# Ontology Core Conceptual Model v0.1

**Status:** Conceptual architecture; no runtime schema or implementation is authorized by OA-00
**Authority:** Architecture Freeze v1.2 and ADR-025 through ADR-030, after formal adoption

## 1. Purpose

This model defines domain-neutral semantics for interoperable contracts. It intentionally does not select tables, indexes, ORM models, a graph database, API payload versions, or product-specific rule content. PostgreSQL/Blob compatibility is mandatory.

## 2. Core concepts

| Concept | Meaning | Minimum identity / control |
|---|---|---|
| Entity | Stable reference to a thing or concept | entityId, type, namespace, organizationId, version |
| Relationship | Typed edge between Entities | relationshipId, subjectId, predicate, objectId, direction, version |
| Assertion | Versioned claim about an Entity, Relationship, or value | assertionId plus fields below |
| Evidence | Traceable support for an Assertion | evidenceId, source type, locator/reference, source hash |
| Conflict | Explicit incompatible or unresolved claims | conflictId, member assertions, state, resolution reference |
| Rule | Declarative domain rule content | ruleId, typed representation, dependencies, version |
| Namespace | Ownership and authority partition | namespaceId, domain owner, read/proposal/approval/write policy |
| Version | Immutable revision identity | versionId, predecessor, content hash, createdAt |
| Snapshot | Immutable closed set of eligible versions | snapshotId, ontologyVersion, content hash, members |
| Approval | Evidence of an actual authorized decision | approvalId, actor, authority, entity/version/hash, decision, time |
| ExternalReference | Versioned pointer to externally owned truth | referenceId, owner system, external ID/version/hash |
| Provenance | Derivation trace | actor/model/pipeline/generator versions and parent references |
| ValidityPeriod | Time interval in which a claim applies | validFrom, validTo or open end |
| Criticality | Policy classification | informational, standard, critical, emergency or domain mapping |
| OrganizationScope | Tenant and sharing boundary | organizationId and explicitly authorized sharing scope |

## 3. Assertion shape

An Assertion supports at least:

```text
assertionId
subject
predicate
object | value
evidenceReferences[]
sourceType
confidence
status
conflictState
approvalState
validityPeriod
version
organizationScope
namespace
creator
createdAt
updatedAt
contentHash
```

`confidence`, `status`, `conflictState`, and `approvalState` are independent. A high-confidence assertion may remain proposed, conflicted, revoked, or unapproved.

## 4. Lifecycle

```text
observed / submitted
  -> candidate
  -> validated or rejected
  -> conflict-detected / question-required
  -> proposed
  -> approved or rejected by authorized policy/actor
  -> included in immutable snapshot
  -> superseded or revoked by later version
```

No state transition deletes history. A Critical assertion cannot enter an approved manufacturing snapshot without genuine human approval evidence.

## 5. Evidence and provenance

Evidence records or references source type, stable locator, source hash, source version, extraction method, and organization scope. Confidential binaries remain in protected source storage; Ontology prefers a minimized reference rather than a copy.

Provenance links an assertion to Evidence, candidate generation, human edits, model/provider/prompt/schema versions, validation results, conflict resolution, approvals, snapshots, generators, and produced DSL hashes. AI inference is explicitly typed and never silently promoted to confirmed human truth.

## 6. Conflict representation

A Conflict is a first-class record linking all affected assertions and their evidence. It carries conflict type, scope, Criticality, detection time, state, resolution proposal, authorized resolution, and downstream impact. `unknown`, `unresolved`, `accepted exception`, `superseded`, and `resolved` remain distinguishable.

Unresolved Critical conflicts block protected snapshot eligibility, generation, or release. Resolution produces new versions; it does not rewrite the conflicting originals.

## 7. Versioning and snapshots

Every mutable concept changes by new version. Content hashes cover canonicalized contract content. A Snapshot closes over exact Entity, Relationship, Assertion, Rule, approval, namespace-policy, and ExternalReference versions.

Snapshot generation:

1. resolve organization and namespace policy;
2. select eligible versions at the requested ontology version/time;
3. verify evidence, conflicts, Criticality, approval, validity, and references;
4. fail closed on missing or unauthorized Critical inputs;
5. canonicalize and hash the closed set;
6. store an immutable manifest and audit event; and
7. emit only through a versioned contract.

## 8. Approval

Approval is bound to actor identity, authority, organization, namespace, target ID, target version, target content hash, decision, timestamp, and policy version. Changes invalidate the applicability of the old approval. Judge recommendations and verifier results may be referenced as evidence but never substituted for the authorized human decision.

## 9. Namespace and organization scope

Required namespace families are `shared.*`, `document.*`, `company.*`, `development.*`, `agent.*`, `manufacturing.*`, and `external-reference.*`. Nested namespaces inherit no authority automatically; policy must be explicit.

Every request carries `organizationId`, actor identity, namespace, and requested operation. Read, propose, approve, and write are evaluated separately. Cross-organization sharing requires an explicit versioned agreement and must not expose source content beyond authorized scope.

## 10. External references

ExternalReference represents externally owned state without copying authority. It includes owner system, external identifier, referenced version/hash when available, relationship purpose, last verification time, and access policy. Customer, order, quantity, price, and invoice remain Order Engine truth.

## 11. Rule representation

Rule content is declarative knowledge: typed conditions, constraints, selection rules, dependencies, priority, applicability, units, source evidence, and approval. Arbitrary code and `eval` are prohibited.

The deterministic Rule Engine remains implementation code and owns typed operators, Decimal behavior, unit conversion, dependency order, cycle detection, `true / false / unknown`, Fail Closed, schema validation, and trace generation.

## 12. Ontology-to-DSL provenance

A generated DSL manifest links:

```text
ontologySnapshotId
ontologyVersion
ontologyContentHash
generatorVersion
evidenceReferences[]
ruleReferences[]
generatedAt
approvalState
contentHash
```

Regeneration with the same canonical inputs and generator version must be deterministic or fail verification. A generated DSL never writes back as Ontology truth.

## 13. Synthetic Company example

```text
Entity: company.role.synthetic-design-reviewer
Assertion: role --mayReview--> development.architecture-change
Evidence: synthetic-policy-reference-v1
Confidence: 1.0
Approval: approved by synthetic organization policy owner
Namespace: company.example
OrganizationScope: org-example
```

This fictional example contains no real company policy or operational data.

## 14. Synthetic Manufacturing example

```text
Entity: manufacturing.example-component-type
Rule: when synthetic-material-class = M1, require synthetic-check C1
Evidence: synthetic-specification-reference-v1
Criticality: critical
ApprovalState: proposed (not approved)
Namespace: manufacturing.example
OrganizationScope: org-example
```

ADO may create the proposal. Manufacturing OS validates its semantics. A human must approve it before an eligible manufacturing snapshot can contain it. No real product name, dimension, calculation, customer, or confidential rule is present.
