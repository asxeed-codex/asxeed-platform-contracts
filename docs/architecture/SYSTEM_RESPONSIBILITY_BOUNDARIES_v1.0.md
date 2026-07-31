# ASXEED SYSTEM RESPONSIBILITY BOUNDARIES v1.0

**対象:** ADO / ASXEED Manufacturing OS / Common Platform Foundation / asxeed-order-engine  
**上位基準:** Architecture Freeze v1.1 / ADR-001〜024  
**目的:** 各System・Programの所有責任、Source of Truth、連携方法、禁止される重複を明文化する。

## 1. 3本柱

### Pillar 1：ADO - AI Company OS

**役割:** AI社員とAI開発組織を運用する「作るAI」。

ADOが所有するもの：

- Goal Intake
- Plan
- Program／Milestone／Task Graph
- Agent Router
- Codex Runner
- Verification Artifact収集
- Build／Test／Architecture／Security／Product Judge
- Deterministic Policy Gate
- Fix Loop
- Decision Gateway
- Development Approval
- Smartphone Approval Inbox
- Progress／Work／Cost管理
- GitHub PR／Required Check／Release orchestration
- Development Audit／Incident／Rollback orchestration

ADOが所有しないもの：

- Product DSLの内容
- 製造寸法の計算
- Parts／Geometry／Drawing／3D
- 製造知識承認
- 製作用図面Release
- 顧客・注文・価格・請求の正本

### Pillar 2：Manufacturing OS - Manufacturing Domain Product

**役割:** 製造知識を理解・構造化し、製作可能な成果物へ変換する「製造OSの頭脳と製品」。

Manufacturing OSが所有するもの：

- Secure Document Intake
- OCR／PUE
- Evidence／Candidate／Conflict／Missing Info
- Draft／Approved Product DSL
- Product Instance
- Deterministic Rule Engine
- Rule Result
- Parts Model／Assembly Tree
- Geometry Model
- Drawing Model
- SVG／PDF／DXF
- Three.js／GLB
- BOM
- Manufacturing Workspace
- Evidence／Rule／Part／2D／3D連動
- Product Knowledge Approval
- Instance Design Approval
- Drawing Release Approval
- Manufacturing Start Approval
- Released Manufacturing Package
- Manufacturing Adapter（工程・原価・Order・CAM・BIMへの接続境界）

Manufacturing OSが所有しないもの：

- ADO Goal／Task／Judgeの内部状態
- Codex実行管理
- GitHub Merge判断
- Customer／Order／Quantity／Price／Invoiceの正本
- Cloud IdentityやStorageの物理実装詳細

### Pillar 3：Common Platform Foundation

**役割:** ADOとManufacturing OSが共有するが、Domain Logicを持たない共通実行基盤。

Platformが所有するもの：

- Microsoft Entra ID接続
- Organization／User／Roleの共通Identity Contract
- Managed Identity／Key Vault
- Job／Artifact／Trace／Error／Event／Approval Base Contract
- OpenAPI／JSON Schema共通規約
- Temporal CloudとWorker Runtime
- PostgreSQL／Blob Storageの運用基盤
- Transaction Outbox
- Audit基盤
- OpenTelemetry／Application Insights
- Notification transport
- Bicep／Azure Container Apps／Front Door／WAF
- GitHub Actions Reusable Workflow
- Package Registry／Container Registry
- Backup／Restore／DR基盤
- 共通Design Token、低レベルUI Primitive、認証Shell

Platformが所有しないもの：

- Manufacturing Workspaceの業務画面・製造操作
- ADO Approval Inboxの業務判断
- Product DSL、Rule、Parts、Geometry、Drawing
- Goal／Task／JudgeのDomain Logic
- Order／InvoiceのDomain Logic

## 2. UI責任の重要な分離

「UI」をすべてCommon Platformへ置かない。

| UI種別 | Owner |
|---|---|
| Design Token、Button、Dialog、Form Primitive、Auth Shell | Common Platform |
| ADO Dashboard、Task Graph、Judge、Approval Inbox | ADO |
| Manufacturing Workspace、Drawing Viewer、3D Viewer、BOM、Evidence UI | Manufacturing OS |
| Public Demoの商品体験 | Manufacturing OS Product UI / UX |

共通基盤は見た目と低レベル部品を共有するが、業務フローと状態遷移は各Domainが所有する。

## 3. Source of Truth Matrix

| Information | Source of Truth | Owner |
|---|---|---|
| Goal／Plan／Task／Judge | ADO Domain | ADO |
| Codex Run／Verification Artifact | ADO Domain + Artifact Repository | ADO |
| User／Organization／Role Primitive | Identity Contract | Platform |
| 製造ルール | Approved Product DSL | Manufacturing OS |
| 仕様書根拠 | Evidence Artifact | Manufacturing OS |
| 案件W・H・Option | Product Instance | Manufacturing OS |
| 計算・制約・禁止 | Immutable Rule Result | Manufacturing OS |
| 部材 | Parts Model | Manufacturing OS |
| 形状 | Geometry Model | Manufacturing OS |
| 製図表現 | Drawing Model | Manufacturing OS |
| 正式製造成果物 | Released Manufacturing Package | Manufacturing OS |
| Customer／Order／Quantity | asxeed-order-engine | Order Engine |
| Price／Invoice | asxeed-order-engine | Order／Invoice Engine |
| File Binary | Azure Blob Storage | Platform |
| Workflow History | Temporal + Audit Event | Platform |

## 4. Integration Rules

```text
ADO ↔ Manufacturing OS
Version付きAPI／Temporal Message／CloudEvents互換Eventのみ

ADO / Manufacturing OS ↔ Platform
Version付きContract／SDK／Infrastructure Module

Manufacturing OS ↔ Order Engine
Version付きFile Adapter → API → Domain Eventの順で段階導入
```

禁止：

- 相互Domain Databaseへの直接SQL
- 他Domainの内部Packageを直接import
- ADOがProduct DSLを承認する
- Manufacturing OSがCodex Taskを直接完了扱いにする
- Platformが製造RuleやApproval判断を持つ
- Product UIの業務ロジックを共通UI Packageへ移す
- Product DSLへ顧客、価格、請求、在庫を入れる

## 5. Responsibility Matrix

| Capability | ADO | Manufacturing OS | Platform | Order Engine |
|---|---|---|---|---|
| Goal／Task／Agent | Owner | Consumer | Contract support | - |
| Codex／Judge／Fix | Owner | Verification target | Runtime support | Verification target |
| Development Approval | Owner | - | Identity／Audit | - |
| PUE／Product DSL | - | Owner | Storage／AI connectivity | - |
| Rule／Parts／Geometry | - | Owner | Runtime／Persistence | - |
| Drawing／3D／BOM | - | Owner | Artifact storage | - |
| Manufacturing Approval | Orchestrates notification only | Owner | Identity／Audit | - |
| Authentication | Uses | Uses | Owner | Uses／Adapter |
| Organization／RBAC primitive | Uses | Uses | Owner | Uses／Adapter |
| UI Primitive | Uses | Uses | Owner | Optional |
| ADO UI | Owner | - | Primitive support | - |
| Manufacturing UI | - | Owner | Primitive support | - |
| Infrastructure／CI | Uses | Uses | Owner | Existing boundary |
| Order／Customer／Quantity | - | Reference only | Contract support | Owner |
| Price／Invoice | - | Adapter only | Contract support | Owner |

## 6. Completion Condition

この文書の完成条件は、すべてのTaskが`programId`と`trackId`を持ち、各成果物のSource of TruthとOwnerが一意であり、相互DB参照や重複計算がArchitecture Judgeで検出可能なことである。
