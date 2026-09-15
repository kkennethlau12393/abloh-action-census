/**
 * GENERATED FILE - DO NOT EDIT.
 *
 * Every file a run writes, the evidence block inside the record it writes, and how to read the index the run put in it.
 *
 * Written by `scripts/generate-decision-copies.mts` from:
 *   packages/core/src/evidence-registry.ts
 *   packages/core/src/evidence-index.ts
 *   packages/core/src/coverage-evidence.ts
 *   packages/core/src/run-local-evidence.ts
 *   packages/core/src/run-evidence.ts
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
     * ------------------------------------------------------------- THE INDEX IS IN THE RECORD
     *
     * `abloh-evidence-manifest.json` STOOD HERE and is now `evidence.index` inside `abloh-run.json`
     * (the captain's ruling of 2026-09-14). Nothing about whose statement it is moved: it is still a
     * fact about the RUN and never about the build reading it, which is the whole reason the index
     * exists - a customer's workflow pins the Action by SHA and the CLI it installs is resolved at run
     * time, so a reader consulting its own table is asking its own build what a stranger's run wrote.
     * What moved is the file it is read out of, and there are two of those now instead of ten.
     */
    /* ---------------------------------------------------------------- the three artifacts */
    {
        id: "artifact-json",
        basename: "abloh-run.json",
        kind: "file",
        role: "artifact",
        publishable: false,
        label: "Run summary",
    },
    /**
     * THE RUN'S REPORT, WRITTEN ON EVERY RUN, AND IT IS HTML (the captain's ruling of 2026-09-15, 17:05).
     *
     * ONE FILE A BROWSER OPENS. The record beside it is a machine's document; this is the person's,
     * and a person reads a page rather than a marked-up source file. Twenty comparable tools were
     * surveyed for that ruling and the convention is unanimous - Stryker, Playwright, Vitest, Jest,
     * Lighthouse, pytest-html, cargo-llvm-cov and tarpaulin all write a rich page for the reader and
     * a machine file beside it, and not one of them makes Markdown its primary local artifact.
     *
     * SELF-CONTAINED, so it needs nothing but a browser: its styles are inside it, it loads nothing
     * over a network, and it reads with styles off. Markdown is the SECOND rendering of the same
     * summary and is written where `--md <path>` asks for it, which is the door an agent reading the
     * file rather than a person opening it goes through.
     *
     * WHY IT IS WRITTEN AT ALL WITHOUT BEING ASKED (the captain's addition of the same day). It
     * stopped being written by default on the argument that it is a rendering, and that argument
     * stopped holding the day the report became the only surface a local run has for what it FOUND.
     * The record beside it carries digests, closed codes and a roster; this is where a finding has a
     * title, an account, what it costs and the test that catches it, and a maintainer had to know to
     * pass a flag to get any of it.
     *
     * BESIDE THE RECORD, WHICH ON A DEFAULT RUN IS THE RUN'S OWN FOLDER. `runOutputPath`'s rule is
     * unmoved: a default run keeps its evidence under `~/.abloh/runs/<repository>/<run>`, so nothing
     * lands in the measured checkout - and a caller who pointed `--json` somewhere gets the report in
     * the same place, which is where every collector already looks. `--html <path>` overrides it.
     */
    {
        id: "artifact-html",
        basename: "abloh-run.html",
        kind: "file",
        role: "artifact",
        publishable: false,
        label: "Run report",
    },
    /**
     * THE SECOND RENDERING, WRITTEN WHERE A CALLER ASKS FOR ONE.
     *
     * It was the default from 2026-09-15 until the same day's later ruling replaced it with the page
     * above; what it lost is the default DESTINATION, and it is the same report from the same summary
     * wherever `--md` puts it. A run nobody asked writes none, so this row is in an index only when
     * the caller pointed it at the run's own directory.
     */
    {
        id: "artifact-markdown",
        basename: "abloh-run.md",
        kind: "file",
        role: "artifact",
        publishable: false,
        label: "Run report (Markdown)",
    },
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
    /*
     * ----------------------------------------- SEVEN ROWS STOOD HERE AND ARE NOW MEMBERS, NOT FILES
     *
     * THE CAPTAIN'S RULING OF 2026-09-14: a run folder is two JSON documents and a report. A complete
     * local run used to leave TEN files, and seven of them were here - the evidence index, the
     * coverage document, the redacted mutation report, the two proposal sidecars, their two
     * `.local.json` ledgers and the composed run's per-package tree. Each existed because a file is
     * how one process hands bytes to another, and a maintainer opening the folder had to know which
     * of ten names to read and which of them were about the same measurement.
     *
     * WHERE EACH WENT, and the split is what the two files MEAN rather than a tidy-up. The four that
     * the Action uploads are members of `evidence` inside `abloh-run.json` - so that record is exactly
     * what the envelope carries, nothing more - and `packages/core/src/run-evidence.ts` is the block.
     * The coverage document's CHILDREN and the two rejected-candidate ledgers never left a runner, so
     * they are members of `abloh-run.local.json`, and the ledgers only where `--debug` asked for them.
     *
     * THE DIGESTS ARE UNMOVED, which is what makes it a relocation rather than a rewrite. Every member
     * is a verbatim STRING and the artifact's `rawCoverageDigest`, `redactedReportDigest`,
     * `proposals.proofsDigest` and `disclosure.agentBugs.evidenceDigest` still bind exactly the bytes
     * their producers wrote. So does the wire: the envelope's keys did not change, only where the
     * runner reads their bytes from.
     *
     * THEIR NAMES ARE IN {@link RETIRED_EVIDENCE_OUTPUTS}, which is what removes a previous release's
     * files from a directory a customer reuses and what still labels a run stored before the fold.
     */
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
export const PROPOSALS_PACKAGE_SIDECAR_INDEX = "manifest.json";
const BY_ID = new Map(EVIDENCE_OUTPUTS.map((entry) => [entry.id, entry]));
const BY_BASENAME = new Map(EVIDENCE_OUTPUTS.map((entry) => [entry.basename, entry]));
/** The row for an id. Throws on an unknown id, which can only be a typo the union already refuses. */
export function evidenceOutput(id) {
    const found = BY_ID.get(id);
    if (found === undefined)
        throw new InvariantError(`unknown evidence output: ${id}`);
    return found;
}
/** The basename for an id - the one call site every consumer that needs the string should use. */
/**
 * THE INVARIANT CLASS, DECLARED HERE RATHER THAN IMPORTED.
 *
 * This module is a `pnpm gen:action` source, so `assertImportFree` refuses any import in it - the
 * bytes are rendered into a process that has no `@abloh/core` to reach. The class is six lines and
 * carries no sentence, and `scripts/message-scan.mts` reads it by NAME, exactly as it reads the two
 * copies the generator already renders into `apps/web` and `@abloh/github-app`. Its one authority is
 * `packages/core/src/invariant.ts`, which states what it means and what may not be done with it.
 */
class InvariantError extends Error {
    constructor(message) {
        super(message);
        this.name = "InvariantError";
    }
}
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
/**
 * Every DIRECTORY publication owns beside the artifact, promoted or removed whole.
 *
 * EMPTY SINCE THE 2026-09-14 FOLD, which is a fact about today's table and not about the rule. A
 * composed run's per-package evidence was the one such row and is `evidence.packages` in the record
 * now; the machinery stays because it is what promotes or sweeps a directory the day one is owned
 * again, and because publication still REMOVES the retired directory from a reused folder.
 */
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
        fate: "renamed to `abloh-run.md` beside the artifact it reports on, and written again on every " +
            "run (the captain, 2026-09-15). It spent a release with no default name at all, on the " +
            "argument that a rendering stored beside the thing it renders can only go stale - which " +
            "stopped holding when the report became the one local surface a finding has a title on. " +
            "The id never retired; what retired is the `attest-` name a run used to default to",
        label: "Run report",
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
    /*
     * ------------------------------------------------------------------- the engine's old name
     *
     * FIVE NAMES THAT DESCRIBED AN ENGINE RELEASE RATHER THAN A DOCUMENT (captain's naming ruling of
     * 2026-08-31). The engine that writes these is MARIGOLD now, and that name is INTERNAL - a
     * document a maintainer downloads from their own job artifact is a customer surface - so all five
     * took the plain word `proposals` instead of either name.
     *
     * THE ROWS ARE KEYED BY THE ID THIS BUILD USES, like every row above: a caller asks
     * `storedEvidenceBasename(index, "proposals-proofs")` and gets `abloh-engine-v2-proofs.json` back
     * for a run that wrote one. The ID moved too, which is the one thing that had not happened before
     * - so each row also carries the id it WAS, and {@link manifestBasename} reads it when today's id
     * finds nothing in the index a stored run really uploaded.
     */
    {
        id: "proposals-proofs",
        was: "engine-v2-proofs",
        basename: "abloh-engine-v2-proofs.json",
        kind: "file",
        fate: "renamed with the engine's four siblings. `engine-v2` named a release of ours, and the " +
            "document is the proofs the run's test proposals earned",
        label: "Proven tests",
    },
    {
        id: "proposals-pool2",
        was: "engine-v2-pool2",
        basename: "abloh-engine-v2-pool2.json",
        kind: "file",
        fate: "renamed with the four above it, for the reason stated there",
        label: null,
    },
    {
        id: "proposals-proofs-local",
        was: "engine-v2-proofs-local",
        basename: "abloh-engine-v2-proofs.local.json",
        kind: "file",
        fate: "renamed with the four above it, for the reason stated there",
        label: null,
    },
    {
        id: "proposals-pool2-local",
        was: "engine-v2-pool2-local",
        basename: "abloh-engine-v2-pool2.local.json",
        kind: "file",
        fate: "renamed with the four above it, for the reason stated there",
        label: null,
    },
    {
        id: "proposals-packages",
        was: "engine-v2-packages",
        basename: "abloh-engine-v2-packages",
        kind: "directory",
        fate: "renamed with the four above it, for the reason stated there",
        label: null,
    },
    /*
     * ------------------------------------- folded into the two documents a run folder now holds
     *
     * THE CAPTAIN'S RULING OF 2026-09-14 (`run-evidence.ts` carries the whole of it). These seven are
     * members rather than files now, and they are here for the two jobs this table does: publication
     * REMOVES them from a directory a customer reuses, so a rerun cannot leave a previous release's
     * sidecars beside a record that disclaims them; and a run STORED before the fold is still named
     * and labelled from its own index.
     *
     * THE LABELS COME WITH THEM, because the live rows that carried them are gone and the v2 run page
     * still prints a word for a stored record's documents. The concept did not move - a coverage
     * document is still changed-line coverage - only the file it is in.
     */
    {
        id: "evidence-manifest",
        basename: "abloh-evidence-manifest.json",
        kind: "file",
        fate: "folded into the record as `evidence.index`. It is the same statement by the same author - " +
            "the RUN, about the directory it wrote - read out of the record a consumer has already " +
            "parsed instead of out of a file beside it",
        label: null,
        foldedIntoTheRecord: true,
        member: "evidence.index",
    },
    {
        id: "redacted-report",
        basename: "abloh-mutation.json",
        kind: "file",
        fate: "folded into the record as `evidence.mutationRedacted`, verbatim, still bound by " +
            "`redactedReportDigest`. It is one of the four documents the envelope has always carried, so " +
            "the record it is in is now exactly what an upload sends",
        label: null,
        foldedIntoTheRecord: true,
        member: "evidence.mutationRedacted",
    },
    {
        id: "raw-coverage",
        basename: "abloh-coverage.json",
        kind: "file",
        fate: "split where the two halves always belonged: the merged report the artifact committed to is " +
            "`evidence.coverage` in the record, and the per-suite documents it was derived from - local " +
            "evidence the Action unwrapped away before every upload - are in `abloh-run.local.json`",
        label: "Changed-line coverage",
        foldedIntoTheRecord: true,
        member: "evidence.coverage",
    },
    {
        id: "proposals-proofs",
        basename: "abloh-proposals-proofs.json",
        kind: "file",
        fate: "folded into the record as `evidence.proposalsProofs`, verbatim, still bound by `proofsDigest`",
        label: "Proven tests",
        foldedIntoTheRecord: true,
        member: "evidence.proposalsProofs",
    },
    {
        id: "proposals-pool2",
        basename: "abloh-proposals-pool2.json",
        kind: "file",
        fate: "folded into the record as `evidence.proposalsPool2`, verbatim, still bound by " +
            "`disclosure.agentBugs.evidenceDigest`",
        label: null,
        foldedIntoTheRecord: true,
        member: "evidence.proposalsPool2",
    },
    {
        id: "proposals-proofs-local",
        basename: "abloh-proposals-proofs.local.json",
        kind: "file",
        fate: "folded into `abloh-run.local.json` under `rejectedProposals`, and written only where " +
            "`--debug` asked. Nothing here has ever left a runner, so what a run omits costs the upload " +
            "nothing - which is why it is the one member of these two files that is asked for",
        label: null,
        foldedIntoTheRecord: true,
        member: "abloh-run.local.json#rejectedProposals",
    },
    {
        id: "proposals-pool2-local",
        basename: "abloh-proposals-pool2.local.json",
        kind: "file",
        fate: "folded into the same member, under the same flag, for the reason stated above it",
        label: null,
        foldedIntoTheRecord: true,
        member: "abloh-run.local.json#rejectedProposals",
    },
    {
        id: "proposals-packages",
        basename: "abloh-proposals-packages",
        kind: "directory",
        fate: "folded into the record as `evidence.packages`, one entry per measured package naming its " +
            "own directory - so a composed run's structure is kept rather than flattened, and the Action " +
            "no longer re-derives a slug rule to find it",
        label: null,
        foldedIntoTheRecord: true,
        member: "evidence.packages",
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
/**
 * FIRST WINS, WHICH IS THE OLDEST RETIREMENT OF THAT ID.
 *
 * An id can be retired more than once now - `raw-coverage` was `attest-raw-coverage.json`, then
 * `abloh-coverage.json`, and is a member of the record - and the one caller that reads this map for
 * a NAME is {@link storedEvidenceBasename}'s compatibility path, which is answering for a record so
 * old it uploaded no index at all. That record wrote the oldest of the names, so the oldest row is
 * the right answer and a plain `new Map(entries)` would have handed it the newest.
 */
const RETIRED_BY_ID = (() => {
    const map = new Map();
    for (const entry of RETIRED_EVIDENCE_OUTPUTS)
        if (!map.has(entry.id))
            map.set(entry.id, entry);
    return map;
})();
/** Keyed by NAME, for dating a stored run's producer off the index it uploaded. */
/**
 * THE PRE-REGROUPING NAMES ALONE, which is what dates a stored run's producer.
 *
 * A row this build retired in the 2026-09-14 FOLD is excluded: a run that wrote
 * `abloh-coverage.json` is from after the regrouping, so reading its index as evidence of an older
 * era would answer every un-indexed id with an `attest-` name that run never used.
 */
const RETIRED_BY_NAME = new Set(RETIRED_EVIDENCE_OUTPUTS.filter((entry) => entry.foldedIntoTheRecord !== true).map((entry) => entry.basename));
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
    if (rows.some((entry) => RETIRED_BY_NAME.has(entry.basename)))
        return retired;
    /*
     * A RUN FROM AFTER THE MOVE, AND THERE MAY BE NO FILE TO NAME.
     *
     * The 2026-09-14 fold made seven of these documents MEMBERS rather than files, so a run that
     * wrote no file for this id is not a run that produced nothing - it is a run that put the document
     * inside the record. A surface has to name something a reader can find, and for that record the
     * answer is the member path rather than a filename no directory holds.
     */
    const folded = RETIRED_EVIDENCE_OUTPUTS.find((entry) => entry.id === id && entry.foldedIntoTheRecord === true);
    return live ?? folded?.member ?? retired;
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
    const live = BY_ID.get(id)?.label;
    if (live != null)
        return live;
    /* EVERY RETIRED ROW FOR THE ID, not the oldest one. An id retired twice carries its word on
       whichever row was written with it: `raw-coverage`'s label is on the row the fold added, because
       the live row that used to hold it is gone and the page still prints a word for a stored run. */
    for (const entry of RETIRED_EVIDENCE_OUTPUTS)
        if (entry.id === id && entry.label !== null)
            return entry.label;
    return null;
}
/**
 * Every pre-regrouping name, for a caller that only needs the strings.
 *
 * NO READER ASKS IT IN THIS BUILD, and that is stated rather than left to be discovered. It served
 * one question - whether an untracked file in a checkout was written by an older abloh rather than
 * by the maintainer - and that question is answered by the run's own record of what it wrote
 * (`apps/cli/src/artifact-output.ts`, `noteFilesAblohWrote`), because a set of names cannot cover a
 * path the maintainer chose with `--json` or `--md`. Its sibling {@link registeredBasenames} is
 * still read, by the build check that refuses a name spelled by hand outside this module.
 * Publication reads the rows themselves through {@link retiredEvidenceOutputs}, which is what
 * removes a previous release's file from a directory a customer reuses.
 */
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
    /*
     * THE BENCHMARK ARM'S TWO DOCUMENTS, which used to be a customer's two files.
     *
     * Since the 2026-09-14 fold a run puts its survivor projection in the record and its full ledger
     * in the one file nothing sends, so nothing in the product writes these names. A benchmark arm is
     * a directory of arms on abloh's own box, read by a harness that wants each arm's two documents
     * side by side and has no record to put them in - so it keeps the names production used to write,
     * which is what stops every harness reading them having to move.
     */
    {
        id: "bench-proposals-proofs",
        basename: "abloh-proposals-proofs.json",
        kind: "local",
        producer: "cli",
        note: "one proposal benchmark arm's survivor projection, in the benchmark's own output directory " +
            "on abloh's own box. Never beside a customer's artifact: a run's own projection is a member " +
            "of the record.",
    },
    {
        id: "bench-proposals-proofs-local",
        basename: "abloh-proposals-proofs.local.json",
        kind: "local",
        producer: "cli",
        note: "the same arm's full ledger, beside it and read by the same harness. Rejected candidates and " +
            "their holds are most of what a bench arm is read for.",
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
        id: "playground-engine-job",
        basename: "abloh-playground-job.json",
        kind: "handoff",
        producer: "cli",
        note: "what the public playground's HOST tells its engine harness to measure - the tree, a scratch " +
            "directory, and the submitted bytes. It never sits beside an artifact and never leaves the " +
            "run's own workspace: it is how the visitor's files reach the harness without going through " +
            "an argv the worker's binding check re-derives argument for argument " +
            "(`packages/playground-runtime/src/engine-cli.ts`).",
    },
    {
        id: "playground-engine-report",
        basename: "abloh-playground-engine-report.json",
        kind: "handoff",
        producer: "cli",
        note: "the public playground's engine report, written by the harness inside the run's container and " +
            "read back by the host (`packages/playground-runtime/src/engine-report.ts`). It is not a run " +
            "record: it carries only what the playground renders, which is the whole reason the adapter " +
            "that reads it no longer holds a copy of the product's fifty-field artifact. Publication does " +
            "not own it because a playground run publishes nothing - its result reaches one browser.",
    },
    {
        id: "files-abloh-wrote",
        basename: "abloh-wrote.json",
        kind: "local",
        producer: "cli",
        note: "the one account of which files a run of abloh's put into the maintainer's checkout, written " +
            "by the run that wrote them into its own stored directory under the runs home. Every check " +
            "that looks at the tree asks it - whose file this is, whether the caller's tree and the " +
            "scratch copy hold the same change, and what the copy carries - because a list of filenames " +
            "cannot know a path the maintainer chose with `--json` or `--md` (the local-lane review of " +
            "2026-09-12, class 7). It is never beside an artifact and never inside the measured " +
            "repository: a file of abloh's left there is the very thing it exists to explain.",
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
    const named = manifest.outputs.find((entry) => entry.id === id)?.basename;
    if (named !== undefined)
        return named;
    /* AND THE ID THIS ONE USED TO BE, for the five documents whose id moved with their name on
       2026-08-31. An index is written by the CLI a run resolved and read by whichever Action is
       pinned, so those are different builds - and an id lookup that missed would report "this run
       wrote no proofs" about a run that wrote them, which is silence rather than an error. Retires
       with the rest of {@link RETIRED_EVIDENCE_OUTPUTS} on {@link EVIDENCE_REGROUPING_EXPIRY}. */
    const was = RETIRED_BY_ID.get(id)?.was;
    if (was === undefined)
        return null;
    return manifest.outputs.find((entry) => entry.id === was)?.basename ?? null;
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
 * (`proposals-packages`) is a single `sidecar` covering a directory. So a composed run's
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
 * PROPOSALS_PACKAGE_SIDECAR_INDEX} - so withholding the unknown would stage an empty tree on every
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
/**
 * THE LARGEST ONE SIDECAR MAY BE, and it is here because BOTH roads read it.
 *
 * It stood in `apps/action/action-boundary.mjs` - the runner's entry point, and a file the CLI must
 * not import - so when a signed-in local run grew a reader of its own it carried a number of its
 * own: 4 MiB against this 16, which made a document between the two travel from a job and not from
 * a laptop. That is the divergence the one composer exists to end, in miniature.
 *
 * It sits beside {@link evidenceWithheldLine} because they are one decision: this is the limit, that
 * is the sentence a reader gets when a file passes it, and a road that took one without the other
 * would drop a document in silence.
 */
export const SIDECAR_MAX_BYTES = 16 * 1024 * 1024;
/**
 * WHAT A LOCAL RUN SAYS ABOUT A DOCUMENT IT LEFT BEHIND.
 *
 * A SECOND SENTENCE ON PURPOSE, and the road is the whole reason. The hosted one closes on "the
 * evidence this file carried is not on the pull request", which is true of a job and false of
 * somebody's own machine - the same split `SETUP_TRIAL_RERUN` and the Files card's own location word
 * already make. What the two share is the LIMIT above and the decision that a discarded input is
 * never silent; what they cannot share is a clause about a pull request nobody opened.
 *
 * THE FIGURE IS DERIVED. The Action's copy types "16 MiB" beside the constant, under a comment
 * saying it is stated once; this one reads it, so a change to the limit cannot leave a sentence
 * claiming the old one.
 */
export function withheldSidecarLine(withheld) {
    const mib = (withheld.bytes / (1024 * 1024)).toFixed(1);
    const limit = `${Math.round(SIDECAR_MAX_BYTES / (1024 * 1024))} MiB`;
    const why = {
        oversize: `a document may not pass ${limit}, and this one does`,
        empty: "the file is empty, which a finished run does not write",
        unreadable: "the file could not be read from the output directory",
    };
    return (`${withheld.basename} (${mib} MiB) was not filed - ${why[withheld.cause]}. ` +
        "The run's score is unaffected, and the file is still beside the artifact on this machine.");
}
export function evidenceWithheldLine(withheld) {
    const cause = withheld.reason === "local-only"
        ? "it holds your own source and stays on the runner"
        : withheld.reason === "unknown-output"
            ? "this Action is older than the abloh that wrote it and cannot say what is in it"
            : "the run listed it and this step could not read it from the output directory";
    return `abloh: ${withheld.basename} is kept out of the run artifact: ${cause}.`;
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
            ? `abloh: This is a failure in abloh, not something in your repository. Quote report id ` +
                `${EVIDENCE_INDEX_UNREADABLE_REPORT_ID} if you contact support@abloh.dev.`
            : `Abloh: next: ${EVIDENCE_INDEX_MISSING_REMEDY}`,
    ];
}

/**
 * WHAT A MERGING RUN'S COVERAGE DOCUMENT WAS DERIVED FROM, and where that fact lives.
 *
 * THE MERGED REPORT IS A RE-SERIALIZATION on any run that merged: each child's key order, its
 * whitespace and any metadata the merge does not understand are gone, while the document is still
 * the thing `rawCoverageDigest` commits to. So the children are kept beside it - one per suite
 * command on a multi-command run, one per package on a monorepo - and a reader can check the merged
 * report against its sources rather than believe it.
 *
 * THEY ARE LOCAL EVIDENCE AND ALWAYS WERE. Two reasons, and either alone is enough: a monorepo's
 * children are N times the merged document, which would push a real repository through the
 * acceptor's own bound and lose the coverage view entirely; and nothing on the far side has ever
 * been able to check them, because the artifact commits to the merged report and not to them.
 *
 * SO THEY ARE IN `abloh-run.local.json` SINCE THE 2026-09-14 FOLD (`run-evidence.ts` carries the
 * ruling), which is the file whose whole name says nothing in it is sent. The ENVELOPE that used to
 * hold them beside the merged report in `abloh-coverage.json` is gone with that file: the merged
 * report is a member of the record, the children are a member of the ledger, and there is no
 * document left that is both. `renderCoverageEvidence` and `coverageReportBytes` went with it -
 * every reader of either was unwrapping an envelope nothing writes any more.
 *
 * WHAT SURVIVES IS THE SHAPE, because the children still have one and it is still typed once. This
 * module is import-free so `pnpm gen:action` can render it, and `run-local-evidence.ts` carries them
 * as opaque JSON pointing here - a rendered copy can carry no import, so restating these fields
 * there would be the second copy that generator exists to refuse.
 */
export {};

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
 * AND IT COVERS THE ENGINE'S LEDGERS TOO SINCE 2026-09-14, which it deliberately did not before.
 * The argument against folding them was that a per-package structure would be flattened and that
 * nothing about what leaves the runner would change. The captain's ruling made the first half a
 * requirement - the run folder is two files - and the structure is kept rather than flattened: each
 * package's ledger is an entry naming its own directory. The second half still holds, which is why
 * they are behind `--debug`: nothing here has ever been sent, so what this file omits costs the
 * upload nothing.
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
        /* ABSENT RATHER THAN EMPTY, on the executions' own rule one member down: a run that merged
           nothing and a run whose build wrote no children are different facts. */
        ...(input.coverageChildren === undefined || input.coverageChildren.length === 0
            ? {}
            : { coverageChildren: input.coverageChildren }),
        /* AND ABSENT UNLESS THE RUN WAS ASKED, which is what `--debug` decides. */
        ...(input.rejectedProposals === undefined || input.rejectedProposals.length === 0
            ? {}
            : { rejectedProposals: input.rejectedProposals }),
        /* OMITTED WHEN THERE ARE NONE rather than written as an empty list: a run this build measured
           nothing on and a run written by a build that had no records are different facts. */
        ...(input.executions === undefined || input.executions.length === 0
            ? {}
            : { executions: input.executions, executionsDropped: input.executionsDropped ?? 0 }),
        ...(input.schedule === undefined ? {} : { schedule: input.schedule }),
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
    /* THE RECORDS ARE READ BACK AS THEY WERE WRITTEN, unvalidated field by field: this file never
       crosses a door, so a shape check here would be a check of this build against itself. An absent
       member reads as absent, which is the state a file written before it existed is really in. */
    const executions = Array.isArray(record.executions)
        ? record.executions
        : undefined;
    const opaqueList = (value) => Array.isArray(value) ? value : undefined;
    const coverageChildren = opaqueList(record.coverageChildren);
    const rejectedProposals = opaqueList(record.rejectedProposals);
    const schedule = typeof record.schedule === "object" && record.schedule !== null && !Array.isArray(record.schedule)
        ? record.schedule
        : undefined;
    return {
        schema: record.schema,
        mutationReport,
        rationales,
        ...(executions === undefined
            ? {}
            : { executions, executionsDropped: typeof record.executionsDropped === "number" ? record.executionsDropped : 0 }),
        ...(coverageChildren === undefined ? {} : { coverageChildren }),
        ...(rejectedProposals === undefined ? {} : { rejectedProposals }),
        ...(schedule === undefined ? {} : { schedule }),
    };
}

/**
 * THE RUN'S EVIDENCE, INSIDE THE RECORD RATHER THAN BESIDE IT.
 *
 * WHAT A LOCAL RUN USED TO LEAVE BEHIND (the captain's ruling of 2026-09-14). Ten files in
 * `~/.abloh/runs/<repository>/<run>/`: the record, the report, the run's own never-sent ledger, and
 * SEVEN more - an evidence index, the coverage document, the redacted mutation report, two proposal
 * sidecars and their two `.local.json` ledgers - each of which existed because a file is how one
 * process hands bytes to another. A maintainer opening that folder had to know which of ten names
 * was the one to read, and which of them were about the same measurement.
 *
 * THE RULING IS THAT THE RECORD IS TWO FILES. `abloh-run.json` is the machine's document and carries
 * EXACTLY what the upload carries - the measurement, and the evidence documents that ride beside it
 * in the envelope, in this block. `abloh-run.local.json` is everything kept here and sent nowhere.
 * `abloh-run.html` is the person's document. Nothing else.
 *
 * NOTHING ABOUT THE WIRE MOVED, WHICH IS THE PROPERTY THAT MAKES THIS SAFE. The envelope the Action
 * posts has the same keys it always had: this block is where the runner READS those bytes from, not
 * a new shape for the control plane to learn. `apps/action/action-boundary.mjs` used to open four
 * files beside the artifact and now reads four members of the artifact it has already parsed, and
 * `apps/cli/src/local-run-evidence.ts` does the same on the local road.
 *
 * EVERY MEMBER IS A VERBATIM STRING, for the reason `coverage-evidence.ts` and
 * `run-local-evidence.ts` both give: the artifact's own `rawCoverageDigest`,
 * `redactedReportDigest`, `proposals.proofsDigest` and `disclosure.agentBugs.evidenceDigest` are
 * taken over the producers' own bytes BEFORE anything is written, so a member re-serialized as an
 * object would hash to something else and a commitment nothing can be checked against is not one.
 * That is why a reader opening this file finds JSON inside JSON.
 *
 * WHAT IS NOT HERE IS WHAT DOES NOT TRAVEL. The coverage document's CHILDREN - the per-suite reports
 * a merging run derived it from - are local evidence and are in `abloh-run.local.json`; so are the
 * proposal ledgers' rejected candidates, and those only when the run was asked for them. A member of
 * this block is a member of the upload, and the two lists are the same list on purpose: it is what
 * makes "this file is what is sent" a fact a reader can check rather than a sentence.
 *
 * IT IS IMPORT-FREE, so `pnpm gen:action` can render it into the Action beside the registry.
 */
/** The block's own name for itself, versioned because it crosses a build boundary. */
export const RUN_EVIDENCE_SCHEMA = "abloh-run-evidence/v1";
/**
 * WHERE EACH DOCUMENT IS, FOR A SURFACE THAT USED TO NAME A FILE.
 *
 * The artifact's own `rawCoveragePath` and `redactedReportPath` said which file beside it carried
 * the bytes their digests bind. There is no file any more, so they say which MEMBER does - a
 * pointer into the record the reader is already holding, which is a stronger answer than a basename
 * they had to go and find. Both fields are local-only by the run-record contract, so this reaches no
 * hosted surface.
 */
export const RECORD_EVIDENCE_PATH = {
    coverage: "evidence.coverage",
    mutationRedacted: "evidence.mutationRedacted",
    proposalsProofs: "evidence.proposalsProofs",
    proposalsPool2: "evidence.proposalsPool2",
};
/** The block a measurement hands the record, before publication knows what the directory holds. */
export function buildRunEvidence(input) {
    return {
        schema: RUN_EVIDENCE_SCHEMA,
        index: null,
        coverage: input.coverage,
        mutationRedacted: input.mutationRedacted,
        proposalsProofs: input.proposalsProofs,
        proposalsPool2: input.proposalsPool2,
        packages: input.packages,
    };
}
/**
 * A record's evidence block read back, or null when this value is not one.
 *
 * NULL IS "I CANNOT READ THIS", never "the run produced none" - the posture every reader in this
 * family takes - so a caller has to answer for both states itself. A record written before this
 * block existed reads null, which is the same answer a run that wrote no sidecar always gave.
 *
 * EVERY MEMBER IS CHECKED, because this value arrives from a DIFFERENT BUILD of this product: the
 * Action is pinned by SHA and the CLI is resolved at run time. A member of the wrong type is
 * dropped to null rather than taking the whole block with it, so one malformed document costs its
 * own evidence and never the three beside it.
 */
export function parseRunEvidence(value) {
    if (typeof value !== "object" || value === null || Array.isArray(value))
        return null;
    const record = value;
    if (record.schema !== RUN_EVIDENCE_SCHEMA)
        return null;
    return {
        schema: RUN_EVIDENCE_SCHEMA,
        index: readIndex(record.index),
        coverage: readString(record.coverage),
        mutationRedacted: readString(record.mutationRedacted),
        proposalsProofs: readString(record.proposalsProofs),
        proposalsPool2: readString(record.proposalsPool2),
        packages: readPackages(record.packages),
    };
}
/**
 * THE FOUR DOCUMENTS A RECORD CARRIES, BOUNDED, WITH EVERY ONE IT HELD BACK NAMED.
 *
 * THE BOUND DID NOT GO WITH THE FILES. The control plane refuses a sidecar over
 * `SIDECAR_MAX_BYTES`, so a member over it would take the WHOLE envelope with it - and the size
 * question is now asked of a string in an object rather than of a file on disk, which is the only
 * thing that changed. Both roads ask this one function for the same reason they shared the limit
 * before: a document between the two would travel from a job and not from a laptop.
 *
 * AND WHAT IS HELD BACK IS NAMED, never dropped in silence
 * (`docs/lessons/a-discarded-input-is-never-silent.md`). A maintainer looking for a document needs
 * the name they were looking for; a count tells them only that something is absent.
 *
 * THE LIMIT IS PASSED IN RATHER THAN IMPORTED, because this module has to stay import-free for
 * `pnpm gen:action` and `SIDECAR_MAX_BYTES` is the evidence registry's. Both callers hold it.
 */
export function boundRunEvidence(evidence, maxBytes) {
    const sidecars = {};
    const withheld = [];
    if (evidence === null)
        return { sidecars, withheld };
    const members = [
        ["coverage", evidence.coverage],
        ["mutationRedacted", evidence.mutationRedacted],
        ["proposalsProofs", evidence.proposalsProofs],
        ["proposalsPool2", evidence.proposalsPool2],
    ];
    for (const [key, value] of members) {
        if (value === null)
            continue;
        /* BYTES AND NOT CHARACTERS, because the bound is the one the far side applies to the body it
           receives, and a document carrying anything above ASCII is longer on the wire than in memory. */
        const bytes = utf8Length(value);
        /* AN EMPTY MEMBER IS ABSENT rather than withheld: a run that produced nothing has nothing to
           report, and the writers omit a member rather than writing an empty string for it. */
        if (bytes === 0)
            continue;
        if (bytes > maxBytes) {
            withheld.push({ name: `${RECORD_EVIDENCE_PATH_BY_KEY[key] ?? key}`, bytes });
            continue;
        }
        sidecars[key] = value;
    }
    return { sidecars, withheld };
}
/** The member path each key is named by, so a withheld line names what a reader can look for. */
const RECORD_EVIDENCE_PATH_BY_KEY = {
    coverage: RECORD_EVIDENCE_PATH.coverage,
    mutationRedacted: RECORD_EVIDENCE_PATH.mutationRedacted,
    proposalsProofs: RECORD_EVIDENCE_PATH.proposalsProofs,
    proposalsPool2: RECORD_EVIDENCE_PATH.proposalsPool2,
};
/** How many bytes this string is on the wire. No import, so it is counted rather than measured. */
function utf8Length(value) {
    let bytes = 0;
    for (const character of value) {
        const code = character.codePointAt(0) ?? 0;
        bytes += code < 0x80 ? 1 : code < 0x800 ? 2 : code < 0x10000 ? 3 : 4;
    }
    return bytes;
}
function readString(value) {
    return typeof value === "string" ? value : null;
}
function readIndex(value) {
    if (!Array.isArray(value))
        return null;
    const entries = [];
    for (const entry of value) {
        if (typeof entry !== "object" || entry === null)
            continue;
        const row = entry;
        if (typeof row.id !== "string" || typeof row.basename !== "string")
            continue;
        entries.push({ id: row.id, basename: row.basename });
    }
    return entries;
}
function readPackages(value) {
    if (!Array.isArray(value))
        return null;
    const entries = [];
    for (const entry of value) {
        if (typeof entry !== "object" || entry === null)
            continue;
        const row = entry;
        if (typeof row.directory !== "string" || typeof row.proposalsProofs !== "string")
            continue;
        entries.push({
            directory: row.directory,
            proposalsProofs: row.proposalsProofs,
            proposalsPool2: readString(row.proposalsPool2),
        });
    }
    return entries;
}
