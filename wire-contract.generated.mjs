/*
 * GENERATED - DO NOT EDIT.
 *
 * Written by scripts/generate-wire-copies.mts from @abloh/core's wire contracts, which is the one owner of every
 * value below. This process cannot import that package, so the values are rendered here rather
 * than typed here - see the generator's header for what typing them a second time cost.
 *
 * To change a value, change it in the contract and run `pnpm gen:wire`.
 */

/**
 * The model service's own address and limits, so the endpoint this Action hands the CLI is the
 * SERVICE rather than one of its doors.
 *
 * The hosted producer supplied the chat-completions path, which every resolver in this product
 * honours as a customer's deliberate chat-only routing - so the surface that survives the
 * endpoint's idle timer was never reached on a hosted run. A base names the service.
 */
export const MODEL_SERVICE_CONTRACT_VERSION = "abloh-model-service/v1";
export const MODEL_SERVICE_BASE_PATH = "/api/v1/model";
export const MODEL_SERVICE_ROUTE_PATHS = [
  "/api/v1/model/chat/completions",
  "/api/v1/model/responses",
];

/** The service's own declared limits, so a runner-side producer states the same numbers. */
export const MODEL_SERVICE_LIMITS = Object.freeze({
  "promptBytes": 1048576,
  "schemaBytes": 65536,
  "requestEnvelopeBytes": 16384,
  "requestBodyBytes": 1130496,
  "replyBytes": 2097152,
  "completionTokensMin": 1,
  "completionTokensMax": 64000,
  "temperatureMin": 0,
  "temperatureMax": 2,
  "upstreamDeadlineMs": 290000,
});

/** F51: every provider this runner's coverage may be produced by, from the capability registry. */
export const COVERAGE_PROVIDER_MATRIX = Object.freeze({
  "jest": [
    "v8",
    "babel",
    "aster",
  ],
  "vitest": [
    "v8",
    "aster",
  ],
  "mocha": [
    "c8",
  ],
  "node-test": [
    "c8",
    "aster",
  ],
  "ava": [
    "c8",
    "aster",
  ],
  "tap": [
    "c8",
    "aster",
  ],
  "jasmine": [
    "c8",
  ],
  "bun": [
    "bun-lcov",
  ],
  "deno": [
    "deno-lcov",
  ],
  "angular-karma": [
    "istanbul",
  ],
  "angular-vitest": [
    "istanbul",
  ],
});

/** F85: every raw sidecar format a provider writes. */
export const RAW_COVERAGE_FORMATS = [
  "istanbul-coverage-final-v1",
  "lcov-v1",
  "aster-line-map-v1",
];

/** F52: the closed diff-coverage cannot-attest vocabulary. An unrecognised code is a hard failure. */
export const DIFF_COVERAGE_CANNOT_ATTEST_REASONS = [
  "coverage-provider-unavailable",
  "coverage-provider-bundled-broken",
  "coverage-provider-unsupported-runner",
  "coverage-provider-cache-unusable",
  "coverage-provider-not-staged",
  "coverage-provider-registry-unreachable",
  "coverage-runner-not-installed",
  "coverage-contradicts-gutting",
  "coverage-provider-version-mismatch",
  "coverage-run-failed",
  "coverage-report-missing",
  "coverage-report-invalid",
  "coverage-report-too-large",
  "coverage-aggregate-irreconcilable",
  "coverage-scope-invalid",
  "coverage-path-not-addressable",
  "coverage-scope-incomplete",
  "tests-import-built-output",
  "rebuild-before-measuring-failed",
  "coverage-acquisition-failed",
  "package-unmeasurable",
];

/** F23: what a mutation pass may report. A value missing here fails a run's own upload. */
export const MUTATION_SCOPE_KINDS = [
  "original",
  "covered-only",
  "covered-plus-error-handlers",
  "error-handlers-only",
];
export const MUTATION_SKIP_REASONS = [
  "layer-0-failed",
  "no-covered-changed-lines",
  "layer-0-unavailable",
];
export const MUTATION_NOT_RUN_REASONS = [
  "empty-scope",
  "baseline-abort",
  "pre-mutation-deadline",
  "job-time-budget",
  "no-runner",
  "engine-error",
  "engine-timeout",
  "quarantine-not-excludable",
  "test-command-checks-sources",
  "no-test-files",
  "target-not-established",
];

/** F23: the source-checking steps a declared test command can carry. Signed, so closed. */
export const SOURCE_CHECK_STEPS = [
  "eslint",
  "prettier",
  "biome",
  "tsc",
];

/**
 * THE FINDING CONTRACT'S OWN TABLES (audit D01 / F1).
 *
 * The key lists were typed here, in the Action, beside a second copy in the ingest door's egress
 * sanitizer and a third in its value validator. They disagreed: the door accepts, stores and
 * SERVES `about`, `severity` and `severityBasis`, and this projection has never sent one of the
 * three - three hosted readers, already written and structurally unable to fire.
 *
 * ABSENCE IS PER KEY and that is the half that cost a run. One rule over every key wrote `null`
 * for a missing value, which is right for `triage` and wrong for `coveredBy`, whose absence means
 * the run measured no covering population and whose null the door refuses.
 */
export const RUN_FINDING_FIELDS = [
  "mutantId",
  "file",
  "startLine",
  "endLine",
  "mutator",
  "status",
  "coveredBy",
  "routePurity",
  "triage",
];
export const RUN_FINDING_ABSENCE = Object.freeze({
  "mutantId": "omit",
  "file": "omit",
  "startLine": "omit",
  "endLine": "omit",
  "mutator": "omit",
  "status": "omit",
  "coveredBy": "omit",
  "routePurity": "omit",
  "triage": "null",
});

/**
 * The nested half: `triage` is an object, and its own key list and absence rule ride inside this
 * table rather than beside it. ONE list per fact - a second copy of the triage names, exported
 * here and read by nobody, would be the writer-with-no-reader shape this program is against.
 */
export const RUN_FINDING_NESTED = Object.freeze({
  "triage": {
    "fields": [
      "verdict",
      "reasonCode",
      "confidence",
      "description",
      "about",
      "severity",
      "severityBasis",
      "emoji",
      "modelId",
      "promptVersion",
      "effort",
      "overridden",
      "carried",
      "carriedAtSha",
    ],
    "absence": {
      "verdict": "omit",
      "reasonCode": "omit",
      "confidence": "omit",
      "description": "omit",
      "about": "omit",
      "severity": "omit",
      "severityBasis": "omit",
      "emoji": "omit",
      "modelId": "omit",
      "promptVersion": "omit",
      "effort": "omit",
      "overridden": "omit",
      "carried": "omit",
      "carriedAtSha": "omit",
    },
    "whenAbsent": "null",
  },
});

/**
 * The bound on how many findings one run may upload.
 *
 * The Action refuses over it and the customer's whole measurement stops at that refusal, so the
 * number is a fact about the BOUNDARY rather than about this process, and both ends read one.
 */
export const MAX_UPLOADED_FINDINGS = 10000;

/**
 * The bound on a finding's own file path.
 *
 * The door refuses the WHOLE envelope over it and cannot drop the row instead - it requires one
 * finding per survivor - so the run has to say so here rather than take a bare 400 afterwards.
 */
export const FINDING_FILE_PATH_MAX = 512;

/** F91: the closed triage verdicts. A verdict the Action has not heard of loses the finding. */
export const TRIAGE_VERDICTS = [
  "likely-equivalent",
  "real-gap",
  "unclear",
];

/** F27: the receiver's own bounds. Projecting more rows than the door takes loses the upload. */
export const MAX_PACKAGE_ROWS = 8;
export const MAX_MUTANT_ROSTER_ROWS = 20000;

/**
 * Every field a measured package row may carry, and the bound on an excluded row's two strings.
 *
 * They were authored here and again in the ingest door, held together by a test comparing the two
 * lists - which can only fail in a checkout holding both sides, never on a pinned Action meeting a
 * service released afterwards. A field the door gained and this projection did not is a field no
 * upload can carry: `excluded`, `shard` and `replay` each had that shape, and the first of them
 * made the door refuse the WHOLE envelope with every sibling package's evidence inside it.
 */
export const PACKAGE_ROW_FIELDS = [
  "directory",
  "runner",
  "excluded",
  "diffCoverage",
  "mutation",
  "baseline",
  "environmentContractDigest",
  "reachedStage",
];
export const PACKAGE_ROW_EXCLUDED_FIELDS = [
  "reason",
  "remedy",
];
export const PACKAGE_EXCLUSION_TEXT_MAX = 300;

/**
 * F30: the ceiling the setup-trial parser accepts, so the Action refuses before the wire does.
 *
 * Four places acted on this number and each declared it: core's parser, the runner, the route's
 * body limit and the tail probe's padded fixture. A pinned Action that refuses a report the
 * service would take - or sends one it will not - leaves a maintainer with a setup check that
 * never answers, so the bound the DOOR enforces is the one every sender is given.
 */
export const SETUP_TRIAL_MAX_BYTES = 262144;

/** F18: how a pinned client reads a refusal, and the two ways it is deliberately tolerant. */
export const REFUSAL_MESSAGE_MAX = 500;
export const REFUSAL_CODE_RE = /^[A-Za-z0-9_.-]{1,64}$/u;
export const REFUSAL_MESSAGE_PATHS = [
  [
    "error",
    "message",
  ],
  [
    "message",
  ],
];

/**
 * The refusal a RUN produced, as it travels on the upload (error-plane plan, step 7).
 *
 * The Action forwards the object the CLI composed rather than a code the far side looks up in
 * its own table, so these are the door's own bounds and the door's own egress label. A second
 * spelling of either here would silently drop a safe byte or forward a local-only one.
 */
export const RUN_REFUSAL_LIMITS = Object.freeze({
  "code": 128,
  "summary": 8000,
  "remedyText": 4000,
  "reportId": 128,
  "file": 512,
  "key": 256,
  "shape": 512,
  "evidenceItems": 8,
  "evidenceKey": 64,
  "evidenceLabel": 200,
  "evidenceValue": 400,
  "evidenceAt": 256,
  "withheldItems": 8,
  "withheldLabel": 200,
  "destinations": 16,
});
export const RUN_REFUSAL_CODE_RE = /^[A-Za-z0-9_.:-]{1,128}$/u;
export const EVIDENCE_EGRESS_SAFE = "safe";
export const REFUSAL_STAGES = [
  "init",
  "admission",
  "setup",
  "target-detection",
  "environment",
  "baseline",
  "coverage",
  "mutation",
  "proof",
  "gate",
  "boundary",
  "cli",
];
export const REFUSAL_OWNERS = [
  "abloh",
  "repository",
  "environment",
  "account",
  "integration",
  "command",
];
export const REFUSAL_PRIVACY = [
  "authored",
  "egress-safe",
  "local-only",
  "egress-split",
];
export const REFUSAL_DESTINATIONS = [
  "terminal",
  "artifact",
  "markdown",
  "job-log",
  "check",
  "slack",
  "web",
  "setup-comment",
  "playground",
];
export const EVIDENCE_SOURCES = [
  "abloh",
  "customer-command",
  "customer-repository",
  "third-party-tool",
  "control-plane",
];

/**
 * EVERY KEY THE UPLOAD'S `evidence` BLOCK MAY CARRY, from the run-record contract.
 *
 * The projection in `build-handoff.mjs` is a hand-maintained allowlist and every key it forgets
 * is invisible: the producer's suite passes, the service's suite passes, and the field dies
 * between them. Six of the run record's fields died that way, four of them with hosted readers
 * already written and structurally unable to fire. This is the one list both ends read, so the
 * Action's own suite can ask whether the envelope it builds is the envelope the contract
 * describes rather than the one this file happens to construct.
 */
export const RUN_RECORD_EVIDENCE_KEYS = [
  "baseline",
  "counts",
  "diffCoverage",
  "engine",
  "engineFailure",
  "errorHandlers",
  "evidenceProfile",
  "findingCount",
  "findings",
  "fixLoop",
  "floor",
  "gate",
  "interruption",
  "modelCost",
  "mutantRoster",
  "mutantsPlanned",
  "mutantsRun",
  "mutationExecution",
  "mutationScope",
  "mutationWallMs",
  "packages",
  "policy",
  "proposals",
  "rationalesDigest",
  "rawCoverageDigest",
  "rawCoverageFormat",
  "rawReportDigest",
  "redactedReportDigest",
  "rewrittenFiles",
  "schema",
  "scope",
  "scores",
  "skipBaseline",
  "target",
  "tier",
  "triageWallMs",
  "unguardedSites",
  "wallMs",
];

/**
 * The keys EVERY envelope carries, which is the list above minus the handful a producer omits
 * rather than nulls. An ordinary run's envelope may be held to this one exactly.
 */
export const RUN_RECORD_ALWAYS_EMITTED_EVIDENCE_KEYS = [
  "baseline",
  "counts",
  "diffCoverage",
  "engine",
  "engineFailure",
  "errorHandlers",
  "evidenceProfile",
  "findingCount",
  "findings",
  "fixLoop",
  "floor",
  "gate",
  "modelCost",
  "mutantRoster",
  "mutantsPlanned",
  "mutantsRun",
  "mutationExecution",
  "mutationScope",
  "mutationWallMs",
  "packages",
  "policy",
  "proposals",
  "rationalesDigest",
  "rawCoverageDigest",
  "rawCoverageFormat",
  "rawReportDigest",
  "redactedReportDigest",
  "schema",
  "scope",
  "scores",
  "skipBaseline",
  "target",
  "tier",
  "triageWallMs",
  "wallMs",
];

/**
 * WHAT STOPPED A RUN, as the closed vocabularies and bounds this projection holds it to.
 *
 * The record carries no prose by construction - a mechanism, a stage, three integers and the
 * mechanism's own coordinates - so what this Action does with it is BOUND it, on the same
 * two-wall rule `engine-failure-id.ts` states: the runner checks the grammar and the control
 * plane checks membership, and the tighter wall can never silently drop a name core declares.
 */
export const INTERRUPTION_MECHANISMS = [
  "job-clock",
  "pre-mutation-deadline",
  "proposal-loop-wall-clock",
  "proposal-loop-executions",
  "proposal-loop-model-calls",
  "proposal-loop-spend",
  "cancelled",
];
export const RUN_STAGES = [
  "preflight",
  "policy",
  "workspace",
  "setup",
  "detect",
  "baseline",
  "coverage",
  "line-map",
  "mutation",
  "first-coverage",
  "triage",
  "proposal-loop",
  "neighborhood",
  "bug-pool",
  "publication",
];
export const RUN_STAGE_UNITS = [
  "suite-run",
  "test-file",
  "mutant",
  "changed-function",
  "nearby-function",
  "candidate",
  "neighbour",
  "planted-bug",
];
export const RUN_INTERRUPTION_LIMITS = Object.freeze({
  "maxFacts": 8,
  "maxFactKey": 40,
  "maxFactValue": 200,
  "maxProgress": 10000000,
});
export const RUN_INTERRUPTION_FACT_KEY_RE = /^[a-z][A-Za-z0-9]{0,39}$/u;
