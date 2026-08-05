# P0-T02C Ontology Transition Plan v1.0

**Target:** Manufacturing OS Draft PR #26
**Current control:** PR #26 remains open, Draft, and unchanged during OA-00
**Execution task:** OA-00B only, after OA-00 human merge

## 1. Purpose

P0-T02C correctly formalizes Manufacturing OS governance under Architecture Freeze v1.1. Architecture v1.2 changes the position of Product DSL and introduces Manufacturing Ontology Pack boundaries. OA-00 documents the later transition but does not edit, update, close, retarget, merge, or rerun mutating commands on PR #26.

## 2. Required later changes

- Change Product DSL from primary manufacturing knowledge asset to immutable generated execution artifact.
- Add Manufacturing Ontology Pack ownership: manufacturing extensions, semantic validation, Criticality, approval requirements, generator mappings.
- Define the ADO Knowledge Core integration boundary through versioned APIs/messages/events/snapshots/packages.
- Require approved or explicitly reviewable Ontology Snapshot inputs.
- Add Product DSL provenance: `ontologySnapshotId`, `ontologyVersion`, `ontologyContentHash`, `generatorVersion`, `evidenceReferences`, `ruleReferences`, `generatedAt`, `approvalState`, `contentHash`.
- Preserve Manufacturing OS ownership of validation, protected approval, deterministic Rule Engine, Product Instance, Parts, Geometry, Drawing, 3D, BOM, release, and manufacturing start.
- Preserve current Product DSL exclusions for customer/order/quantity/price/invoice/inventory, drawing/DXF/SVG/CAD commands, 3D coordinates, and renderer internals.
- Preserve Evidence, Confidence, Conflict, confidentiality, source priority, AI inference labeling, and genuine human approval rules.
- Preserve current runtime, CLI, pipeline, output directories, samples, tests, and released artifacts unless a later authorized task explicitly migrates them.

## 3. Controlled implementation steps for OA-00B

1. Begin from the exact reviewed PR #26 head or a human-selected successor base.
2. Reinspect repository status and preserve all unrelated/dirty data.
3. Update `AGENTS.md` and the Manufacturing OS governance profile only within approved OA-00B scope.
4. Update its verifier and deterministic negative tests for v1.2 boundaries.
5. Record version/compatibility/migration/rollback impact truthfully.
6. Run all P0-T02C validation, including architecture adoption, governance, focused/full tests, build, safe CLI/pipeline smoke checks, JSON, links, diff, protected scope, Product DSL compatibility, and confidentiality checks.
7. Push only the scoped task branch and keep the PR Draft.
8. Stop for human checkpoint before merge.

## 4. Acceptance gates

- ADO runtime ownership and Manufacturing semantic/approval ownership are unambiguous.
- No separate Knowledge OS or Graph Database is authorized.
- No manufacturing runtime or data migration is smuggled into governance.
- All historical P0-T02C evidence remains unchanged; new OA-00B evidence is separate.
- PR #26 state and commit history remain auditable.
- Human checkpoint is explicit and no AI approval is fabricated.

## 5. Rollback

Revert only OA-00B governance commits or issue a corrected governance version. Preserve PR #26 history, P0-T02C evidence, runtime behavior, Product DSL, and all confidential/user-owned data. Never force-push protected history or merge automatically.
