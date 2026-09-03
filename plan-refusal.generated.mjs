/**
 * GENERATED FILE - DO NOT EDIT.
 *
 * Why a plan refused this run's evidence, said in the words of the build that reads it.
 *
 * Written by `scripts/generate-decision-copies.mts` from:
 *   packages/core/src/plan-refusal.ts
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
 * WHY THE CONTROL PLANE WOULD NOT TAKE THIS RUN'S EVIDENCE, AS FACTS RATHER THAN AS A SENTENCE.
 *
 * WHAT THIS FIXES (Kenneth's ruling of 2026-09-02, the exemption list going to zero).
 * `upload-plan-limit` was the second of the two codes `message-contract.ts` exempted from the rule
 * that a customer-visible sentence is composed in the registry: its summary was
 * `(facts) => facts.reason`, and what it would have passed through was PROSE THE SERVICE COMPOSED.
 * The Action's HTTP 402 branch printed that prose directly and the code had no producer at all.
 *
 * WHY A SENTENCE FROM THE SERVICE IS THE WRONG SHAPE, and it is not a style point. A customer's
 * workflow pins the Action by SHA while `api.abloh.dev` is whatever shipped last, so the words a
 * maintainer read were written by a build that never saw their run and nothing reported the
 * mismatch. That is the same argument `wire/run-refusal.ts` makes for the other direction, and its
 * conclusion is the same: THE FACTS TRAVEL AND THE SENTENCE IS COMPOSED WHERE IT IS READ.
 *
 * WHAT KENNETH CORRECTED ON THE WAY. A plan's allowance is a MONTHLY DOLLAR AMOUNT and usage is a
 * PERCENTAGE OF IT, never a count of checks or pull requests. So `allowanceUsedPercent` is the
 * share of the period's ruled allowance this workspace has spent - derived server side through
 * `RULED_MONTHLY_ALLOWANCE_USD` and `MEASURED_DOLLARS_PER_CHECK_RUN`, which are the two constants
 * that decide it - and `nextPlanAllowanceMultiple` is the next plan's allowance against this one,
 * as a multiple.
 *
 * AND NO DOLLAR FIGURE CROSSES, which is Kenneth's standing ruling of 2026-08-25 and is not
 * loosened here: the internal allowances are internal, on every surface including a JSON field. A
 * percentage and a multiple are both derived FROM those dollars and are neither of them a dollar.
 *
 * BOTH SHAPES ACCEPTED, IN BOTH DIRECTIONS, because the two processes are released separately and
 * `product/RELEASE.md` states the order (the control plane learns a key first):
 *
 *   AN OLD ACTION MEETING A NEW SERVICE reads `error.message`, which the service still sends
 *   unchanged, and never looks at `error.facts`. It prints exactly what it printed before.
 *
 *   A NEW ACTION MEETING AN OLD SERVICE finds no `error.facts`, and falls back to `error.message`
 *   exactly as it does today. {@link planRefusalFactsOf} returning null IS that fallback.
 *
 * IMPORT-FREE, because `pnpm gen:action` renders this module into the Action, which ships as
 * dependency-free `.mjs` onto a customer's runner.
 */
/** The two refusals the evidence door answers HTTP 402 with. Named as the registry names them. */
export const PLAN_REFUSAL_CODES = ["upload-plan-limit", "upload-run-ceiling"];
/** The plans a workspace can be on, as the refusal names them. */
export const PLAN_NAMES = ["free", "pro", "team", "enterprise"];
/* ------------------------------------------------------------------ the sentences */
/** `1 repository` / `3 repositories`, so the sentence agrees with its own number. */
function repositories(count) {
    return `${count} ${count === 1 ? "repository" : "repositories"}`;
}
/**
 * WHAT HAPPENED, AND THE ONE THING A READER MUST NOT BE LEFT TO WONDER.
 *
 * The measurement RAN. Only the upload was declined, and a sentence that did not say so reads as a
 * failed check on a repository whose tests are fine - which is the reason this refusal renders the
 * check neutral rather than red in the first place.
 */
export function planLimitSentence(facts) {
    /* SAID AS WHAT HAPPENED TO THIS RUN (wave 4, ruled under Kenneth's delegation, 2026-09-03). "only
       the upload was declined" is a clause about what did NOT happen, and a maintainer reading it has
       to work out what did. The run was not filed, which is the fact. */
    return (`your ${facts.plan} plan covers ${repositories(facts.repositoriesCovered)} and ` +
        `${facts.repositoriesMeasured} ${facts.repositoriesMeasured === 1 ? "is" : "are"} already in ` +
        "use, so this run was not filed");
}
/**
 * THE WAY OUT, WITH COORDINATES (Kenneth's error-plane step 13, applied here).
 *
 * What this replaces is "Open billing settings for this workspace to see what the plan covers" - a
 * pointer at a page, which is the shape that step banned everywhere else: it tells a reader where
 * to go and looking is the whole of what it offers. This names the page, what the move buys in the
 * unit the allowance is counted in, and when the period turns over.
 *
 * NO URL, on the copy law (`docs/decisions/copy-directness-2026-08-26.md`): a link is a separate
 * element, and a bare address is furniture in a job log, a terminal and a check summary alike.
 *
 * NO DOLLARS, on Kenneth's ruling of 2026-08-25. The multiple is what the reader is told, because
 * the allowance is a monthly dollar amount they never see the inside of.
 *
 * IT DEGRADES RATHER THAN INVENTS. Every clause below is dropped when the fact behind it is absent,
 * so a workspace whose allowance could not be read is offered the move and told nothing about a
 * period nobody measured.
 */
export function planLimitRemedy(facts) {
    /*
     * THE MOVE, AND NOTHING ELSE (wave 4, ruled under Kenneth's delegation, 2026-09-03). Two clauses
     * went with that ruling and both were explaining rather than acting: the allowance MULTIPLE, which
     * is our own arithmetic about a monthly figure the customer never sees the inside of, and the
     * percent-spent-and-resets sentence, which is about a different limit from the one that refused
     * this run. What refused it is the repository count, and what clears it is the move.
     */
    if (facts.nextPlan === null)
        return "Keep using the repository you started with.";
    return (`Move this workspace to the ${facts.nextPlan} plan on the Billing tab, which covers every ` +
        "repository, or keep using the repository you started with.");
}
/**
 * THE LOOP GUARD, SAID AS WHAT IT IS.
 *
 * IT NAMES NO PLAN AND NO PRICE, because neither is what stopped this: the same sentence is read on
 * every plan, including the ones with nothing left to buy. That rule is `plan-limits.ts`'s and it
 * moved here with the sentence.
 */
export function runCeilingSentence(facts) {
    return (`this pull request has been checked ${facts.checksRun} times, the most abloh checks one pull ` +
        "request in a row, so this run was not filed");
}
export const RUN_CEILING_REMEDY = "Open a new pull request and it will be checked normally.";
/** The sentence for either, chosen by the fact bag's own discriminator. */
export function planRefusalSentence(facts) {
    return facts.refusal === "upload-plan-limit" ? planLimitSentence(facts) : runCeilingSentence(facts);
}
/** The next action for either. */
export function planRefusalRemedy(facts) {
    return facts.refusal === "upload-plan-limit" ? planLimitRemedy(facts) : RUN_CEILING_REMEDY;
}
/* ------------------------------------------------------------------ reading one off the wire */
/** A whole number in a sane range, or null. Anything else is a body this build cannot read. */
function counted(value, max) {
    return typeof value === "number" && Number.isInteger(value) && value >= 0 && value <= max
        ? value
        : null;
}
/** A short authored date phrase, or null. Bounded because it is remote and reaches a build log. */
function phrase(value) {
    if (typeof value !== "string")
        return null;
    const text = value.replace(/[^\x20-\x7e]/gu, " ").trim();
    return text === "" || text.length > 40 ? null : text;
}
/** One of the closed plan names, or null. */
function planName(value) {
    return typeof value === "string" && PLAN_NAMES.includes(value)
        ? value
        : null;
}
/**
 * THE FACTS IN A REFUSAL BODY, OR NULL WHEN THERE ARE NONE THIS BUILD CAN READ.
 *
 * NULL IS THE COMPATIBILITY PATH AND NOT AN ERROR. A service older than this key sends no `facts`
 * at all, and a caller that gets null falls back to the sentence in `error.message` exactly as it
 * did before this existed. So does a caller handed a `facts` object whose discriminator this build
 * has never heard of, which is what a NEWER service adding a third refusal looks like from here.
 *
 * EVERY FIELD IS CHECKED RATHER THAN CAST. The body is remote and the destination is a public build
 * log, so a number that is not a number or a plan name this build does not know makes the whole bag
 * unreadable rather than composing a sentence with a hole in it. That is the same posture
 * `refusalMessage` takes over the sentence one key away.
 */
export function planRefusalFactsOf(body) {
    if (body === null || typeof body !== "object")
        return null;
    const error = body.error;
    if (error === null || typeof error !== "object")
        return null;
    const raw = error.facts;
    if (raw === null || typeof raw !== "object")
        return null;
    const bag = raw;
    if (bag["refusal"] === "upload-run-ceiling") {
        const checksRun = counted(bag["checksRun"], 100_000);
        const checksCeiling = counted(bag["checksCeiling"], 100_000);
        if (checksRun === null || checksCeiling === null)
            return null;
        return { refusal: "upload-run-ceiling", checksRun, checksCeiling };
    }
    if (bag["refusal"] === "upload-plan-limit") {
        const plan = planName(bag["plan"]);
        const repositoriesCovered = counted(bag["repositoriesCovered"], 100_000);
        const repositoriesMeasured = counted(bag["repositoriesMeasured"], 100_000);
        if (plan === null || repositoriesCovered === null || repositoriesMeasured === null)
            return null;
        return {
            refusal: "upload-plan-limit",
            plan,
            repositoriesCovered,
            repositoriesMeasured,
            allowanceUsedPercent: counted(bag["allowanceUsedPercent"], 100),
            allowanceResetsOn: phrase(bag["allowanceResetsOn"]),
            nextPlan: planName(bag["nextPlan"]),
            nextPlanAllowanceMultiple: counted(bag["nextPlanAllowanceMultiple"], 1000),
        };
    }
    return null;
}
