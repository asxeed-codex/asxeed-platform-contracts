# ASXEED Architecture Freeze v1.1

**対象:** ADO / ASXEED Manufacturing OS / Platform Contracts  
**状態:** 正式採用・Architecture Freeze  
**基準日:** 2026-07-29  
**ADR:** 24 / 24 採用済み  
**Technology Baseline:** v1.0 正式採用

## 1. 目的
本書は、ASXEEDの大規模開発における最上位の実装設計基準である。Codex、ADO、Judge、開発者は、本書、ADR、正式Technology Baselineに反する設計判断を独自に行ってはならない。

## 2. 統合アーキテクチャ
```text
レウ + AI CTO（ぴーちゃん）
        │  Vision / Priority / ADR / Approval
        ▼
ADO - AI Company OS
Goal → Plan → Task → Codex → Test → 5-layer Judge → Human Approval → Release
        │ Versioned Contract / Artifact / Trace
        ▼
ASXEED Manufacturing OS
Confidential PDF → PUE → Evidence / Candidate / Conflict → Draft DSL
→ Human Review → Approved Product DSL → Rule Engine → Parts Model
→ Geometry Model → Drawing Model / 3D → Released Manufacturing Package
        │
        ├─ Order / Cost / Invoice Adapter → asxeed-order-engine
        └─ Future CAM / IFC / BCF / STEP Adapters
```

## 3. 絶対原則
- 商品ごとの図面描画コード、3D生成コード、寸法計算コードを追加しない。
- Product DSLへ顧客、案件、数量、価格、請求、在庫、CAD命令、座標を混入させない。
- Drawing、3D、BOMがそれぞれ独立して寸法を計算しない。
- PUEがApproved DSLを直接生成しない。ConfidenceをApprovalとして扱わない。
- Conflict、Unknown、未承認Critical値を無言で削除・補完しない。
- ADOとManufacturing OSが相互のDomain Databaseへ直接SQLアクセスしない。
- CodexへMain Merge、Production Deploy、Production Data、Production Secretを与えない。
- Security、Architecture、製造Critical失敗をAIの総合判断で上書きしない。
- Portal手動設定、Prompt管理画面、古い図面への手書き修正を正式なSource of Truthにしない。
- Public DemoからProduction API、機密Storage、正式Release機能へ接続しない。

## 4. Source of Truth
| 情報 | 正本 | 所有Domain |
|---|---|---|
| 製造ルール・商品知識 | Approved Product DSL | Manufacturing OS |
| 仕様書の根拠 | Evidence Artifact | PUE / Manufacturing OS |
| 案件ごとのW・H・Option | Product Instance | Manufacturing OS |
| 計算・制約・禁止判定 | Immutable Rule Result | Rule Engine |
| 今回製作する部材 | Parts Model | Manufacturing OS |
| 形状・配置 | Geometry Model | Manufacturing OS |
| 製図表現 | Drawing Model | Manufacturing OS |
| 正式製作用成果物 | Released Manufacturing Package | Manufacturing OS |
| 開発Goal・Task・Judge | ADO Domain | ADO |
| 注文・顧客・数量 | Order Engine | asxeed-order-engine |
| 価格・請求 | Order / Invoice Engine | asxeed-order-engine |
| 実行履歴 | Temporal Workflow History + Audit Event | Platform |
| ファイル実体 | Azure Blob Storage | Platform |

## 5. ADR Register
| ADR | 題名 | Status |
|---|---|---|
| ADR-001 | Product DSL Versioning and Extension Model | Adopted |
| ADR-002 | Geometry Coordinate System and Source of Truth | Adopted |
| ADR-003 | Production Drawing, DXF, Tolerance and Revision | Adopted |
| ADR-004 | 3D Engine and Geometry Export | Adopted |
| ADR-005 | PUE OCR, Vision and Evidence Contract | Adopted |
| ADR-006 | AI Model Router and Role Separation | Adopted |
| ADR-007 | Backend Runtime and Durable Workflow | Adopted |
| ADR-008 | Database, Object Storage, Audit and Artifact Persistence | Adopted |
| ADR-009 | Security, Confidential Data and AI Data Policy | Adopted |
| ADR-010 | ADO Judge, Fix Loop, Approval, Release and Rollback | Adopted |
| ADR-011 | Frontend, UI/UX and 2D/3D Interaction | Adopted |
| ADR-012 | Deterministic Rule Engine and Parts Model | Adopted |
| ADR-013 | API, Event and System Integration Contract | Adopted |
| ADR-014 | Observability, Trace, Cost and Incident Monitoring | Adopted |
| ADR-015 | Testing, Fixture and AI Evaluation Platform | Adopted |
| ADR-016 | Repository, Monorepo and CI/CD Structure | Adopted |
| ADR-017 | Infrastructure as Code and Environment Provisioning | Adopted |
| ADR-018 | PUE Reanalysis and Prompt/Model Version Governance | Adopted |
| ADR-019 | Manufacturing Approval, Revision and Release Lifecycle | Adopted |
| ADR-020 | Performance, Scalability and Capacity Management | Adopted |
| ADR-021 | Notification, Smartphone Approval and Human Escalation | Adopted |
| ADR-022 | Disaster Recovery and Business Continuity | Adopted |
| ADR-023 | External Integration: Order, Cost, Invoice, CAM and BIM | Adopted |
| ADR-024 | Demo, Website and Public Release Governance | Adopted |

## ADR-001 Product DSL Versioning and Extension Model

**Decision:** Product DSLはSemantic Versioningで管理し、互換追加はMinor、破壊的変更はMajorとする。会社固有項目はnamespaced extensionsへ格納し、Coreを安定させる。

**Mandatory rules**
- Approved DSLを直接更新せず、新Versionとして保存する。
- 旧VersionはMigration経由で読取り可能にする。
- Product DSLには案件寸法、顧客、数量、価格、請求、在庫、CAD命令、3D座標を含めない。

**Implementation impact:** Product DSLが製造知識の長期資産となり、会社・商品追加を個別コード追加なしで拡張できる。

## ADR-002 Geometry Coordinate System and Source of Truth

**Decision:** 単位はmm、正面視でX右、Y上、Z奥行、原点は枠開口左下、右手系とする。Geometry Modelを2D・3D共通の形状正本にする。

**Mandatory rules**
- 図面と3DはGeometry Modelから派生し、独立して寸法計算しない。
- Geometry IDとPart IDを安定させる。
- 座標系変換はAdapter境界で明示する。

**Implementation impact:** Drawing、3D、BOM、将来のCAM出力間で寸法と形状の一貫性を保てる。

## ADR-003 Production Drawing, DXF, Tolerance and Revision

**Decision:** JIS Z 8310・JIS B 0001を基礎にASXEED Drawing Profileを適用し、Geometry ModelからDrawing Modelを生成してSVG、PDF、DXFへ出力する。

**Mandatory rules**
- 組立図、納まり断面図、枠・扉・ガラス枠等の部材製作図、部材表を生成する。
- 寸法はGeometry Anchorを参照し、公差・材質・板厚・接合情報不足時は製作用Releaseを停止する。
- Primary DXFはAutoCAD 2018 ASCII、旧CAD向け簡易Compatibility DXFを用意する。
- RevisionはImmutableとし、GeometryやCritical条件変更時に承認を失効させる。

**Implementation impact:** 初期対象のDXFは図面交換用までとし、機械直結のNC/CAMデータ生成はADR-023の後段へ分離する。

## ADR-004 3D Engine and Geometry Export

**Decision:** 初期3DはThree.js＋React Three Fiber＋OrbitControlsを採用し、Geometry Modelを正本、MeshとGLBを表示・共有用派生物とする。

**Mandatory rules**
- 1論理部材につき安定したPart IDを持つMeshを生成する。
- Browserは表示と操作、Serverは正式生成・検証・永続化を担当する。
- 板厚、曲げ、Boolean、B-Rep、STEPはOpenCascade.jsを用いるStretch段階で追加する。
- 商品名による3D分岐や独立寸法計算を禁止する。

**Implementation impact:** 最速の箱型プロトから、製造形状に近い板金・STEPへ段階拡張できる。

## ADR-005 PUE OCR, Vision and Evidence Contract

**Decision:** Azure AI Document Intelligence prebuilt-layoutをOCR・Layoutの一次正本とし、OpenAI Visionを製造意味理解とCandidate生成に使う。

**Mandatory rules**
- CandidateにはEvidence、parsed value、semantic target、scope、condition、traceを必須とする。
- OCR Confidence、Semantic Confidence、Rule Confidence、Approval Stateを分離する。
- Critical製造知識は高ConfidenceでもHuman Approvalを必須とする。
- Conflict、Locator、Source Hash、Model／Provider Versionを下流まで保持する。

**Implementation impact:** AIの推測を証拠付き候補に限定し、誤製造知識がApproved DSLへ流入することを防ぐ。

## ADR-006 AI Model Router and Role Separation

**Decision:** Application CodeへModel名を散在させず、共通AI Model Routerで高精度推論、低コスト処理、Codex実装、独立JudgeのRoleを分離する。

**Mandatory rules**
- Critical処理は低品質ModelへSilent Fallbackしない。
- AI Structured OutputはJSON Schemaで検証する。
- CodexとJudgeのContextを分離する。
- Model変更はFixture Eval、Cost／Latency比較、Judge、Human Approvalを通す。

**Implementation impact:** Model製品名の変更に耐えつつ、精度・Cost・独立性を統制できる。

## ADR-007 Backend Runtime and Durable Workflow

**Decision:** Azure Container Apps上でTypeScript／Node.js、NestJS＋FastifyのREST APIを運用し、長時間処理と承認待ちはTemporal Cloudで実装する。

**Mandatory rules**
- APIとWorkerを別Containerに分ける。
- 内部QueueはTemporal Task Queueへ統一し、ActivityはIdempotentにする。
- 初期はRedisと追加の内部Message Busを導入しない。
- 進捗はSSE＋Polling Fallbackで提供する。

**Implementation impact:** Stop／Resume、Retry、Human Approval、Fix Loopを耐障害性のあるWorkflowとして実装できる。

## ADR-008 Database, Object Storage, Audit and Artifact Persistence

**Decision:** 構造化データの正本はAzure Database for PostgreSQL Flexible Server、実ファイルはAzure Blob Storageとし、Prismaで管理する。

**Mandatory rules**
- ADO、Manufacturing、Core、AuditをDomain別Schemaで分離する。
- DSL、Rule Result、Parts、GeometryはVersion単位のImmutable Snapshotとして保存する。
- ArtifactはMetadata、Version、Hash、権限、TraceをDBへ保持し、実体をBlobへ保存する。
- 重要操作はAppend-only Audit Event、重要監査SnapshotはImmutable Storageで保護する。

**Implementation impact:** すべての図面・3D・判断を入力Versionまで遡って追跡できる。

## ADR-009 Security, Confidential Data and AI Data Policy

**Decision:** Microsoft Entra ID、MFA、Managed Identity、Key Vault、Private Endpoint、Front Door WAFを基盤とし、機密PDFとAI送信を最小権限で制御する。

**Mandatory rules**
- PDFはQuarantine、File検証、Malware Scanを通過するまでPUEへ渡さない。
- AI送信先は承認済みAzure Endpointに限定し、必要最小限のPage／Cropだけを送る。
- Development、Staging、Production、Demoを分離し、Production DataをDevelopmentへ複製しない。
- Codex RunnerへProduction Data、Secret、Merge、Deploy権限を与えない。
- Security違反はFail Closedとする。

**Implementation impact:** 機密仕様書をCloud AIで扱いながら、開発Agent・外部利用者・公開Demoから隔離できる。

## ADR-010 ADO Judge, Fix Loop, Approval, Release and Rollback

**Decision:** Codex自己検証後にBuild、Test、Architecture、Security、Productの5層Judgeを実行し、Deterministic Policy Gateで最終判定する。

**Mandatory rules**
- 自動Fixは最大2回とし、設計判断はAI CTO Design Reviewへ戻す。
- ApprovalはAuto Continue、Checkpoint、Mandatory Human Approvalの3段階とする。
- Main直接Pushを禁止し、Draft PRとRequired Checksを必須にする。
- ReleaseはDevelopment→Staging→Pilot→Production、ApplicationはContainer Apps RevisionでRollbackする。
- Verification ArtifactとRollback PlanをDone条件にする。

**Implementation impact:** 人間がTerminal検証を繰り返さず、証拠を見て承認する運用へ移行できる。

## ADR-011 Frontend, UI/UX and 2D/3D Interaction

**Decision:** Next.js App Router＋TypeScript、Tailwind CSS＋shadcn/uiを採用し、Server StateはTanStack Query、Workspace StateはZustand、FormはReact Hook Form＋Zodで管理する。

**Mandatory rules**
- ADO Web、Manufacturing Web、Public WebをDeploy単位で分離する。
- Manufacturing Workspaceは左入力、中央2D／3D、右Inspector、下部TraceのDesktop First構成とする。
- Drawing、3D、Parts、Evidence、RuleをsemanticId／partIdで双方向連動する。
- Draftだけを自動保存し、承認とReleaseは明示操作にする。

**Implementation impact:** 寸法の根拠と影響部材を視覚的に追跡でき、スマートフォンではADO承認に集中できる。

## ADR-012 Deterministic Rule Engine and Parts Model

**Decision:** Rule EngineはApproved DSL＋Instanceを入力とするAI非依存の決定論的エンジンとし、Ruleを型付き宣言的ASTで表す。

**Mandatory rules**
- 任意コード実行、eval、未承認値の無言補完を禁止する。
- decimal.jsによる任意精度Decimalと単位付きValue Objectを使う。
- 判定はtrue／false／unknownを持ち、unknownは下流Releaseを必要に応じてBlockする。
- Parts Modelは実製作用部材Instanceを表し、商品名分岐を禁止する。
- Geometry EngineはParts Modelを形状化する責任だけを持つ。

**Implementation impact:** AIの揺らぎから製造計算を切り離し、図面・3D・BOMを同じ部材構造から生成できる。

## ADR-013 API, Event and System Integration Contract

**Decision:** ADOとManufacturing OSは相互DBへ直接アクセスせず、Version付きAPI、Temporal Message、CloudEvents互換Eventで連携する。

**Mandatory rules**
- 同期APIはOpenAPI 3.1系、構造化ArtifactはJSON Schema 2020-12を正本にする。
- API VersionはPath方式とし、破壊的変更だけMajorを更新する。
- 状態変更APIはIdempotency-Keyを必須にする。
- Domain EventはTransaction Outboxへ同一Transactionで保存する。

**Implementation impact:** ADOとManufacturing OSを独立進化させながら、契約と互換性を機械検証できる。

## ADR-014 Observability, Trace, Cost and Incident Monitoring

**Decision:** OpenTelemetryを標準とし、Azure Monitor Application Insightsを初期BackendとしてAPIからApprovalまで単一Traceで追跡する。

**Mandatory rules**
- Critical処理は100% Trace保存し、機密本文をLogへ出さない。
- Task、Job、Document、Model単位でLatency、Error、Token、Costを記録する。
- Security、Approval、図面Release、2D／3D不一致を即時Alert・Fail Closed対象とする。
- IncidentにTrace、Log、Metric、Artifactを固定する。

**Implementation impact:** 長時間AI開発と製造処理の原因・Cost・影響範囲を一つのTraceから追跡できる。

## ADR-015 Testing, Fixture and AI Evaluation Platform

**Decision:** Vitest、Playwright、Testcontainers、Temporal Testing Suiteを標準とし、匿名化・Version管理・人間承認済みFixtureで回帰検証する。

**Mandatory rules**
- Golden期待値をCodexが自動更新することを禁止する。
- 図面と3DはVisual SnapshotだけでなくSemantic Dimension一致で検証する。
- PUEはEvidence、Identity、Scope、Condition、Conflict、Hallucinationを独立Evalする。
- Critical回帰がある場合、平均点が改善してもReleaseしない。

**Implementation impact:** AIとGeometryの変更を定量比較し、人間の見落としやSnapshotの偽PASSを減らせる。

## ADR-016 Repository, Monorepo and CI/CD Structure

**Decision:** ADO、Manufacturing OS、Platform Contractsを3つの独立Repositoryに分け、各Repository内部はpnpm Workspace＋TurborepoのMonorepoとする。

**Mandatory rules**
- Trunk-based Development、mainのみ長期Branch、すべてDraft PRから開始する。
- 共通ContractはVersion付きPrivate Packageとして配布する。
- CI/CDはGitHub Actions Reusable Workflow、Azure認証はOIDCを使用する。
- CodexにMerge、Package Release、Production Deploy権限を与えない。

**Implementation impact:** ADOを独立製品として保ちながら、共通契約とCIを再利用できる。

## ADR-017 Infrastructure as Code and Environment Provisioning

**Decision:** Azure InfrastructureはBicepを唯一のIaC正本とし、GitHub Actions＋OIDCでProvision／Deployする。

**Mandatory rules**
- Development、Staging、Pilot、ProductionをResource、Identity、Data単位で分離する。
- Lint、Build、Snapshot、Azure What-if、Policy検証をすべての変更で行う。
- Resource削除、Network公開、権限拡大、Database／Storage／Key Vault変更はHuman Approval必須とする。
- Portal手動変更を正式状態とせず、Driftを検出してBicepへ戻す。

**Implementation impact:** Cloud環境を再現可能にし、設定漏れとPortal依存を防ぐ。

## ADR-018 PUE Reanalysis and Prompt/Model Version Governance

**Decision:** Prompt、Model、Pipeline、Schemaを独立Version管理し、全PUE RunへSource Hash、Stage Artifact、Cost、Traceを持つImmutable Manifestを保存する。

**Mandatory rules**
- PromptはGit内のVersion付きPackageを正本とし、管理画面で直接変更しない。
- Dependency Graphに基づき影響Stageだけを再実行し、Content-addressed Cacheを使う。
- 新Prompt／ModelはEval、Shadow Run、Judge、Human Approvalを経て切り替える。
- 既存Approved DSLを再解析結果で自動上書きしない。

**Implementation impact:** AI更新による差分を説明・再現・Rollbackできる。

## ADR-019 Manufacturing Approval, Revision and Release Lifecycle

**Decision:** 製造承認をProduct Knowledge、Instance Design、Drawing Release、Manufacturing Startの4段階に分離する。

**Mandatory rules**
- 承認はEntity、Version、Content Hash、Artifact Hashへ結び付ける。
- 内容変更時は承認を自動失効させる。
- 製作用成果物はImmutable Release Packageとして固定し、DraftとReleasedを明確に区別する。
- 上流Revocationは関連図面・製造Releaseを自動停止する。

**Implementation impact:** 商品知識の承認と、案件図面・実製作の責任を混同せず管理できる。

## ADR-020 Performance, Scalability and Capacity Management

**Decision:** CapacityをDevelopment、Pilot、社内、外販に分け、今回の完成対象をPilot Tierとする。Interactive、短時間Background、長時間Workflowを分離する。

**Mandatory rules**
- Queue別Worker、Concurrency上限、Priority、Backpressureを設定する。
- organizationId単位の公平制御とAI Provider Semaphoreを持つ。
- Database接続をPoolで制限し、大規模PDFはPage／Region単位で分割する。
- 高負荷時は低優先BatchとDemoを停止し、Security、Approval、Revocation、製作停止を維持する。

**Implementation impact:** 過剰なKubernetes化を避けつつ、Pilotから外販へ水平拡張できる。

## ADR-021 Notification, Smartphone Approval and Human Escalation

**Decision:** In-app Notificationを正本とし、Email、Web Push、SMSを補助にする。スマートフォンはResponsive Web／PWAのApproval Inboxを中心とする。

**Mandatory rules**
- 通知から直接承認せず、認証済み画面でVersion、Hash、Judgeを再確認する。
- Critical／EmergencyはPolicyに基づき再通知、代替承認者、Workflow停止へEscalateする。
- 承認期限切れを自動承認として扱わない。
- AIがHuman Approvalを代行しない。

**Implementation impact:** 外出先から安全に承認でき、長時間Workflowの停滞を自動Escalationで減らせる。

## ADR-022 Disaster Recovery and Business Continuity

**Decision:** 高可用性、Disaster Recovery、Business Continuityを分離し、PilotはZone Redundant Primary Regionと復元可能なGeo Backupを基本とする。

**Mandatory rules**
- Critical BlobはGeo redundancy、PostgreSQLはPITRとGeo Restoreを備える。
- Backupの存在ではなく、定期Restore／DR演習成功をRelease条件にする。
- Cloud停止中は同期済みReleased Packageの閲覧だけを許可し、新規承認・Releaseを禁止する。
- Region Failover、Database Restore、製作再開はHuman Decisionを必須とする。

**Implementation impact:** Cloud障害時にも誤った新規製造を防ぎ、Release済み製作だけを安全に継続できる。

## ADR-023 External Integration: Order, Cost, Invoice, CAM and BIM

**Decision:** 外部連携はVersion付きIntegration ContractとAdapterで行い、最初の接続先を既存asxeed-order-engineとする。

**Mandatory rules**
- File-based JSON／CSVから開始し、API、Domain Eventへ段階移行する。
- Order、Cost、Invoice、CAM、BIMの責任境界を分離する。
- 価格、数量、顧客、請求情報をProduct DSLへ入れない。
- CAMはMachine-neutral Operation ModelからMachine Adapterへ、BIMはIFC Adapterへ変換する。

**Implementation impact:** 既存請求資産を壊さず、製造データを工程・原価・外部標準へ展開できる。

## ADR-024 Demo, Website and Public Release Governance

**Decision:** 公開展開をMarketing Demo、Guided Customer Demo、Private Pilot、Public Productへ段階化し、Public環境をProduction Manufacturing OSから完全分離する。

**Mandatory rules**
- 初期Demoは匿名化Fixtureと事前生成Artifactだけを使い、Public PDF Uploadを提供しない。
- Front Door、WAF、Rate Limit、Cost Limit、Session Resetを適用する。
- 公開範囲拡大はProduct、Security、Privacy、Legal、Cost、Accessibility、Load Test、Human Approvalを必須とする。
- Feature FlagとKill Switchで機能単位に即時停止可能にする。

**Implementation impact:** 顧客へ魅力的に見せながら、機密製造環境と誤表示・過剰コストを隔離できる。

## 6. Cross-ADR Consistency Review
- **内部QueueとService Bus:** ADR-007の「初期は追加Busなし」と、ADR-013のOutbox＋将来Service Busは両立する。初期はTemporal＋Outbox、外部連携時だけService Busを追加する。
- **DXFの初期Scope:** 旧計画の「完全なCAD／製造データは非対象」を維持しつつ、ADR-003で図面交換用DXFを初期Release対象にする。NC/CAM・機械直結はADR-023の後段。
- **RedisとCache:** 初期Redisなしを維持する。PUE CacheはContent Hashを用いたDB／Blob上の再利用で実装し、正式状態はCacheに置かない。
- **AI EndpointとModel Router:** 機密Dataは承認済みAzure Endpointへ限定する。Provider追加はModel Routerを通し、Security・Eval・Human Approvalが必要。
- **DB Schema分離と直接Access禁止:** 同一PostgreSQL内にDomain Schemaが存在しても、ADOとManufacturing OSはService Contract経由で連携し、相互Schemaへの直接SQLを禁止する。
- **3DとDrawingの正本:** Geometry Modelが形状正本、Drawing ModelとThree.js Meshは派生物。部材必要性はParts Modelが正本。
- **ApprovalとNotification:** 通知は判断を促すだけで、承認はVersion＋Hashを固定した認証画面でのみ成立する。
- **Cloud停止時の製造:** Cloud停止中は同期済みReleased Packageだけを利用可能とし、新規設計・Revision・Releaseを凍結する。

## 7. Manufacturing Workflow
```text
1. 機密PDFをQuarantineへUpload
2. Malware／File検証後にOCR・PUEを実行
3. Evidence付きCandidate、Conflict、Missing Infoを生成
4. Critical項目をHuman Reviewし、Approved Product DSLを作成
5. Product Instanceへ標準W／Hを初期値表示し、案件値を入力
6. Rule EngineがConstraint・Prohibition・Derived Dimensionを評価
7. Parts Model → Geometry Model → Drawing Model／3Dを生成
8. Drawing Judgeで寸法・公差・Artifactを検証
9. 4段階Approvalを通し、Immutable Release Packageを発行
10. Order／Cost／Invoice／CAMへVersion付きAdapterで連携
```

## 8. ADO Workflow
```text
1. レウとAI CTOがGoal、禁止事項、成功条件を決定
2. ADOがPlanと依存関係付きTask Graphを生成
3. Codex Runnerが隔離Branchで実装・自己検証
4. Verification Artifactを保存
5. Build／Test／Architecture／Security／Product Judgeを独立実行
6. Deterministic Policy GateがAuto Continue／Fix／Human Approvalを判定
7. Fixは最大2回。設計問題はAI CTO Design Reviewへ戻す
8. レウがスマートフォンのApproval Inboxで承認
9. Draft PRをMergeし、Staging→Pilot→Productionへ段階Release
10. Incident時はRevision、Database、DSL、Workflow別にRollback
```

## 9. Implementation Order
| Phase | Goal | Deliverable |
|---|---|---|
| Phase 0 | Architecture Freeze反映 | ADR文書、Master Plan、Repository Rules、禁止事項を各Repositoryへ配置する。 |
| Phase 1 | Contracts・Repository・Cloud Foundation | Platform Contracts、Monorepo、CI、Bicep、Identity、PostgreSQL、Blob、Temporal、Observabilityを構築する。 |
| Phase 2 | Reference DSL Vertical Slice | Human-reviewed Reference DSLからRule Result、Parts Model、Geometry Modelまでを完成させる。 |
| Phase 3 | Drawing・3D・Manufacturing UI | 組立図・部材図・SVG/PDF/DXF、Three.js 3D、2D/3D連動UIを完成させる。 |
| Phase 4 | ADO Execution and Judge Loop | Task実行、Codex Runner、5層Judge、Fix Loop、スマホApproval、Release／Rollbackを完成させる。 |
| Phase 5 | PUE Safety and AI Integration | Candidate Gate、Scoped Dimension、Condition、Conflict、Prompt/Model Version、Human Reviewを統合する。 |
| Phase 6 | End-to-End Pilot | 実仕様書からPUE、DSL、Rule、Parts、Drawing、3D、Releaseまでを一気通貫で検証する。 |
| Phase 7 | Order Integration and Public Demo | asxeed-order-engine連携、匿名化Demo、Webサイト、動画、顧客デモを公開する。 |

## 10. Deferred Decisions
| Item | Freeze後の決定条件 |
|---|---|
| Azure Region・SKU | Pilot開始前にCost、可用性、Data所在地、利用可能Modelを確認して固定する。 |
| 実Model Deployment名 | AI Model RouterのRole Contractは固定済み。具体ModelはEval後に選定する。 |
| Customer Drawing Profile | 文化シャッター、三和シャッター等の図枠・Layer・公差差分を実Data確認後に登録する。 |
| 普通公差の具体等級 | ASXEED製造責任者の確認なしにm等を自動採用しない。 |
| Retentionの最終期間 | 契約・法務・取引先要件を確認後にPolicy値を確定する。 |
| IFC Version | BIM実装開始時に接続先ソフトとbuildingSMART Releaseを確認して別ADRで固定する。 |
| Machine Adapter | 実加工機、Post Processor、原点、Toolingの確認後に個別Adapter ADRを追加する。 |
| 外販SLA・RTO/RPO保証 | Pilotの実測とDR演習後に公開値を決定する。 |

## 11. Architecture Change Procedure
1. 未決定または矛盾を検出した実装は停止する。
2. AI CTO Design Reviewへ論点、選択肢、推奨、影響を提出する。
3. レウが決定し、ADRを追加または改訂する。
4. Master Implementation PlanとPhase Packを更新する。
5. ADOが新Taskを生成し、Codex実装とJudgeを再開する。

## 12. Freeze Exit Criteria
- 24件のADRがRepository内へ配置されている。
- Master Implementation Plan、ADO Task Graph、Phase別Codex PackがADRを参照している。
- Architecture Judgeが禁止事項を機械検査できる。
- Reference DSLによるVertical SliceのAcceptance Criteriaが定義されている。
- PUE TrackとDownstream Trackの接続点がVersion Contractで固定されている。

---
本書に反する下位文書・Task・実装は停止し、AI CTO Design Reviewへ戻す。

## 13. Technology Baseline

Architecture Freeze v1.1は次のTechnology文書を正式な実装基準として採用する。

1. `TECHNOLOGY_STACK.md`
2. `TECHNOLOGY_VERSION_MATRIX.md`
3. `TECHNOLOGY_SELECTION_RATIONALE.md`
4. `DEFERRED_TECHNOLOGY.md`

### 13.1 Authority

Technology文書はADRの下位、Master Implementation Planの上位に位置する。Technology文書がADRと衝突する場合はADRを優先し、実装を停止してAI CTO Design Reviewへ戻す。

### 13.2 Formal Baseline Summary

- TypeScript / Node.js 24 LTS line
- Next.js App Router / React
- NestJS / Fastify / REST / OpenAPI
- PostgreSQL Flexible Server / Prisma / Blob Storage
- Temporal Cloud / Temporal Task Queue
- Azure Container Apps / Bicep / Front Door / Key Vault
- Entra ID / Managed Identity / GitHub OIDC
- OpenTelemetry / Azure Monitor / Pino
- Three.js / React Three Fiber / Semantic SVG
- Drawing Model → PDFKit、ASXEED DXF Adapter → acad-ts
- Vitest / Playwright / Testcontainers / k6
- GitHub Packages / Lefthook / Changesets / ACR Premium
- Japan East Primary / Japan West Core DR

### 13.3 Technology Governance

- Codexは選定済み技術を別FrameworkやServiceへ置換しない。
- Major Version変更、重複技術導入、責任境界変更にはDesign Reviewが必要。
- Phase 1 Gateまでに7件のCompatibility Spikeを完了する。
- Spike失敗時は代替技術を自動選定せず、`NEEDS_DESIGN_DECISION`で停止する。

### 13.4 Cross-ADR Consistency

Technology BaselineはADR-003、004、007、008、009、011、013〜018、020〜024の実装方式を具体化するものであり、Source of TruthやDomain責任を変更しない。

