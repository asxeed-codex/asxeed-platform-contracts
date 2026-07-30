# ASXEED DEFERRED TECHNOLOGY v1.0

**状態:** 正式採用  
**目的:** 現時点で採用しない技術と、将来の導入条件を明示する。

## 1. Deferred / Rejected Register

| Technology | 現在の判断 | 導入条件 |
|---|---|---|
| Node.js 26 | Deferred | LTS化、全Compatibility Suite成功、Migration Approval |
| TypeScript Major Upgrade | Deferred | Framework互換、Full Regression、Architecture Review |
| pnpm 11 | Deferred | Repository安定後、Lockfile / CI Migration検証 |
| Prisma 7以降 | Deferred | Stable Migration評価、Driver / Generator互換、Rollback検証 |
| Redis | Not adopted | 実測でCache / Coordination Requirementが証明された場合 |
| Kubernetes / AKS | Not adopted | Container AppsのCapacityまたは機能上限が測定で証明された場合 |
| GraphQL | Not adopted | RESTで解決できない複雑なClient Query要件が確定した場合 |
| gRPC | Not adopted | 内部RPCのLatency / Throughput要件が測定で確定した場合 |
| Azure Service Bus | Deferred | Order / CAM / BIM等の外部Event連携を開始する時点 |
| External Feature Flag SaaS | Not adopted | 複雑なTargeting、Global Edge配信、大規模運用が必要になった場合 |
| External Vector DB | Not adopted | PostgreSQL / pgvectorで満たせない検索規模・Latencyが確認された場合 |
| pgvector | Deferred | 類似Evidence、過去Rule、類似製品検索を実装する時点 |
| OpenCascade.js | Deferred | Box Prototype後、板厚・曲げ・Boolean・B-Repを実装する時点 |
| STEP | Deferred | OpenCascade Geometryが安定し、Export Fixtureが用意された時点 |
| Machine-specific NC / CAM | Deferred | Manufacturing Operation Modelと対象機械仕様が承認された時点 |
| IFC / BIM | Deferred | 対象BIM Software、IFC Release、Customer Use Caseが確定した時点 |
| BCF | Deferred | BIM Issue連携を開始する時点 |
| Native Mobile App | Not adopted initially | PWAで満たせないOffline / Device機能が明確になった場合 |
| Web Push | Deferred | Approval PWA運用後、通知到達率要件が確定した場合 |
| SMS | Deferred | Critical Incidentの代替連絡経路が契約・規制面で確定した場合 |
| Public PDF Upload | Prohibited initially | Security、契約、Abuse、Cost、Tenant IsolationがPublic Gateを通過した場合 |
| `svg-to-pdfkit` | Not adopted | Manufacturing Release Pathでは採用しない |
| DXF as Geometry Source | Prohibited | 永続禁止 |
| Browser Print for Manufacturing PDF | Prohibited | 永続禁止 |
| Host-installed Fonts | Prohibited for released PDFs | 永続禁止 |
| Product-specific Drawing / 3D Code | Prohibited | 永続禁止 |
| Automatic Critical AI Region / Provider Fallback | Prohibited | 新ADR、Eval、Security Review、Human Approvalがある場合のみ |

## 2. Adoption Request必須項目

Deferred Technologyを導入するRequestは次を含める。

- 解決する具体的問題
- 現行技術では不足する測定Evidence
- 代替案比較
- Architecture / Security / Cost影響
- Data Migration
- Rollback Plan
- Test / Fixture
- License
- Owner
- 導入期限または見直し条件

「人気だから」「Codexが使いやすいから」「最新版だから」は導入理由にならない。

## 3. Review Timing

- Phase Gateで該当条件を確認する。
- Capacity ReviewでRedis / Kubernetes / Service Busを再評価する。
- Detailed Geometry開始前にOpenCascade / STEPを再評価する。
- External Integration開始前にService Bus / CAM / IFC / BCFを再評価する。
- Public Beta前にFeature Flag SaaS、Status Page、Billing、Support Toolを再評価する。
