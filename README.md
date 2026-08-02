# ASXEED Platform Contracts

Canonical shared governance and, in later phases, versioned platform contracts for ASXEED.

The Phase 0 architecture and technology baseline is indexed in [docs/README.md](docs/README.md). The canonical adoption record is [docs/architecture/adoption-manifest.json](docs/architecture/adoption-manifest.json), and repository ownership rules are defined in [docs/architecture/repository-responsibility.md](docs/architecture/repository-responsibility.md).

Repository agent behavior is governed by [AGENTS.md](AGENTS.md), recorded in the [Platform Contracts agent-governance profile](docs/architecture/platform-contracts-agents-governance.json), and checked by the [deterministic governance verifier](scripts/verify-platform-contracts-agents-governance.mjs).

P0-T01D cross-repository evidence is recorded in the [verification report](docs/reports/P0_T01D_CROSS_REPOSITORY_VERIFICATION.md) and pinned by the [cross-repository adoption lock](docs/architecture/cross-repository-adoption-lock.json).

Run the deterministic governance check with:

```sh
node scripts/verify-architecture-adoption.mjs
node scripts/verify-cross-repository-architecture-adoption.mjs
```

P0-T01D remains `checkpoint-review-required`, P0-T02 remains `not-started`, and Phase 1 work must not begin until `P0-GATE` has human approval.
