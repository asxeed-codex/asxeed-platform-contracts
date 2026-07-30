# ASXEED TECHNOLOGY VERSION MATRIX v1.0

**状態:** 正式採用  
**Freeze date:** 2026-07-29  
**適用対象:** ADO / Manufacturing OS / Platform Contracts  
**正本:** 本書 + 各Repositoryの`package.json` / `pnpm-lock.yaml` / Container Digest

## 1. Version管理原則

- 本書のExact Pinは初期実装Baselineであり、「常に最新版」を意味しない。
- Repository Bootstrap後はLockfileとContainer Digestを実行上の正本とする。
- CIでは`pnpm install --frozen-lockfile`を必須とする。
- Codexによる自動Major Upgradeを禁止する。
- Security PatchもTest・Judgeを通す。緊急時はIncident手順を使う。

## 2. Initial Frozen Platform Matrix

| Component | Frozen version / line | Pin policy | 備考 |
|---|---:|---|---|
| Node.js | `24.18.0` LTS | Exact | `.nvmrc`, `.node-version`, `engines.node`, Container Digest |
| TypeScript | `6.0.3` | Exact | 初期互換性Baseline |
| pnpm | `10.34.0` | Exact | `packageManager`を固定 |
| Turborepo | `2.9.15` | Exact | Root Dev Dependency |
| Next.js | `16.2.9` | Exact | App Router |
| React | Next.js固定版と互換の`19.x` | Lockfile Exact | Spikeで解決Versionを記録 |
| NestJS | `11.1.24` | Exact | Core Package群を同じPatchへ固定 |
| Fastify | Nest Adapter互換の`5.x` | Lockfile Exact | Spikeで固定 |
| Prisma ORM / Client | `6.19.3` | Exact | Prisma 7系は初期非採用 |
| PostgreSQL | Provisioning時のAzure対応安定Major | Environment Major Pin | Phase 1 Spikeで決定 |
| Tailwind CSS | `4.x` | Lockfile Exact | Bootstrapで固定 |
| Zod | `4.x` | Lockfile Exact | Bootstrapで固定 |
| Vitest | TS 6互換Stable | Lockfile Exact | Bootstrapで固定 |
| Playwright | Bootstrap時Stable | Exact + Browser Binary | CI ImageもDigest固定 |
| Temporal TypeScript SDK | Bootstrap時Stable | Exact | Compatibility Spike必須 |
| Three.js | Bootstrap時Stable | Exact | GLTFExporterを含む |
| React Three Fiber | React 19互換Stable | Exact | Spikeで固定 |
| PDFKit | Bootstrap時Stable | Exact | Font / Scale Spike必須 |
| pdfjs-dist | Next.js 16互換Stable | Exact | Client-only Spike必須 |
| `@node-projects/acad-ts` | DXF Spike合格Version | Exact | AC1032 Round-trip必須 |
| Pino | Nest Integration対応Stable | Exact | `nestjs-pino`も固定 |
| k6 | Stable CLI / Container | Digest | CIでDigest Pin |

## 3. Required Repository Version Files

```text
.nvmrc
.node-version
package.json
pnpm-lock.yaml
pnpm-workspace.yaml
turbo.json
lefthook.yml
.changeset/
```

Root `package.json`は最低限次を持つ。

```json
{
  "packageManager": "pnpm@10.34.0",
  "engines": {
    "node": "24.18.0"
  }
}
```

## 4. Version Update Classification

| 変更 | 必須手順 |
|---|---|
| Patch | CI、Security Scan、Affected Test、Judge |
| Minor | Compatibility Test、Release Note Review、Judge、Checkpoint Approval |
| Major | Design Review、Migration Plan、Full Regression、Rollback Plan、Human Approval |
| Framework責任変更 | 新ADRまたはArchitecture Freeze更新 |
| AI Model Version | Eval、Shadow Run、Judge、Human Approval |
| OCR / CAD / PDF Engine | Golden Fixture、Artifact Diff、Pilot Review |

## 5. Environment Version Policy

- Developmentで先にVersionを検証する。
- Staging、Pilot、Productionは同一Artifact Digestを昇格する。
- Production用Imageを環境ごとにRebuildしない。
- Database Majorは環境単位で固定し、Production変更は別Taskにする。
- Primary / DRのApplication Versionを明示的に管理する。

## 6. Phase 1で固定するVersion

次のExact Versionは互換性Spike成功後に本書へ追記する。

1. React
2. Fastify
3. PostgreSQL Major
4. Tailwind CSS
5. Zod
6. Vitest
7. Playwright
8. Temporal TypeScript SDK
9. Three.js
10. React Three Fiber
11. PDFKit
12. pdfjs-dist
13. acad-ts
14. Pino / nestjs-pino
15. k6 Container Digest

Spike失敗時は別Libraryを自動採用せず、Design Reviewへ戻す。

## 7. Version Matrix Verification Artifact

各RepositoryはCIで次を出力する。

```text
technology-version-report.json
```

最低限の内容：

```json
{
  "node": "24.18.0",
  "packageManager": "pnpm@10.34.0",
  "lockfileHash": "sha256:...",
  "containerDigest": "sha256:...",
  "approvedMatrixVersion": "1.0",
  "status": "pass"
}
```
