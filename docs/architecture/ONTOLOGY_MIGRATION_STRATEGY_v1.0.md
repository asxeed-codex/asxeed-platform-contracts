# Ontology Migration Strategy v1.0

**Status:** Proposed controlled migration; no runtime or data migration is authorized by OA-00
**Principle:** additive, versioned, reversible, fail closed, and human-gated

## 1. Objectives

- Adopt ADO Knowledge Core without creating a separate Knowledge OS.
- Move reusable knowledge authority from Product DSL to approved Ontology Snapshot without destroying or silently reclassifying historical DSL.
- Preserve Evidence, provenance, conflicts, approvals, releases, and external ownership.
- Keep current runtime behavior available until a compatible successor path proves safe.
- Prevent any big-bang destructive migration.

## 2. Required sequence

| Order | Task | Outcome and gate |
|---:|---|---|
| 1 | OA-00 Architecture package | v1.2/ADR-025–030 proposal, plans, verifier, tests, Draft PR, human merge |
| 2 | OA-00A ADO Architecture adoption | ADO governance adopts Knowledge Core/Builder ownership; no runtime yet |
| 3 | OA-00B Manufacturing OS PR #26 transition | Manufacturing governance adopts Ontology Pack and Product DSL artifact position; PR #26 remains human-gated |
| 4 | OA-00C Cross-repository v1.2 verification | Exact commits, versions, hashes, boundaries, and consumer statuses pass |
| 5 | OA-01 ADO Knowledge Core | Minimal versioned runtime/contracts, isolation, snapshots, audit, rollback evidence |
| 6 | OA-02 ADO Ontology Builder | Candidate/proposal/conflict/question/approval routing on Knowledge Core |
| 7 | OA-03 Company Ontology dogfooding | Synthetic/non-confidential internal pilot and operational evidence |
| 8 | OA-04 Manufacturing Ontology Pack | Manufacturing semantics, validation, Criticality, approval policy; no DSL switch yet |
| 9 | OA-05 Ontology-to-DSL Generators | Plan/Product DSL generation, provenance, dual-read comparison |
| 10 | OA-06 Engine integration | Versioned adapter to existing Agent/Rule Engines; deterministic equivalence gates |
| 11 | OA-07 Cross-domain pilot | Controlled Company and Manufacturing flow with external boundaries |
| 12 | OA-GATE | Final architecture/security/compatibility/rollback/human gate |

No successor begins before its dependencies and required human checkpoint are complete.

## 3. Contract evolution

1. Publish domain-neutral Ontology and DSL provenance contracts through normal Platform Contracts versioning.
2. Prefer compatible additive fields where consumer semantics remain unchanged.
3. Use a new major contract version when source-of-truth or required-field semantics break an existing contract.
4. Provide explicit old/new readers and adapters.
5. Pin package/artifact versions and SHA-256; never consume `latest`, a branch, or a mutable URL.
6. Require compatibility evidence, migration strategy, rollback, consumer assessment, Architecture Judge evidence when available, and human approval for every breaking change.

## 4. Existing Product DSL preservation

- Approved Product DSL files and database records remain immutable.
- Existing Rule Engine inputs remain readable under their original schema/version.
- Existing released manufacturing packages retain their original DSL, rule result, artifact, approval, and content hashes.
- Historical approvals are not rebound to a new snapshot by inference.
- A migration link is a new record: old DSL ID/version/hash -> new snapshot ID/version/hash -> generator version -> regenerated DSL ID/version/hash -> reviewed equivalence decision.

## 5. Old DSL migration

For each eligible historical DSL version:

1. identify the exact DSL version, content hash, evidence, approval, and release dependencies;
2. extract candidate knowledge through an approved, versioned migration adapter;
3. preserve unknown/conflict/source gaps rather than inventing values;
4. create proposed assertions with migration provenance;
5. run manufacturing semantic validation and Criticality classification;
6. obtain required human approval for Critical knowledge;
7. create an immutable snapshot;
8. generate a new DSL using a pinned generator;
9. compare old and new outputs through schema, semantic, rule-trace, and release-impact tests; and
10. activate the new path only after the consumer and human gate pass.

No old DSL is overwritten or deleted.

## 6. Dual-read and compatibility strategy

During OA-05/OA-06, consumers support:

- **legacy read:** existing approved Product DSL by its historical version;
- **ontology-backed read:** generated Product DSL with snapshot provenance;
- **shadow generation:** generate and compare without affecting production or release;
- **explicit selector:** choose the permitted path by approved organization/environment policy;
- **fail closed:** no implicit fallback when provenance, approval, schema, or equivalence is missing.

Automatic fallback may return to a previously approved compatible artifact only where policy explicitly permits it; it must emit audit/incident evidence and cannot manufacture approval.

## 7. Snapshot identifiers and hashes

Every migrated path records `ontologySnapshotId`, `ontologyVersion`, `ontologyContentHash`, `generatorVersion`, `contentHash`, Evidence references, Rule references, approval state, organization, namespace, and timestamps. Snapshot IDs are stable, immutable, and never reused for changed content.

## 8. Evidence and approval preservation

Evidence references preserve source ownership, locator, source hash, and access rules. Confidential content is not duplicated unnecessarily. Approval remains bound to actual actor, authority, version, and content hash. Migration or regeneration invalidates no historical approval but requires new approval where policy or changed content demands it.

## 9. Consumer adoption order

ADO governance adopts first (OA-00A), Manufacturing OS governance transitions second (OA-00B), and Platform Contracts verifies exact adoption third (OA-00C). Runtime contracts then land before consumers. Manufacturing generator/engine cutover follows Company Ontology dogfooding and Manufacturing Ontology Pack validation.

## 10. Fail-closed gates

Stop migration when any of the following is missing or contradictory: organization/namespace authority, source/evidence, Criticality, conflict resolution, required approval, version/hash, generator pin, schema validity, deterministic trace, old/new equivalence, rollback readiness, consumer adoption, security review, or human checkpoint.

## 11. Rollback points

- After OA-00: revert only the unadopted architecture package or supersede it after adoption.
- After consumer governance: revert/supersede consumer adoption before runtime use.
- After Knowledge Core: route traffic to prior ADO revision; retain data/audit.
- After Builder: disable proposal workflows; retain proposals/evidence.
- After generator: deactivate generator version; use preserved legacy DSL reader.
- After engine integration: switch the approved adapter/traffic revision back.
- After pilot: revoke pilot activation and preserve artifacts for analysis.

Detailed procedures are in [Ontology Rollback Strategy v1.0](ONTOLOGY_ROLLBACK_STRATEGY_v1.0.md).

## 12. Completion condition

Migration completes only at OA-GATE after zero unresolved Critical compatibility/security findings, restore/rollback rehearsal, cross-repository verification, deterministic pilot evidence, and human approval. Until then, legacy compatibility remains supported where required.
