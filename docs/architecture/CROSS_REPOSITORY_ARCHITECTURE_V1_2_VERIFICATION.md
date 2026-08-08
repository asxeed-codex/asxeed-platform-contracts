# Cross-repository Architecture v1.2 Verification

**Task:** `OA-00C` — Cross-repository Architecture v1.2 Verification

**Repository / agent:** `asxeed-codex/asxeed-platform-contracts` / Judge

**Risk / approval:** Critical / mandatory human checkpoint

**Architecture:** ASXEED Architecture Freeze v1.2; adopted ADR-001 through ADR-030

**Scope:** Governance and deterministic verification only
**Adoption condition:** OA-00C is not formally complete until a human reviews and merges its pinned pull request

## 1. Verification decision

The pinned Platform Contracts, ADO, and Manufacturing OS adoption states agree on Architecture Freeze v1.2. The verification package found no ownership, authority, namespace, approval, Product DSL, Rule Engine, PUE, storage, integration, or Order Engine boundary conflict.

This result is deterministic evidence, not human approval. It does not authorize OA-01 before the OA-00C human merge, and it does not approve manufacturing knowledge, Product DSL, manufacturing release, manufacturing start, production release, package publication, or deployment.

## 2. Exact repository state

| Repository | Adopted state pinned by OA-00C | Access during OA-00C |
|---|---|---|
| `asxeed-codex/asxeed-platform-contracts` | Architecture v1.2 merge `a6445ec5a7fa2e27dabcd49bc494da4b0a5c6672` | OA-00C task worktree only |
| `asxeed-codex/ado` | OA-00A merge `53dfe785de99425e22add7ab3e300ba9d3d75c1d` | Read-only |
| `asxeed-codex/asxeed-manufacturing-os` | OA-00B post-merge verification main `c34bb03766683dc5d14b3093c23313312cccbcaf` | Read-only clean verification checkout |

Manufacturing PR #26 provenance remains exact: final head `c99af6f0129f498c683c5b738d08610a5ab7f27a`, squash merge `b10cfe233d7323076cc1dec74ad3692b3ec96ad1`, and equal Git tree `869138423d9fa9b1cb1bab3dffc9ede896af7428`.

The exact repository objects, source hashes, prior human merge provenance, and historical evidence-tree identities are pinned by [the Architecture v1.2 adoption lock](cross-repository-v1.2-adoption-lock.json).

## 3. Exact authority order

All three repositories enforce the same order:

1. Architecture Freeze v1.2
2. Adopted ADR-001 through ADR-030
3. Technology Stack v1.0
4. Technology Version Matrix v1.0
5. Technology Selection Rationale v1.0
6. Deferred Technology v1.0
7. Master Implementation Plan v1.3
8. ADO Task Graph v1.3 Markdown and JSON
9. Sprint Execution Plan v1.1
10. System Responsibility Boundaries v1.1
11. Ontology Core Conceptual Model v0.1
12. Ontology Architecture Compatibility Matrix v1.0
13. Ontology Migration Strategy v1.0
14. Ontology Rollback Strategy v1.0
15. Development Readiness Report v1.0 and Phase 0 Architecture Adoption Codex Pack v1.3, interpreted through v1.2
16. Repository-specific `AGENTS.md` rules, current task instructions, and existing implementation

The verifier compares this order structurally against both consumer adoption manifests and governance profiles. Historical pre-merge status fields in the OA-00, OA-00A, and OA-00B manifests remain immutable; the exact human merge commits and merge provenance prove formal adoption.

## 4. Ownership matrix

| Boundary | Platform Contracts | ADO | Manufacturing OS | Order Engine |
|---|---|---|---|---|
| Architecture and neutral contracts | Canonical owner | Consumer | Consumer | External consumer as applicable |
| Knowledge Core runtime | Must not own | Owner | Must not own | Must not own |
| Ontology Builder orchestration | Must not own | Owner | Must not own | Must not own |
| Company / Development / Agent Ontology | Neutral contracts only | Runtime owner | Must not own | Must not own |
| Manufacturing Ontology Pack | Neutral contracts only | May propose candidates | Semantic owner | Must not own |
| Manufacturing semantic validation / Criticality | Must not own | Must not own | Owner | Must not own |
| Product DSL Generator | Provenance and compatibility contracts only | Must not own | Owner | Must not own |
| Deterministic Rule Engine | Must not own | Must not own | Owner | Must not own |
| Parts / Geometry / Drawing / 3D / BOM / release | Must not own | Must not own | Owner | Must not own |
| Customer / order / quantity / price / invoice / inventory truth | Must not own | Must not own | Must not own | Owner |

Platform Contracts remains domain-neutral and stores no operational Ontology knowledge. ADO owns Knowledge Core runtime, Ontology Builder, Company/Development/Agent Ontology, Plan DSL, knowledge-to-task, agent context, Goal/Plan/Task/Agent/Judge/Fix, and Codex coordination. Manufacturing OS owns manufacturing semantics, deterministic execution, artifacts, protected approval surfaces, and release.

## 5. Approval matrix

| Action or evidence | AI / verifier authority | Human authority |
|---|---|---|
| Evidence extraction, candidates, conflicts, questions | May perform | May direct and review |
| Deterministic validation or Ontology Judge output | Evidence only | Reviews where applicable |
| Architecture Freeze / ADR adoption | May recommend | Exclusive adoption and merge |
| Critical manufacturing knowledge | Must not finally approve | Exclusive approval |
| Required Product DSL approval | Must not finally approve | Exclusive approval |
| Manufacturing release / start | Must not approve | Exclusive decision where required |
| Production release / final merge | Must not perform | Exclusive decision |
| Authority-boundary exception | Must stop | Exclusive architecture decision |

Confidence, Judge output, verifier output, workflow completion, Snapshot generation, and DSL generation are never human approval.

## 6. Namespace and organization matrix

| Namespace | Runtime | Domain authority |
|---|---|---|
| `shared.*` | ADO Knowledge Core | Designated shared steward under Platform contracts |
| `document.*` | ADO Knowledge Core | Source-owning domain |
| `company.*` | ADO Knowledge Core | Organization / ADO policy |
| `development.*` | ADO Knowledge Core | ADO development policy |
| `agent.*` | ADO Knowledge Core | ADO agent policy |
| `manufacturing.*` | ADO Knowledge Core | Manufacturing OS policy and humans |
| `external-reference.*` | ADO Knowledge Core | Referenced source owner |

Every protected operation requires `organizationId`, explicit namespace, domain owner, and separate read, proposal, approval, and write authority. Least privilege, immutable approved snapshots, revocation, supersession, versioned cross-namespace references, and audit trace are mandatory. A shared Knowledge Core does not create unrestricted shared writes.

## 7. Product DSL boundary

Product DSL is an immutable, versioned execution artifact. It is not persistent manufacturing-knowledge truth. Manufacturing OS owns the Product DSL Generator; future Ontology-backed output is generated from an approved immutable Ontology Snapshot and carries:

- `ontologySnapshotId`
- `ontologyVersion`
- `ontologyContentHash`
- `generatorVersion`
- `evidenceReferences`
- `ruleReferences`
- `generatedAt`
- `approvalState`
- `contentHash`

Existing Product DSL remains legacy pre-Ontology content: immutable, readable, and valid under its historical contract. The future provenance fields are not imposed on that legacy format by OA-00C. Migration remains additive, dual-read, reversible, compatibility-tested, and human-gated.

## 8. Rule Engine boundary

Rule content belongs in Ontology or an approved versioned Manufacturing Ontology Pack. Deterministic evaluator behavior remains Manufacturing OS code. The Rule Engine retains typed operators, Decimal calculations, units, dependency evaluation, cycle detection, `true / false / unknown`, schema validation, deterministic execution, trace generation, and Fail Closed behavior.

The current Rule Engine is legacy pre-Ontology and unchanged. OA-00C does not claim that it reads Ontology and does not remove or replace it.

## 9. PUE current and target distinction

Current implementation:

```text
PUE
-> existing Product DSL pipeline
```

Target architecture:

```text
PUE
-> ADO Knowledge Core / Manufacturing Ontology
-> approved Manufacturing Ontology Snapshot
-> Manufacturing OS Product DSL Generator
-> Product DSL
```

The target is not implemented by OA-00C. Current PUE Evidence, Candidate, Conflict, source-priority, CLI, output, and runtime behavior remain unchanged.

## 10. Storage and integration policy

Approved initial persistence is PostgreSQL and Blob. Graph semantics are independent of physical persistence. No Graph Database is approved; adoption would require measured workload evidence, demonstrated PostgreSQL limitations, tenancy/security analysis, compatibility, migration, rollback, a new ADR, and human approval.

Cross-domain interaction uses only versioned APIs, messages, events, artifacts, or Platform Contracts packages. Direct cross-domain SQL, ORM, views, triggers, stored procedures, joins, credential sharing, consumer-internal imports, consumer source-tree dependencies, mutable URLs, branch-only authority, and `latest`-only authority are prohibited.

## 11. Historical preservation

OA-00C does not rewrite Architecture Freeze v1.1 or v1.2, Clarification 001, ADR-001 through ADR-030, the Technology Baseline, Master Plan v1.2/v1.3, Task Graph v1.2/v1.3, Sprint Plan v1.0/v1.1, existing adoption manifests, OA-00 evidence, P0 evidence, OA-00A evidence, OA-00B evidence, or the OA-00B post-merge-fix evidence.

The original dirty Manufacturing OS checkout is never used as Architecture authority. OA-00C records only its privacy-preserving `git status --porcelain=v1 -z --untracked-files=all` SHA-256 before and after verification, without recording dirty filenames or file contents.

## 12. Repository verifier results

The OA-00C evidence records actual executions of:

| Repository | Required verifier set | OA-00C result |
|---|---|---|
| Platform Contracts | Historical Architecture, historical v1.1 cross-repository, Platform governance, Ontology Architecture | Pass |
| ADO | Historical Architecture, ADO governance, ADO Ontology adoption | Pass |
| Manufacturing OS | Historical Architecture, Manufacturing governance, Manufacturing Ontology adoption | Pass |
| Cross-repository | OA-00C Architecture v1.2 verifier | Pass before human merge; post-merge path covered deterministically |

Focused mutation tests cover exact commits, missing objects, ancestry, committed and uncommitted drift, hashes, authority, ownership, approval, namespace, Product DSL, Rule Engine, PUE, storage, integration, historical evidence, PR provenance, gate lifecycle, auto-merge, human merger metadata, successor state, and navigation.

## 13. Successor gate

The stable [OA-00C gate metadata](oa-00c-gate-metadata.json) record stores only the OA-00C PR identity and policy. The verifier queries Git and GitHub for lifecycle truth:

- While the pinned PR is open and Draft, OA-01 remains blocked.
- After that same PR is human-reviewed and squash-merged without auto-merge, the verifier requires the current Platform Contracts HEAD to be the merge commit or a descendant and the PR-head tree to equal the squash-merge tree.
- Once those checks pass, OA-01 is reported `eligible-ready` without a repository edit.
- OA-02 and later remain dependency-blocked.

No Task Graph v1.4 or permanent transient PR-state record is required.

## 14. Rollback

Before OA-00C merge, close or revise the Draft PR or revert its scoped commits. After adoption, use a new scoped governance change or `git revert`; do not edit adopted Architecture or historical evidence in place. Re-run all repository and cross-repository verifiers, JSON/link validation, tests, hash checks, and consumer checks. Keep OA-01 blocked until the corrected gate is human-reviewed and merged.

## 15. Unresolved and residual risks

- OA-00C is critical-risk governance and remains subject to human review.
- The local Node runtime may differ from the frozen future application baseline `24.18.0`; OA-00C uses Node built-ins only and records the difference as a non-blocking pre-OA-01 standardization risk when checks pass.
- Live lifecycle verification requires authenticated GitHub metadata. Missing or contradictory metadata fails closed.
- Later committed or uncommitted drift on pinned adoption paths fails verification and requires a reviewed lock update or corrective task.
- This gate proves architecture/governance agreement; it does not prove future runtime safety, migration equivalence, performance, recovery, or manufacturing behavior. Those remain successor-task gates.

## 16. Human checkpoint

OA-00C remains pending mandatory human checkpoint review. A passing verifier or Judge recommendation is evidence only. An agent must not merge, enable auto-merge, publish packages, deploy, start OA-01, or represent this document as the human decision.
