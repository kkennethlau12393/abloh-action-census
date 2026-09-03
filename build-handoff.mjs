#!/usr/bin/env node
/**
 * Builds the `abloh-ci-handoff/v2` envelope that the authenticated control-plane
 * endpoint accepts.
 *
 * This replaces a ~240-line jq filter that lived inside the workflow YAML. The jq
 * version could not be unit tested, which is how the producer and the validator in
 * that same file drifted apart on `baseline` keys without anyone noticing.
 *
 * CONTRACT: the output must remain byte-identical to the jq filter's output.
 * `build-handoff.differential.test.mjs` enforces that against every corpus
 * artifact by running both and comparing the serialized result. Two consequences
 * for anyone editing this file:
 *
 *   1. Key insertion order is part of the contract. jq emits object keys in the
 *      order the filter constructs them and this file mirrors that order exactly.
 *      Reordering a property is a behavioural change.
 *   2. jq's `//` is an ALTERNATIVE operator, not a null-coalesce: `a // b` yields
 *      `b` when `a` is null OR false. `alt()` below reproduces that, and it is
 *      deliberately not `??`.
 *
 * This is the ONLY upload builder. The endpoint it feeds derives repository
 * identity from GitHub's signed OIDC token rather than trusting the payload, so
 * no field here may carry a runner-local path.
 */

import { readFileSync, realpathSync } from "node:fs";
import { fileURLToPath } from "node:url";
/*
 * THE WIRE FACTS, WRITTEN FROM `@abloh/core` RATHER THAN TYPED HERE - see the header on
 * `wire-contract.generated.mjs`. Change a value in the contract and run `pnpm gen:wire`.
 */
import {
  DIFF_COVERAGE_CANNOT_ATTEST_REASONS,
  EVIDENCE_EGRESS_SAFE,
  EVIDENCE_SOURCES,
  MAX_MUTANT_ROSTER_ROWS,
  MAX_PACKAGE_ROWS,
  REFUSAL_DESTINATIONS,
  REFUSAL_OWNERS,
  REFUSAL_PRIVACY,
  REFUSAL_STAGES,
  RUN_REFUSAL_CODE_RE,
  RUN_REFUSAL_LIMITS,
  SOURCE_CHECK_STEPS,
} from "./wire-contract.generated.mjs";
/*
 * THE REFUSAL PROJECTION AND THE LINE BOUNDER, SHARED WITH THE OTHER UPLOAD BUILDER.
 *
 * `gate-refusal.mjs` owns the projection and this file imports it. It was written when there were
 * TWO builders - `prepare-upload.mjs` built the self-vouched body - and a field that reached one
 * and not the other was the divergence this product has already paid for four times. That second
 * builder is deleted (error-plane step 15): it had been unreachable from every workflow since
 * 2026-08-03. The module stays where it is, because the near side reads the same projection - the
 * local Markdown renders `report.gate.refusal` rather than looking the code up again - so it is
 * still shared, one caller fewer.
 */
import { gateRefusal, printableLine } from "./gate-refusal.mjs";
/*
 * WHETHER THIS JOB WAS HANDED THE REPOSITORY'S MODEL CREDENTIAL, read by the rule that owns it.
 *
 * The rule lives in `packages/core/src/identity-condition.ts` and arrives here through
 * `pnpm gen:action`, exactly as the three identity sentences do. It is asked HERE rather than
 * carried from the measuring step, because both roads out - the upload and the staging for the
 * attestation job - build the envelope in the same job the measurement ran in, and both read the
 * same two variables. A second reading written into this file would be the shape that told every
 * hosted run its pull request comes from a fork.
 */
import { repositoryModelCredentialOfEnvironment } from "./identity-condition.generated.mjs";

/** jq's `//`. Falls through on null AND false, unlike `??`. */
function alt(value, fallback) {
  return value === null || value === undefined || value === false ? fallback : value;
}

/**
 * jq's `.foo` on a key the object does not have yields `null`. JavaScript yields
 * `undefined`, and JSON.stringify DELETES undefined-valued keys — so a field the
 * producer happened to omit would vanish from the envelope entirely and the
 * endpoint's exact-key checks would reject the whole upload.
 *
 * Every fixed-shape object is therefore built from an explicit key list rather
 * than by spreading or by property-by-property copying: the key list is the
 * schema, absences become null, and unknown producer keys cannot leak through.
 * Key order follows the array, which is part of the output contract.
 */
function field(value) {
  return value === undefined ? null : value;
}

function pick(source, keys) {
  const from = source ?? {};
  const out = {};
  for (const key of keys) out[key] = field(from[key]);
  return out;
}

/**
 * The closed vocabulary of diff-coverage cannot-attest reasons.
 *
 * Provider diagnostics are free text and can embed local paths and parser excerpts, so the raw
 * value is never carried. It is mapped to one of these codes and an unrecognized reason is a hard
 * failure - silently forwarding it is how a path would escape.
 *
 * WRITTEN FROM CORE, NOT TYPED HERE. This script runs standalone on a runner and cannot import
 * TypeScript, so it used to carry a text copy pinned by a comparison test. That pin's first run
 * caught the list missing the three Python codes, which made `normalizeL0Reason` throw on any
 * Python repository whose diff coverage refused and took the whole CI upload down with it - and a
 * pin can only catch that in a checkout holding both sides. See `wire-contract.generated.mjs`.
 *
 * EXPORTED so `coverage-code-contract.test.mjs` walks the vocabulary itself rather than carrying a
 * third copy of it.
 */
export const L0_REASON_CODES = new Set(DIFF_COVERAGE_CANNOT_ATTEST_REASONS);

/**
 * THE CLOSED CODE, PASSED THROUGH - and nothing is guessed any more (external refusal review, rank 5).
 *
 * WHAT WAS HERE. Thirty lines of prefix and exact-match rules that tried to recover a wire code from
 * whatever sentence the engine happened to throw, ending in
 * `throw new Error("diff coverage cannot-attest reason is not recognized")`. Two things that rule
 * cost, both reproduced by the reviewer:
 *
 *  - IT DID NOT COVER EVERY REACHABLE SENTENCE. `aggregate coverage timed out`,
 *    `prepared coverage adapter does not match the test runner` and
 *    `angular-vitest runner: no angular.json test target was resolved` all threw here, and the throw
 *    DISCARDS THE ENTIRE ARTIFACT - every package that measured perfectly included. The customer's
 *    job log then showed an HTTP status and nothing else, on a run that succeeded locally.
 *  - IT DISAGREED WITH THE API'S COPY OF ITSELF. Deno's
 *    `coverage report step exited nonzero (untrusted)` matched this file's `coverage report ` prefix
 *    rule and became `coverage-report-invalid`, while the API's exact map made it
 *    `coverage-run-failed`. One failure, two names, depending on which surface you were reading.
 *
 * The engine now declares the code where it refuses, so this only has to check that what arrived is
 * in the vocabulary. An UNRECOGNISED value no longer takes the run down: it becomes the generic
 * `coverage-acquisition-failed`, which is the honest thing to say about a refusal whose code this
 * boundary does not know, and it is said on the job log rather than swallowed. Losing the specific
 * code costs a reader one sentence of precision. The throw cost them the entire measurement.
 */
export function normalizeL0Reason(reason) {
  if (typeof reason !== "string") {
    throw new Error("diff coverage cannot-attest reason is required");
  }
  if (L0_REASON_CODES.has(reason)) return reason;
  /* THE UNKNOWN VALUE IS NOT QUOTED, and that is not squeamishness. Every producer contract says
     this field is a closed egress-safe reason, but a producer that BREAKS that contract is exactly
     the case this branch exists for, and echoing whatever arrived would print a checkout path or a
     command tail into the job log. The value is already in the local run artifact for anyone
     diagnosing this, which is where unbounded diagnostics live everywhere else in this product. */
  console.log(
    "Abloh: this run reported a diff-coverage refusal this Action does not recognise. " +
      "It is recorded as coverage-acquisition-failed and the rest of the measurement is unaffected. " +
      "The exact reason is in this run's local JSON artifact, and updating the abloh Action to the " +
      "version matching your CLI restores it here.",
  );
  return "coverage-acquisition-failed";
}

/**
 * A BOUND THAT ACTUALLY BOUND IS NEWS, AND IT GOES ON THE JOB LOG (silent-discard sweep, 2026-08-28).
 *
 * Every cap in this file is set at the producer's own ceiling, so in the ordinary case it removes
 * nothing and this says nothing. The case it exists for is the one where the two drift: the producer
 * grows a limit, this file does not, and the envelope quietly describes less than the run measured.
 * A truncated `packages` list looks like a complete measurement of fewer packages; a truncated
 * `mutantRoster` is refused at the ingest door by a sentence that names the count and blames the
 * producer, which sends a maintainer to read the wrong file. Neither is allowed to be silent.
 */
function bounded(values, limit, what) {
  if (!Array.isArray(values) || values.length <= limit) return values;
  console.log(
    `Abloh: this run reported ${values.length} ${what}, and this Action uploads at most ${limit}. ` +
      `The remaining ${values.length - limit} are NOT in the upload, so what the control plane shows ` +
      "covers less than this run measured. The whole measurement is in this run's local JSON " +
      "artifact, and updating the abloh Action to the version matching your CLI restores the rest.",
  );
  return values.slice(0, limit);
}

/**
 * THE MOST DECLARED REWRITTEN FILES ONE UPLOAD CARRIES.
 *
 * `MAX_REWRITTEN_FILES` in `packages/core/src/config.ts` is 128, and the schema refuses a longer
 * list, so a producer this Action understands can never exceed it. The bound is here anyway because
 * this file is pinned by SHA in a customer's workflow and the CLI it reads is resolved at run time:
 * a future producer's cap is not this build's to assume.
 */
const MAX_REWRITTEN_FILES = 128;

/**
 * WHICH DECLARED FILES THIS REPOSITORY'S OWN INSTALL REWROTE.
 *
 * COUNTS AND REPO-RELATIVE PATHS, nothing else. A declared rewritten file is the customer's own
 * source and none of its bytes cross here - the same posture the mutant roster's `(file, status)`
 * pairs take, and for the same reason: the paths are what makes the count checkable, and the
 * contents are what may not travel.
 *
 * `null` WHEN THE ARTIFACT CARRIES NONE, which is every repository declaring no such file and every
 * artifact a CLI released before the block existed writes. The receiver reads null as absent, and
 * absent is a different fact from a repository that declared files and had none of them rewritten.
 */
function rewrittenFilesBlock(rewritten) {
  if (rewritten === null || rewritten === undefined || typeof rewritten !== "object") return null;
  const declared = rewritten.declared;
  if (!Number.isInteger(declared) || declared < 0) return null;
  const drifted = bounded(
    alt(rewritten.drifted, []).filter((path) => typeof path === "string"),
    MAX_REWRITTEN_FILES,
    "rewritten declared file(s)",
  ).map((path) => printableLine(path, 512)).filter((path) => path !== "");
  return { declared, drifted };
}

/** `{file, ranges, lines}` only — drops any other key the producer may add. */
function scopeEntries(entries) {
  return (alt(entries, [])).map((entry) => ({
    file: entry.file,
    ranges: entry.ranges.map((range) => [range[0], range[1]]),
    lines: entry.lines,
  }));
}

const PROVIDER_KEYS = ["runner", "provider", "runnerVersion", "providerVersion"];
const COVERAGE_COUNT_KEYS = ["changed", "covered", "uncovered", "notInstrumented"];
const COUNT_KEYS = [
  "killed", "timeout", "survived", "no-coverage",
  "runtime-error", "build-error", "skipped-by-cap",
];
const SCORE_KEYS = [
  "rawScore", "triagedScore", "denominator",
  "errorCount", "confirmedEquivalent", "triageValidated",
];
const FLOOR_KEYS = ["minMutantsExecuted", "maxErrorRate", "minSamplingFraction"];
/*
 * THE BASELINE STATE, WHOLE.
 *
 * `redBaseline` alone stopped describing this block on 2026-08-27, and the four names below are the
 * rest of what it now takes to say what happened to the suite:
 *
 *  - `runTimedOut` with its notice and its bound disclosure. A run the engine killed at its per-run
 *    wall exits non-zero and is deliberately NOT red, so it arrives here as `redBaseline: false`.
 *    Projected without the flag, the control plane classified it green and the run page said
 *    "3 baseline runs, all green" over a suite nothing had finished observing.
 *  - `deadlineExceeded`, which is the same shape one cause later: the shared pre-mutation deadline
 *    expired, nothing was measured, and `redBaseline` is false.
 *  - `redBaselineDetail`, the counts and test names behind a red baseline. Stripping it collapsed
 *    "12 of 161 test(s) executed failed in every run: a, b, c" into the hosted fallback sentence
 *    "the test suite did not pass before measurement started".
 *
 * `quarantine` is projected separately below, because it is a nested block with arrays in it and
 * `pick` copies values verbatim.
 */


const BASELINE_KEYS = [
  "runs", "durationsMs", "redBaseline", "testCount", "testCounts",
  "testIdentityCount", "ambiguousIdentityCount", "flakyCount",
  "timingCv", "timeoutFactor", "quarantineDowngraded",
  "runTimedOut", "runTimeoutNotice", "runBoundDisclosure", "deadlineExceeded",
  "redBaselineDetail",
];
/*
 * WHETHER THE BASELINE KNEW WHICH TEST DID WHAT (external review, rank 3).
 *
 * `redBaseline: false` beside an empty flaky set is what made a hosted card say "3 baseline runs,
 * all green" over a suite whose per-test reports never parsed - the flaky set was empty because
 * nothing could be compared, not because nothing was flaky, and quarantine had nothing to exclude
 * so a test broken on unmutated code credited every mutant it covered. Two integers, re-asserted
 * here rather than copied, because `pick` forwards nested objects verbatim and this one decides
 * what a hosted sentence is allowed to claim.
 */
function perTestAttributionBlock(baseline) {
  const raw = baseline?.perTestAttribution;
  if (raw === null || raw === undefined || typeof raw !== "object") return null;
  const count = (value) => (Number.isSafeInteger(value) && value >= 0 ? value : null);
  const expected = count(raw.expected);
  const parsed = count(raw.parsed);
  return expected === null || parsed === null ? null : { expected, parsed };
}
/**
 * Closed quarantine-block keys. Sentences and identities are bounded here rather than trusted:
 * the block is composed on the customer's runner and rendered into a hosted check summary.
 */
const QUARANTINE_KEYS = ["excluded", "measured", "rescuedRedBaseline", "disclosure"];
/**
 * The bound on the two name lists.
 *
 * The quarantine cap is `max(5 tests, 2% of the suite)`, so a fifty-thousand-test suite can
 * legitimately name a thousand. NOT A SILENT CAP: `excluded` beside the list is the true count and
 * stays whatever the producer measured, so a truncated list is visible as a list shorter than the
 * number it sits next to.
 */
const MAX_QUARANTINE_NAMES = 1_000;
const FINDING_KEYS = [
  "mutantId", "file", "startLine", "endLine", "mutator", "status", "coveredBy",
];
/*
 * WHAT USED TO SIT HERE, AND WHY IT IS GONE.
 *
 * `TIER2_FINDING_KEYS` was a second allowlist - `originalText`, `replacement`, `startColumn`,
 * `endColumn` - added on top of the structural seven whenever the artifact reported tier 2.
 * `originalText` IS CUSTOMER SOURCE, and the default had climbed to tier 2, so a customer who never
 * named a tier had their source slices sent to Abloh; tiering was on no customer surface, so nobody
 * was offered the choice and nobody could decline it.
 *
 * The ladder is deleted on the captain's ruling. `FINDING_KEYS` above is now the whole of what a
 * finding may carry out of a customer's CI, which is the same thing `FINDING_ALLOWED_FIELDS` in
 * `apps/api/src/draft.ts` now says on the receiving side.
 */
/*
 * The triage fields that travel.
 *
 * modelId, promptVersion and effort are the CLASSIFIER IDENTITY, and they are safe to send
 * because a project cannot choose them: a committed config file may not name a model, so these
 * always identify the service's own classifier and never anything the customer wrote.
 *
 * They matter for two things that are impossible without them. A run can only be marked
 * triage-validated by matching an exact (model, prompt, effort) triple, so a run that omits them
 * can never be validated. And a human label on a verdict is meaningless unless it can be
 * attributed to whatever produced that verdict — the moment the prompt changes, unattributed
 * labels become noise.
 */
const TRIAGE_KEYS = [
  "verdict",
  "reasonCode",
  "confidence",
  "overridden",
  "description",
  /* NO `impact`. The one-sentence consequence was retired on 2026-08-21 and the server's triage
     allowlist no longer keeps it, so projecting it here would upload prose that is dropped on
     arrival. Dropping it on this side is what keeps the two lists the same names, which is the
     invariant the note above exists to protect. */
  "modelId",
  "promptVersion",
  "effort",
];

/**
 * Diff coverage. A completed measurement (or a not-applicable one with no executable
 * lines) carries its per-line classification; every other state carries the
 * state, a normalized reason and nothing else — counts and lines would be
 * unfounded.
 */
/**
 * Closed per-package row keys (counts-only rows; the server re-derives every quantity).
 *
 * `excluded` IS PART OF THE ROW, and its absence here cost more than any other omission in this
 * file. A package the change touched and the run could not measure at all carries no runner - there
 * is none to name - and says so in `excluded`. Projected without it, the row reached the control
 * plane as a measurable package with `runner: null`, which the ingest door refuses
 * (`runResult.packages row '<dir>' has an unrecognized runner`), and the refusal discards THE WHOLE
 * ENVELOPE: every sibling package that measured perfectly went with it, behind a bare HTTP 400.
 *
 * It is projected through `excludedBlock` rather than copied, because the two strings in it are
 * composed by the selector on the customer's runner and the receiver refuses anything that is not
 * one printable ASCII line.
 */
const PACKAGE_ROW_KEYS = [
  "directory",
  "runner",
  "diffCoverage",
  "mutation",
  "baseline",
  "environmentContractDigest",
  "reachedStage",
];
/** The two strings an excluded row carries, and the receiver's cap on each. */
const MAX_EXCLUSION_STR_LEN = 300;

function diffCoverageBlock(dc) {
  if (dc === null || dc === undefined) return null;
  const measured =
    dc.state === "completed" ||
    (dc.state === "not-applicable" && dc.reason === "no-executable-lines");

  if (measured) {
    return {
      state: dc.state,
      reason: alt(dc.reason, null),
      wallMs: dc.wallMs,
      provider: pick(dc.provider, PROVIDER_KEYS),
      counts: {
        ...pick(dc.counts, COVERAGE_COUNT_KEYS),
        /* Older producers omit this; jq's `// 0` made it zero, not null. */
        notExecutable: alt(dc.counts?.notExecutable, 0),
      },
      /* Retry-once disclosure — was silently dropped by this projection (WS3 fold). */
      acquisitionAttempts: alt(dc.acquisitionAttempts, null),
      lines: dc.lines.map((line) => ({ file: line.file, line: line.line, state: line.state })),
    };
  }

  return {
    state: dc.state,
    reason: dc.state === "cannot-attest" ? normalizeL0Reason(dc.reason) : dc.reason,
    /*
     * The tool's own first line, beside the code. The code names the situation; this names the fix
     * ("Cannot find module '@vitest/coverage-v8'"), and without it the reader is sent hunting
     * through CI logs for the sentence the runner already produced. The producer folded it to one
     * printable-ASCII line and capped it; `printableLine` re-asserts that shape here because this
     * projection is the egress door and asserts every field's shape itself. Kenneth's call,
     * 2026-08-12: the first line is actionable and carries nothing a stack frame would.
     */
    reasonDetail:
      dc.state === "cannot-attest" && typeof dc.reasonDetail === "string" && dc.reasonDetail !== ""
        ? printableLine(dc.reasonDetail, 200)
        : null,
    wallMs: alt(dc.wallMs, null),
    provider: dc.provider === null || dc.provider === undefined ? null : pick(dc.provider, PROVIDER_KEYS),
    counts: null,
    acquisitionAttempts: alt(dc.acquisitionAttempts, null),
    lines: [],
  };
}

/**
 * WHAT WAS LEFT OUT OF THE MEASURED SURFACE, and what the run's rate therefore covers.
 *
 * THE BLOCK IS THE DIFFERENCE BETWEEN TWO RUNS THAT LOOK IDENTICAL ON THE WIRE. A suite that was
 * green and a suite that was red until its failing tests were excluded both upload
 * `redBaseline: false`; only this block says which one a reader is looking at. Stripped, a rescued
 * red baseline was signed and rendered as fully green, with no disclosure that the unmutated suite
 * had failed.
 *
 * Counts and one sentence, plus the identities Kenneth's ruling of 2026-08-26 requires every
 * surface to be able to show. `byReason` is copied verbatim rather than filtered: the receiver
 * checks that its tally sums to `excluded`, and a key dropped here would break that sum.
 */
function quarantineBlock(quarantine) {
  if (quarantine === null || quarantine === undefined) return null;
  const nameList = (value) =>
    (Array.isArray(value) ? value : [])
      .slice(0, MAX_QUARANTINE_NAMES)
      .map((name) => printableLine(name, 200))
      .filter((name) => name !== "");
  const byReason = {};
  for (const [reason, count] of Object.entries(quarantine.byReason ?? {})) {
    if (Number.isInteger(count) && count >= 0) byReason[reason] = count;
  }
  return {
    ...pick(quarantine, QUARANTINE_KEYS),
    /* The sentence every surface shows. Bounded here like every other authored string that crosses:
       it is composed on the runner and rendered into a hosted check summary. */
    disclosure:
      typeof quarantine.disclosure === "string" ? printableLine(quarantine.disclosure, 500) : null,
    names: nameList(quarantine.names),
    failing: nameList(quarantine.failing),
    byReason,
  };
}

/**
 * The exclusion, scrubbed to the shape the receiver accepts.
 *
 * A DIAGNOSTIC MUST NOT BE ABLE TO DESTROY THE RUN IT DESCRIBES - the same law `fixLoop.reason`
 * lives under below. These two strings are composed by the target selector from whatever the
 * repository looked like, and the ingest door refuses a whole upload over a newline in either.
 * A field the producer left empty says so rather than making the receiver refuse the envelope.
 */
function excludedBlock(excluded) {
  if (excluded === null || excluded === undefined) return null;
  const line = (value) => {
    const text = typeof value === "string" ? printableLine(value, MAX_EXCLUSION_STR_LEN) : "";
    return text === "" ? "not stated by the producer" : text;
  };
  return { reason: line(excluded.reason), remedy: line(excluded.remedy) };
}

/** One package row: the closed key list, plus the exclusion block when the row carries one. */
function packageRow(row) {
  return {
    ...pick(row, PACKAGE_ROW_KEYS),
    excluded: excludedBlock(row?.excluded),
  };
}

/**
 * THE FRACTION OF THE SUITE THAT WAS MEASURED, AS TWO INTEGERS (silent-discard sweep, 2026-08-28).
 *
 * A repository whose own test command carries a shard flag - `vitest run --shard=1/4` - measures a
 * quarter of its suite, and Kenneth's F12 ruling of 2026-08-27 is MEASURE AND DISCLOSE: the command
 * runs exactly as declared and every surface states that a fraction was covered. The CLI records
 * that on the baseline, the run page reads `baseline.shard` and renders it, and this projection sat
 * between the two dropping it. So the local artifact disclosed the shard, the hosted surface showed
 * the same catch rate with nothing beside it, and the customer read a rate over a quarter of their
 * tests as a rate over their tests. Same defect as `redBaselineDetail`, one key over.
 *
 * TWO INTEGERS AND NOT THE SENTENCE, which is the shape `run-store.ts` declares and the shape the
 * run page wants: it composes its own words from the numbers rather than rendering a string this
 * runner produced. Sending `flag` and `disclosure` would egress unbounded producer text for a
 * surface that will not print it.
 */
function shardBlock(shard) {
  if (shard === null || shard === undefined || typeof shard !== "object") return null;
  const { index, total } = shard;
  if (!Number.isInteger(index) || !Number.isInteger(total)) return null;
  if (total < 1 || index < 1 || index > total) return null;
  return { index, total };
}

/**
 * WHETHER THE SUITE MET LIVE RESPONSES OR RECORDED ONES (silent-discard sweep, 2026-08-28).
 *
 * The producer's own comment on this field says it lives in the baseline block precisely so that
 * "disclosing this reaches the control plane", and the run page has a whole path for it - a
 * `baseline-replayed` note, a `baseline-recording-missing` note, and two counts on the card. All of
 * it was unreachable, because this projection never carried the key: every replayed run uploaded as
 * an ordinary green baseline. A rate measured against a recording of what an API said months ago is
 * a different claim from one measured against what it says now, and that difference is invisible in
 * the number - which is the reason the field exists at all.
 *
 * TWO INTEGERS, under the names the run page reads. `recordings` is a repository path, `disclosure`
 * is a producer sentence and the page writes its own; neither crosses this door.
 */
function replayBlock(replay) {
  if (replay === null || replay === undefined || typeof replay !== "object") return null;
  const served = replay.handled;
  const missing = replay.unmatched;
  if (!Number.isInteger(served) || served < 0) return null;
  return { handled: served, unmatched: Number.isInteger(missing) && missing >= 0 ? missing : 0 };
}

/** Baseline durations and per-run test totals are capped at the first 10 runs. */
function baselineBlock(baseline) {
  if (baseline === null || baseline === undefined) return null;
  return {
    ...pick(baseline, BASELINE_KEYS),
    shard: shardBlock(baseline.shard),
    replay: replayBlock(baseline.replay),
    /* Both arrays are capped at the first 10 runs. */
    durationsMs: bounded(alt(baseline.durationsMs, []), 10, "baseline run duration(s)"),
    testCounts: bounded(alt(baseline.testCounts, []), 10, "baseline test count(s)"),
    /* The three authored sentences, re-asserted as one printable line each at this egress door.
       Every one of them is composed on the customer's runner and rendered by a hosted surface. */
    runTimeoutNotice:
      typeof baseline.runTimeoutNotice === "string" ? printableLine(baseline.runTimeoutNotice, 500) : null,
    runBoundDisclosure:
      typeof baseline.runBoundDisclosure === "string" ? printableLine(baseline.runBoundDisclosure, 500) : null,
    perTestAttribution: perTestAttributionBlock(baseline),
    redBaselineDetail:
      typeof baseline.redBaselineDetail === "string" ? printableLine(baseline.redBaselineDetail, 1_000) : null,
    quarantine: quarantineBlock(baseline.quarantine),
  };
}

/**
 * WHAT THE RUN'S MODEL CALLS COST, forwarded whole and never re-added here.
 *
 * The producer sums the lanes ONCE, in the CLI's `runModelCost`, and that sum is what travels. This
 * projection copies the lanes, the total and the unpriced marker across; it does not add anything
 * up, because a second summation on the wire is exactly the partial-total defect the run-total law
 * of 2026-08-23 exists to stop. A total that disagrees with its own lanes is refused at the ingest
 * door, not corrected here.
 *
 * `null` WHEN THE ARTIFACT CARRIES NONE, which is every artifact a CLI released before the block
 * existed writes. The receiver treats null as absent, and an absent cost is UNKNOWN rather than
 * zero — a run with no cost on record and a run that cost nothing are different facts and the row
 * has to keep them apart.
 *
 * WHAT IT CARRIES IS MONEY AND LANE NAMES: numbers, two fixed English labels the producer writes,
 * and a reason sentence naming a missing operator variable. No source, no model prose, no path.
 */
function modelCostBlock(cost) {
  if (cost === null || cost === undefined) return null;
  return {
    lanes: alt(cost.lanes, [])
      .slice(0, 8)
      .map((lane) => ({ label: printableLine(lane?.label ?? "", 120), dollars: field(lane?.dollars) })),
    dollars: field(cost.dollars),
    unpriced:
      cost.unpriced === null || cost.unpriced === undefined
        ? null
        : {
            label: printableLine(cost.unpriced.label ?? "", 120),
            /* Same scrub as `fixLoop.reason`: this sentence is written by a failure path and one
               newline in it would have the receiver refuse the whole upload. */
            reason: printableLine(cost.unpriced.reason ?? "", 512),
          },
  };
}

/**
 * The most findings one upload may carry.
 *
 * A REFUSAL, NOT A TRUNCATION (junction audit ACT-FIND-01, 2026-08-28). This used to `slice`, while
 * `findingCount` beside it stayed the TRUE total - and the control plane's ingest door requires the
 * two to agree, so every run past this bound was rejected by an invariant nobody could see from the
 * job log. The customer's CI failed as configured and then reported `HTTP 400` with no body: a
 * measured run, correct in every respect, thrown away with no sentence naming why.
 *
 * TRUNCATING WOULD NOT BE SAFE EITHER, which is why the bound refuses rather than carrying a
 * truncation contract. The server RE-DERIVES the gate from the findings it receives: a flagged-path
 * violation past the cap would be missing from that recompute, the recomputed gate would pass where
 * the artifact failed, and the upload would be refused again - this time after silently describing a
 * different run. The bound stops the run here, by name, with the whole measurement still in the
 * job's own artifact.
 */
export const MAX_UPLOADED_FINDINGS = 10_000;

/**
 * Findings are allowlist-copied to the structural seven, on every run.
 *
 * `replacement`, `originalText`, the exact columns and the triage rationale are source-bearing and
 * are dropped by omission here. There is no level that widens this: the tier ladder that once did
 * is deleted, and `FINDING_KEYS` is the whole of it.
 */
function findingEntries(findings) {
  const keys = FINDING_KEYS;
  const all = alt(findings, []);
  if (all.length > MAX_UPLOADED_FINDINGS) {
    throw new Error(
      `this run reported ${all.length} findings and one upload carries at most ` +
        `${MAX_UPLOADED_FINDINGS}. Nothing was uploaded, because sending the first ` +
        `${MAX_UPLOADED_FINDINGS} beside a count of ${all.length} is what the control plane refuses, ` +
        "and sending a shorter count would describe a run that did not happen. The whole measurement " +
        "is in this job's own artifact. Narrow what this check measures - a smaller pull request, or " +
        "a tighter mutation scope in abloh.yml - and the upload comes back.",
    );
  }
  return all
    .map((finding) => ({
      ...pick(finding, keys),
      triage:
        finding.triage === null || finding.triage === undefined
          ? null
          : pick(finding.triage, TRIAGE_KEYS),
    }));
}

/**
 * @param {object} evidence  parsed run artifact from the runner
 * @param {object} ctx       GitHub-supplied provenance and policy identity
 * @param {{coverage?: string, mutationRedacted?: string, engineV2Proofs?: string, engineV2Pool2?: string}} [sidecars]
 *   Uploaded sidecars, as the RAW BYTES of the local files.
 *
 *   `coverage` is line and column maps with hit counters and carries no source text.
 *
 *   `mutationRedacted` is per-mutant line, mutator and outcome, with every source-bearing field
 *   removed by the CLI before the file was written and re-scanned for on arrival.
 *
 *   `engineV2Proofs` is bounded by its acceptor, which verifies the bytes against
 *   `engineV2.proofsDigest` and stores only candidates that PROVED.
 *
 *   `engineV2Pool2` travels on the same terms, bound to its own commitment
 *   (`engineV2.disclosure.agentBugs.evidenceDigest`) and projected to the bugs the artifact signed
 *   as survivors.
 *
 *   `rationales` AND `fixProofs` ARE NOT IN THIS LIST AND ARE NOT ACCEPTED. They were the tier-2
 *   pair; the ladder is deleted, the receiving side deleted `acceptTier2Sidecars` with it, and both
 *   files stay on the runner on every run. Their DIGESTS still travel in the evidence block.
 *
 *   Passed as a separate argument, and the key omitted when absent, so that every existing two-argument
 *   call produces byte-identical output — which is what keeps the differential contract against the
 *   retired jq filter meaningful instead of merely re-baselined.
 *
 *   The bytes are forwarded UNCHANGED. The control plane verifies each against the commitment the
 *   evidence block already carries, so re-serializing here would break the verification that makes
 *   these files evidence rather than attachments.
 */
/**
 * ABLOH'S OWN FAILURE, AS A SHAPE, ON ITS WAY OUT OF THE RUNNER.
 *
 * KENNETH'S EGRESS RULING, 2026-08-31: an abloh-owned diagnostic may leave the customer's runner
 * ONLY as a shape - no path, no quoted string, no number - plus an identifier that lets two
 * occurrences of one failure be recognised as one failure. Never the raw text.
 *
 * THIS FUNCTION USED TO SEND THE FIRST LINE. `Missing coverage results for:
 * packages/cli-link-assets/src/__tests__/linkAssets.test.ts, ...` is a third party's prose wrapped
 * around the customer's own file names, and it was uploaded, stored on `abloh_runs` and printed on
 * the pull request - for a case the customer can neither see nor consent to, on a product whose
 * site promises nothing of their code reaches Abloh.
 *
 * WHAT TRAVELS NOW IS `shape` AND `reportId`, both composed by `@abloh/core`'s
 * `engine-failure-id.ts` in the CLI. This boundary FORWARDS them and decides nothing: a composite
 * Action ships as dependency-free `.mjs` and cannot import core, so a boundary that recognised the
 * shape itself would be a second copy of the catalogue - and the control plane checks both against
 * the closed sets that file owns before either reaches a surface.
 *
 * AN ARTIFACT WITH NO SHAPE SENDS NO BLOCK. That is a CLI older than the field, and the honest
 * answer to "abloh's engine broke and this runner cannot say how" is the absence, not the text.
 */
/**
 * THE GRAMMAR OF A SHAPE NAME AND OF AN IDENTIFIER, as this boundary can check them.
 *
 * The AUTHORITY is `packages/core/src/engine-failure-id.ts`, which holds the closed set and is what
 * the control plane checks membership against. This Action cannot import it - and cannot have it
 * generated in either, because that module imports `node:crypto` and `pnpm gen:action` refuses a
 * source module with an import. So this is the shape of a name rather than the list of them, and it
 * is a SECOND wall rather than the wall: lowercase, digits and hyphens, nothing else and nothing
 * long. A path, a sentence, a quoted string and a number all fail it here, on the runner, before a
 * byte moves - which is what makes "the envelope carries no prose" a property of the bytes rather
 * than of a downstream reader's diligence.
 *
 * `scripts/refusal-render-matrix.test.ts` pins every name core declares against these.
 */
const ENGINE_FAILURE_SHAPE_GRAMMAR = /^[a-z][a-z0-9-]{0,48}$/;
const ENGINE_FAILURE_REPORT_ID_GRAMMAR = /^abloh-[a-z0-9-]{1,60}$/;
/* The engine is one of ABLOH's own package names. A path, a sentence or a version range fails it. */
const ENGINE_NAME_GRAMMAR = /^@?[a-z0-9][a-z0-9._/-]{0,62}$/;

function engineFailureBlock(evidence) {
  const failure = evidence?.engineFailure;
  if (failure === null || failure === undefined || typeof failure !== "object") return null;
  const shape = typeof failure.shape === "string" ? failure.shape : "";
  const reportId = typeof failure.reportId === "string" ? failure.reportId : "";
  const engine = typeof failure.engine === "string" ? failure.engine : "";
  if (!ENGINE_FAILURE_SHAPE_GRAMMAR.test(shape)) return null;
  if (!ENGINE_FAILURE_REPORT_ID_GRAMMAR.test(reportId)) return null;
  return {
    stage: failure.stage === "mutation" ? "mutation" : "mutation",
    engine: ENGINE_NAME_GRAMMAR.test(engine) ? engine : "",
    shape,
    reportId,
  };
}

export function buildStructuralHandoff(evidence, ctx, sidecars, evidenceIndex) {
  return {
    schema: "abloh-ci-handoff/v2",
    provenance: {
      repository: ctx.repository,
      triggerSha: ctx.triggerSha,
      headSha: ctx.headSha,
      /* Empty string means "not a pull request", not "PR zero". */
      pullRequest: ctx.pullRequest === "" ? null : Number(ctx.pullRequest),
      workflowRef: ctx.workflowRef,
      workflowSha: ctx.workflowSha,
      githubRunId: ctx.runId,
      githubRunAttempt: ctx.runAttempt,
    },
    artifactDigest: ctx.artifactDigest,
    evidence: {
      schema: field(evidence.schema),
      engine: pick(evidence.engine, ["name", "version"]),
      /* target.repo is deliberately absent: on the runner it is a local
         filesystem path. Repository identity comes from the OIDC claim. */
      target: pick(evidence.target, ["baseSha", "sha", "runner"]),
      scope: scopeEntries(evidence.scope),
      diffCoverage: diffCoverageBlock(evidence.diffCoverage),
      /* THE SHAPE OF ABLOH'S OWN FAILURE AND NOTHING ELSE - see `engineFailureBlock`. Both the
         first line and the complete log stay on the machine that produced it, on the refusal's
         `local-only` slots, and every surface that cannot show them names them as withheld. */
      engineFailure: engineFailureBlock(evidence),
      rawCoverageDigest: field(evidence.rawCoverageDigest),
      rawCoverageFormat: field(evidence.rawCoverageFormat),
      /*
       * The fix-loop block, and with it `proofsDigest`.
       *
       * WHAT TRAVELS IS COUNTS, VERDICTS AND DIGESTS, on every run and with no gate.
       *
       * The generated test bodies themselves stay on the runner: `attest-fix-proofs.json` was the
       * tier-2 pair's other half and is no longer uploaded or accepted anywhere. The commitment
       * outlives the upload, which is the point of a commitment - this block was once not emitted at
       * all, and every proven test a fix loop generated was refused as `sidecar.malformed` for want
       * of the digest to check it against.
       */
      fixLoop:
        evidence.fixLoop === null || evidence.fixLoop === undefined
          ? null
          : {
              ...evidence.fixLoop,
              /*
               * A DIAGNOSTIC MUST NOT BE ABLE TO DESTROY THE RUN IT DESCRIBES.
               *
               * The control plane requires printable single-line ASCII here and refuses the whole
               * upload otherwise. `reason` is produced by failure paths — an unavailable proof
               * environment, an exceeded budget — and one of them interpolated the customer's own
               * suite tail, complete with newlines and vitest's `⎯` rule characters. The
               * measurement was finished and correct; the evidence was thrown away at ingest and
               * the Action reported a bare "HTTP 400".
               *
               * The producer now sends one scrubbed line, and this is the second guard: the field
               * is normalised at the boundary as well, so no future failure message can reach the
               * receiver in a shape it refuses.
               */
              ...(typeof evidence.fixLoop.reason === "string"
                ? { reason: printableLine(evidence.fixLoop.reason) }
                : {}),
            },
      /*
       * THE V2 ENGINE'S OWN BLOCK, forwarded whole.
       *
       * The control plane refuses an `engineV2` block that carries a `tier` field at all, and that
       * refusal outlives the ladder: a producer claiming a level for a tierless run is asserting a
       * data-flow posture nothing decides any more.
       *
       * FORWARDED VERBATIM rather than projected key by key. Every field of it is validated at
       * ingest by `sanitizeEngineV2`, which refuses a forbidden or unknown one outright, so a
       * second allowlist here would only be a copy that drifts from the one that decides. What
       * this block carries is digests, counts, verdicts and named reasons: no generated source.
       *
       * It carries `proofsDigest`, the commitment the v2 proofs sidecar below is checked against.
       * Without this key that sidecar arrives uncheckable and is refused — the same failure the
       * `fixLoop` comment above records, one engine later.
       */
      engineV2:
        evidence.engineV2 === null || evidence.engineV2 === undefined
          ? null
          : {
              ...evidence.engineV2,
              /* Same scrub as `fixLoop.reason`, for the same reason: one v2 failure path
                 interpolates a caught error's own message into this field, and a newline in it
                 would have the receiver refuse the whole upload. */
              ...(typeof evidence.engineV2.reason === "string"
                ? { reason: printableLine(evidence.engineV2.reason) }
                : {}),
            },
      /* The changed-error-handler analysis. Half of the Ext-5 recompute: `policy.errorPaths` above
         says whether the rule is on, and this says how many untested handler mutants and
         anti-patterns it found. With the policy alone the server reads failOnUntested: true against
         a count of zero and still recomputes a pass, so both must travel or neither helps. Null when
         no scan ran. */
      errorHandlers:
        evidence.errorHandlers === null || evidence.errorHandlers === undefined
          ? null
          : evidence.errorHandlers,
      /* The REDACTED mutation report's commitment, for exactly the reason above.
         `mutationRedacted` is forwarded in `sidecars` and the control plane checks it against this
         value; the field was never emitted, so those bytes always arrived uncheckable and were
         refused. The digest describes the source-free rewrite, not `rawReportDigest`'s verbatim
         report, which never leaves the runner. */
      redactedReportDigest: field(evidence.redactedReportDigest),
      mutationExecution:
        evidence.mutationExecution === null || evidence.mutationExecution === undefined
          ? null
          : {
              state: evidence.mutationExecution.state,
              reason: alt(evidence.mutationExecution.reason, null),
              scope: alt(evidence.mutationExecution.scope, null),
              /* THE STEP THE REFUSAL SENTENCE NAMES (junction audit ACT-CHECK-01, 2026-08-28).
                 `checkStep` says WHICH gate in the project's own test script reads its sources -
                 eslint, prettier, biome or tsc - and the control plane's refusal copy prints it
                 verbatim. This projection dropped it, so the customer read "your test command
                 checks your sources" with no name attached and no idea which step to move. The
                 receiver holds it to that same closed vocabulary and rejects anything else, which
                 is why forwarding it cannot widen what leaves this runner. */
              ...(SOURCE_CHECK_STEPS.includes(evidence.mutationExecution.checkStep)
                ? { checkStep: evidence.mutationExecution.checkStep }
                : {}),
            },
      mutationScope: scopeEntries(evidence.mutationScope),
      /*
       * WHAT `environment.rewrittenFiles` MEANT FOR THIS RUN, and OMITTED rather than null when
       * there is nothing to say.
       *
       * THE OTHER OPTIONAL BLOCKS HERE ARE EMITTED AS `null`, and this one is not, deliberately.
       * Those keys describe something every run does - a duration, a cost - so an explicit null is
       * the honest way to say "this producer did not measure it". This key describes a DECLARATION
       * almost no repository makes, and an always-present null would put a key on every envelope in
       * circulation to say that. `scripts/upload-payload-control.test.ts` freezes a real run's
       * bytes for exactly that reason, and a run declaring nothing has to keep producing them.
       *
       * THE RECEIVER TAKES IT EITHER WAY: it is a widened-only key, permitted and never required
       * (`apps/api/src/ci-handoff.ts`), so absent is the same answer as a producer released before
       * the key existed - which is "this run declared none", and is what both mean.
       */
      ...(rewrittenFilesBlock(evidence.rewrittenFiles) === null
        ? {}
        : { rewrittenFiles: rewrittenFilesBlock(evidence.rewrittenFiles) }),
      /* Per-phase wall clock. The run page states what each stage cost, and a duration that does
         not survive this boundary is a duration the hosted UI can never show. */
      mutationWallMs: field(evidence.mutationWallMs),
      triageWallMs: field(evidence.triageWallMs),
      /* What the run charged, every lane summed once by the producer. Always emitted, null when
         the artifact carried none — the same convention as the two durations above. */
      modelCost: modelCostBlock(evidence.modelCost),
      /*
       * `tier` IS STILL EMITTED, AND IT IS ALWAYS NULL. This is the one place the deleted ladder
       * leaves a key behind, and removing it would refuse every upload.
       *
       * `V2_EVIDENCE_KEYS` in `apps/api/src/ci-handoff.ts` is the REQUIRED key set - `exactKeys`
       * refuses unknown keys and demands the listed ones - and `tier` is in it. A pinned Action from
       * before the ladder went still sends a number, so the receiver cannot drop the requirement
       * without breaking those customers' CI; and while it is required, a producer that omits it
       * gets a shape refusal rather than a run.
       *
       * The artifact carries no tier any more, so `field` turns the absence into `null`: the key is
       * present for the shape check and carries no claim. The receiver never reads it, never
       * range-checks it and never stores it (`apps/api/src/draft.ts`). Moving it from required to
       * optional is a wire-contract change with released clients on the other side of it.
       */
      tier: field(evidence.tier),
      mutantsPlanned: field(evidence.mutantsPlanned),
      mutantsRun: field(evidence.mutantsRun),
      counts: pick(evidence.counts, COUNT_KEYS),
      scores: pick(evidence.scores, SCORE_KEYS),
      floor:
        evidence.floor === null || evidence.floor === undefined
          ? null
          : pick(evidence.floor, [...FLOOR_KEYS, "passed"]),
      gate: {
        ...pick(evidence.gate, ["status", "score", "threshold"]),
        /*
         * THE REFUSAL THIS RUN PRODUCED, WHOLE (error-plane plan, step 7).
         *
         * THE CALLER'S GATE IS NOT TRUSTED and this does not change that: the control plane
         * recomputes status, score and threshold from the evidence and refuses an envelope whose
         * numbers disagree. This carries no number. It carries WHY the run refused, in the run's own
         * words - which is the one thing the far side cannot work out for itself, because working it
         * out means reading a separately deployed copy of the message table.
         *
         * EVERY STAGE, since step 7. It used to be admission alone, on the argument that the others
         * were reconstructible here; they are, from a table that may have been reworded since the
         * customer's Action was pinned, and nothing reported the mismatch.
         */
        ...gateRefusal(evidence.gate),
      },
      baseline: baselineBlock(evidence.baseline),
      /* The TRUE total, deliberately not findings.length: the array above is
         capped at 10000 so a consumer can tell truncation happened. */
      findingCount: alt(evidence.findings, []).length,
      findings: findingEntries(evidence.findings),
      policy: {
        /*
         * THE FIELDS THE SERVER RECOMPUTES THE GATE FROM.
         *
         * The control plane does not trust the CLI's pass/fail: it re-derives the gate from the
         * sanitized findings and this policy, then REFUSES the upload when its answer differs from
         * the one the artifact was signed with (draft.ts:3366 -> 400 INVALID_CI_HANDOFF).
         *
         * `flaggedPaths` and `errorPaths` are inputs to that recompute — resolveFlaggedPaths and the
         * Ext-5 error-path gate read them. Omitting them made the server default both rules to OFF,
         * so a run the CLI failed under either rule recomputed as passing and the whole upload was
         * rejected. The customer's CI failed as configured, then the evidence, check run and
         * dashboard row never existed, and the Action reported only "HTTP 400" with no body.
         *
         * Anything added to the server's recompute must be added here in the same change.
         */
        ...pick(evidence.policy, ["threshold", "enforce", "flaggedPaths", "errorPaths"]),
        policyDigest: ctx.policyDigest === "" ? null : ctx.policyDigest,
        source: {
          kind: ctx.policySource,
          path: ctx.policyPath === "" ? null : ctx.policyPath,
          /* The policy is read at the measured commit, so its source sha is the
             head sha; the validator asserts these are equal. */
          sourceSha: ctx.headSha,
        },
        floor: pick(evidence.policy?.floor, FLOOR_KEYS),
      },
      rationalesDigest: field(evidence.rationalesDigest),
      rawReportDigest: field(evidence.rawReportDigest),
      skipBaseline: field(evidence.skipBaseline),
      /* WS3 widened shape: the worst-of compat signal, per-package rows (counts only by
         construction), and the bounded mutant roster the server derives per-package kills
         from. Null when absent — the server treats null as absent. */
      evidenceProfile: evidence.evidenceProfile === null || evidence.evidenceProfile === undefined
        ? null
        : evidence.evidenceProfile,
      packages: Array.isArray(evidence.packages)
        ? bounded(evidence.packages, MAX_PACKAGE_ROWS, "measured package row(s)").map((row) => packageRow(row))
        : null,
      mutantRoster: Array.isArray(evidence.mutantRoster)
        ? bounded(evidence.mutantRoster, MAX_MUTANT_ROSTER_ROWS, "mutant(s) in its roster").map((entry) => ({ file: entry.file, status: entry.status }))
        : null,
    },
    /* Only what exists. An absent key is the ordinary case, which is why this is spread last rather
       than emitted as null: the receiver's key check treats it as optional, and a null would be a
       claim that the run had sidecars and they were empty. */
    ...(() => {
      const payload = sidecarPayload(sidecars);
      return payload === null ? {} : { sidecars: payload };
    })(),
    /*
     * THE RUN'S OWN INDEX OF ITS OUTPUT DIRECTORY, CARRIED WHOLE.
     *
     * WHY THE CONTROL PLANE NEEDS IT. It serves a run page naming the documents a run produced, and
     * it did that from a list of filenames written into its own source - one deployment's opinion
     * about what a run performed weeks earlier, somewhere else, by a version it never sees. Given
     * this it says the names that run actually wrote, and a stored run keeps saying them however the
     * product's own names move afterwards.
     *
     * PROJECTED, NOT FORWARDED. The two keys the receiver reads and nothing else, from a document
     * that arrived on a runner's disk. Absent where the run left no readable index, on the same
     * terms as `sidecars`: an absent key is the ordinary case for every producer released before it
     * existed, and a null would be a claim that the run wrote nothing.
     */
    ...(() => {
      const rows = evidenceIndexPayload(evidenceIndex);
      return rows === null ? {} : { evidenceIndex: rows };
    })(),
    /*
     * WHAT THIS JOB CAN SAY ABOUT THE REPOSITORY'S OWN MODEL CREDENTIAL.
     *
     * IT IS NOT EVIDENCE ABOUT THE MEASUREMENT, which is why it sits beside `provenance` rather than
     * inside `evidence`: every key in that block is the CLI artifact's, projected, and this one is
     * the Action's own reading of the job it is running in - the same kind of fact the provenance
     * block carries. The CLI never sees the credential's presence and must not be taught to guess
     * at it.
     *
     * ABSENT IS THE ORDINARY CASE, on the same rule as `sidecars` and `evidenceIndex`: a job that
     * could mint an identity, a fork run and every producer released before the reading existed all
     * answer null, and a null key would be a claim where there is silence. So an ordinary run's
     * envelope is byte-identical to the one it produced before this key existed.
     *
     * WHAT IT IS FOR. Nobody can read an Actions secret back, so the only evidence the control plane
     * can ever have that a repository lost the model credential the App wrote for it is a run saying
     * it was handed none. `ensureModelSecret`'s repair pass is what acts on it.
     */
    ...(ctx.modelCredential === "present" || ctx.modelCredential === "absent"
      ? { identity: { modelCredential: ctx.modelCredential } }
      : {}),
  };
}

/** How many rows an index may carry. The registry has seventeen; this is room and not a target. */
const MAX_EVIDENCE_INDEX_ROWS = 64;

/**
 * The index's rows, projected to the two fields the receiver reads, or null when there are none.
 *
 * Every row is re-checked here even though the parser that produced it already did: this projection
 * is what crosses the wire, and a boundary that trusts its caller's validation is a boundary that
 * moves the moment its caller does.
 */
function evidenceIndexPayload(evidenceIndex) {
  if (evidenceIndex === null || evidenceIndex === undefined) return null;
  const rows = Array.isArray(evidenceIndex.outputs) ? evidenceIndex.outputs : [];
  const projected = bounded(rows, MAX_EVIDENCE_INDEX_ROWS, "evidence index row(s)")
    .filter(
      (row) =>
        row !== null &&
        typeof row === "object" &&
        typeof row.id === "string" &&
        row.id !== "" &&
        typeof row.basename === "string" &&
        row.basename !== "",
    )
    .map((row) => ({ id: row.id, basename: row.basename }));
  return projected.length === 0 ? null : projected;
}

/**
 * The sidecar bytes actually present, or null when there is nothing to send.
 *
 * THERE IS NO LEVEL TO READ ANY MORE, and each of the four keys settled somewhere different when the
 * ladder went. What decides a sidecar now is what the receiver does with it, stated per key below.
 *
 * `rationales` AND `fixProofs` ARE NEVER SENT, and that is why neither appears here. They rode on
 * `tier === 2`, which since the default reached 2 meant every run - the model's free-text triage
 * prose and the v1 fix loop's generated test bodies, both leaving a customer's CI by a default
 * nobody chose. `acceptTier2Sidecars` is deleted on the receiving side; the fix bodies went with the
 * v1 arm that proved them and the rationale went with the ladder that admitted it. The CLI's own
 * `--rationales` help says it: kept local, never egressed. The DIGESTS still travel in the evidence
 * block, because a commitment a verifier can check is the point and the file was never the point.
 */
function sidecarPayload(sidecars) {
  if (sidecars === null || sidecars === undefined) return null;
  const payload = {};
  if (typeof sidecars.coverage === "string" && sidecars.coverage.length > 0) {
    payload.coverage = sidecars.coverage;
  }
  /*
   * The redacted mutation report, on EVERY run.
   *
   * It was gated at tier 1 and above, and when the ladder went the artifact stopped carrying a tier
   * at all - so `tier >= 1` read `undefined >= 1`, which is false, and this document silently
   * stopped being uploaded on every run while the control plane went on expecting it and its
   * materials list went on offering a row with nothing behind it.
   *
   * Ungated rather than re-gated, because the boundary here was never the tier: it is the
   * REDACTION, which the CLI applies before writing the file and `acceptMutationSidecar` re-scans
   * on arrival for the four source-bearing fields. The document carries no source by construction,
   * which is the same reason the receiver gives for dropping its own gate.
   */
  if (typeof sidecars.mutationRedacted === "string" && sidecars.mutationRedacted.length > 0) {
    payload.mutationRedacted = sidecars.mutationRedacted;
  }
  /*
   * The v2 proofs sidecar, which never had a tier to lose.
   *
   * What bounds it is on the receiving side and is stricter than a shape check: the file is
   * verified against `engineV2.proofsDigest`, and only PROVEN candidates survive the join to
   * `exitProofs` there.
   *
   * This file carries rejected candidate bodies alongside proven ones, which is why nothing here
   * decides what is kept. It is sent whole because the digest commits to these exact bytes, and it
   * is projected by the acceptor rather than by the producer that wrote it.
   */
  if (typeof sidecars.engineV2Proofs === "string" && sidecars.engineV2Proofs.length > 0) {
    payload.engineV2Proofs = sidecars.engineV2Proofs;
  }
  /*
   * Pool 2's evidence, on exactly the terms of the file above and for the same reasons.
   *
   * It carries every bug the pool handled - killed, held and survived alike - each with its witness
   * test body. Nothing here filters that: the acceptor verifies these bytes against
   * `engineV2.disclosure.agentBugs.evidenceDigest` and then keeps only the bugs the ARTIFACT signed
   * as survivors, so a bug the customer's own suite caught can never be presented as one it missed.
   * A producer that pre-filtered would be deciding its own case.
   */
  if (typeof sidecars.engineV2Pool2 === "string" && sidecars.engineV2Pool2.length > 0) {
    payload.engineV2Pool2 = sidecars.engineV2Pool2;
  }
  return Object.keys(payload).length > 0 ? payload : null;
}

export function contextFromEnvironment(environment = process.env) {
  return {
    repository: environment.GITHUB_REPOSITORY ?? "",
    triggerSha: environment.ABLOH_TRIGGER_SHA ?? "",
    headSha: environment.ABLOH_HEAD_SHA ?? "",
    pullRequest: environment.ABLOH_PULL_REQUEST ?? "",
    workflowRef: environment.GITHUB_WORKFLOW_REF ?? "",
    workflowSha: environment.GITHUB_WORKFLOW_SHA ?? "",
    runId: environment.GITHUB_RUN_ID ?? "",
    runAttempt: environment.GITHUB_RUN_ATTEMPT ?? "",
    artifactDigest: environment.ABLOH_LOCAL_ARTIFACT_DIGEST ?? "",
    policySource: environment.ABLOH_POLICY_SOURCE ?? "",
    policyPath: environment.ABLOH_POLICY_PATH ?? "",
    policyDigest: environment.ABLOH_POLICY_DIGEST ?? "",
    /*
     * WHAT THE JOB CAN SAY ABOUT THE REPOSITORY'S MODEL CREDENTIAL, or null when it can say nothing.
     *
     * `null` IS THE ORDINARY ANSWER and is what every environment that predates the variable gives,
     * along with every job that could mint an identity and every fork run - see the rule's own
     * header for why each of those three is silence rather than an absence.
     */
    modelCredential: repositoryModelCredentialOfEnvironment(environment),
  };
}

/*
 * `readSidecar` STOOD HERE and is deleted with the two files it read.
 *
 * It was this entry point's bounded reader for `attest-rationales.json` and `attest-fix-proofs.json`
 * - the tier-2 pair - and it had no other caller. The live envelope's four sidecars are read by
 * `readOptionalFile` in `action-boundary.mjs`, which also names to the customer any document it
 * could not carry.
 */

function main() {
  const evidencePath = process.env.ABLOH_EVIDENCE_PATH;
  if (!evidencePath) throw new Error("ABLOH_EVIDENCE_PATH is required");
  const evidence = JSON.parse(readFileSync(evidencePath, "utf8"));
  /*
   * THE TWO SIDECARS THIS USED TO READ ARE THE TWO NOTHING ACCEPTS.
   *
   * `ABLOH_RATIONALES_PATH` and `ABLOH_FIX_PROOFS_PATH` were read here and handed on for the tier-2
   * gate to decide about. The ladder is deleted and `buildStructuralHandoff` carries neither key, so
   * reading them would be opening the model's triage prose to drop it. The live envelope is built by
   * `action-boundary.mjs`, which reads the four sidecars the control plane actually accepts.
   */
  const sidecars = undefined;
  process.stdout.write(
    JSON.stringify(buildStructuralHandoff(evidence, contextFromEnvironment(), sidecars)),
  );
}

/*
 * Run as a script, stay silent when imported.
 *
 * Two traps here, both of which produce an EMPTY envelope rather than an error:
 *
 *  - The workflow pipes this file to `node --input-type=module` on STDIN, where
 *    process.argv[1] is undefined. Any comparison against it fails, main() never
 *    runs, and the upload step writes a zero-byte payload.
 *  - argv[1] is the path as given, while import.meta.url is fully resolved. On
 *    macOS /var is a symlink to /private/var, so the two disagree for the same
 *    file. Both sides are therefore reduced to a real path before comparison.
 */
function isEntryPoint() {
  const entry = process.argv[1];
  if (!entry) return true; /* stdin: nothing else could have imported us */
  try {
    return realpathSync(entry) === realpathSync(fileURLToPath(import.meta.url));
  } catch {
    return false;
  }
}

if (isEntryPoint()) main();
