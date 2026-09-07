/**
 * GENERATED FILE - DO NOT EDIT.
 *
 * What this Action could not carry, and where the fix is.
 *
 * Written by `scripts/generate-decision-copies.mts` from:
 *   packages/core/src/action-notices.ts
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
 * THE SENTENCES THE COMPOSITE ACTION PRINTS THAT ARE NOT ITS OWN.
 *
 * WHY THEY ARE HERE (messages plan S3, 2026-09-07). `apps/action` ships as dependency-free `.mjs`
 * onto a customer's runner, so it cannot call `refuse()` - and three of the sentences it printed
 * offered the reader something to DO, which is exactly what a registry code is for and exactly what
 * a sentence written at a `console.log` cannot have. The route is the one AGENTS.md already names:
 * an import-free core module, generated in by `pnpm gen:action`, with the code declared out of it.
 * The Action prints these bytes; `refusal.ts` composes the same bytes for every other surface.
 *
 * TWO OF THEM ARE VERSION DRIFT, and it is worth saying what that is because the fix is not obvious
 * from the sentence alone: a customer's workflow pins the Action by SHA while the CLI it installs is
 * resolved at run time, so the Action can be older than the run it is carrying. When it is, it
 * cannot recognise a newer closed reason and cannot carry a list that grew - and in both cases the
 * measurement is complete and it is the ENVELOPE that says less. What to do about it lives in the
 * pin, which is in the customer's own workflow.
 *
 * IMPORT-FREE, like every other module `pnpm gen:action` renders.
 */
/** The reason abloh recorded instead, when the Action cannot recognise the one the run reported. */
export const COVERAGE_REASON_SUBSTITUTE = "coverage-acquisition-failed";
/**
 * A diff-coverage refusal reason this build of the Action has never heard of.
 *
 * THE UNKNOWN VALUE IS NOT QUOTED, and that is not squeamishness: a producer that broke the closed
 * vocabulary is exactly this branch's case, and echoing whatever arrived would print a checkout path
 * or a command tail into the job log. It is in the run's own local JSON for anyone diagnosing it.
 */
export function unrecognisedCoverageReasonNotice() {
    return ("this run reported a diff-coverage refusal this Action does not recognise. It is recorded as " +
        `${COVERAGE_REASON_SUBSTITUTE} and the rest of the measurement is unaffected. The exact reason ` +
        "is in this run's local JSON artifact");
}
/** How many of a list the Action carried, when the run reported more than this build can hold. */
export function uploadTruncatedNotice(facts) {
    const dropped = Math.max(0, facts.reported - facts.limit);
    return (`this run reported ${facts.reported} ${facts.what}, and this Action uploads at most ` +
        `${facts.limit}. The remaining ${dropped} are not in the upload, so what the control plane ` +
        "shows covers less than this run measured. The whole measurement is in this run's local JSON artifact");
}
/** What to do about either of the two above: the pin is in the customer's own workflow. */
export const ACTION_PIN_REMEDY = "Update the abloh Action pin in your workflow to the version matching your CLI.";
/**
 * The composite Action cannot post a pull-request comment, and says where that is done instead.
 *
 * It is a fact about the shape of a composite action rather than about anything the customer got
 * wrong, and the two places that DO post are what the reader needs.
 */
export function prCommentUnavailableNotice() {
    return "pull-request comments are not posted by the composite Action";
}
/**
 * A run whose finding list is larger than ONE UPLOAD CAN CARRY, and why nothing was sent.
 *
 * NOT A TRUNCATION, and the difference is the whole sentence: sending the first N beside a count of
 * M is what the control plane refuses, and sending a shorter count would describe a run that did not
 * happen. So the envelope goes without them and the measurement stays in the job's own artifact.
 */
export function findingsOverUploadCapNotice(facts) {
    return (`this run reported ${facts.reported} findings and one upload carries at most ${facts.limit}. ` +
        "Nothing was uploaded, because sending the first " +
        `${facts.limit} beside a count of ${facts.reported} is what the control plane refuses, and ` +
        "sending a shorter count would describe a run that did not happen. The whole measurement is in " +
        "this job's own artifact");
}
/** What narrows a check enough for its findings to fit. */
export const NARROW_THE_CHECK_REMEDY = "Narrow what this check measures - a smaller pull request, or a tighter mutation scope in abloh.yml.";
/** Where a pull-request comment does come from. */
export const PR_COMMENT_REMEDY = "Use a separate no-checkout privileged job, or the abloh GitHub App.";
