# Governance index

This repository is the canonical Phase 0 source for shared ASXEED architecture governance. Adopted documents are copied without substantive changes from the immutable P0-T01A inputs and are pinned by [the adoption manifest](architecture/adoption-manifest.json).

## Authority hierarchy

1. [Architecture Freeze v1.1](architecture/ASXEED_Architecture_Freeze_v1.1.md)
2. ADR-001 through ADR-024, incorporated into the Architecture Freeze
3. [Technology Stack v1.0](architecture/TECHNOLOGY_STACK.md)
4. [Technology Version Matrix v1.0](architecture/TECHNOLOGY_VERSION_MATRIX.md)
5. [Technology Selection Rationale v1.0](architecture/TECHNOLOGY_SELECTION_RATIONALE.md)
6. [Deferred Technology v1.0](architecture/DEFERRED_TECHNOLOGY.md)
7. [Master Implementation Plan v1.2](plans/MASTER_IMPLEMENTATION_PLAN_v1.2.md)
8. [ADO Task Graph v1.2 (Markdown)](plans/ADO_TASK_GRAPH_v1.2.md) and [ADO Task Graph v1.2 (JSON)](plans/ADO_TASK_GRAPH_v1.2.json)
9. [Sprint Execution Plan v1.0](plans/SPRINT_EXECUTION_PLAN_v1.0.md)
10. [System Responsibility Boundaries v1.0](architecture/SYSTEM_RESPONSIBILITY_BOUNDARIES_v1.0.md)
11. [Development Readiness Report v1.0](reports/ASXEED_DEVELOPMENT_READINESS_REPORT_v1.0.md)
12. [Phase 0 Architecture Adoption Codex Pack v1.3](plans/PHASE_00_ARCHITECTURE_ADOPTION_CODEX_PACK_v1.3.md)

## Repository governance

- [Repository responsibility and synchronization policy](architecture/repository-responsibility.md)
- [Deterministic adoption manifest](architecture/adoption-manifest.json)
- [Architecture adoption verifier](../scripts/verify-architecture-adoption.mjs)

ADO and Manufacturing OS must consume versioned platform-contract packages or adopt synchronized document copies pinned to the exact versions and SHA-256 values in the manifest. Unversioned URLs and imports of another repository's internal domain packages are prohibited.
