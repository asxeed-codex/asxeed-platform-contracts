# ASXEED MASTER IMPLEMENTATION PLAN v1.2

**対象:** ADO / ASXEED Manufacturing OS / Platform Contracts  
**上位基準:** `ASXEED_Architecture_Freeze_v1.1.md`  
**基準日:** 2026-07-29  
**状態:** Architecture Freeze準拠・実装開始基準  
**計画Owner:** レウ  
**AI CTO:** ぴーちゃん  

---

## 1. 本計画の目的

本計画は、Architecture Freeze v1.1とTechnology Baseline v1.0で採用されたADR-001〜ADR-024を、実装可能なフェーズ、成果物、依存関係、Acceptance Criteria、Judge条件へ変換する最上位実装計画である。

最優先目標は、完璧な汎用製品を先に作ることではない。最初の実商品について、次の一気通貫動作をCloud上で成立させることである。

```text
機密仕様書
→ PUE
→ Evidence / Candidate / Conflict
→ Human Review
→ Approved Product DSL
→ W・H・Option入力
→ Deterministic Rule Engine
→ Parts Model
→ Geometry Model
→ 組立図・部材製作図・3D
→ Drawing Approval
→ Released Manufacturing Package
```

同時にADOを、次の承認駆動型実行基盤として実用化する。

```text
Goal
→ Plan
→ Task Graph
→ Codex実装
→ 自己検証
→ 5-layer Judge
→ Fix Loop
→ スマートフォン承認
→ Merge
→ Staging / Pilot Release
```

---

## 2. 計画上の最上位ルール

### 2.1 文書階層

実装判断の優先順位は次のとおりとする。

1. `ASXEED_Architecture_Freeze_v1.1.md`
2. ADR-001〜ADR-024
3. `TECHNOLOGY_STACK.md` / `TECHNOLOGY_VERSION_MATRIX.md` / `TECHNOLOGY_SELECTION_RATIONALE.md` / `DEFERRED_TECHNOLOGY.md`
4. 本書 `MASTER_IMPLEMENTATION_PLAN_v1.2.md`
5. `SYSTEM_RESPONSIBILITY_BOUNDARIES_v1.0.md`
6. `SPRINT_EXECUTION_PLAN_v1.0.md`
7. `ADO_TASK_GRAPH_v1.2.md`
6. `PHASE_XX_CODEX_PACK_vX.Y.md`
9. ADO Task
8. Codex実装

下位文書または実装が上位文書と衝突する場合、作業を停止してAI CTO Design Reviewへ戻す。

### 2.2 絶対禁止事項

- 商品名による図面・3D・寸法・部材生成の個別分岐
- Product DSLへの顧客、案件、数量、価格、請求、在庫、CAD命令、座標の混入
- Drawing、3D、BOMによる独立寸法計算
- EvidenceなしCandidateの下流流入
- ConfidenceをApprovalとして扱うこと
- Conflict、Unknown、未承認Critical値の無言削除・補完
- ADOとManufacturing OSの相互Domain DB直接参照
- CodexへのMain Merge、Production Deploy、Production Data、Production Secret付与
- Testを通すためのGolden Fixture期待値自動更新
- ArchitectureまたはSecurity失敗をAIの総合判断で上書きすること
- Portal手動設定をInfrastructureの正式正本とすること
- Public DemoからProduction環境へ接続すること

---

## 3. 完成対象

### 3.1 最初の対象商品

Sprint 2.5で使用した実仕様書の商品を対象とする。

- ガラス入り片開き扉
- 標準枠
- 扉、枠、ガラス開口、ガラス、ガラス枠
- 標準W・Hを仕様書から取得
- UIでW・Hおよび許可されたOptionを変更可能

### 3.2 Prototype Definition of Done

次をすべて満たした時点で、実用プロトタイプ完成とする。

1. 機密PDFをQuarantine経由で安全に投入できる。
2. OCR、Evidence、Candidate、Conflict、Missing InfoがVersion付きArtifactとして生成される。
3. Critical項目を人間が確認し、Approved Product DSLを作成できる。
4. Reference DSLとPUE生成DSLが同じProduct DSL Contractを満たす。
5. W・HをUIで変更すると、Rule Result、Parts、Geometry、図面、3Dが再生成される。
6. Rule、Parts、Geometry、Drawing、3D、部材表のSemantic Dimensionが一致する。
7. 組立図、断面図、枠・扉・ガラス枠の部材製作図、部材表を生成できる。
8. SVG、PDF、AutoCAD 2018 ASCII DXF、GLBを出力できる。
9. 図面と3Dで同一部材を双方向選択できる。
10. 未承認Critical値、公差不足、Rule違反がある場合は製作用Releaseを停止する。
11. 4段階の製造承認を通し、Immutable Release Packageを発行できる。
12. ADOがTask実行、Codex検証、5層Judge、最大2回のFix Loop、Human Approvalを実行できる。
13. Codex実装の証拠がVerification Artifactとして保存される。
14. StagingからPilotへ段階Releaseし、旧RevisionへRollbackできる。
15. 実仕様書を使ったEnd-to-End Pilotを完走する。

### 3.3 Stretch Definition of Done

Prototype完了後、同じArchitecture上で次を追加する。

- 板厚を持つ実形状
- 曲げ形状と曲げ指示
- チリ、呑込み、納まり
- 孔、切欠き、補強、接合
- OpenCascade.jsによるBoolean / B-Rep
- STEP出力
- Machine-neutral Manufacturing Operation Model
- asxeed-order-engineとの自動連携
- 匿名化Customer Demo

---

## 4. 現在地点

### 4.1 完了済み

- Sprint 0：Repository棚卸し
- Sprint 1：DSL Repository、Versioning、Approval、AuditのKnowledge Layer
- Sprint 2：Executable PUE Pipeline
- Sprint 2.5：Plain-text PUE
- 実仕様書を使ったPUE End-to-End実行
- Candidate without Evidence = 0などのSafety Gate
- Draft DSLのまま停止し、誤ったApproved DSLを生成しないFail-safe動作
- Product DSL MVP Flow
- ADO基本CLI、Goal、Plan、Task、Judge、Reviewの基礎

### 4.2 現在の主要Gap

- W、WW、DW、KW等のDimension Identity崩壊
- Scope、Condition、Applicabilityの欠落
- Conflictの下流消失
- Fallback EvidenceとPlaceholderの混入
- Evidence LocatorとCoverage不足
- Missing Infoと質問生成の品質不足
- Draft DSLへの誤製造知識混入
- Reference DSLからDrawing・3Dまでの正式Vertical Slice未完成
- Cloud Foundation、Temporal、PostgreSQL、Blob、Identityの未構築
- ADO 5-layer JudgeとスマートフォンApprovalの未完成

### 4.3 開発戦略

次の2 Trackを並行し、Phase 5で接続する。

```text
Track A：PUE Safety Track
実仕様書 → Evidence / Candidate / Conflict → Draft DSL

Track B：Downstream Vertical Slice Track
Human-reviewed Reference DSL → Rule → Parts → Geometry → Drawing / 3D

Integration
PUE Draft DSL → Human Review → Approved DSL → Track Bへ接続
```

PUE精度の完成を待って下流開発を止めてはならない。下流はReference DSLで先に完成させる。

---

## 5. Repository構成

### 5.1 Repositories

```text
asxeed-codex/ado
asxeed-codex/asxeed-manufacturing-os
asxeed-codex/asxeed-platform-contracts
```

### 5.2 共通技術基盤

- Node.js / TypeScript
- pnpm Workspace
- Turborepo
- GitHub Actions
- Azure Container Apps
- NestJS + Fastify
- Temporal Cloud
- Azure PostgreSQL Flexible Server
- Prisma
- Azure Blob Storage
- Microsoft Entra ID
- Azure Key Vault
- OpenTelemetry + Azure Monitor
- Bicep

### 5.3 Repository間依存

```text
platform-contracts
      ↑       ↑
     ADO   Manufacturing OS
```

ADOとManufacturing OSは互いを直接importしない。共通ContractはVersion付きPrivate Packageとして利用する。

---


## 5.4 Program / Track Operating Model

本計画は2つのSystemを3つの大型Programとして運用する。

| Program | 役割 | 主なPhase / Track |
|---|---|---|
| `PROGRAM-1` | ADO - 作るAI / AI Company OS | ADO Control Plane MVP、Advanced Operations |
| `PROGRAM-2` | Manufacturing OS Core - 製造OSの頭脳 | Reference DSL Track、PUE Safety Track、Drawing / 3D Core、Order Adapter |
| `PROGRAM-3` | Manufacturing OS Product UI / UX - 人が使う製品 | Manufacturing Workspace、2D / 3D連動、Approval UI、Public Demo |
| `COMMON-FOUNDATION` | 3 Program共通基盤。第4の製品Programではない | Architecture、Contracts、Cloud、Security、CI、Observability、Technology Spike |

### 実行順

```text
Architecture / Contract / Cloud Foundation
→ ADO Control Plane MVP開始
→ PROGRAM-1 / PROGRAM-2 / PROGRAM-3を依存関係に従い並行
→ End-to-End Pilot
→ Order Integration / Customer Demo
```

Program番号は責任領域を示し、完全な直列順序を示さない。

### Manufacturing Coreの並行Track

```text
TRACK-PUE-SAFETY
実仕様書 → Evidence / Candidate / Conflict → Draft DSL

TRACK-REFERENCE-DSL
Human-reviewed Reference DSL → Rule → Parts → Geometry → Drawing / 3D
```

PUE精度の完成を待ってReference DSL Trackを停止しない。


## 5.5 Formal Technology Baseline

実装技術の正本は次の4文書とする。

- `TECHNOLOGY_STACK.md`
- `TECHNOLOGY_VERSION_MATRIX.md`
- `TECHNOLOGY_SELECTION_RATIONALE.md`
- `DEFERRED_TECHNOLOGY.md`

Phase 1では、Repository Bootstrapと並行して次の7件のTechnology Compatibility Spikeを実施する。

1. PDFKitによる製作用PDFの用紙・Scale・日本語Font検証
2. acad-tsによるAC1032 DXF Write / Read / External Viewer検証
3. Next.js / React / pdfjs-dist Client Boundary検証
4. NestJS / Fastify / Pino / OpenTelemetry Trace検証
5. Prisma / PostgreSQL JSONB・Transaction・Migration検証
6. GitHub PackagesのRepository間Publish / Consume検証
7. Japan East Provision / Japan West DR Reconstruction検証

Spike失敗はTechnologyの自動置換を許可しない。Design Reviewへ戻す。

## 6. 全体実装フェーズ

| Phase | 名称 | 主目的 | Exit Result |
|---|---|---|---|
| 0 | Architecture Adoption | FreezeをRepository・CI・ADOへ反映 | Architecture違反を検出可能 |
| 1 | Platform Foundation | Contract、Cloud、Security、Workflow基盤 | Cloud上で安全なJobを実行可能 |
| 2 | Reference DSL Vertical Slice | Rule、Parts、Geometryを完成 | 同一入力から決定論的形状生成 |
| 3 | Drawing・3D・Manufacturing UI | 製作用図面、3D、UIを完成 | 寸法変更から図面・3D再生成 |
| 4 | ADO Execution・Judge Loop | 自動実装、検証、承認、Release | 人間は証拠を見て承認可能 |
| 5 | PUE Safety・AI Integration | 実仕様書解析を安全にDSLへ接続 | PUE DraftからApproved DSLへ移行可能 |
| 6 | End-to-End Pilot | 実商品を一気通貫で検証 | Released Manufacturing Package発行 |
| 7 | Order Integration・Public Demo | 既存資産連携と顧客公開 | Demo・Web・Order連携稼働 |

---

# Phase 0：Architecture Adoption

## 7. 目的

Architecture Freezeを、参照文書ではなく実際のRepository RuleとJudge条件に変換する。

## 7.1 Workstreams

### P0-W1：Architecture Documents

各Repositoryへ配置する。

- Architecture Freeze
- 対象ADR
- Master Implementation Plan
- Repository Responsibility
- Dependency Rules
- Prohibited Patterns
- Definition of Done

### P0-W2：AGENTS.md更新

Codexへ次を強制する。

- ADR参照
- 商品固有コード禁止
- Source of Truth遵守
- TestとArtifact生成
- Architecture判断が必要な場合の停止
- PRとVerification Reportの形式

### P0-W3：Architecture Judge Skeleton

最初に検出するルール：

- ADOからManufacturing Packageの直接import
- ManufacturingからADO内部Packageの直接import
- `productName`による描画・3D分岐
- Product DSLへの禁止Field
- Drawing／3D内の寸法再計算
- EvidenceなしCandidate
- `eval`または任意Rule Code

## 7.2 Deliverables

- `docs/architecture/ASXEED_Architecture_Freeze_v1.1.md`
- `docs/plans/MASTER_IMPLEMENTATION_PLAN_v1.2.md`
- 各Repositoryの`AGENTS.md`
- `architecture-rules.json`
- Architecture Judge初期実装
- `ADO_TASK_GRAPH_v1.2.md` / `.json`
- Technology Baseline 4文書

## 7.3 Exit Criteria

- 3 RepositoryがArchitecture Freezeを参照している。
- Codex Task TemplateがADR番号を必須入力にしている。
- Architecture Judgeが最低7種類の違反を検出する。
- CIでArchitecture CheckがRequired Checkになっている。

---

# Phase 1：Platform Foundation

## 8. 目的

ADOとManufacturing OSが、安全なCloud上でVersion付きContract、Job、Artifact、Traceを共有できる基盤を構築する。

## 8.1 Workstreams

### P1-W1：Platform Contracts

実装するContract：

- Job Contract
- Artifact Contract
- Trace Contract
- Error Contract
- Approval Base Contract
- Verification Artifact Contract
- Domain Event Envelope
- Version Contract
- Organization Scope

### P1-W2：Repository Foundation

- pnpm Workspace
- Turborepo
- Node / pnpm Version固定
- Shared TypeScript Config
- ESLint / Format / Build
- Vitest
- Reusable GitHub Actions
- Draft PR Template

### P1-W3：Cloud Infrastructure

Bicepで構築：

- Resource Groups
- VNET / Private Endpoint
- Container Apps Environment
- API / Worker Runtime
- PostgreSQL
- Blob Storage
- Key Vault
- Managed Identity
- Front Door / WAF
- Azure Monitor
- Budget / Tag / Policy

### P1-W4：Identity・Security

- Entra ID Login
- MFA Policy
- Role Contract
- Managed Identity
- Key Vault参照
- Signed URL
- Quarantine Container
- Malware Scan Integration
- Audit Event

### P1-W5：Durable Workflow

- Temporal Namespace
- APIとWorkerの分離
- Job Start
- Progress
- Signal / Update / Query
- Retry / Timeout
- Cancel / Resume
- Idempotency
- SSE + Polling

### P1-W6：Persistence・Observability

- Prisma Schema
- Domain別DB Schema
- Immutable Snapshot Base
- Artifact Metadata
- Transaction Outbox
- OpenTelemetry
- Trace / Metric / Structured Log
- Cost Attribution


### P1-W7：Technology Compatibility Spikes

- Manufacturing PDF：PDFKit、用紙、Scale、日本語Font
- DXF：acad-ts、AC1032 Round-trip、External Viewer Fixture
- Frontend：Next.js、React、pdfjs-dist Client Boundary
- Backend：NestJS、Fastify、Pino、OpenTelemetry
- Persistence：Prisma、PostgreSQL、JSONB、Transaction、Migration
- Package：GitHub Packages Publish / Consume
- Region：Japan East Provision、Japan West DR再構築

失敗したSpikeは`NEEDS_DESIGN_DECISION`とし、別Libraryへの自動変更を禁止する。

## 8.2 Parallelization

```text
P1-W1 Contracts ─────────────┐
P1-W2 Repository ────────────┼→ Integration
P1-W3 Infrastructure ────────┤
P1-W4 Security ──────────────┤
P1-W5 Temporal ──────────────┤
P1-W6 Persistence / Trace ───┘
```

Contractを先行させ、各WorkstreamはContract Mockで並行実装する。

## 8.3 Deliverables

- `@asxeed/platform-contracts`
- Development環境
- Staging環境Skeleton
- Authenticated API
- Temporal Job Demo
- PostgreSQL / Blob接続
- Audit / Trace Demo
- Verification Artifact保存

## 8.4 Exit Criteria

- LoginからJob実行、進捗表示、Artifact保存までCloud上で動く。
- APIとWorkerが別Containerで稼働する。
- SecretがRepositoryとLogに存在しない。
- Public Access禁止ResourceがPolicyで検証される。
- Job再試行で重複Artifactが生成されない。
- TraceからAPI、Workflow、Worker、Artifactを追跡できる。

---

# Phase 2：Reference DSL Vertical Slice

## 9. 目的

AIに依存せず、人間確認済みReference DSLから製造ロジックの中核を完成させる。

## 9.1 Input Baseline

- ガラス入り片開き扉＋標準枠
- Reference Product DSL v1
- 標準W・H
- ガラス開口
- 扉、枠、ガラス、ガラス枠
- 最小限の材質、板厚、Rule、Constraint

## 9.2 Workstreams

### P2-W1：Product DSL Contract

- Core Schema
- Namespaced Extension
- Semantic Version
- Migration Harness
- Approval State
- Evidence Reference
- Part Template
- Rule AST

### P2-W2：Instance Contract

- W / H
- Option
- 吊元
- 開き方向
- Override Policy
- Version / Hash

### P2-W3：Deterministic Rule Engine

- Decimal Value Object
- Unit
- AST Evaluator
- Dependency Graph
- Topological Sort
- true / false / unknown
- Constraint / Prohibition / Requirement
- Readiness
- Trace

### P2-W4：Parts Model

- Stable Semantic Part ID
- Assembly Tree
- Material / Thickness
- Quantity
- Cut Dimension
- Part Operation
- Joint / Bend / Hole / Cutout Skeleton

### P2-W5：Geometry Model

- Coordinate Contract
- Geometry Entity
- Anchor
- Bounding Box
- Transform
- Part Mapping
- Door / Frame / Glass Geometry

### P2-W6：Cross-model Validation

- DSL → Rule
- Rule → Parts
- Parts → Geometry
- Dimension一致
- Hash / Trace
- Golden Fixture
- Property-based Test

## 9.3 Deliverables

- Approved Reference DSL v1
- Rule Result JSON
- Parts Model JSON
- Geometry Model JSON
- Rule Trace Viewer用Data
- Golden Fixture Set
- Benchmark Report

## 9.4 Exit Criteria

- 同一入力＋同一Engine Versionから同一Hashの結果が生成される。
- W・H変更でRule、Parts、Geometryが1秒以内を目標に再生成される。
- 商品名による分岐が存在しない。
- Unknownが正しく下流ReadinessをBlockする。
- 最小・最大・範囲外FixtureがPASSする。
- Rule、Parts、Geometryの寸法が完全一致する。

---

# Phase 3：Drawing・3D・Manufacturing UI

## 10. 目的

Reference DSL Vertical Sliceを、実際に確認・承認できる図面、3D、UIへ拡張する。

## 10.1 Workstreams

### P3-W1：Drawing Model

- Sheet
- View
- Section
- Dimension
- Annotation
- Layer
- Title Block
- Revision
- Drawing Profile

### P3-W2：Drawing Output

- SVG
- PDF
- AutoCAD 2018 ASCII DXF
- Compatibility DXF
- Font / Page / Scale検証
- DXF再読込検証

### P3-W3：3D Viewer

- Three.js / React Three Fiber
- Part Mesh
- OrbitControls
- Front / Side / Top
- Section / Transparency
- GLB Export
- Stable Part Selection

### P3-W4：Manufacturing Workspace

```text
左：W・H・Option入力
中央：2D / 3D
右：Part / Dimension Inspector
下：Rule / Evidence / Warning / History
```

### P3-W5：2D / 3D / Parts連動

- semanticId
- partId
- 双方向Highlight
- Drawingから3D選択
- 3Dから該当Sheetへ移動
- DimensionからRule Trace表示

### P3-W6：Drawing Release Gate

- 公差
- 材質
- 板厚
- 接合
- Required Sheet
- Cross-output Dimension
- Draft Watermark
- Revision / Hash

## 10.2 必須図面

1. 完成品組立図
2. 納まり・断面図
3. 枠製作図
4. 扉製作図
5. ガラス枠・関連部材図
6. 部材表・加工表

## 10.3 Deliverables

- Drawing Model v1
- SVG Viewer
- PDF Export
- DXF Export
- GLB Export
- Manufacturing Workspace
- 2D / 3D Linked Selection
- Drawing Judge

## 10.4 Exit Criteria

- W・H変更後、図面と3Dが同じGeometryから再生成される。
- Drawing、3D、Parts、Geometryの寸法が一致する。
- 図面の寸法からRuleとEvidenceまで追跡できる。
- 公差またはCritical情報不足時にReleaseできない。
- SVG、PDF、DXF、GLBが自動検証を通る。
- DraftとReleased Artifactが明確に区別される。

---

# Phase 4：ADO Execution・Judge Loop

## 11. 目的

Codexが実装と検証を行い、ADOが独立JudgeとHuman Approvalを統制する実用フローを完成させる。

## 11.1 Workstreams

### P4-W1：Goal・Plan・Task Graph

- Goal Intake
- Plan Import / Generate
- Task Dependency
- Readiness
- Risk
- Required ADR
- Acceptance Criteria

### P4-W2：Codex Runner

- Temporary Isolated Runner
- Repository / Branch Scope
- Credential Scope
- Implementation
- Command Execution
- Draft PR
- Verification Artifact

### P4-W3：5-layer Judge

1. Build Judge
2. Test Judge
3. Architecture Judge
4. Security Judge
5. Product Judge

### P4-W4：Policy Gate・Fix Loop

- Deterministic Result
- Auto Continue
- Max 2 Fix Attempts
- Needs Design Decision
- Needs Human Approval
- Cost / Runtime Limit

### P4-W5：Approval Inbox

- Smartphone Responsive UI
- Change Summary
- Test / Judge
- Risk / Cost
- Artifact
- Rollback
- Approve / Reject / Hold / Return

### P4-W6：Release・Rollback

- GitHub Required Checks
- Main Merge Gate
- Staging
- Pilot
- Container Apps Revision
- Rollback
- Audit / Incident

## 11.2 Verification Artifacts

- `implementation-summary.json`
- `commands-executed.json`
- `test-results.json`
- `architecture-report.json`
- `security-report.json`
- `product-report.json`
- `changed-files.json`
- `dependency-changes.json`
- `risk-report.json`
- `cost-report.json`
- `rollback-plan.json`
- `judge-summary.json`

## 11.3 Exit Criteria

- TaskがCodex Runnerで実装され、Draft PRまで到達する。
- Codex ContextとJudge Contextが分離される。
- 5 Judgeの必須失敗をPolicy Gateが上書きしない。
- Fixが2回失敗するとHumanまたはDesign Reviewへ戻る。
- スマートフォンからVersionとHashを確認して承認できる。
- Codex、Judge、ADOにMerge権限がない。
- Approval後にStagingへReleaseし、旧RevisionへRollbackできる。

---

# Phase 5：PUE Safety・AI Integration

## 12. 目的

実仕様書から、安全にReview可能なDraft Product DSLを生成し、Phase 2〜3へ接続する。

## 12.1 Workstreams

### P5-W1：Secure Document Intake

- Quarantine
- File Validation
- Malware Scan
- Source Hash
- Page Manifest
- Confidential Access

### P5-W2：OCR・Layout

- Azure Document Intelligence
- Page / Table / Figure
- Bounding Polygon
- Text Span
- OCR Confidence

### P5-W3：Evidence Contract

- Source Locator
- Crop
- Parsed Value
- Semantic Target
- Scope
- Condition
- Provider / Model Version
- Trace

### P5-W4：Dimension Identity Safety

- W / WW / DW / KW等のIdentity辞書
- Semantic Dimension Registry
- Locator Coverage
- Duplicate / Collision検出
- Unit / Context検証

### P5-W5：Candidate・Conflict

- Candidate Gate
- Evidence必須
- Conflict保持
- Placeholder Quarantine
- Fallback Evidence禁止
- Unknown / Missing Info

### P5-W6：Review・Question

- Critical Review
- Evidence Viewer
- Candidate Compare
- Conflict Resolution
- Missing Info
- 重複しない現場向け質問

### P5-W7：Prompt・Model Governance

- Prompt Package
- Model Router
- PUE Run Manifest
- Stage Artifact
- Content-addressed Cache
- Eval
- Shadow Run
- Reanalysis Dependency Graph

### P5-W8：Draft DSL Integration

- Draft DSL Schema Validation
- Reference DSLとの差分
- Human Approval
- Approved DSL Version生成
- 下流Vertical Sliceへ接続

## 12.2 Required Safety Metrics

- Candidate without Evidence：0
- PlaceholderのApproved DSL流入：0
- Critical Hallucination：0
- Conflictの無言消失：0
- 未承認Critical Ruleの下流Release：0
- Dimension Identityの既知Fixture一致：100%

## 12.3 Exit Criteria

- 実仕様書からEvidence Locatorを確認できる。
- W、WW、DW、KW等が別Semantic Identityとして保持される。
- Scope、Condition、ApplicabilityがCandidateとDSLまで残る。
- ConflictがReviewで解消されるまで下流へ残る。
- PUE結果はDraftであり、自動Approvedにならない。
- Human Review後のApproved DSLがPhase 2 Contractを満たす。
- PromptまたはModel変更を再現・比較・Rollbackできる。

---

# Phase 6：End-to-End Pilot

## 13. 目的

ASXEEDの実商品と実仕様書を用いて、Cloud上の全Workflowを一気通貫で検証する。

## 13.1 Pilot Scenario

```text
1. 実仕様書Upload
2. Malware Scan
3. OCR / PUE
4. Evidence / Candidate / Conflict Review
5. Approved Product DSL作成
6. 標準W・H表示
7. W・H変更
8. Rule / Parts / Geometry再生成
9. 組立図・部材図・3D生成
10. Drawing Judge
11. Product Knowledge Approval
12. Instance Design Approval
13. Drawing Release Approval
14. Manufacturing Start Approval
15. Release Package発行
16. Revision変更
17. 再生成・再承認
18. Rollback / Revocation Test
```

## 13.2 Pilot Verification

### Functional

- Critical Flow
- Boundary Input
- Invalid Input
- Conflict
- Revision
- Approval Invalidated
- Revocation

### Quality

- Dimension一致
- Required Drawing
- DXF再読込
- GLB再読込
- Evidence Trace
- Rule Trace

### Operational

- Load
- Cost
- Retry
- Timeout
- Worker Scaling
- Backup
- Restore
- Incident
- Notification

### Security

- Tenant Scope
- Signed URL
- Secret Scan
- Public Access
- Log Redaction
- Codex Isolation

## 13.3 Pilot Exit Criteria

- 代表商品1件をEnd-to-Endで完走する。
- 3種類以上のW・H Caseを生成する。
- すべてのReleased ArtifactでDimension一致が確認される。
- Critical Safety Metricがすべて0件を満たす。
- BackupからProduct DSL、Drawing Package、Approval履歴を復元できる。
- Release、Revision、Revocation、Rollbackが実行できる。
- レウが日常運用できると判断する。

---

# Phase 7：Order Integration・Public Demo

## 14. 目的

既存のasxeed-order-engineを壊さず接続し、顧客へ見せられる公開体験を作る。

## 14.1 Order Integration

### Step 1：Version付きFile Adapter

- Order Metadata JSON
- Product Instance Reference
- Quantity
- Released Package Reference
- Parts Summary
- CSV互換Export

### Step 2：API Adapter

- Idempotent Import / Export
- Reconciliation
- Error Contract
- Audit

### Step 3：Domain Event

- `manufacturing.release.completed`
- Transaction Outbox
- Order / Cost / Invoice Consumer

## 14.2 Public Demo

- `public-web`
- 匿名化Fixture
- W・H変更
- 2D / 3D更新
- Part Highlight
- PUE演出または事前生成Result
- Productionから完全分離
- WAF / Rate Limit / Cost Limit
- Session Reset
- Kill Switch

## 14.3 Marketing Deliverables

- ASXEED Webサイト
- Product Overview
- 画面録画
- 3D Demo動画
- Customer Demo Script
- 明確な公開価格への将来接続
- 実装済み機能と将来構想の区別

## 14.4 Exit Criteria

- Released Package情報をOrder Engineへ安全に渡せる。
- 既存請求処理にRegressionがない。
- Public DemoがProduction Dataへ接続していない。
- 匿名化商品でW・H変更、Drawing、3Dを体験できる。
- Cost Limit、Rate Limit、Session Reset、Kill Switchが動作する。
- 顧客へ案内可能なDemo URLと動画が完成する。

---

## 15. 3つの大規模実装Wave

Codexへ一度に全体を渡さず、次の3 Waveへまとめる。

### Wave A：Platform・ADO Foundation

対象：Phase 0、Phase 1、Phase 4の基盤部分

```text
Contracts
→ Repository / CI
→ Cloud / Security
→ Temporal
→ ADO Task / Judge / Approval
```

### Wave B：Manufacturing Core

対象：Phase 2、Phase 3のDomain部分、Phase 5のPUE部分

```text
Product DSL
→ Rule Engine
→ Parts
→ Geometry
→ Drawing / 3D
→ PUE Integration
```

### Wave C：UI/UX・Pilot・Release

対象：Phase 3 UI、Phase 6、Phase 7

```text
Manufacturing Workspace
→ Smartphone Approval
→ End-to-End Pilot
→ Order Integration
→ Public Demo
```

各Waveは複数のCodex Packへ分割し、1 PRが複数の独立目的を持たないようにする。

---

## 16. Parallel Development Rules

### 16.1 並行可能

- ContractとAdapter Mockが固定されたWorkstream
- UIとAPIのContract-driven実装
- Drawing Output Adapterと3D Viewer
- ADO Judge種別ごとの実装
- PUE Stageごとの改善
- Test Fixture作成とEngine実装

### 16.2 並行禁止

- 同じSchemaを複数Taskで同時変更
- 同じMigrationを複数Branchで作成
- Product DSL CoreとRule Engine Contractの無調整同時変更
- Geometry Contract確定前のDrawing／3D正式実装
- Approval Contract確定前の複数Approval UI実装
- Platform Contract Release前の複数Repository同時変更

### 16.3 Cross-repository変更

```text
Platform Contract PR
→ Package Release
→ Consumer Update PR
→ Compatibility Judge
```

一つのCodex Taskで複数Repositoryへ書き込まない。

---

## 19. ADO Task Design Rules

各Taskは必ず次を持つ。

```yaml
id:
title:
repository:
phase:
workstream:
adrReferences:
dependencies:
riskLevel:
objective:
inScope:
outOfScope:
acceptanceCriteria:
requiredTests:
requiredArtifacts:
rollbackPlan:
humanApproval:
```

### Task Size

- 1 Task = 1明確な成果
- 1 PR = 1 Taskを原則とする
- 目安は1〜3時間のCodex実装単位
- Architecture変更を通常Taskへ混ぜない
- 依存関係が曖昧なTaskを`ready`にしない

### Task Completion

- 実装済み
- Test済み
- Verification Artifactあり
- 5-layer Judge適用済み
- Required Approval済み
- Rollback Planあり

---

## 18. Codex Pack標準構成

各Phase Packは次を含む。

```text
1. Phase Goal
2. Architecture References
3. Current Repository State
4. Exact Scope
5. Explicit Non-goals
6. File / Package Boundaries
7. Contract Inputs / Outputs
8. Ordered Tasks
9. Parallelizable Tasks
10. Acceptance Criteria
11. Required Commands
12. Required Verification Artifacts
13. Forbidden Patterns
14. Judge Instructions
15. Rollback Procedure
16. Completion Report Format
```

Codexへ「全体をいい感じに実装して」と依頼しない。

---

## 19. Quality Gates

### 19.1 Pull Request Gate

- Format
- Lint
- Type Check
- Build
- Unit
- Contract
- Changed Integration
- Architecture
- Security
- Critical E2E
- Artifact Validation

### 19.2 Nightly Gate

- Full Integration
- Three-browser E2E
- Property-based Test
- PUE Eval
- Drawing / 3D Fixture
- Performance Trend
- Dependency Scan
- Drift Check

### 19.3 Pilot Release Gate

- Full Test
- Backup確認
- Restore Test
- Migration Test
- Rollback Test
- Load Test
- Security Review
- Manufacturing Approval
- Human Approval

---

## 20. Milestone Register

| Milestone | Completion Evidence |
|---|---|
| M0 Architecture Operational | CIがArchitecture違反を検出 |
| M1 Cloud Foundation | Authenticated JobがCloud上で完走 |
| M2 Manufacturing Core | Reference DSLからGeometryまで生成 |
| M3 Visual Manufacturing | 図面・3D・UIが連動 |
| M4 ADO Approval Loop | Codex→Judge→スマホ承認が完走 |
| M5 Safe PUE | 実仕様書からReview可能Draft DSL生成 |
| M6 Practical Prototype | Release Packageを実商品で発行 |
| M7 Customer Demonstration | Order連携と公開Demo完成 |

---

## 21. Risk Register

| Risk | Impact | Mitigation |
|---|---|---|
| PUE精度改善が長期化 | 下流停止 | Reference DSL Trackを並行 |
| Product DSL Contractが頻繁に変わる | 全Domain影響 | Phase 2開始前にCoreを固定 |
| GeometryとDrawingが分岐 | 誤寸法 | Geometry Source of TruthとCross-output Test |
| Codexが設計判断を行う | Architecture Drift | ADR参照、Architecture Judge、Design Review停止 |
| Cloud基盤が過剰化 | 速度・Cost悪化 | Pilot Tier、Container Apps、初期Redisなし |
| AI Cost増大 | 運用停止 | Model Router、Budget、Cache、Page/Crop処理 |
| Approvalがボトルネック | 長時間停止 | Risk別Approval、通知、スマホInbox |
| 実図面要件不足 | 製作不可 | Reference Drawing Profileと現場Review |
| 既存Order Engine破壊 | 請求業務停止 | File Adapterから段階連携、Regression Test |
| Public Demoから機密漏えい | 重大Incident | Environment完全分離、匿名化Fixture |

---

## 22. Deferred Decisions

次は実装前提が揃った段階で確定する。

- Azure Region / SKU
- 実際のAI Model Deployment
- ASXEED普通公差等級
- 取引先別Drawing Profile
- Retention最終期間
- IFC Version
- 実加工機とMachine Adapter
- 外販SLA
- 課金・価格体系のSystem Contract

これらをCodexが独自に決めてはならない。

---

## 23. Master Plan Change Procedure

1. 実装中に未決定事項または矛盾を検出する。
2. 該当Taskを停止する。
3. AI CTO Design Reviewへ、論点・選択肢・推奨・影響を提出する。
4. レウが判断する。
5. 必要に応じてADRを追加・改訂する。
6. Architecture Freezeと本計画を更新する。
9. ADO Task GraphとCodex Packを再生成する。
8. Judge確認後に実装を再開する。

---

## 24. 次の正式成果物

本計画の次に、次の順序で作成する。

1. `ADO_TASK_GRAPH_v1.2.md` / `ADO_TASK_GRAPH_v1.2.json`
2. `PHASE_00_ARCHITECTURE_ADOPTION_CODEX_PACK.md`
3. `PHASE_01_PLATFORM_FOUNDATION_CODEX_PACK.md`
4. `PHASE_02_REFERENCE_DSL_VERTICAL_SLICE_CODEX_PACK.md`
5. `PHASE_03_DRAWING_3D_UI_CODEX_PACK.md`
6. `PHASE_04_ADO_EXECUTION_JUDGE_CODEX_PACK.md`
7. `PHASE_05_PUE_SAFETY_AI_CODEX_PACK.md`
8. `PHASE_06_END_TO_END_PILOT_CODEX_PACK.md`
9. `PHASE_07_ORDER_DEMO_CODEX_PACK.md`

最初に着手する実装はPhase 0である。Architecture Freeze、Master Plan、AGENTS.md、Architecture Judge、ADO Task ContractをRepositoryへ反映してから、大規模実装を開始する。

---



## 24.1 Sprint Execution and Responsibility Boundary

正式なSprint割当は`SPRINT_EXECUTION_PLAN_v1.0.md`を正本とする。全103 TaskはSprint 00〜11へ割り当てられ、機械可読版Task Graphでは`sprintId`と`sprintSequence`を保持する。Sprintは時間管理単位であり、依存関係の正本は`dependsOn`である。

System責任境界は`SYSTEM_RESPONSIBILITY_BOUNDARIES_v1.0.md`を正本とする。ADO、Manufacturing OS、Common Platform、Order EngineのSource of Truthと禁止される重複を同文書に従って判定する。

Phase 0開始可否は`ASXEED_DEVELOPMENT_READINESS_REPORT_v1.0.md`で`READY_FOR_PHASE_0`と判定されていることを条件とする。

## 25. 最終実装原則

```text
最速で動かす。
ただし、製造知識・寸法・承認・Securityは省略しない。

AIで候補を作る。
決定論的Engineで計算する。
人間がCritical判断を承認する。

一つの商品を最後まで完成させる。
その後、同じContractで商品と会社を追加する。
```

本書に反するTask、Codex Pack、PR、実装は停止し、AI CTO Design Reviewへ戻す。


## 19. Program / Track Mapping Summary

| Phase | Primary Program / Track |
|---|---|
| P0 | COMMON-FOUNDATION / ARCHITECTURE-ADOPTION |
| P1 | COMMON-FOUNDATION / PLATFORM-FOUNDATION + TECHNOLOGY-VALIDATION |
| P2 | PROGRAM-2 / REFERENCE-DSL-VERTICAL-SLICE |
| P3 Core | PROGRAM-2 / DRAWING-3D-CORE |
| P3 UI | PROGRAM-3 / PRODUCT-UI-UX |
| P4 | PROGRAM-1 / ADO-CONTROL-PLANE-MVP |
| P5 | PROGRAM-2 / PUE-SAFETY |
| P6 | PORTFOLIO / END-TO-END-PILOT |
| P7 Order | PROGRAM-2 / ORDER-INTEGRATION |
| P7 Demo | PROGRAM-3 / PUBLIC-DEMO |

