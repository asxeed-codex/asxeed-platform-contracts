# Ontology Rollback Strategy v1.0

**Status:** Proposed; execution requires a scoped task and human authority appropriate to the affected environment
**Invariant:** Rollback must not delete approved historical knowledge, evidence, approvals, DSL, releases, or audit history.

## 1. Common rollback rules

- Use `git revert`, version supersession, version deactivation, compatibility adapters, traffic rollback, and corrected new versions.
- Never rewrite approved history, mutate an immutable snapshot/DSL/release, or restore revoked authority merely by deploying old code.
- Capture incident, affected versions/hashes, consumers, approvals, and decision authority.
- Verify organization/namespace isolation and fail closed before reopening traffic.
- Production, database restore, architecture, manufacturing, and release decisions remain human-controlled.

## 2. Architecture documents

Before OA-00 merge, close/revise the Draft PR or revert scoped branch commits. After adoption, create a new architecture change package that supersedes v1.2; do not edit v1.1, v1.2, or adopted ADR files in place. Consumer adoption is rolled back through versioned governance revisions and cross-repository verification.

## 3. ADO Knowledge Core

Deactivate the affected API/worker revision, stop new snapshot creation, drain or pause Temporal workflows safely, and route approved traffic to the last compatible Container Apps revision. Keep PostgreSQL/Blob records and audit immutable. Run compatibility and authorization verification before resume.

## 4. Ontology Builder

Disable candidate/proposal/question/approval routes by approved feature policy, pause in-flight workflows, and retain candidates, Evidence, conflicts, and human answers. Do not promote paused proposals. Resume through a corrected version with idempotent replay.

## 5. Ontology schema

Prefer expand/contract migrations. On failure, stop writers, keep the expanded schema, reactivate the compatible application reader, and issue a corrective forward migration. Destructive down-migration requires separate human approval and proof that no approved history is lost.

## 6. Ontology data

Deactivate or supersede affected versions and snapshots. Never delete approved records. Rebuild corrected snapshots from preserved source versions and compare hashes/provenance. Restore from backup only under ADR-022 human decision and reconcile append-only audit afterward.

## 7. Product DSL Generator

Deactivate the faulty generator version, preserve its outputs and trace, select the last approved compatible generator, and generate a new artifact/version when needed. Existing approved Product DSL remains readable. Never overwrite it or silently claim the replacement has inherited approval.

## 8. Plan DSL Generator

Stop new plan generation, preserve generated Plan DSL and affected task references, and return to the last compatible generator/revision. Re-run planning under a corrected version; do not silently mutate active task history.

## 9. Rule Engine integration

Switch the versioned adapter back to the last approved legacy or ontology-backed input path. Verify schema, Decimal/unit behavior, dependency/cycle logic, `true / false / unknown`, Fail Closed, and trace. Do not remove the deterministic evaluator or bypass unknown/Conflict gates.

## 10. Manufacturing OS integration

Pause new snapshot import, DSL generation, and releases. Preserve existing Product DSL and Released Manufacturing Packages. Deactivate the incompatible adapter or contract version, re-enable the last approved path, re-run manufacturing validation and all P0-T02C/runtime tests, and obtain human checkpoint approval before resume.

## 11. Consumer adoption

Use a versioned governance supersession or scoped revert on each consumer task branch. Re-run consumer and cross-repository verifiers against exact commits. Do not modify PR #26 during OA-00; its later transition and any rollback occur in OA-00B.

## 12. Deployment revisions

Container Apps traffic rollback uses a previously tested immutable image digest. Database and storage state are not assumed compatible merely because application traffic moved. Human approval is required for Production rollback, region failover, restore, or manufacturing restart.

## 13. Rollback evidence

Every rollback records trigger, owner, affected versions/hashes, audit IDs, selected prior revision, data compatibility, authorization state, test/verifier results, consumer impact, unresolved risk, and human decision. A rollback is not complete until integrity and access controls pass and affected workflows are reconciled.
