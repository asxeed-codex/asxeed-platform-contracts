# ADR-028 — PUE, Ontology, and DSL Architecture

**Status:** Proposed; human direction approved in principle; formal adoption requires OA-00 human checkpoint review and merge

## Context

PUE extracts meaning from documents, Ontology persists reusable knowledge, and DSL drives deterministic execution. Conflating these layers allows model inference to become execution truth without evidence, conflict, approval, or version gates.

## Decision

The required flow is `Documents / Human Input -> PUE / Understanding -> Ontology -> approved immutable Snapshot -> DSL Generator -> versioned DSL -> deterministic Engine`. Ontology is persistent reusable knowledge. DSL is a generated execution artifact.

## Mandatory rules

- PUE outputs evidence-linked candidates, conflicts, missing information, and questions.
- Assertions preserve source type, confidence, status, conflict, approval, validity, version, scope, namespace, creator, timestamps, and content hash.
- Only eligible approved snapshots can feed protected generators.
- Generator input, version, output hash, evidence, rules, and approval state are traceable.
- Unknown or unresolved Critical conflict blocks protected generation or release.

## Ownership

ADO owns shared understanding orchestration and Knowledge Core. Domain owners define semantic validation and protected approval. ADO owns Plan DSL generation; Manufacturing OS owns Product DSL generation.

## Prohibited interpretations

- PUE does not directly produce approved knowledge or approved DSL.
- High confidence does not bypass approval.
- DSL output does not overwrite Ontology.
- Generated artifacts do not become cross-domain operational databases.

## Security impact

Only necessary page/crop content reaches approved Azure AI endpoints. Evidence references are preferred over source duplication. Confidential source text is not logged or copied into shared contracts.

## Compatibility impact

ADR-005 and ADR-018 evidence, prompt/model, source-hash, and reanalysis controls are preserved. ADR-012 deterministic evaluation remains downstream and AI-independent.

## Migration impact

Existing PUE-to-Draft-DSL paths remain available through compatibility adapters until Ontology-backed generation passes dual-read and equivalence gates.

## Rollback impact

Route generation back to the last compatible path, preserve candidates/evidence/snapshots, and never promote unapproved intermediate state during rollback.

## Alternatives considered

- **PUE directly approves DSL:** rejected by existing Evidence and Approval rules.
- **DSL as knowledge store:** rejected due loss of reusable semantics and provenance.
- **AI evaluator:** rejected for deterministic manufacturing decisions.

## Implementation consequences

Each layer requires a versioned contract, deterministic boundary validation, trace continuity, and explicit failure behavior.

## Human approval requirement

Human checkpoint merge adopts the flow. Critical manufacturing knowledge and required Product DSL approvals remain human decisions.
