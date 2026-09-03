/**
 * GENERATED FILE - DO NOT EDIT.
 *
 * Every file a run writes, how to read the index the run wrote beside them, and how to unwrap the one of them that is an envelope.
 *
 * Written by `scripts/generate-decision-copies.mts` from:
 *   packages/core/src/evidence-registry.ts
 *   packages/core/src/evidence-index.ts
 *   packages/core/src/coverage-evidence.ts
 *   packages/core/src/run-local-evidence.ts
 *
 * Those files are the one owner of every rule below. This process cannot import them - see the
 * generator's header for what typing them a second time cost - so they are RENDERED here rather
 * than retyped here, comments and all.
 *
 * To change a rule, change it at the authority above and run `pnpm gen:action`. An edit made
 * here is undone by the next run, and `scripts/decision-copies.test.ts` fails the suite while
 * this file disagrees with its source.
 */

/**
 * THE single source of truth for every file a measurement writes and publication delivers.
 *
 * WHAT WAS DUPLICATED, and it is the repository's most-repeated defect shape
 * (`docs/lessons/two-sites-must-agree-so-pin-them.md`, face one). The basenames were typed out in
 * four places that had to agree and nothing made them:
 *
 *   1. `apps/cli/src/run-support.ts` - one `*_BASENAME` constant per sidecar.
 *   2. `apps/cli/src/artifact-output.ts` - `OWNED_EVIDENCE_FILES`, which spread the constants above
 *      and then spelled two more out as literals, plus the three primary artifact names again.
 *   3. `apps/web/lib/v2-run-page.ts` - `MATERIAL_LABEL`, four names hand-typed to give a reader a
 *      word for a file.
 *   4. `apps/action/action-boundary.mjs` - the three primary names a third time, in a file that
 *      cannot import TypeScript at all.
 *
 * A name added to one and not the others has cost a whole run four times: publication throws
 * `unexpected destination` on a staged file it does not own, and the throw aborts the TRANSACTION,
 * so a repository that measured everything correctly delivers nothing - artifact included.
 *
 * SO THE STRINGS LIVE HERE AND NOWHERE ELSE. Every TypeScript consumer imports from this table, and
 * `scripts/artifact-names.test.ts` fails the build for an artifact filename written as a literal
 * anywhere else on the shipped paths - a name this table declares included, because a declared name
 * typed by hand breaks on the day it changes exactly as an undeclared one does.
 *
 * THE TWO CONSUMERS THAT CANNOT IMPORT IT DO NOT RETYPE IT EITHER (manifest phase A, 2026-09-01).
 * The Action gets this module rendered whole by `pnpm gen:action`, for the names it DICTATES, and
 * reads the run's own manifest for the ones it DISCOVERS. The web app, a separate dependency graph,
 * holds no names at all: the control plane serves the label per file and the page prints what it is
 * given, so `MATERIAL_LABEL` and the test that pinned it are both gone.
 *
 * WHY A RUN'S OWN MANIFEST AND NOT THIS TABLE, WHERE A READER HAS THE CHOICE. This table is a fact
 * about the `@abloh/core` a reader was COMPILED against; the manifest is a fact about the run whose
 * directory that reader is holding. On a hosted run they are two different versions of this product,
 * because a customer's workflow pins the Action by SHA while the CLI it installs is resolved at run
 * time - and the two have agreed so far only because no basename here has ever changed.
 *
 * THE MEASUREMENT PLAN CARRIES THIS TABLE (structural review §11.1, "owned evidence output
 * registry", and §11.5, "evidence producers register their basenames in the same registry
 * publication consumes"). Publication reads the plan's copy, so the producer's registration and the
 * consumer's allowlist are one object rather than two lists that happen to match today.
 */
/**
 * `as const satisfies`, for the same reason {@link RUNNER_CAPABILITIES} is.
 *
 * Annotated, `id` would be `string` and {@link EvidenceOutputId} would stop being a literal union -
 * so a `Record<EvidenceOutputId, …>` would degrade to `Record<string, …>` and silently accept a
 * table missing half its rows, which is precisely the failure this registry exists to end.
 *
 * ORDER IS PUBLICATION ORDER for the owned rows, preserved exactly as `OWNED_EVIDENCE_FILES`
 * carried it, so this table is a re-homing of the list and not a rewrite of it.
 */
export const EVIDENCE_OUTPUTS = [
    /*
     * ------------------------------------------------------------------------- the manifest
     *
     * THE RUN'S OWN INDEX OF WHAT IT WROTE, and the first row because every other reader is now
     * resolved through it rather than through a list of its own.
     *
     * WHY A FILE AND NOT THIS TABLE. This table is a fact about the version of `@abloh/core` that
     * COMPILED a reader; the manifest is a fact about the run that produced the directory the reader
     * is holding. Those are different versions in every hosted run - the Action is pinned by SHA in a
     * customer's workflow and the CLI it installs is resolved at run time - so a reader that consults
     * the table is asking its own build what a stranger's run wrote. It has been right so far only
     * because no basename has ever changed.
     *
     * IT IS `publishable` LIKE ANY OTHER OWNED NAME, so a rerun that writes fewer outputs cannot leave
     * the previous run's manifest describing files that are no longer there.
     */
    {
        id: "evidence-manifest",
        basename: "abloh-evidence-manifest.json",
        kind: "file",
        role: "manifest",
        publishable: true,
        label: null,
    },
    /* ---------------------------------------------------------------- the three artifacts */
    {
        id: "artifact-json",
        basename: "abloh-run.json",
        kind: "file",
        role: "artifact",
        publishable: false,
        label: "Run summary",
    },
    /*
     * `attest-summary.md` STOOD HERE and there is no default name for it any more (manifest phase B,
     * step 14). The prose summary is a RENDERING of the artifact above it, and a rendering stored
     * beside the thing it renders is a second copy that can only go stale. `--md <path>` is the door:
     * a caller who wants one names where it goes, and the id survives so the manifest can carry that
     * name when they do.
     */
    /* ------------------------------------------------------- the sidecars, in publication order */
    /*
     * THE ONE FILE THE CUSTOMER'S OWN SOURCE IS IN, and the one nothing sends (phase B, step 15).
     *
     * It replaced two: `attest-raw-report.json`, the mutation engine's verbatim report, and
     * `attest-rationales.json`, the model's full prose about the source in it. Both had to stay on the
     * runner, for two different reasons held in two different places - and the rationales' reason had
     * already changed once, when the data-flow tier was deleted, without the file moving with it.
     * `packages/core/src/run-local-evidence.ts` is the envelope and the whole of the argument.
     *
     * A LEDGER, not a sidecar, because that is the role's meaning: a local-only record the Action does
     * not upload. Publication owns it like any other, so a rerun cannot leave a previous run's source
     * beside a new artifact.
     */
    {
        id: "run-local",
        basename: "abloh-run.local.json",
        kind: "file",
        role: "ledger",
        publishable: true,
        label: "Planted-bug report",
    },
    {
        id: "redacted-report",
        basename: "abloh-mutation.json",
        kind: "file",
        role: "sidecar",
        publishable: true,
        label: null,
    },
    {
        id: "raw-coverage",
        basename: "abloh-coverage.json",
        kind: "file",
        role: "sidecar",
        publishable: true,
        label: "Changed-line coverage",
    },
    /*
     * `attest-raw-coverage-children.json` STOOD HERE and is now INSIDE the row above (manifest phase
     * B, step 12). It held the documents a merging run's coverage report was derived from, so that
     * report - which is a re-serialization on any run that merged - could be checked against its
     * sources rather than believed. Two files for one fact, and only one of them named in a way that
     * said what it was for. `packages/core/src/coverage-evidence.ts` is the envelope that replaced it.
     */
    {
        id: "engine-v2-proofs",
        basename: "abloh-engine-v2-proofs.json",
        kind: "file",
        role: "sidecar",
        publishable: true,
        label: "Proven tests",
    },
    {
        id: "engine-v2-pool2",
        basename: "abloh-engine-v2-pool2.json",
        kind: "file",
        role: "sidecar",
        publishable: true,
        label: null,
    },
    /*
     * THREE SIDECAR ROWS STOOD HERE and all three are retired (manifest phase B, step 13). The two
     * carrier files went with the carrier pass the 2026-08-31 Stryker deletion took, and the v1 fix
     * loop's proofs went with the v1 engine arm. None of the three had a producer left: the carrier
     * report list was declared and never pushed to, the carrier manifest survived only as an `rmSync`,
     * and no call site asked for the fix-proofs name at all. Their names are in
     * {@link RETIRED_EVIDENCE_OUTPUTS}, where a stored record can still be read against them.
     */
    /*
     * ------------------------------------------------------------------------- local ledgers
     *
     * THE FULL LEDGERS, and they are owned for a reason worth keeping. The two `engine-v2` sidecars
     * above are the SURVIVOR PROJECTIONS - what the Action uploads and what the artifact's digests
     * commit to - and these two are what stays on the runner (junction audit rank 2,
     * `upload-projection.ts`). Publication owns both, so a rerun cannot leave a previous run's
     * REJECTED candidate bodies lying beside a new artifact.
     */
    {
        id: "engine-v2-proofs-local",
        basename: "abloh-engine-v2-proofs.local.json",
        kind: "file",
        role: "ledger",
        publishable: true,
        label: null,
    },
    {
        id: "engine-v2-pool2-local",
        basename: "abloh-engine-v2-pool2.local.json",
        kind: "file",
        role: "ledger",
        publishable: true,
        label: null,
    },
    /* ------------------------------------------------------------------- owned directories */
    /*
     * `attest-ci-invariance` STOOD HERE and is retired with the three above. It was an owned directory
     * with no producer and no reader anywhere in the product - a reserved destination nothing could
     * ever stage - and the comment below, about how a directory is owned whole, was written about it.
     * The rule survives because the row beneath it is real.
     */
    /*
     * A COMPOSED v2 run's per-package evidence, one subdirectory per measured package.
     *
     * A DIRECTORY RATHER THAN MORE FILE ROWS, because the names inside are the customer's package
     * directories and no fixed list can name them. Publication owns the whole tree: staged in full or
     * removed in full, so a rerun that measures fewer packages cannot leave the previous run's
     * evidence beside the new artifact.
     *
     * A SINGLE-PACKAGE RUN DOES NOT USE IT and keeps writing `abloh-engine-v2-proofs.json` beside the
     * artifact exactly as before - the composition has to be invisible where it does not apply.
     */
    {
        id: "engine-v2-packages",
        basename: "abloh-engine-v2-packages",
        kind: "directory",
        role: "sidecar",
        publishable: true,
        label: null,
    },
];
/**
 * THE INDEX INSIDE THE OWNED DIRECTORY ABOVE, which is the fifth name and had no home.
 *
 * A composed run writes one v2 sidecar per measured package under `<slug>/`, and this file is what
 * says which slug belongs to which package directory - the Action reads it rather than re-deriving
 * the CLI's own slug rule. So it is a name a PRODUCER and a CONSUMER in two different processes both
 * have to spell, which is the whole of what this module exists to stop, and it was spelled by hand
 * in both (`apps/cli/src/index.ts` and `apps/action/action-boundary.mjs`, found 2026-09-02).
 *
 * THE CONSUMER SPELLING IS THE DANGEROUS HALF. It is the Action, pinned by SHA in a customer's
 * workflow, reading a directory written by a CLI resolved at run time - the exact cross-version split
 * this module's header is about - and only a composed multi-package run exercises it, which is why
 * nothing had caught it.
 *
 * IT IS A CONSTANT AND NOT A REGISTRY ROW, because the two tables answer questions about the
 * DESTINATION DIRECTORY - what publication owns, promotes and sweeps - and publication owns this
 * file already by owning the tree it is in. Nor is it in {@link registeredBasenames}: that set is
 * what the build check refuses to see spelled by hand anywhere, and `manifest.json` is an ordinary
 * filename that means a hundred things outside this directory.
 */
export const ENGINE_V2_PACKAGE_SIDECAR_INDEX = "manifest.json";
const BY_ID = new Map(EVIDENCE_OUTPUTS.map((entry) => [entry.id, entry]));
const BY_BASENAME = new Map(EVIDENCE_OUTPUTS.map((entry) => [entry.basename, entry]));
/** The row for an id. Throws on an unknown id, which can only be a typo the union already refuses. */
export function evidenceOutput(id) {
    const found = BY_ID.get(id);
    if (found === undefined)
        throw new Error(`unknown evidence output: ${id}`);
    return found;
}
/** The basename for an id - the one call site every consumer that needs the string should use. */
export function evidenceBasename(id) {
    return evidenceOutput(id).basename;
}
/**
 * The row a staged basename belongs to, or null when the registry has never heard of it.
 *
 * Keyed on the WIDE type on purpose: the caller is asking about a name it found on disk, which is
 * exactly the question "is this one of ours".
 */
export function evidenceOutputByBasename(basename) {
    return BY_BASENAME.get(basename) ?? null;
}
/** Every FILE publication owns beside the artifact, in publication order. */
export function publishableEvidenceFiles() {
    return EVIDENCE_OUTPUTS.filter((entry) => entry.publishable && entry.kind === "file").map((entry) => entry.basename);
}
/** Every DIRECTORY publication owns beside the artifact, promoted or removed whole. */
export function publishableEvidenceDirectories() {
    return EVIDENCE_OUTPUTS.filter((entry) => entry.publishable && entry.kind === "directory").map((entry) => entry.basename);
}
export const RETIRED_EVIDENCE_OUTPUTS = [
    /* ------------------------------------------------------------------------- renamed */
    {
        id: "artifact-json",
        basename: "attest-results.json",
        kind: "file",
        fate: "renamed to the run's own name. `attest-` was the product's first vocabulary and the file is " +
            "the run artifact - what a measurement produced, which every other document beside it is " +
            "evidence for",
        label: null,
    },
    {
        id: "redacted-report",
        basename: "attest-mutation-redacted.json",
        kind: "file",
        fate: "renamed to the mutation file. It is the mutation evidence that MAY be sent - the verbatim " +
            "report it is a rewrite of embeds the customer's source and now lives in the one never-sent " +
            "file - so it is the mutation document rather than a qualified form of one",
        label: null,
    },
    {
        id: "raw-coverage",
        basename: "attest-raw-coverage.json",
        kind: "file",
        fate: "renamed to the coverage file, which since step 12 also carries the documents a merging run's " +
            "report was derived from. `raw` described a property the file stopped having on any run that " +
            "merged, which is what the children were introduced to make checkable",
        label: null,
    },
    /* ------------------------------------------------- folded into the one never-sent file */
    {
        id: "raw-report",
        basename: "attest-raw-report.json",
        kind: "file",
        fate: "folded into `abloh-run.local.json`, which is now the only file a run's own source is in and " +
            "the only one nothing sends. It is still bound by `rawReportDigest`, over the same verbatim " +
            "bytes, which the envelope keeps as a string for exactly that reason",
        /* THE LABEL SURVIVES THE MOVE, because a STORED record still has this row and the v2 run page
           still prints a word for it. The concept did not merge - the mutation report and the model's
           prose are two facts with two digests - only the file they live in did. */
        label: "Planted-bug report",
    },
    {
        id: "artifact-rationales",
        basename: "attest-rationales.json",
        kind: "file",
        fate: "folded into the same file, and `--rationales` is gone with it. The model's prose about a " +
            "customer's source stopped being uploaded when the data-flow tier was deleted, and a flag " +
            "that let it be written to any path was the one thing still able to move it",
        label: null,
    },
    /* ---------------------------------------------------------- no longer stored by default */
    {
        id: "artifact-markdown",
        basename: "attest-summary.md",
        kind: "file",
        fate: "no longer stored under a default name. The prose summary is a rendering of the artifact " +
            "beside it, so a run writes one only where `--md <path>` asks for it and puts it exactly " +
            "there. The id is still live; what retired is the name a run defaulted to",
        label: null,
    },
    /* -------------------------------------------------- folded into the file it was evidence about */
    {
        id: "raw-coverage-children",
        basename: "attest-raw-coverage-children.json",
        kind: "file",
        fate: "folded into the coverage file it was always evidence about. It held the documents a merging " +
            "run's report was derived from; they are now the `children` of that report's own envelope, " +
            "so one file answers both halves and a reader needs no second filename",
        label: null,
    },
    /*
     * -------------------------------------------- what the prune found: four names nothing wrote
     *
     * NOT MOVES. Each of these had already stopped being produced, and the registry went on reserving
     * the name - so `evidenceOutputByBasename` answered "one of ours" for four files no run could
     * contain, and publication owned four destinations nothing could ever stage.
     */
    {
        id: "raw-carrier-reports",
        basename: "attest-raw-carrier-reports.json",
        kind: "file",
        fate: "retired with the carrier pass, which the 2026-08-31 Stryker deletion took. What was left was " +
            "a `const rawCarrierReports = []` nothing pushed to, so the file's bytes were unreachable by " +
            "construction and every run wrote null",
        label: null,
    },
    {
        id: "carrier-evidence",
        basename: "attest-carrier-evidence.json",
        kind: "file",
        fate: "retired with the same pass. Its producer went on 2026-08-31 and what survived was an " +
            "`rmSync` of a file nothing writes, guarding a directory nothing reuses",
        label: null,
    },
    {
        id: "fix-proofs",
        basename: "attest-fix-proofs.json",
        kind: "file",
        fate: "retired with the v1 engine arm. Nothing has written it since that arm was deleted - there is " +
            "no `evidenceBasename(\"fix-proofs\")` call site anywhere - and the control plane still names " +
            "it on a STORED v1 record, which is why the name has to survive the row",
        label: null,
    },
    {
        id: "ci-invariance",
        basename: "attest-ci-invariance",
        kind: "directory",
        fate: "retired unwritten. An owned directory with no producer and no reader anywhere in the " +
            "product: publication reserved a name nothing ever staged",
        label: null,
    },
];
/**
 * THE DAY THIS TABLE MUST BE GONE, and a test fails on it.
 *
 * DERIVED, NOT PICKED. The only thing that can still meet a pre-regrouping name is a STORED RUN,
 * and a stored run is deleted by the retention sweep at most `EVIDENCE_RETENTION_MAX_DAYS` (90)
 * after it was created. The clock starts not at the release but at the LAST run that could write an
 * old name - and a customer may pin `cli-version`, so that is later than the release by however
 * long a pinned workflow takes to move. Ninety days of retention plus the rest of the quarter for a
 * pin to move is 2027-01-01.
 *
 * WHAT THE FAILING TEST ASKS. Not "delete this" unconditionally: it asks whether any stored record
 * still carries no index, and if none does, the table and its two readers go. If some still do, the
 * date moves WITH the measurement that justified moving it, which is a decision somebody made rather
 * than a comment that rotted.
 */
export const EVIDENCE_REGROUPING_EXPIRY = "2027-01-01";
const RETIRED_BY_ID = new Map(RETIRED_EVIDENCE_OUTPUTS.map((entry) => [entry.id, entry]));
/** Keyed by NAME, for dating a stored run's producer off the index it uploaded. */
const RETIRED_BY_NAME = new Set(RETIRED_EVIDENCE_OUTPUTS.map((entry) => entry.basename));
/**
 * What a run wrote for this id BEFORE the regrouping, or null when the name never moved.
 *
 * Keyed on the WIDE type, because two of these ids have no row in {@link EVIDENCE_OUTPUTS} at all -
 * the caller is asking about a record older than this build, and the id it is holding may be one
 * this build no longer produces.
 */
export function retiredEvidenceBasename(id) {
    return RETIRED_BY_ID.get(id)?.basename ?? null;
}
/**
 * The name a STORED RUN wrote for this id, given whatever index that run uploaded.
 *
 * THE ONE ANSWER EVERY SERVING SURFACE ASKS, and the order is the whole of it:
 *
 *   1. THE RUN'S OWN INDEX, which is a fact about the run whose documents are being named.
 *   2. THE PRE-REGROUPING NAME, because a record with no index is older than the index, and a
 *      producer older than the index is older than the regrouping - so it wrote the old name.
 *   3. THIS BUILD'S REGISTRY, which is the honest last answer for an id that never moved.
 *
 * STEP 2 IS THE COMPATIBILITY PATH and it expires; see {@link EVIDENCE_REGROUPING_EXPIRY}. Without
 * it, step 3 would print this deployment's current name over a run that wrote a different one -
 * which is the defect the index was introduced to end, reintroduced by the rename it made safe.
 */
export function storedEvidenceBasename(index, id) {
    const named = index?.find((entry) => entry.id === id)?.basename;
    if (named !== undefined)
        return named;
    const live = BY_ID.get(id)?.basename ?? null;
    const retired = retiredEvidenceBasename(id);
    if (retired === null)
        return live;
    /*
     * WHICH ERA THIS RUN IS FROM, read off the index it DID upload.
     *
     * An id the index does not name is a document that run did not write, so the name here is a label
     * rather than a location - but it is on a customer's screen and it should be the one their run
     * would have used. No index at all means a producer older than the index, which is older than the
     * regrouping. An index carrying any pre-regrouping name dates the producer the same way. An index
     * carrying none of them is a run from after the move, and gets today's name.
     */
    const rows = index ?? null;
    if (rows === null)
        return retired;
    return rows.some((entry) => RETIRED_BY_NAME.has(entry.basename)) ? retired : (live ?? retired);
}
/**
 * Every pre-regrouping name and what it was on disk, for the publication sweep that removes them.
 *
 * The KIND travels with the name because publication removes a directory whole and a file
 * one-for-one, and it refuses a destination whose kind on disk disagrees with the one it was told.
 */
export function retiredEvidenceOutputs() {
    return RETIRED_EVIDENCE_OUTPUTS;
}
/**
 * The word the v2 run page may print for an id, live or retired, or null where it may print none.
 *
 * ONE LOOKUP FOR BOTH TABLES, because a surface rendering a STORED record does not know which of
 * them that record's id belongs to and must not have to. {@link evidenceOutput} throws on a retired
 * id by design - the live table is a claim about what THIS build writes - so a serving surface asks
 * here instead. See `EvidenceOutput.label` for why the column is scoped to one surface.
 */
export function storedEvidenceLabel(id) {
    return BY_ID.get(id)?.label ?? RETIRED_BY_ID.get(id)?.label ?? null;
}
/** Every pre-regrouping name, for a caller that only needs the strings. */
export function retiredEvidenceBasenames() {
    return RETIRED_EVIDENCE_OUTPUTS.map((entry) => entry.basename);
}
export const NON_EVIDENCE_OUTPUTS = [
    /* ------------------------------------------------------- written instead of a measurement */
    {
        id: "run-refusal",
        basename: "abloh-refusal.json",
        kind: "diagnostic",
        producer: "cli",
        note: "why a run produced no measurement, written by the CLI's one exit door " +
            "(`apps/cli/src/run-outcome.ts`) and read back into the job log by the step that finds no " +
            "artifact. It exists BECAUSE there is no evidence: census wave 3 measured `vitejs/vite` " +
            "reaching artifact validation with an empty output directory and nothing anywhere saying " +
            "why. Publication owning it would put the absence of evidence into its allowlist.",
    },
    {
        id: "sweep-ledger",
        basename: "abloh-sweep.json",
        kind: "diagnostic",
        producer: "cli",
        note: "the diagnostic sweep's wall ledger, which the CLI writes and the Action's `sweep` input asks " +
            "for. A sweep measures nothing - no artifact, no gate, no model call - and its own bytes say " +
            "`attesting: false`, so owning it would make a run that measured nothing look like one that " +
            "did. The sweep drives many runs into its own output directory; each run underneath it " +
            "publishes its artifact normally.",
    },
    {
        id: "sweep-summary",
        basename: "abloh-sweep-summary.json",
        kind: "diagnostic",
        producer: "cli",
        note: "the same sweep's names-and-counts summary, written beside the ledger above.",
    },
    {
        id: "validation-ledger",
        basename: "abloh-init-validation.json",
        kind: "diagnostic",
        producer: "cli",
        note: "the SAME wall ledger as `abloh-sweep.json` under the name `abloh init --validate` writes it " +
            "with - one mode of one module, through one writer, differing only in the basename. The " +
            "Action's boundary names it because a validation run leaves it where a measurement would have " +
            "gone and the step that finds no artifact has to be able to say so instead of reporting a " +
            "cancelled job (corpus rehearsal, 2026-08-30, finding 3). A validation run publishes no " +
            "artifact at all.",
    },
    {
        id: "validation-summary",
        basename: "abloh-init-validation-summary.json",
        kind: "diagnostic",
        producer: "cli",
        note: "the same validation run's names-and-counts summary, beside the ledger above.",
    },
    {
        id: "sweep-preceding-refusal",
        basename: "abloh-sweep-preceding-refusal.json",
        kind: "diagnostic",
        producer: "action",
        note: "the boundary refusal a diagnostic sweep ran past, filed beside the wall ledger so a collected " +
            "directory carries the wall that made it a diagnostic. It is the OPPOSITE of run evidence and " +
            "its own bytes say `attesting: false`: the run it describes refused, measured nothing and " +
            "uploaded nothing.",
    },
    {
        id: "preflight-report",
        basename: "abloh-preflight.json",
        kind: "diagnostic",
        producer: "cli",
        note: "the preflight's egress-safe report, written where the run's artifact would go so the Action " +
            "can find it after a refusal. It is a pre-run readiness check, and a run that publishes one " +
            "of these is a run that published no artifact.",
    },
    /* ------------------------------------------------- finished documents carried between processes */
    {
        id: "handoff-envelope",
        basename: "abloh-handoff.json",
        kind: "handoff",
        producer: "action",
        note: "the finished upload envelope, staged by the measuring job for the attestation job to post " +
            "(the identity split, 2026-08-29). It is not a document the CLI writes and not evidence: it " +
            "is the SERIALIZED FORM of the envelope the upload would have sent from this same run, built " +
            "by `buildStructuralHandoff` from evidence this registry already declares. Owning it would " +
            "invite a second answer to what the envelope contains, which is the projection's alone.",
    },
    {
        id: "setup-trial",
        basename: "abloh-setup-trial.json",
        kind: "handoff",
        producer: "cli",
        note: "the setup trial's report, which is not run evidence and must not be: a trial measures " +
            "nothing and publishes nothing, and its report goes to the setup door rather than through the " +
            "evidence upload. Owning it would make a report-only run look like a measured one.",
    },
    {
        id: "setup-report",
        basename: "abloh-setup-report.md",
        kind: "handoff",
        producer: "cli",
        note: "the maintainer-facing rendering of the trial above, written beside it by the same producer " +
            "and read by the setup pull request's comment. Same door, same reason.",
    },
    {
        id: "setup-trial-refusal",
        basename: "abloh-setup-trial-refusal.json",
        kind: "handoff",
        producer: "action",
        note: "why the setup report was not handed up, staged by the measuring job in the report's own place " +
            "when the report is over the trial door's ceiling (tail probe, 2026-08-30, finding 2). The " +
            "attestation job used to find an empty directory, read it as an ordinary run with nothing to " +
            "file, and conclude success while the maintainer's setup check never answered. Its own bytes " +
            "say `attesting: false`.",
    },
    /* ------------------------------------------------------------------- never beside an artifact */
    {
        id: "provider-receipt",
        basename: "abloh-provider-receipt.json",
        kind: "local",
        producer: "cli",
        note: "the coverage provider cache's receipt, written inside the cache directory under the runs " +
            "home so a staged provider can be identified later. Never in the measured checkout.",
    },
    {
        id: "ci-properties",
        basename: "attest-ci-properties.json",
        kind: "local",
        producer: "cli",
        note: "the CI-property pass's local source-bearing proof detail, written into whatever directory " +
            "its caller names, of which only the digest may egress. `runCiPropertyPass` has no caller on " +
            "the shipped path today, so nothing writes one on a customer's run.",
    },
    {
        id: "replay-recordings",
        basename: "abloh-recordings.json",
        kind: "input",
        producer: "cli",
        note: "the replay recordings file, which is the CUSTOMER's committed input to a run rather than " +
            "anything a run produces.",
    },
];
/**
 * TOTAL BY CONSTRUCTION, so the lookup below raises nothing.
 *
 * {@link NonEvidenceOutputId} is derived from this very array's `id` cells, so every id the type
 * admits is a key here and a miss is not a state that exists. The assertion says that rather than
 * hoping it: the alternative is a throw whose sentence no reader can ever reach, and an unreachable
 * failure message is one more thing to own. `evidence-manifest.test.ts` walks every id through it.
 */
const NON_EVIDENCE_BY_ID = Object.fromEntries(NON_EVIDENCE_OUTPUTS.map((entry) => [entry.id, entry]));
/** The row for a non-evidence id. */
export function nonEvidenceOutput(id) {
    return NON_EVIDENCE_BY_ID[id];
}
/** The basename for a non-evidence id - the one call site every consumer that needs the string uses. */
export function nonEvidenceBasename(id) {
    return nonEvidenceOutput(id).basename;
}
/**
 * Every artifact-shaped name this product knows about, evidence or not.
 *
 * THE SET THE BUILD CHECK ASKS. `scripts/artifact-names.test.ts` refuses any such name spelled as a
 * literal outside this module, and "is this one of ours" has to be answerable about all of them or
 * the check is a list of the ones somebody remembered.
 */
export function registeredBasenames() {
    return new Set([
        ...EVIDENCE_OUTPUTS.map((entry) => entry.basename),
        ...NON_EVIDENCE_OUTPUTS.map((entry) => entry.basename),
    ]);
}
/* ==========================================================================================
 * THE MANIFEST: what one run actually wrote, said by that run.
 * ========================================================================================== */
/**
 * The document's own name for itself.
 *
 * Versioned because it crosses two boundaries a version cannot be negotiated over: a customer's
 * pinned Action reading a CLI resolved at run time, and a control plane reading an envelope built by
 * an Action released before it. A reader that does not recognise the schema answers "no manifest"
 * and says so, which is the only honest thing left to do with bytes it cannot interpret.
 */
export const EVIDENCE_MANIFEST_SCHEMA = "abloh-evidence-manifest/v1";
/**
 * The manifest's bytes, as publication writes them.
 *
 * PRETTY-PRINTED AND NEWLINE-TERMINATED, because a customer reads this file: it is the index of
 * their own run's output directory and the first place to look when a downstream reader says a
 * document is missing.
 */
export function renderEvidenceManifest(outputs) {
    const document = {
        schema: EVIDENCE_MANIFEST_SCHEMA,
        outputs: outputs.map((entry) => ({ id: entry.id, basename: entry.basename })),
    };
    return `${JSON.stringify(document, null, 2)}\n`;
}
/**
 * A manifest read back, or null when these bytes are not one.
 *
 * NULL IS "I CANNOT READ THIS", NEVER "THERE IS NOTHING HERE", and every caller has to tell its
 * reader which of those happened - an unreadable manifest beside a complete artifact is a producer
 * older than this reader, and silence about it is the discarded input the lesson is named for
 * (`docs/lessons/a-discarded-input-is-never-silent.md`).
 *
 * STRICT ON SHAPE AND SILENT ON EXTRA KEYS. A row missing `id` or `basename` makes the whole
 * document unreadable rather than a shorter list, because a partial index is indistinguishable from
 * a run that produced less. A row carrying a key this version does not know is kept: this is a
 * pinned consumer reading a producer that may have shipped afterwards, which is the posture
 * `wire/schema-kernel.ts` states for exactly this direction.
 *
 * A BASENAME IS A BASENAME. Anything with a separator in it, or a relative traversal, is refused -
 * readers join these onto a directory path, and a name that could leave that directory is the one
 * thing a document arriving from a disk this process does not own must not be able to say.
 */
export function parseEvidenceManifest(text) {
    let parsed;
    try {
        parsed = JSON.parse(text);
    }
    catch {
        return null;
    }
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed))
        return null;
    const record = parsed;
    if (record.schema !== EVIDENCE_MANIFEST_SCHEMA)
        return null;
    if (!Array.isArray(record.outputs))
        return null;
    const outputs = [];
    for (const row of record.outputs) {
        if (typeof row !== "object" || row === null || Array.isArray(row))
            return null;
        const entry = row;
        const id = entry.id;
        const basename = entry.basename;
        if (typeof id !== "string" || id === "")
            return null;
        if (typeof basename !== "string" || basename === "")
            return null;
        if (!/^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/u.test(basename))
            return null;
        if (outputs.some((seen) => seen.id === id))
            return null;
        outputs.push({ id, basename });
    }
    return { schema: record.schema, outputs };
}
/**
 * The name THIS run wrote for one registry id, or null when the run wrote no such output.
 *
 * The one call every reader makes. Null is an ordinary answer - a v1 run writes no v2 proofs, and a
 * run whose pool never planted writes no pool evidence - and it is the same answer the readers used
 * to get from a `statSync` that found nothing, so nothing downstream has to learn a new state.
 */
export function manifestBasename(manifest, id) {
    if (manifest === null)
        return null;
    return manifest.outputs.find((entry) => entry.id === id)?.basename ?? null;
}
/**
 * THE DECISION, TAKEN FROM THE RUN'S OWN INDEX AND FROM THIS TABLE'S ROLE COLUMN.
 *
 * The job artifact exists so a maintainer can open what a run wrote (error-plane step 10; wave 1's
 * item 4 measured that those files die with the job). Two rules and nothing else decides it.
 *
 * THE LIST COMES FROM THE RUN, NEVER FROM THIS TABLE. `EVIDENCE_OUTPUTS` is a fact about the build
 * that compiled the reader; the manifest is a fact about the run whose directory is being staged.
 * A hardcoded list is what the census shipped and it would have uploaded an empty artifact for every
 * repository (`data/abloh-manifest-real-run-smoke/report.md`, finding 3).
 *
 * THE PERMISSION COMES FROM THIS TABLE, and it FAILS CLOSED. `role` is the one column that says
 * whether a file may leave the machine, and a manifest is a document written by a process this one
 * does not own - so a row whose id this build cannot look up is withheld rather than trusted. That
 * costs a newer producer's new sidecar its place in the artifact and never leaks a source-bearing
 * file, which is the direction the trade has to go.
 *
 * A NULL MANIFEST PLANS NOTHING. That is not "the run wrote nothing" - the caller has proved a
 * complete artifact is present - and it is the state {@link evidenceIndexMissingSentence} already
 * has a sentence for: the upload carries the artifact alone, whose name the caller dictated.
 */
export function evidenceUploadPlan(manifest) {
    if (manifest === null)
        return { upload: [], withheld: [] };
    const upload = [];
    const withheld = [];
    for (const entry of manifest.outputs) {
        const row = BY_ID.get(entry.id);
        if (row === undefined) {
            withheld.push({ basename: entry.basename, reason: "unknown-output" });
            continue;
        }
        if (row.role === "ledger") {
            withheld.push({ basename: entry.basename, reason: "local-only" });
            continue;
        }
        upload.push(entry.basename);
    }
    return { upload, withheld };
}
/**
 * WHETHER ONE FILE FOUND INSIDE A STAGED EVIDENCE DIRECTORY IS A LEDGER THIS BUILD MUST HOLD BACK.
 *
 * {@link evidenceUploadPlan} decides per manifest ROW, and the row for the per-package tree
 * (`engine-v2-packages`) is a single `sidecar` covering a directory. So a composed run's
 * `.local.json` ledgers, which live one level down under a package slug, were never asked about -
 * they went into the download unnamed, on a path the single-package rule holds perfectly
 * (`data/abloh-manifest-smoke-3/report.md`, finding L). The rule is not "the row is a sidecar",
 * it is "no ledger leaves the machine", and a directory does not suspend it.
 *
 * KEYED ON THE BASENAME, because inside that tree there are no manifest ids to ask about - the run
 * writes the registry's own filenames under a slug of the package that produced them, and the slug
 * is the customer's directory name rather than anything this table knows.
 *
 * IT IS THE LEDGER RULE AND NOT THE WHOLE FAIL-CLOSED RULE, which is the one asymmetry with the top
 * level and is deliberate. Up there an id this build cannot look up is withheld, because the
 * manifest names ids and every id is either known or new. Down here the tree legitimately holds
 * names no row will ever carry - the package slug directories and {@link
 * ENGINE_V2_PACKAGE_SIDECAR_INDEX} - so withholding the unknown would stage an empty tree on every
 * composed run and lose the evidence the directory exists to deliver.
 */
export function stagedEvidenceIsLedger(name) {
    return BY_BASENAME.get(name)?.role === "ledger";
}
/**
 * The line the job log carries for one held-back file.
 *
 * ONE LINE PER FILE RATHER THAN A COUNT, on the same reasoning as the withheld-sidecar report the
 * upload step already prints: a maintainer looking for a document in the artifact needs the name
 * they were looking for, and a number tells them only that something is absent.
 */
export function evidenceWithheldLine(withheld) {
    const cause = withheld.reason === "local-only"
        ? "it holds your own source and stays on the runner"
        : withheld.reason === "unknown-output"
            ? "this Action is older than the abloh that wrote it and cannot say what is in it"
            : "the run listed it and this step could not read it from the output directory";
    return `Abloh: ${withheld.basename} is kept out of the run artifact: ${cause}.`;
}

/**
 * WHAT TO SAY WHEN A FINISHED RUN LEFT NO INDEX OF ITS OWN OUTPUT DIRECTORY.
 *
 * THE STATE THIS IS ABOUT (manifest phase A, 2026-09-01). Every reader of a run's evidence used to
 * carry its own list of the filenames: the Action's four sidecar reads, the control plane's
 * materials panel, the run page's labels. Each was one build's opinion about what a DIFFERENT
 * build wrote - a customer's workflow pins the Action by SHA and the CLI it installs is resolved at
 * run time - and the agreement held only because no basename had ever changed. So the run now writes
 * `abloh-evidence-manifest.json` beside its artifact and every reader asks the run.
 *
 * WHICH CREATES ONE NEW STATE, AND THIS FILE IS ITS SENTENCE. A complete artifact with no readable
 * index beside it means the producer is older than the reader - a `cli-version` pinned behind the
 * Action, most likely - or the file could not be read on that runner. The reader cannot then say
 * which document is which, so the upload carries the artifact alone.
 *
 * IT MUST NOT BE SILENT AND IT MUST NOT REFUSE. Silent is the shape
 * `docs/lessons/a-discarded-input-is-never-silent.md` is named for: the evidence exists, it is
 * beside the artifact, and nothing would say it had been left behind. Refusing is worse in the other
 * direction - a complete measurement thrown away over its index - and the run's verdict does not
 * depend on the sidecars at all.
 *
 * THE ACTION CANNOT IMPORT THE REGISTRY THIS CODE IS DECLARED IN, and does not retype it. This
 * module is import-free, so `scripts/generate-decision-copies.mts` renders it into
 * `apps/action/evidence-registry.generated.mjs` beside the registry itself, and the boundary prints
 * from the copy. Change the sentence here and run `pnpm gen:action`.
 */
/**
 * The one sentence, and it states the consequence before the cause.
 *
 * The consequence is what a reader has to act on - their run page will show a measurement with no
 * evidence attached - and the cause is what they change. Kenneth's copy shape: state the fact, state
 * the action, stop.
 */
export function evidenceIndexMissingSentence(problem) {
    /*
     * TWO CAUSES, TWO SENTENCES, ONE CONSEQUENCE (Kenneth's delegation, wave 4, queue 15 and 116).
     *
     * The consequence is what a reader can act on and what they will go looking for: the run page
     * shows less than it did, and only the main result was uploaded. Naming "the documents beside the
     * artifact" described abloh's own output directory to somebody who has never seen one.
     */
    const cause = problem === "absent"
        ? "this run's abloh version wrote no file index"
        : "abloh could not read its own list of the files this run wrote";
    return (`${cause}, so only the main result was uploaded and this run's detail is missing on the ` +
        "dashboard");
}
/**
 * What to do about an index that was never written. The version pairing, and only that.
 *
 * IT USED TO BE THE ANSWER TO BOTH PROBLEMS AND IS NOT ONE (split audit S9, applied 2026-09-02).
 * `absent` is a producer older than the reader, so pinning the versions together is exactly right.
 * `unreadable` is the file present and not this document - "Truncated, corrupt, or written by
 * something else", in this module's own words two declarations up - and pinning a version fixes
 * none of those. A truncated index THIS build wrote is abloh's defect, and telling a maintainer to
 * change an input they may not even have set is `docs/lessons/a-remedy-is-a-promise.md`'s defect.
 * Two causes, two owners, two remedies: `evidence-index-missing` keeps this one and
 * `evidence-index-unreadable` carries the other.
 */
export const EVIDENCE_INDEX_MISSING_REMEDY = "Let this step install the abloh version it ships with: remove the `cli-version` input, or set " +
    "it to that version, and rerun.";
/**
 * WHICH REFUSAL AN UNREADABLE INDEX IS.
 *
 * ONE READING OF THE PROBLEM THE PRODUCER ALREADY TYPED. `EvidenceIndexProblem` has separated the
 * two causes since it was written, and the registry attached one fixed remedy to both - the
 * discriminator computed and then dropped, which is split audit section 6's mechanism.
 */
export function evidenceIndexRefusalCode(problem) {
    return problem === "unreadable" ? "evidence-index-unreadable" : "evidence-index-missing";
}
/**
 * THE IDENTIFIER A MAINTAINER QUOTES FOR AN INDEX ABLOH WROTE AND COULD NOT READ BACK.
 *
 * Fixed rather than derived, because there is exactly one failure under this code: the file is
 * there and it is not this document. Nothing about the run distinguishes two occurrences of it.
 */
export const EVIDENCE_INDEX_UNREADABLE_REPORT_ID = "evidence-index-unreadable";
/**
 * The block a job log prints, line for line what the registry composes for every other reader.
 *
 * Two lines rather than one paragraph, because the second is a next action and a reader scanning a
 * job log for what to do should not have to find it inside a sentence about what happened.
 */
export function evidenceIndexMissingLines(problem) {
    return [
        `Abloh: ${evidenceIndexMissingSentence(problem)}.`,
        /* THE UNREADABLE HALF ENDS ON THE COMPOSED CLOSING LINE AND CARRIES NO `next:` LABEL (Kenneth's
           wave-4 ruling 1): it is not a next action, it is the statement that there is none, so
           labelling it as one is a contradiction on the line that carries it. The literal is here
           because `pnpm gen:action` refuses a source module that imports, and `refusal.test.ts` pins
           it against `ablohFailureClosingLine`. The missing half is a real customer action and keeps
           its label. */
        problem === "unreadable"
            ? `Abloh: This is a failure in abloh, not something in your repository. Quote report id ` +
                `${EVIDENCE_INDEX_UNREADABLE_REPORT_ID} if you contact support@abloh.dev.`
            : `Abloh: next: ${EVIDENCE_INDEX_MISSING_REMEDY}`,
    ];
}

/**
 * THE COVERAGE FILE, AND WHY IT IS AN ENVELOPE RATHER THAN A PROVIDER'S OWN BYTES.
 *
 * WHAT USED TO BE TWO FILES (manifest phase B, step 12). `attest-raw-coverage.json` held the
 * provider's document verbatim, and beside it `attest-raw-coverage-children.json` held the
 * documents that document was merged FROM - one per suite command on a multi-command run, one per
 * package on a monorepo. Two files, one fact, and only one of them named in a way that said what it
 * was for. The second existed because the first is a RE-SERIALIZATION on any run that merged: each
 * child's key order, whitespace and any metadata the merge does not understand are gone, while the
 * file is still labelled raw.
 *
 * SO THEY ARE ONE FILE NOW, and the file says what it is: the merged report and the documents it was
 * derived from, under one schema, in one place a reader can check one against the other without
 * knowing that a second filename exists.
 *
 * THE VERBATIM BYTES SURVIVE AS BYTES, which is the whole property this evidence layer has. `report`
 * is a STRING and never a parsed object, so `rawCoverageDigest` - the artifact's commitment, taken
 * before anything is written - still binds exactly what the provider wrote. Re-serializing it into
 * the envelope as an object would lose the key order and whitespace the digest was taken over, and a
 * commitment nothing can be checked against is not one.
 *
 * WHAT THE UPLOAD CARRIES IS `report` AND NOT THIS ENVELOPE, and the Action unwraps before it sends.
 * Three reasons, in the order they matter: the control plane checks the uploaded bytes against
 * `rawCoverageDigest` and would refuse an envelope; the children are LOCAL evidence and always were,
 * so sending them would widen what leaves a customer's runner for nothing; and a monorepo's children
 * are N times the merged document, which would push a real repository through
 * `MAX_COVERAGE_SIDECAR_BYTES` and lose the coverage view entirely.
 *
 * THE ACTION CANNOT IMPORT THIS, so it does not retype it: `pnpm gen:action` renders this module
 * into `apps/action/evidence-registry.generated.mjs` beside the registry, and the boundary unwraps
 * with the copy. It is import-free for exactly that reason.
 */
/** The document's own name for itself, versioned because it crosses a build boundary. */
export const COVERAGE_EVIDENCE_SCHEMA = "abloh-coverage/v1";
/**
 * The coverage file's bytes, as the run writes them.
 *
 * PRETTY-PRINTED AND NEWLINE-TERMINATED, like every other document a customer opens in their own
 * output directory.
 */
export function renderCoverageEvidence(report, children) {
    const document = {
        schema: COVERAGE_EVIDENCE_SCHEMA,
        report,
        children: children.map((child) => ({
            source: child.source,
            runner: child.runner,
            report: child.report,
        })),
    };
    return `${JSON.stringify(document, null, 2)}\n`;
}
/**
 * The provider's own merged bytes, out of whichever shape these bytes are.
 *
 * TWO SHAPES, AND THE SECOND IS THE COMPATIBILITY PATH. An envelope yields its `report`; anything
 * else IS the report, because that is what the file held before this envelope existed and what a
 * customer's pinned CLI still writes. It expires with every other pre-regrouping allowance; see
 * `EVIDENCE_REGROUPING_EXPIRY`.
 *
 * THE FALLBACK IS THE INPUT UNCHANGED, never a refusal and never an empty string. This runs on the
 * upload path, where the alternative to sending the bytes is sending nothing - and coverage
 * evidence dropped for a shape question is a complete measurement made unverifiable.
 *
 * BOTH KEYS ARE REQUIRED to recognise an envelope, so a provider document that happens to hold a
 * file called `schema` is not mistaken for one: its value would be a coverage object, not this
 * string, and `report` would not be a string at all.
 */
export function coverageReportBytes(text) {
    let parsed;
    try {
        parsed = JSON.parse(text);
    }
    catch {
        return text;
    }
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed))
        return text;
    const record = parsed;
    if (record.schema !== COVERAGE_EVIDENCE_SCHEMA)
        return text;
    return typeof record.report === "string" ? record.report : text;
}

/**
 * THE ONE FILE A RUN'S OWN SOURCE IS IN, AND THE ONE FILE NOTHING SENDS.
 *
 * WHAT WAS SCATTERED (manifest phase B, step 15). Two documents beside every artifact held bytes
 * that must never leave a customer's runner, and they were two separate names with two separate
 * writers and two separate reasons for staying put:
 *
 *   `attest-raw-report.json` - the mutation engine's VERBATIM report, which embeds the source of
 *   every file it mutated. The redacted rewrite beside it is the form that may be uploaded.
 *
 *   `attest-rationales.json` - the model's full triage prose about that source. It stopped being
 *   uploaded when the data-flow tier was deleted, and until then the tier decided it.
 *
 * TWO FILES IS TWO CHANCES TO GET IT WRONG. Whether a document may be sent was a fact about each
 * name, held in each reader's head and in a comment above each writer, and the answer had already
 * moved once - for the rationales - without the file moving with it. One file, one answer: this one
 * is never sent, so a reader asking "may I forward this?" has a filename to ask about rather than a
 * policy to remember.
 *
 * THE DIGESTS STILL BIND WHAT THEY BOUND. Both members are verbatim STRINGS, never parsed objects:
 * `rawReportDigest` and `rationalesDigest` are taken over the producers' own bytes before anything
 * is written, and a re-serialization into this envelope would hash to something else. That is the
 * same rule `coverage-evidence.ts` states for the same reason - a commitment nothing can be checked
 * against is not one - and it is why a human opening this file finds JSON inside JSON.
 *
 * WHAT THIS DOES NOT COVER, said plainly rather than implied. The v2 engine's own `.local.json`
 * ledgers are a separate family: they are written one per measured package on a composed run, they
 * already carry `.local` in their names, and their sent halves carry planted-bug spans by Kenneth's
 * own ruling. Folding them here would flatten a per-package structure into one document and would
 * not change what leaves the runner. So "exactly one never-sent file" is a statement about the
 * CLASSIC lane's evidence, which is what was scattered, and not about the engine's.
 */
/** The document's own name for itself. */
export const RUN_LOCAL_EVIDENCE_SCHEMA = "abloh-run-local/v1";
/**
 * The file's bytes, as the run writes them.
 *
 * PRETTY-PRINTED AND NEWLINE-TERMINATED, because a customer opens this: it is where their own source
 * is, and the first place to look when a surface says a document was held back.
 */
export function renderRunLocalEvidence(input) {
    const document = {
        schema: RUN_LOCAL_EVIDENCE_SCHEMA,
        mutationReport: input.mutationReport,
        rationales: input.rationales,
    };
    return `${JSON.stringify(document, null, 2)}\n`;
}
/**
 * A run-local file read back, or null when these bytes are not one.
 *
 * NULL IS "I CANNOT READ THIS", never "there is nothing here" - the same posture every other reader
 * in this registry takes, and every caller has to tell its own reader which happened.
 */
export function parseRunLocalEvidence(text) {
    let parsed;
    try {
        parsed = JSON.parse(text);
    }
    catch {
        return null;
    }
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed))
        return null;
    const record = parsed;
    if (record.schema !== RUN_LOCAL_EVIDENCE_SCHEMA)
        return null;
    const member = (value) => value === null || typeof value === "string" ? value : undefined;
    const mutationReport = member(record.mutationReport);
    const rationales = member(record.rationales);
    if (mutationReport === undefined || rationales === undefined)
        return null;
    return { schema: record.schema, mutationReport, rationales };
}
