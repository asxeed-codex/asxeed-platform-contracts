# ASXEED SPRINT EXECUTION PLAN v1.0

**対象:** ADO / ASXEED Manufacturing OS / Platform Contracts  
**上位基準:** Architecture Freeze v1.1 → Technology Baseline v1.0 → Master Implementation Plan v1.2 → ADO Task Graph v1.2  
**Sprint cadence:** 原則1週間。Gate未通過時は次Sprintの依存Taskを開始しない。  
**計画期間:** Sprint 00〜11（12 Sprint）  

## 1. 目的

103件のADO Taskを、依存関係を壊さず、3つのProgramを可能な範囲で並行実行する12個のSprintへ割り当てる。Sprintは依存関係の正本ではなく時間管理単位であり、依存関係の正本はADO Task Graphの`dependsOn`である。

## 2. Sprint運用ルール

- 1 Sprintは原則1週間。開始時にReady TaskだけをCommitする。
- Sprint内でも`dependsOn`を満たすまでTaskを開始しない。
- Phase GateはHuman Approvalを含む。Gate未通過のまま次Phaseへ進まない。
- Carry-overは自動で行わず、未完理由・Risk・次Sprint影響を記録する。
- Architecture、Security、Critical製造判断は速度のために省略しない。
- 1 Taskは原則1 Repository、1成果、1 Draft PRとする。
- Program番号は責務を示し、完全な直列順序を示さない。

## 3. 12 Sprint Overview

| Sprint | Goal | Main Programs | Milestone | Task数 |
|---|---|---|---|---:|
| `SPRINT-00` | Architecture Operational | COMMON-FOUNDATION | M0 Architecture Operational | 7 |
| `SPRINT-01` | Platform Contracts and Technology Validation | COMMON-FOUNDATION | M1前半 Platform Contract Baseline | 14 |
| `SPRINT-02` | Cloud, Security and Workflow Foundation | COMMON-FOUNDATION | M1 Cloud Foundation | 11 |
| `SPRINT-03` | DSL and ADO Execution Foundations | PROGRAM-1, PROGRAM-2 | M2前半 Rule Runtime / M4前半 ADO Runner | 11 |
| `SPRINT-04` | Parts, Geometry, Judges and PUE Intake | PROGRAM-1, PROGRAM-2 | M2 Manufacturing Core | 13 |
| `SPRINT-05` | Drawing, 3D, Product UI and Approval Loop | PROGRAM-1, PROGRAM-2, PROGRAM-3 | M4 ADO Approval Loop | 21 |
| `SPRINT-06` | Visual Manufacturing and Safe PUE Integration | PROGRAM-2, PROGRAM-3 | M3 Visual Manufacturing / M5 Safe PUE | 7 |
| `SPRINT-07` | Pilot Readiness and Baseline Run | PORTFOLIO | M6前半 Pilot Baseline | 3 |
| `SPRINT-08` | Pilot Quality, Resilience and Security | PORTFOLIO | M6検証完了 | 5 |
| `SPRINT-09` | Operational UAT and Practical Prototype Gate | PORTFOLIO | M6 Practical Prototype | 2 |
| `SPRINT-10` | Order Integration and Public Demo Build | PROGRAM-2, PROGRAM-3 | M7前半 Integration / Demo | 6 |
| `SPRINT-11` | Customer Demonstration and Beta Readiness | PROGRAM-3, PORTFOLIO | M7 Customer Demonstration | 3 |

## 4. Sprint Details

### SPRINT-00：Architecture Operational

**Goal:** Architecture Freeze、Technology Baseline、Task Contract、Architecture JudgeをRepositoryとCIへ反映し、大規模実装を安全に開始できる状態にする。

**Milestone:** M0 Architecture Operational

**Task IDs**

```text
P0-T01
P0-T02
P0-T03
P0-T04
P0-T05
P0-T06
P0-GATE
```

**Sprint Definition of Done**

- 対象TaskがRequired Artifactを生成している。
- Codex自己検証とADO Judge結果が保存されている。
- Mandatory Approval対象はHuman Approval済みである。
- 次Sprintへ渡すBlocker、Risk、Rollback情報が明示されている。
- Milestone Gateを含むSprintではGate判定が完了している。

### SPRINT-01：Platform Contracts and Technology Validation

**Goal:** 共通Contract、Repository基盤、Reusable CI、Bicep Module、および7つの技術互換性Spikeを完了する。

**Milestone:** M1前半 Platform Contract Baseline

**Task IDs**

```text
P1-T01
P1-T02
P1-T03
P1-T04
P1-T05
P1-T06
P1-T07
P1-TS01
P1-TS02
P1-TS03
P1-TS04
P1-TS05
P1-TS06
P1-TS07
```

**Sprint Definition of Done**

- 対象TaskがRequired Artifactを生成している。
- Codex自己検証とADO Judge結果が保存されている。
- Mandatory Approval対象はHuman Approval済みである。
- 次Sprintへ渡すBlocker、Risk、Rollback情報が明示されている。
- Milestone Gateを含むSprintではGate判定が完了している。

### SPRINT-02：Cloud, Security and Workflow Foundation

**Goal:** Development／Staging、Identity、Storage、PostgreSQL、Temporal、Job API、Audit、Observabilityを統合し、Cloud Jobを安全に完走させる。

**Milestone:** M1 Cloud Foundation

**Task IDs**

```text
P1-T08
P1-T09
P1-T10
P1-T11
P1-T12
P1-T13
P1-T14
P1-T15
P1-T16
P1-T17
P1-GATE
```

**Sprint Definition of Done**

- 対象TaskがRequired Artifactを生成している。
- Codex自己検証とADO Judge結果が保存されている。
- Mandatory Approval対象はHuman Approval済みである。
- 次Sprintへ渡すBlocker、Risk、Rollback情報が明示されている。
- Milestone Gateを含むSprintではGate判定が完了している。

### SPRINT-03：DSL and ADO Execution Foundations

**Goal:** Reference DSL、Instance、Decimal／Unit、Rule ASTの基礎と、ADO Goal／Plan／Task／Codex Runnerの入口を並行実装する。

**Milestone:** M2前半 Rule Runtime / M4前半 ADO Runner

**Task IDs**

```text
P2-T01
P2-T02
P2-T03
P2-T04
P2-T05
P2-T06
P2-T07
P4-T01
P4-T02
P4-T03
P4-T04
```

**Sprint Definition of Done**

- 対象TaskがRequired Artifactを生成している。
- Codex自己検証とADO Judge結果が保存されている。
- Mandatory Approval対象はHuman Approval済みである。
- 次Sprintへ渡すBlocker、Risk、Rollback情報が明示されている。
- Milestone Gateを含むSprintではGate判定が完了している。

### SPRINT-04：Parts, Geometry, Judges and PUE Intake

**Goal:** Parts／Geometryを完成させ、ADOの主要Judgeと、PUEのSecure Intake／OCR／Evidence基盤を並行構築する。

**Milestone:** M2 Manufacturing Core

**Task IDs**

```text
P2-T08
P2-T09
P2-T10
P2-T11
P2-GATE
P4-T05
P4-T06
P4-T07
P5-T01
P5-T02
P5-T03
P5-T04
P5-T05
```

**Sprint Definition of Done**

- 対象TaskがRequired Artifactを生成している。
- Codex自己検証とADO Judge結果が保存されている。
- Mandatory Approval対象はHuman Approval済みである。
- 次Sprintへ渡すBlocker、Risk、Rollback情報が明示されている。
- Milestone Gateを含むSprintではGate判定が完了している。

### SPRINT-05：Drawing, 3D, Product UI and Approval Loop

**Goal:** Drawing／3D／Manufacturing UIの基礎、ADO Fix・Approval・Release、PUE Candidate／Conflict／Model管理を並行実装する。

**Milestone:** M4 ADO Approval Loop

**Task IDs**

```text
P3-T01
P3-T02
P3-T03
P3-T04
P3-T05
P3-T06
P3-T07
P3-T08
P3-T09
P3-T10
P4-T08
P4-T09
P4-T10
P4-T11
P4-T12
P4-GATE
P5-T06
P5-T07
P5-T08
P5-T09
P5-T10
```

**Sprint Definition of Done**

- 対象TaskがRequired Artifactを生成している。
- Codex自己検証とADO Judge結果が保存されている。
- Mandatory Approval対象はHuman Approval済みである。
- 次Sprintへ渡すBlocker、Risk、Rollback情報が明示されている。
- Milestone Gateを含むSprintではGate判定が完了している。

### SPRINT-06：Visual Manufacturing and Safe PUE Integration

**Goal:** 2D／3D／Parts連動、製造承認、E2E UI、PUE Eval、Draft DSL承認接続を完成させる。

**Milestone:** M3 Visual Manufacturing / M5 Safe PUE

**Task IDs**

```text
P3-T11
P3-T12
P3-T13
P3-GATE
P5-T11
P5-T12
P5-GATE
```

**Sprint Definition of Done**

- 対象TaskがRequired Artifactを生成している。
- Codex自己検証とADO Judge結果が保存されている。
- Mandatory Approval対象はHuman Approval済みである。
- 次Sprintへ渡すBlocker、Risk、Rollback情報が明示されている。
- Milestone Gateを含むSprintではGate判定が完了している。

### SPRINT-07：Pilot Readiness and Baseline Run

**Goal:** Pilot Data、承認者、Runbook、Infrastructure Readinessを整え、実仕様書End-to-End Baselineを完走する。

**Milestone:** M6前半 Pilot Baseline

**Task IDs**

```text
P6-T01
P6-T02
P6-T03
```

**Sprint Definition of Done**

- 対象TaskがRequired Artifactを生成している。
- Codex自己検証とADO Judge結果が保存されている。
- Mandatory Approval対象はHuman Approval済みである。
- 次Sprintへ渡すBlocker、Risk、Rollback情報が明示されている。
- Milestone Gateを含むSprintではGate判定が完了している。

### SPRINT-08：Pilot Quality, Resilience and Security

**Goal:** 寸法境界、Revision／Revocation、Backup／Restore、負荷、障害注入、Securityを検証する。

**Milestone:** M6検証完了

**Task IDs**

```text
P6-T04
P6-T05
P6-T06
P6-T07
P6-T08
```

**Sprint Definition of Done**

- 対象TaskがRequired Artifactを生成している。
- Codex自己検証とADO Judge結果が保存されている。
- Mandatory Approval対象はHuman Approval済みである。
- 次Sprintへ渡すBlocker、Risk、Rollback情報が明示されている。
- Milestone Gateを含むSprintではGate判定が完了している。

### SPRINT-09：Operational UAT and Practical Prototype Gate

**Goal:** レウによるOperational UATを完了し、実用プロトタイプを正式判定する。

**Milestone:** M6 Practical Prototype

**Task IDs**

```text
P6-T09
P6-GATE
```

**Sprint Definition of Done**

- 対象TaskがRequired Artifactを生成している。
- Codex自己検証とADO Judge結果が保存されている。
- Mandatory Approval対象はHuman Approval済みである。
- 次Sprintへ渡すBlocker、Risk、Rollback情報が明示されている。
- Milestone Gateを含むSprintではGate判定が完了している。

### SPRINT-10：Order Integration and Public Demo Build

**Goal:** 既存Order Engineとの安全な接続と、Productionから隔離されたPublic Demoを構築する。

**Milestone:** M7前半 Integration / Demo

**Task IDs**

```text
P7-T01
P7-T02
P7-T03
P7-T04
P7-T05
P7-T06
```

**Sprint Definition of Done**

- 対象TaskがRequired Artifactを生成している。
- Codex自己検証とADO Judge結果が保存されている。
- Mandatory Approval対象はHuman Approval済みである。
- 次Sprintへ渡すBlocker、Risk、Rollback情報が明示されている。
- Milestone Gateを含むSprintではGate判定が完了している。

### SPRINT-11：Customer Demonstration and Beta Readiness

**Goal:** Webサイト、動画、Demo Script、Guided Customer Demo検証を完了し、β準備へ進む。

**Milestone:** M7 Customer Demonstration

**Task IDs**

```text
P7-T07
P7-T08
P7-GATE
```

**Sprint Definition of Done**

- 対象TaskがRequired Artifactを生成している。
- Codex自己検証とADO Judge結果が保存されている。
- Mandatory Approval対象はHuman Approval済みである。
- 次Sprintへ渡すBlocker、Risk、Rollback情報が明示されている。
- Milestone Gateを含むSprintではGate判定が完了している。

## 5. Pilot Release Flow

```text
SPRINT-07 Pilot準備・Baseline
→ SPRINT-08 品質・復旧・負荷・Security検証
→ SPRINT-09 Operational UAT
→ P6-GATE Practical Prototype承認
→ Pilot Release
→ SPRINT-10 Order連携・Public Demo構築
→ SPRINT-11 Customer Demo／β準備
```

## 6. Sprint Completion Evidence

- Sprint summary
- 完了Task一覧／未完Task一覧
- Judge summary
- Risk report
- Cost report
- Rollback plan
- Milestone evidence
- 次Sprint Ready Task一覧

## 7. 変更手順

Sprint割当を変更する場合でもTask IDと`dependsOn`を変更しない。依存関係を変更する場合はMaster Plan、Task Graph、Sprint Plan、該当Codex Packを同時更新し、Architecture JudgeとHuman Approvalを通す。
