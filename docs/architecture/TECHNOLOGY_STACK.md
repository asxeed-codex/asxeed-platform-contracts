# ASXEED TECHNOLOGY STACK v1.0

**対象:** ADO / ASXEED Manufacturing OS / ASXEED Platform Contracts  
**状態:** 正式採用  
**承認日:** 2026-07-29  
**上位基準:** `ASXEED_Architecture_Freeze_v1.1.md` / ADR-001〜ADR-024  
**関連文書:** `TECHNOLOGY_VERSION_MATRIX.md` / `TECHNOLOGY_SELECTION_RATIONALE.md` / `DEFERRED_TECHNOLOGY.md`

## 1. 目的

本書は、実装時にCodex、ADO、開発者が技術を推測・置換しないための正式な技術基準である。

選定済み技術と重複するFramework、Database、Queue、Storage、AI Provider、Drawing Library、認証方式を、Design Reviewなしに追加してはならない。

## 2. 技術選定の原則

- ADOとManufacturing OSは、TypeScript / Node.jsを共通言語・Runtimeとする。
- 外部サービスとFile FormatはAdapter境界で交換可能にする。
- 製造計算、Parts、Geometry、DrawingのSource of TruthをLibrary固有形式へ依存させない。
- 正式Versionは`TECHNOLOGY_VERSION_MATRIX.md`と各RepositoryのLockfileを正本とする。
- CodexによるMajor Version変更、代替技術の導入、重複Libraryの追加を禁止する。
- 技術Spikeが失敗した場合、Codexは別技術を勝手に採用せず、`NEEDS_DESIGN_DECISION`で停止する。

## 3. Application Stack

| 領域 | 正式採用 |
|---|---|
| 開発言語 | TypeScript |
| Runtime | Node.js 24 LTS line（初期固定VersionはVersion Matrix参照） |
| Frontend | Next.js App Router + React |
| UI | Tailwind CSS + shadcn/ui |
| Server State | TanStack Query |
| Workspace State | Zustand |
| Form | React Hook Form + Zod |
| Backend | NestJS + Fastify |
| API | REST + OpenAPI 3.1系 |
| Realtime | SSE + Polling Fallback |
| Validation | Zod + JSON Schema 2020-12 |

## 4. Repository and Toolchain

| 領域 | 正式採用 |
|---|---|
| Package Manager | pnpm |
| Monorepo Runner | Turborepo |
| Private Package Registry | GitHub Packages (`@asxeed/*`) |
| Git Hooks | Lefthook |
| Package Release | Changesets + Semantic Versioning |
| Formatting | Prettier |
| Lint | ESLint |
| CI/CD | GitHub Actions Reusable Workflows |
| Container Registry | Azure Container Registry Premium（Production / Non-production分離） |
| Azure Deploy認証 | GitHub OIDC |

## 5. Data and Persistence

| 領域 | 正式採用 |
|---|---|
| Main Database | Azure Database for PostgreSQL Flexible Server |
| ORM | Prisma ORM |
| Migration | Prisma Migrate + 承認済みRaw SQL |
| Object Storage | Azure Blob Storage |
| Cache | 初期Redisなし。Content HashによるDB / Blob再利用 |
| Vector Search | 初期対象外。将来pgvector |
| Audit | PostgreSQL Append-only Event + Immutable Blob Snapshot |
| Hash | SHA-256 |
| Internal ID | UUID v7 |
| Human-facing ID | Drawing / Release / TaskごとのDomain ID |
| Time | UTC保存、UIはAsia/Tokyo表示 |
| Pagination | Cursor方式 |

## 6. AI and PUE

| 領域 | 正式採用 |
|---|---|
| OCR / Layout | Azure AI Document Intelligence `prebuilt-layout` |
| Vision / Reasoning | 承認済みAzure AI Endpoint |
| Model Selection | ASXEED AI Model Router |
| Prompt | Git内のVersion付きPrompt Package |
| Structured Output | JSON Schema |
| Evaluation | Version付きFixture + ASXEED Eval Pipeline |
| Critical Fallback | 低品質Model・別Provider・別Regionへの自動Fallback禁止 |
| Run Trace | Prompt / Model / Schema / Source Hash / CostをImmutable Manifestへ保存 |

Model RoleはApplication Codeで次の論理名を使用し、具体的なModel名を散在させない。

```text
document_vision
manufacturing_reasoning
low_cost_classification
question_generation
development_implementation
independent_judge
```

## 7. Workflow and Workers

| 領域 | 正式採用 |
|---|---|
| Durable Workflow | Temporal Cloud |
| Worker SDK | Temporal TypeScript SDK |
| Internal Queue | Temporal Task Queue |
| External Event Bus | 初期なし。外部連携開始時にAzure Service Bus |
| Scheduler | Temporal Schedule |
| Human Wait | Temporal Signal / Update |
| Job Progress | Temporal Query + SSE |
| Retry | Error種別別Policy |
| Idempotency | 全Activity・Mutationで必須 |

共通Job Contractは次を必須Fieldとする。

```text
jobId
workflowId
taskId
traceId
attempt
priority
timeout
costLimit
cancellationPolicy
organizationId
```

## 8. Manufacturing Technology

| 領域 | 正式採用 |
|---|---|
| Rule | 型付き宣言的AST |
| Decimal | decimal.js |
| Unit | mm中心の単位付きValue Object |
| Parts | Stable Semantic Part ID |
| Shape Source of Truth | Geometry Model |
| Drawing Representation | Drawing Model |
| Browser Drawing | Semantic SVG |
| Manufacturing PDF | Drawing Model → PDFKit Adapter |
| Business PDF | Playwright / Chromium PDF |
| DXF | ASXEED DXF Adapter + `@node-projects/acad-ts`、AC1032 / AutoCAD 2018 ASCII |
| Legacy DXF | ASXEED最小R12-style ASCII Serializer |
| BOM | Parts ModelからCSV / JSON |
| 3D | Three.js + React Three Fiber |
| 3D Artifact | GLB |
| Image Processing | Sharp |
| Detailed CAD Kernel | 後段でOpenCascade.js |
| STEP / CAM / IFC | Adapterとして後段追加 |

### 8.1 Manufacturing PDF Policy

製作用PDFはBrowser PrintをSource of Truthにしない。

```text
Drawing Model
→ DrawingPdfAdapter
→ PDFKit
→ Vector PDF
```

Drawing Adapterは寸法を再計算せず、Drawing Model Primitiveだけを描画する。

### 8.2 DXF Policy

```text
Drawing Model
→ ASXEED DXF Adapter
→ acad-ts
→ AC1032 ASCII DXF
```

DXFはGeometryの正本ではない。Parser Round-trip、Semantic Dimension、Layer、Entity、Fixtureで検証する。

## 9. Cloud and Infrastructure

| 領域 | 正式採用 |
|---|---|
| Cloud | Microsoft Azure |
| Application Runtime | Azure Container Apps |
| IaC | Bicep |
| Public Entry | Azure Front Door Premium + WAF |
| Network | VNET + Private Endpoint |
| Secret | Azure Key Vault |
| Service Identity | Managed Identity |
| Human Auth | Microsoft Entra ID + MFA |
| External User | 将来Microsoft Entra External ID |
| Primary Region | Japan East |
| Core DR Region | Japan West |
| Environment | Development / Staging / Pilot / Production / Demo分離 |
| Deployment | Container Apps Revision |
| Cost | Azure Cost Management + ADO Cost Attribution |

AI DeploymentはRegionごとに利用可能性が異なるため、Core Regionから独立して承認・固定する。

## 10. Security

| 領域 | 正式採用 |
|---|---|
| Authorization | NestJS Guard + Domain Policy |
| Session | Entra Token。独自Password認証なし |
| Security Header | Helmet |
| Rate Limit | Front Door + APIの二層 |
| Malware Scan | Microsoft Defender for Storage |
| Dependency Scan | Dependabot / GitHub Security機能 |
| Secret Scan | GitHub Secret Scanning |
| Container Scan | ACR / Microsoft Defender |
| Feature Flag | PostgreSQL上の型付き最小Service |

## 11. Logging and Observability

| 領域 | 正式採用 |
|---|---|
| Application Logger | Pino + `nestjs-pino` |
| Log Format | Structured JSON |
| Telemetry Standard | OpenTelemetry |
| Backend | Azure Monitor Application Insights |
| Dashboard | Azure Workbooks + ADO Dashboard |
| Alert | Azure Monitor Alert + ADO Incident Workflow |
| Audit | Domain Audit Event。Application Logと分離 |

Pino LogにはTrace ID、Job ID、Task IDを関連付け、PDF本文、Evidence、Prompt全文、Secret、Signed URLを記録しない。

## 12. Test and Quality

| 領域 | 正式採用 |
|---|---|
| Unit / Integration | Vitest |
| Property Testing | fast-check |
| Browser E2E | Playwright |
| Component Test | Vitest + Testing Library |
| Database Integration | Testcontainers |
| Workflow Test | Temporal Testing Suite |
| Visual Regression | Playwright Screenshot + Semantic Validation |
| Load Test | k6 |
| CI | GitHub Actions |
| Release Artifact | OCI Container Image + SBOM + Attestation |

## 13. Product Operations

| 領域 | 正式採用 |
|---|---|
| Email | Azure Communication Services Email |
| Push | Web Pushを後段追加 |
| SMS | Critical用途だけ後段評価 |
| PDF Preview | `pdfjs-dist` |
| Drawing Preview | Semantic SVG |
| 3D Preview | React Three Fiber |
| Search | PostgreSQL Full Textから開始 |
| Localization | 日本語Primary、i18n可能な構造 |
| UI Font | Noto Sans JP |
| Drawing PDF Font | Noto Sans CJK JP Regular / Boldを埋込み・Subset |

## 14. 禁止事項

- 技術Spikeを行わずに代替Libraryへ変更する。
- 同じ責任のFrameworkやState Libraryを追加する。
- Product DSLへLibrary固有EntityやCAD命令を入れる。
- Browser、DXF、Three.js Meshを形状の正本にする。
- Host OS Fontへ依存して正式PDFを生成する。
- Redis、Kubernetes、GraphQL、gRPC、Service Busを測定・承認なしに導入する。
- AIのCritical処理を別Region・別Providerへ自動Fallbackする。
- CodexがPackage Publish、Major Upgrade、Production Deployを行う。

## 15. 変更手順

Technology Stack変更は次を必須とする。

```text
Change Request
→ 代替比較
→ Compatibility Spike
→ Security / License / Cost確認
→ Regression Test
→ Architecture Judge
→ Human Approval
→ Version Matrix更新
```

Major Version変更または責任境界変更はAI CTO Design Reviewを必須とする。
