# ASXEED Platform Contracts

Canonical shared governance and, in later phases, versioned platform contracts for ASXEED.

The Phase 0 architecture and technology baseline is indexed in [docs/README.md](docs/README.md). The canonical adoption record is [docs/architecture/adoption-manifest.json](docs/architecture/adoption-manifest.json), and repository ownership rules are defined in [docs/architecture/repository-responsibility.md](docs/architecture/repository-responsibility.md).

Repository agent behavior is governed by [AGENTS.md](AGENTS.md), recorded in the [Platform Contracts agent-governance profile](docs/architecture/platform-contracts-agents-governance.json), and checked by the [deterministic governance verifier](scripts/verify-platform-contracts-agents-governance.mjs).

The proposed OA-00 architecture package is indexed by [Architecture Freeze v1.2](docs/architecture/ASXEED_Architecture_Freeze_v1.2.md), [ADR-025 through ADR-030](docs/architecture/adrs/ADR-025_ONTOLOGY_CORE_EMBEDDED_IN_ADO.md), the [Ontology conceptual model](docs/architecture/ONTOLOGY_CORE_CONCEPTUAL_MODEL_v0.1.md), [System Responsibility Boundaries v1.1](docs/architecture/SYSTEM_RESPONSIBILITY_BOUNDARIES_v1.1.md), [architecture decision report](docs/architecture/ADO_ONTOLOGY_ARCHITECTURE_DECISION_REPORT_v1.0.md), [compatibility matrix](docs/architecture/ONTOLOGY_ARCHITECTURE_COMPATIBILITY_MATRIX_v1.0.md), [migration strategy](docs/architecture/ONTOLOGY_MIGRATION_STRATEGY_v1.0.md), and [rollback strategy](docs/architecture/ONTOLOGY_ROLLBACK_STRATEGY_v1.0.md).

Execution ordering is defined by [Master Implementation Plan v1.3](docs/plans/MASTER_IMPLEMENTATION_PLAN_v1.3.md), [Task Graph v1.3](docs/plans/ADO_TASK_GRAPH_v1.3.md), and [Sprint Plan v1.1](docs/plans/SPRINT_EXECUTION_PLAN_v1.1.md). Run the [OA-00 verifier](scripts/verify-ontology-architecture.mjs) to validate the proposed package.

OA-00C cross-repository Architecture v1.2 verification is defined by the [human-readable verification record](docs/architecture/CROSS_REPOSITORY_ARCHITECTURE_V1_2_VERIFICATION.md), pinned by the [v1.2 adoption lock](docs/architecture/cross-repository-v1.2-adoption-lock.json), and enforced by the [Ontology adoption verifier](scripts/verify-cross-repository-ontology-adoption.mjs).

P0-T01D cross-repository evidence is recorded in the [verification report](docs/reports/P0_T01D_CROSS_REPOSITORY_VERIFICATION.md) and pinned by the [cross-repository adoption lock](docs/architecture/cross-repository-adoption-lock.json).

Run the deterministic governance check with:

```sh
node scripts/verify-architecture-adoption.mjs
node scripts/verify-cross-repository-architecture-adoption.mjs
node scripts/verify-platform-contracts-agents-governance.mjs
node scripts/verify-ontology-architecture.mjs
node scripts/verify-cross-repository-ontology-adoption.mjs
```

Human direction for Architecture Freeze v1.2 is approved in principle, but formal adoption remains pending OA-00 human checkpoint review and merge. P0-T02C remains `checkpoint-review-required`; P0-T02D, P0-T03, OA-00A, and every later OA task remain blocked or `not-started`.
