const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const { test } = require("node:test");

const repositoryRoot = path.resolve(__dirname, "..");
const verifierModule = import(pathToFileURL(path.join(repositoryRoot, "scripts/verify-cross-repository-ontology-adoption.mjs")).href);
const lock = JSON.parse(fs.readFileSync(path.join(repositoryRoot, "docs/architecture/cross-repository-v1.2-adoption-lock.json"), "utf8"));
const taskGraph = JSON.parse(fs.readFileSync(path.join(repositoryRoot, "docs/plans/ADO_TASK_GRAPH_v1.3.json"), "utf8"));
const canonicalManifest = JSON.parse(fs.readFileSync(path.join(repositoryRoot, "docs/architecture/ontology-architecture-manifest-v1.0.json"), "utf8"));
const gateMetadataPath = path.join(repositoryRoot, "docs/architecture/oa-00c-gate-metadata.json");

function copied(value) {
  return JSON.parse(JSON.stringify(value));
}

function gateMetadataFixture() {
  if (fs.existsSync(gateMetadataPath)) return JSON.parse(fs.readFileSync(gateMetadataPath, "utf8"));
  return {
    metadataVersion: "1.0",
    taskId: "OA-00C",
    repository: "asxeed-codex/asxeed-platform-contracts",
    pullRequestNumber: 999,
    baseBranch: "main",
    headBranch: "codex/OA-00C-cross-repository-v1-2-verification",
    authorizedBaseCommit: "a6445ec5a7fa2e27dabcd49bc494da4b0a5c6672",
    mergeMethodPolicy: "squash",
    humanApprovalRequired: true,
    autoMergeAllowed: false,
  };
}

function sourceRecords(key) {
  if (key === "platformContracts") return [lock.platformContracts.architectureManifest, lock.platformContracts.ontologyVerifier, ...lock.canonicalDocuments];
  const consumer = lock[key];
  return [consumer.adoptionDocument, consumer.adoptionManifest, consumer.mergeReceipt, consumer.governanceProfile, ...consumer.verifiers].filter(Boolean);
}

function repositoryObservation(key) {
  const expected = {
    platformContracts: { evidence: ".ado/artifacts/OA-00", field: "platformOa00EvidenceTree" },
    ado: { evidence: ".ado/artifacts/OA-00A", field: "adoOa00aEvidenceTree" },
    manufacturingOs: { evidence: ".ado/artifacts/OA-00B", field: "manufacturingOa00bEvidenceTree", additional: ".ado/artifacts/OA-00B-POSTMERGE-FIX", additionalField: "manufacturingPostMergeFixEvidenceTree" },
  }[key];
  const evidenceTrees = { [expected.evidence]: lock.historicalPreservation[expected.field] };
  if (expected.additional) evidenceTrees[expected.additional] = lock.historicalPreservation[expected.additionalField];
  return {
    repositoryExists: true,
    remoteMatched: true,
    commitExists: true,
    headDescendsFromPinned: true,
    committedDrift: false,
    worktreeDrift: false,
    pinnedHashes: Object.fromEntries(sourceRecords(key).map((entry) => [entry.path, entry.sha256])),
    evidenceTrees,
    head: key === "platformContracts" ? "1".repeat(40) : key === "ado" ? lock.ado.adoptionCommit : lock.manufacturingOs.adoptionCommit,
  };
}

function adoptionPr(key) {
  const provenance = lock.adoptionProvenance[key];
  const repository = lock[key].repository;
  return {
    number: provenance.pullRequest,
    state: "MERGED",
    isDraft: false,
    baseRefName: "main",
    headRefOid: provenance.finalHead,
    headRepository: { nameWithOwner: repository },
    mergeCommit: { oid: provenance.mergeCommit },
    mergedAt: provenance.mergedAt,
    mergedBy: { login: provenance.humanMergerLogin, is_bot: false },
    autoMergeRequest: null,
    autoMergeWasEnabled: false,
    headTreeOid: provenance.headTree,
    mergeTreeOid: provenance.mergeTree,
  };
}

function canonicalDocumentsForConsumer() {
  return lock.canonicalDocuments.map(({ name, path, version, sha256 }) => ({ name, canonicalPath: path, version, sha256 }));
}

function baseline() {
  const gateMetadata = gateMetadataFixture();
  const adoProfile = {
    authorityHierarchy: lock.authorityHierarchy.map((authority, index) => ({ precedence: index + 1, authority })),
    ownedResponsibilities: ["Knowledge Core runtime responsibility", "Ontology Builder and Knowledge Orchestrator orchestration"],
    adoKnowledgeCoreResponsibilities: ["Ontology query and traversal responsibility"],
    ontologyBuilderResponsibilities: ["Ontology Judge coordination"],
    prohibitedManufacturingResponsibilities: ["Product DSL Generator ownership", "Critical manufacturing-knowledge approval"],
    approvalTruthfulness: { criticalManufacturingApprovalOwner: "human" },
    namespaceAndOrganizationPolicy: {
      namespaceFamilies: copied(lock.namespaceLock.families), organizationIdRequired: true, explicitNamespaceRequired: true, readProposalApprovalWriteSeparated: true,
    },
    productDslPosition: {
      artifactType: "immutable-versioned-execution-artifact", persistentKnowledgeTruth: false, generatorOwner: "Manufacturing OS", historicalVersionsImmutableAndReadable: true, requiredProvenance: copied(lock.productDslLock.futureProvenance),
    },
    ruleBoundary: {
      ruleContentLocation: "Ontology", deterministicEvaluatorLocation: "Manufacturing OS code", deterministicRuleEnginePreserved: true,
    },
    storagePolicy: { approvedInitialPersistence: ["PostgreSQL", "Blob"], graphSemanticsPersistenceIndependent: true, graphDatabaseApproved: false },
    dependencyPolicy: {
      directCrossDomainSqlOrmViewsTriggersStoredProcedures: "prohibited", manufacturingOsDomainStorageAccess: "prohibited", approvedIntegrationBoundaries: ["versioned APIs", "versioned messages", "versioned events", "versioned artifacts", "versioned platform-contract packages"],
    },
  };
  const manufacturingProfile = {
    authorityHierarchy: lock.authorityHierarchy.map((authority, index) => ({ precedence: index + 1, authority })),
    ownedResponsibilities: ["Manufacturing Ontology Pack", "manufacturing semantic validation", "Product DSL Generator", "deterministic Rule Engine and Rule Results"],
    prohibitedResponsibilities: ["ADO Knowledge Core runtime", "ADO Ontology Builder orchestration"],
    manufacturingApprovalPolicy: {
      humanExclusive: ["Critical manufacturing-knowledge approval"], adoCriticalManufacturingApproval: false, oa00bMergeIsManufacturingApproval: false,
    },
    namespaceAndOrganizationPolicy: {
      namespaceFamilies: copied(lock.namespaceLock.families), organizationIdRequired: true, explicitNamespaceRequired: true, readProposalApprovalWriteSeparated: true,
    },
    productDslTransitionPolicy: {
      position: "immutable-versioned-execution-artifact", persistentKnowledgeTruth: false, generatorOwner: "Manufacturing OS", legacyImmutableAndReadable: true, futureProvenanceRequiredOnLegacyNow: false, migration: "additive-dual-read-reversible-human-gated", futureRequiredProvenance: copied(lock.productDslLock.futureProvenance),
    },
    ruleTransitionPolicy: {
      deterministicEvaluatorLocation: "Manufacturing OS code", deterministicRuleEnginePreserved: true, typedOperatorsPreserved: true, decimalAndUnitBehaviorPreserved: true, dependencyAndCycleBehaviorPreserved: true, threeValuedResultsPreserved: true, failClosedPreserved: true, currentRuleEngineReadsOntology: false, currentRuleEngineBehaviorChangedByOa00b: false,
    },
    pueBoundary: {
      currentRuntimeFlow: "PUE -> existing Product DSL pipeline", currentPueReadsOrWritesOntology: false, currentPueBehaviorChangedByOa00b: false, ontologyIntegrationStatus: "not-started", targetFlow: lock.pueLock.targetFlow,
    },
    storagePolicy: { approvedInitialPersistence: ["PostgreSQL", "Blob"], graphSemanticsPersistenceIndependent: true, graphDatabaseApproved: false },
    dependencyPolicy: {
      directCrossDomainSqlOrmViewsTriggersStoredProcedures: "prohibited", adoDomainStorageAccess: "prohibited", approvedIntegrationBoundaries: copied(lock.integrationLock.approvedBoundaries),
    },
  };
  const verifierResults = Object.fromEntries([
    "platformArchitecture", "platformHistoricalCrossRepository", "platformGovernance", "platformOntology", "adoArchitecture", "adoGovernance", "adoOntology", "manufacturingArchitecture", "manufacturingGovernance", "manufacturingOntology",
  ].map((key) => [key, { status: "pass", exitCode: 0, reportedStatus: "pass" }]));
  const gatePr = {
    number: gateMetadata.pullRequestNumber,
    state: "OPEN",
    isDraft: true,
    baseRefName: "main",
    headRefName: gateMetadata.headBranch,
    headRefOid: "1".repeat(40),
    headRepository: { nameWithOwner: gateMetadata.repository },
    autoMergeRequest: null,
    autoMergeWasEnabled: false,
    mergedAt: null,
    mergedBy: null,
    mergeCommit: null,
    title: "OA-00C: verify cross-repository Architecture v1.2 adoption",
    headTreeOid: "2".repeat(40),
    mergeTreeOid: null,
  };
  return {
    gateMetadata,
    observations: {
      repositories: {
        platformContracts: repositoryObservation("platformContracts"),
        ado: repositoryObservation("ado"),
        manufacturingOs: repositoryObservation("manufacturingOs"),
      },
      canonicalManifest: copied(canonicalManifest),
      taskGraph: copied(taskGraph),
      platformTexts: { freeze: "Platform Contracts remains domain-neutral and must not execute ontology queries", boundaries: "Platform Contracts remains domain-neutral" },
      ado: {
        manifest: {
          localAdoptionStatus: "checkpoint-review-required", authorityHierarchy: copied(lock.authorityHierarchy), documents: canonicalDocumentsForConsumer(), ownershipSummary: { orderEngineOwns: ["customer", "order", "quantity", "price", "invoice", "inventory"] }, prohibitedAuthorityEscalation: { separateKnowledgeOsAuthorized: false, separateOntologyOsAuthorized: false },
        },
        profile: adoProfile,
      },
      manufacturingOs: {
        manifest: {
          localAdoptionStatus: "checkpoint-review-required", authorityHierarchy: copied(lock.authorityHierarchy), documents: canonicalDocumentsForConsumer(), ownershipSummary: { orderEngineOwns: ["customer", "order", "quantity", "price", "invoice", "inventory"] }, prohibitedAuthorityEscalation: { adoManufacturingSemanticOwnership: false },
        },
        profile: manufacturingProfile,
        mergeReceipt: {
          taskId: "OA-00B", pullRequest: 26, repository: lock.manufacturingOs.repository, finalPrHead: lock.adoptionProvenance.manufacturingOs.finalHead, mergeCommit: lock.adoptionProvenance.manufacturingOs.mergeCommit, mergedAt: lock.adoptionProvenance.manufacturingOs.mergedAt, mergedBy: { login: "asxeed-codex", isBot: false }, mergedByHuman: true, treeEquivalenceVerified: true, contentHashes: { finalPrHeadTree: { value: lock.adoptionProvenance.manufacturingOs.headTree }, mergeCommitTree: { value: lock.adoptionProvenance.manufacturingOs.mergeTree } }, humanApprovalStatement: "The merge does not approve manufacturing knowledge.",
        },
      },
      verifierResults,
      adoptionPrs: { platformContracts: adoptionPr("platformContracts"), ado: adoptionPr("ado"), manufacturingOs: adoptionPr("manufacturingOs") },
      gatePr,
      gateGit: { prHeadExists: true, prHeadDescendsFromBase: true, prHeadAncestorOfCurrent: true, mergeCommitExists: false, mergeDescendsFromBase: false, mergeAncestorOfCurrent: false },
      navigation: {
        rootReadme: "[verification](docs/architecture/CROSS_REPOSITORY_ARCHITECTURE_V1_2_VERIFICATION.md) [lock](docs/architecture/cross-repository-v1.2-adoption-lock.json) [gate](docs/architecture/oa-00c-gate-metadata.json) [verifier](scripts/verify-cross-repository-ontology-adoption.mjs)",
        docsReadme: "[verification](architecture/CROSS_REPOSITORY_ARCHITECTURE_V1_2_VERIFICATION.md) [lock](architecture/cross-repository-v1.2-adoption-lock.json) [gate](architecture/oa-00c-gate-metadata.json) [verifier](../scripts/verify-cross-repository-ontology-adoption.mjs)",
      },
      originalManufacturingFingerprint: lock.historicalPreservation.originalManufacturingCheckoutFingerprint,
    },
  };
}

async function verify(fixture) {
  const { verifyCrossRepositoryOntologyAdoption } = await verifierModule;
  return verifyCrossRepositoryOntologyAdoption({ lock: fixture.lock ?? copied(lock), gateMetadata: fixture.gateMetadata, observations: fixture.observations });
}

async function assertFails(fixture, check) {
  const report = await verify(fixture);
  assert.equal(report.status, "fail", JSON.stringify(report, null, 2));
  assert.ok(report.errors.some((error) => error.check === check), JSON.stringify(report, null, 2));
}

function postMergeFixture() {
  const fixture = baseline();
  Object.assign(fixture.observations.gatePr, {
    state: "MERGED", isDraft: false, mergedAt: "2026-08-08T10:00:00Z", mergedBy: { login: "human-reviewer", is_bot: false }, mergeCommit: { oid: "3".repeat(40) }, mergeTreeOid: fixture.observations.gatePr.headTreeOid,
  });
  Object.assign(fixture.observations.gateGit, { mergeCommitExists: true, mergeDescendsFromBase: true, mergeAncestorOfCurrent: true });
  return fixture;
}

test("valid pre-merge OA-00C gate passes", async () => {
  const report = await verify(baseline());
  assert.equal(report.status, "pass", JSON.stringify(report, null, 2));
  assert.equal(report.gateLifecycle, "pre-merge");
  assert.equal(report.oa01State, "blocked");
});

test("valid post-merge OA-00C gate fixture passes without source changes", async () => {
  const report = await verify(postMergeFixture());
  assert.equal(report.status, "pass", JSON.stringify(report, null, 2));
  assert.equal(report.gateLifecycle, "post-merge");
  assert.equal(report.oa01State, "eligible-ready");
  assert.equal(report.oa02AndLaterState, "dependency-blocked");
});

for (const [name, key] of [["Platform Architecture", "platformContracts"], ["ADO adoption", "ado"], ["Manufacturing adoption", "manufacturingOs"]]) {
  test(`wrong ${name} commit fails`, async () => {
    const fixture = baseline();
    const field = key === "platformContracts" ? "architectureCommit" : "adoptionCommit";
    fixture.lock = copied(lock);
    fixture.lock[key][field] = "0".repeat(40);
    await assertFails(fixture, "repositoryCommitLock");
  });
}

test("missing pinned commit fails", async () => { const f = baseline(); f.observations.repositories.ado.commitExists = false; await assertFails(f, "repositoryCommitLock"); });
test("non-descendant consumer HEAD fails", async () => { const f = baseline(); f.observations.repositories.manufacturingOs.headDescendsFromPinned = false; await assertFails(f, "repositoryAncestry"); });
test("committed canonical drift fails", async () => { const f = baseline(); f.observations.repositories.ado.committedDrift = true; await assertFails(f, "committedCanonicalDrift"); });
test("uncommitted canonical drift fails", async () => { const f = baseline(); f.observations.repositories.manufacturingOs.worktreeDrift = true; await assertFails(f, "uncommittedCanonicalDrift"); });
test("canonical source hash mismatch fails", async () => { const f = baseline(); f.observations.repositories.platformContracts.pinnedHashes[lock.canonicalDocuments[0].path] = "0".repeat(64); await assertFails(f, "sourceHashes"); });
test("canonical 18-document hash mismatch fails", async () => { const f = baseline(); f.observations.canonicalManifest.documents[0].sha256 = "0".repeat(64); await assertFails(f, "canonicalDocuments"); });
test("wrong authority order fails", async () => { const f = baseline(); f.observations.ado.manifest.authorityHierarchy.reverse(); await assertFails(f, "authorityHierarchy"); });
test("ADO Knowledge Core ownership removed fails", async () => { const f = baseline(); f.observations.ado.profile.ownedResponsibilities.shift(); await assertFails(f, "adoOwnership"); });
test("ADO manufacturing ownership escalation fails", async () => { const f = baseline(); f.observations.ado.profile.ownedResponsibilities.push("Product DSL Generator ownership"); await assertFails(f, "adoOwnership"); });
test("Manufacturing Ontology Pack ownership removed fails", async () => { const f = baseline(); f.observations.manufacturingOs.profile.ownedResponsibilities.shift(); await assertFails(f, "manufacturingOwnership"); });
test("Manufacturing Product DSL Generator ownership removed fails", async () => { const f = baseline(); f.observations.manufacturingOs.profile.ownedResponsibilities = f.observations.manufacturingOs.profile.ownedResponsibilities.filter((value) => value !== "Product DSL Generator"); await assertFails(f, "manufacturingOwnership"); });
test("AI Critical manufacturing approval allowed fails", async () => { const f = baseline(); f.observations.manufacturingOs.profile.manufacturingApprovalPolicy.adoCriticalManufacturingApproval = true; await assertFails(f, "humanApproval"); });
test("Product DSL treated as persistent truth fails", async () => { const f = baseline(); f.observations.manufacturingOs.profile.productDslTransitionPolicy.persistentKnowledgeTruth = true; await assertFails(f, "productDsl"); });
test("deterministic Rule Engine boundary removed fails", async () => { const f = baseline(); f.observations.manufacturingOs.profile.ruleTransitionPolicy.deterministicRuleEnginePreserved = false; await assertFails(f, "ruleEngine"); });
test("current PUE falsely marked Ontology-backed fails", async () => { const f = baseline(); f.observations.manufacturingOs.profile.pueBoundary.currentPueReadsOrWritesOntology = true; await assertFails(f, "pueState"); });
test("current Rule Engine falsely marked Ontology-backed fails", async () => { const f = baseline(); f.observations.manufacturingOs.profile.ruleTransitionPolicy.currentRuleEngineReadsOntology = true; await assertFails(f, "ruleEngine"); });
test("Graph Database approval fails", async () => { const f = baseline(); f.observations.ado.profile.storagePolicy.graphDatabaseApproved = true; await assertFails(f, "storagePolicy"); });
test("organization isolation removal fails", async () => { const f = baseline(); f.observations.ado.profile.namespaceAndOrganizationPolicy.organizationIdRequired = false; await assertFails(f, "organizationIsolation"); });
test("namespace authority separation removal fails", async () => { const f = baseline(); f.observations.manufacturingOs.profile.namespaceAndOrganizationPolicy.readProposalApprovalWriteSeparated = false; await assertFails(f, "namespacePolicy"); });
test("direct cross-domain database access allowed fails", async () => { const f = baseline(); f.observations.ado.profile.dependencyPolicy.directCrossDomainSqlOrmViewsTriggersStoredProcedures = "allowed"; await assertFails(f, "integrationPolicy"); });
test("Order Engine authority removal fails", async () => { const f = baseline(); f.observations.ado.manifest.ownershipSummary.orderEngineOwns.shift(); await assertFails(f, "orderAuthority"); });
test("separate Knowledge OS authorization fails", async () => { const f = baseline(); f.observations.ado.manifest.prohibitedAuthorityEscalation.separateKnowledgeOsAuthorized = true; await assertFails(f, "noAuthorityEscalation"); });
test("Platform Contracts operational ownership fails", async () => { const f = baseline(); f.observations.platformTexts.freeze = "Platform Contracts owns operational Ontology"; await assertFails(f, "platformNeutrality"); });
test("OA-00 historical evidence mutation fails", async () => { const f = baseline(); f.observations.repositories.platformContracts.evidenceTrees[".ado/artifacts/OA-00"] = "0".repeat(40); await assertFails(f, "historicalEvidence"); });
test("OA-00A historical evidence mutation fails", async () => { const f = baseline(); f.observations.repositories.ado.evidenceTrees[".ado/artifacts/OA-00A"] = "0".repeat(40); await assertFails(f, "historicalEvidence"); });
test("OA-00B historical evidence mutation fails", async () => { const f = baseline(); f.observations.repositories.manufacturingOs.evidenceTrees[".ado/artifacts/OA-00B"] = "0".repeat(40); await assertFails(f, "historicalEvidence"); });
test("Manufacturing merge receipt tamper fails", async () => { const f = baseline(); f.observations.manufacturingOs.mergeReceipt.mergeCommit = "0".repeat(40); await assertFails(f, "manufacturingMergeReceipt"); });
test("PR #26 provenance tamper fails", async () => { const f = baseline(); f.observations.adoptionPrs.manufacturingOs.headTreeOid = "0".repeat(40); await assertFails(f, "humanAdoptionProvenance"); });
test("OA-01 started during pre-merge gate fails", async () => { const f = baseline(); f.observations.taskGraph.tasks.find((task) => task.id === "OA-01").status = "in-progress"; await assertFails(f, "successorSourceState"); });
test("OA-02 started early fails", async () => { const f = baseline(); f.observations.taskGraph.tasks.find((task) => task.id === "OA-02").status = "in-progress"; await assertFails(f, "successorSourceState"); });
test("missing human checkpoint fails", async () => { const f = baseline(); f.gateMetadata.humanApprovalRequired = false; await assertFails(f, "gateMetadata"); });
test("auto-merge allowed fails", async () => { const f = baseline(); f.observations.gatePr.autoMergeWasEnabled = true; await assertFails(f, "autoMerge"); });
test("wrong OA-00C PR number fails", async () => { const f = baseline(); f.gateMetadata.pullRequestNumber += 1; await assertFails(f, "gateIdentity"); });
test("unrelated OA-00C PR fails", async () => { const f = baseline(); f.observations.gatePr.title = "Unrelated change"; await assertFails(f, "gateIdentity"); });
test("wrong OA-00C base branch fails", async () => { const f = baseline(); f.observations.gatePr.baseRefName = "release"; await assertFails(f, "gateIdentity"); });
test("post-merge current HEAD not descendant of merge commit fails", async () => { const f = postMergeFixture(); f.observations.gateGit.mergeAncestorOfCurrent = false; await assertFails(f, "postMergeGate"); });
test("squash tree mismatch fails", async () => { const f = postMergeFixture(); f.observations.gatePr.mergeTreeOid = "0".repeat(40); await assertFails(f, "squashTree"); });
test("bot or fabricated human merger fails", async () => { const f = postMergeFixture(); f.observations.gatePr.mergedBy.is_bot = true; await assertFails(f, "postMergeGate"); });
test("README navigation missing fails", async () => { const f = baseline(); f.observations.navigation.rootReadme = f.observations.navigation.rootReadme.replace("scripts/verify-cross-repository-ontology-adoption.mjs", "missing-verifier"); await assertFails(f, "readmeNavigation"); });
