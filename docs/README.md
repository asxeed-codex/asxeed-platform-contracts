# Governance index

This repository is the canonical source for shared ASXEED architecture governance. The v1.1 authorities remain immutable and pinned by [the historical adoption manifest](architecture/adoption-manifest.json). The proposed OA-00 v1.2 package becomes effective only after human checkpoint review and merge.

## Proposed v1.2 authority hierarchy after human merge

1. [Architecture Freeze v1.2](architecture/ASXEED_Architecture_Freeze_v1.2.md)
2. ADR-001 through ADR-030; canonical proposed files: [ADR-025](architecture/adrs/ADR-025_ONTOLOGY_CORE_EMBEDDED_IN_ADO.md), [ADR-026](architecture/adrs/ADR-026_ADO_AS_ONTOLOGY_BUILDER_AND_KNOWLEDGE_ORCHESTRATOR.md), [ADR-027](architecture/adrs/ADR-027_DOMAIN_ONTOLOGY_OWNERSHIP_AND_APPROVAL_BOUNDARIES.md), [ADR-028](architecture/adrs/ADR-028_PUE_ONTOLOGY_DSL_ARCHITECTURE.md), [ADR-029](architecture/adrs/ADR-029_DSL_AS_VERSIONED_EXECUTION_ARTIFACT.md), and [ADR-030](architecture/adrs/ADR-030_SHARED_KNOWLEDGE_GRAPH_NAMESPACE_AND_ACCESS_CONTROL.md)
3. [Technology Stack v1.0](architecture/TECHNOLOGY_STACK.md)
4. [Technology Version Matrix v1.0](architecture/TECHNOLOGY_VERSION_MATRIX.md)
5. [Technology Selection Rationale v1.0](architecture/TECHNOLOGY_SELECTION_RATIONALE.md)
6. [Deferred Technology v1.0](architecture/DEFERRED_TECHNOLOGY.md)
7. [Master Implementation Plan v1.3](plans/MASTER_IMPLEMENTATION_PLAN_v1.3.md)
8. [ADO Task Graph v1.3 (Markdown)](plans/ADO_TASK_GRAPH_v1.3.md) and [JSON](plans/ADO_TASK_GRAPH_v1.3.json)
9. [Sprint Execution Plan v1.1](plans/SPRINT_EXECUTION_PLAN_v1.1.md)
10. [System Responsibility Boundaries v1.1](architecture/SYSTEM_RESPONSIBILITY_BOUNDARIES_v1.1.md)
11. [Ontology Core Conceptual Model v0.1](architecture/ONTOLOGY_CORE_CONCEPTUAL_MODEL_v0.1.md)
12. [Ontology Architecture Compatibility Matrix v1.0](architecture/ONTOLOGY_ARCHITECTURE_COMPATIBILITY_MATRIX_v1.0.md)
13. [Ontology Migration Strategy v1.0](architecture/ONTOLOGY_MIGRATION_STRATEGY_v1.0.md)
14. [Ontology Rollback Strategy v1.0](architecture/ONTOLOGY_ROLLBACK_STRATEGY_v1.0.md)

Before OA-00 human merge, [Architecture Freeze v1.1](architecture/ASXEED_Architecture_Freeze_v1.1.md), [Clarification 001](architecture/ARCHITECTURE_FREEZE_v1.1_CLARIFICATION_001.md), and ADR-001 through ADR-024 remain the highest formally adopted authority.

## OA-00 architecture package

- [Architecture decision report](architecture/ADO_ONTOLOGY_ARCHITECTURE_DECISION_REPORT_v1.0.md)
- [P0-T02C / PR #26 transition plan](plans/P0_T02C_ONTOLOGY_TRANSITION_PLAN_v1.0.md)
- [Ontology architecture manifest](architecture/ontology-architecture-manifest-v1.0.json)
- [Ontology architecture verifier](../scripts/verify-ontology-architecture.mjs)

## Repository governance

- [Platform Contracts agent governance](../AGENTS.md)
- [Machine-readable Platform Contracts agent-governance profile](architecture/platform-contracts-agents-governance.json)
- [Platform Contracts agent-governance verifier](../scripts/verify-platform-contracts-agents-governance.mjs)
- [Repository responsibility and synchronization policy](architecture/repository-responsibility.md)
- [Deterministic adoption manifest](architecture/adoption-manifest.json)
- [Architecture adoption verifier](../scripts/verify-architecture-adoption.mjs)
- [P0-T01D cross-repository adoption lock](architecture/cross-repository-adoption-lock.json)
- [P0-T01D cross-repository verification report](reports/P0_T01D_CROSS_REPOSITORY_VERIFICATION.md)
- [Cross-repository adoption verifier](../scripts/verify-cross-repository-architecture-adoption.mjs)

## OA-00C cross-repository Architecture v1.2 gate

- [Cross-repository Architecture v1.2 verification](architecture/CROSS_REPOSITORY_ARCHITECTURE_V1_2_VERIFICATION.md)
- [Cross-repository v1.2 adoption lock](architecture/cross-repository-v1.2-adoption-lock.json)
- [Cross-repository Ontology adoption verifier](../scripts/verify-cross-repository-ontology-adoption.mjs)

ADO and Manufacturing OS must consume versioned platform-contract packages or adopt synchronized document copies pinned to the exact versions and SHA-256 values in the manifest. Unversioned URLs and imports of another repository's internal domain packages are prohibited.
