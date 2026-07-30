# ASXEED TECHNOLOGY SELECTION RATIONALE v1.0

**状態:** 正式採用  
**目的:** 採用理由、代替案、Trade-off、実装条件を残し、将来の技術変更を感覚ではなくEvidenceで判断する。

## 1. Node.js 24 LTSを固定する理由

**採用:** Node.js 24.18.0 LTS  
**代替:** Node.js 26 Current、Version Manager専用Tool

- Current LineではなくLTSを採用し、Backend、Worker、CI、Containerの差を減らす。
- `.nvmrc`、`.node-version`、`engines`、Container Digestで複数環境を固定する。
- Voltaやmiseを追加せず、Toolchainを増やさない。

**Trade-off:** 最新機能への追随は遅れるが、製造Systemでは再現性を優先する。

## 2. GitHub Packagesを選ぶ理由

**採用:** GitHub Packages npm Registry  
**代替:** npm Private、Azure Artifacts、Git URL Dependency

- Repository、Actions、PermissionをGitHubへ集約できる。
- ADO、Manufacturing OS、Platform Contracts間のPackageをVersion付きで配布できる。
- Git BranchやGit URLへの直接依存を排除できる。

**Trade-off:** `.npmrc`とToken権限設計が必要。Phase 1 SpikeでPublish / Consumeを検証する。

## 3. Lefthookを選ぶ理由

- Monorepoでも高速で、Hook設定をYAMLで共有しやすい。
- Local Hookは速い検査だけに限定し、CIをSource of Truthにできる。

Huskyも利用可能だが、初期はLefthookに統一する。

## 4. Changesetsを選ぶ理由

- 複数PackageのVersion、Changelog、Dependency UpdateをPRとして管理できる。
- Semantic VersioningとHuman Approvalへ接続しやすい。
- CodexにPublish権限を与えず、Release PRをJudgeできる。

## 5. UUID v7を選ぶ理由

- 分散環境で生成でき、時系列に近い並びを持てる。
- Database Sequenceを外部IDとして露出させずに済む。
- Drawing NumberやTask IDは人間向けDomain IDとして別管理できる。

UUIDを解析してEntity Typeや業務情報を推測する設計は禁止する。

## 6. Pinoを選ぶ理由

- Node.jsで低OverheadなStructured JSON Loggingを実装できる。
- `nestjs-pino`とOpenTelemetry Traceを関連付けやすい。
- Redactionを中央設定できる。

LogはAuditの正本ではない。Approval、Security、ReleaseはDomain Audit Eventへ保存する。

## 7. Manufacturing PDFにPDFKitを選ぶ理由

**採用:** Drawing Model → PDFKit Adapter  
**代替:** Browser Print、SVG→PDF変換Library、Canvas Raster

- 固定用紙、Scale、Vector、Font埋込みをServer側で制御できる。
- Browser Layout差によって製造寸法や図枠が変わるRiskを下げられる。
- Drawing Model Primitiveを直接描画し、寸法再計算を禁止できる。

一般ReportはPlaywright PDFを使い、製作用PDFとは責任を分離する。

## 8. acad-tsをDXF Adapterの内部実装に使う理由

- AC1032 / AutoCAD 2018相当の読み書きをAdapter内へ閉じ込められる。
- Parser Round-trip Testに利用できる。
- DXF LibraryのEntityをGeometryやProduct DSLの正本にしない設計を維持できる。

旧CAD向けはApproved Primitiveだけの最小SerializerをASXEED側で持つ。

## 9. pdfjs-distを選ぶ理由

- Source PDF、Evidence Page、Locator Overlayの表示に適する。
- DrawingはPDFではなくSemantic SVG、3DはReact Three Fiberを使い、Viewer責任を分離できる。

Next.js App RouterとのClient-only IntegrationはPhase 1 Spikeで確認する。

## 10. k6を選ぶ理由

- HTTP、SSE、Job Submission、Rate Limit、ConcurrencyをScript化できる。
- CIとContainerで再現しやすい。
- Production機密Documentを使わず、Synthetic FixtureでCapacityを評価できる。

Temporal内部負荷はWorkflow / Worker Fixtureも併用する。

## 11. PostgreSQL Feature Flagを選ぶ理由

- 初期のFlag数・User数では外部SaaSが不要。
- organizationId、Role、Environment、Expiry、Approval、AuditをDomain Policyへ統合できる。
- Public UploadやModel切替などのKill Switchを持てる。

Complex Targetingや大量配信が必要になった場合だけ外部Serviceを再評価する。

## 12. ACR Premiumを選ぶ理由

- Private NetworkingとProduction境界を作れる。
- Geo-replicationへ拡張可能。
- Production / Non-production Registryを分け、Digest Promotionができる。

TagだけでDeployせず、Image Digest、SBOM、Attestationを使用する。

## 13. Japan East / Japan Westを選ぶ理由

- Primary Applicationと初期Azure AI基盤を国内Regionへ置く。
- Core DRをJapan Westへ設計できる。
- AI Modelの提供RegionはCore Infrastructureと別に変化するため、Deployment単位で承認・固定する。

AI障害時はQueueまたはRelease Frozenとし、別ProviderへSilent Fallbackしない。

## 14. Noto Fontを選ぶ理由

- UIとPDFで日本語Glyphを安定して扱える。
- Container Hostに依存せず、Regression Fixtureで同じFont Metricを再現できる。
- UIはNoto Sans JP、製作用PDFはNoto Sans CJK JP Regular / Boldへ絞る。

Font FileはRepository / Build Artifact内でLicense Noticeとともに管理し、Chatで外部配布しない。

## 15. Exact Version Matrixを持つ理由

- Codexが`latest`を選ぶことを防ぐ。
- CI、Container、Localの再現性を高める。
- Upgradeを独立TaskとしてJudgeできる。

Version MatrixはArchitectureの下位、Master Planの上位に位置付ける。

## 16. Technology Spikeの位置付け

採用決定と実装互換性は別問題である。Phase 1 Gateまでに次を検証する。

1. PDFKitでA3 / A4、Scale、日本語Fontを再現できる。
2. AC1032 DXFをWrite / Readし、外部Viewerで確認できる。
3. Next.js / React / PDF.jsがClient-only境界で動く。
4. NestJS / Fastify / Pino / OpenTelemetryがTraceを維持する。
5. Prisma / PostgreSQLでJSONB、Transaction、Migrationを検証する。
6. GitHub Packagesを2 Repository間でPublish / Consumeできる。
7. Japan East ProvisionとJapan West再構築Runbookを検証する。

Spike失敗は技術の自動変更理由ではなく、Design Reviewの入力である。
