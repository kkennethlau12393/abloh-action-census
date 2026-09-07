/**
 * GENERATED FILE - DO NOT EDIT.
 *
 * How far a shallow checkout may be deepened, and what to say when that is not enough.
 *
 * Written by `scripts/generate-decision-copies.mts` from:
 *   packages/core/src/base-reachability-plan.ts
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
 * THE BOUND ON DEEPENING A SHALLOW CHECKOUT, AND THE SENTENCE FOR EVERY WAY IT CAN END BADLY.
 *
 * WHY IT IS SEPARATE FROM `base-reachability.ts` (divergence audit, F14, 2026-08-31). Two processes
 * run this ladder. The CLI runs it asynchronously through `execFile`, in `base-reachability.ts`. The
 * Action's boundary runs it synchronously through `spawnSync`, on a runner, before the CLI it
 * installs exists - so it cannot import that file, and it had a second implementation of the whole
 * thing: its own rungs, its own ceiling, its own timeout, its own causes and its own sentences.
 *
 * THE I/O BEING DIFFERENT IS NOT A DUPLICATION AND STAYS. Synchronous and asynchronous git are two
 * ways of asking, and each process asks the way it can. What must not be decided twice is the
 * BOUND and the SENTENCE, and this file is where both live. It is import-free so
 * `scripts/generate-decision-copies.mts` can render it onto the runner.
 *
 * WHAT THE TWO COPIES HAD ALREADY DRIFTED INTO, which is the argument for doing this rather than
 * pinning the numbers to each other. `apps/action/base-reachability-parity.test.mjs` compared the
 * three constants and nothing else, so the SENTENCES drifted underneath it: told that a repository
 * has no remote, the CLI said "run Abloh against a checkout that has the base branch's history" and
 * the runner said "Abloh cannot diff the pull request against a base it cannot reach". One of those
 * is a remedy and the other is a restatement of the refusal, and the customer who got the restating
 * one had nothing to do next. Same for two histories that share no ancestor. Both are now the CLI's,
 * because the CLI's told the reader what to do.
 *
 * A SITUATION IS NOT A CAUSE, and this file carries both. Nine distinct situations end a reachability
 * attempt; they collapse into five causes, because a cause is what a CALLER branches on and a
 * situation is what a READER is told. Keeping them apart is what stopped the runner from having to
 * re-word a sentence from a cause code, which is where its two divergent tails came from.
 */
/**
 * How deep a shallow checkout may be taken, one rung at a time, on each side of the range.
 *
 * `--depth` is ABSOLUTE, not additive, so the last rung is the whole bound: at most 5000 commits
 * of history per side. The rungs exist so the ordinary pull request - whose merge base is a few
 * commits back - pays for 50, not for 5000; each rung re-asks the two questions before the next
 * one is spent.
 */
export const DEEPEN_LADDER = [50, 500, 5000];
/** The hard ceiling the ladder ends at. Stated once so the bound and the refusal cannot drift. */
export const MAX_DEEPEN_DEPTH = 5000;
/** No single fetch may hang the run. A deepen is one round trip, not a clone of the world. */
export const DEEPEN_FETCH_TIMEOUT_MS = 120_000;
/** What a caller branches on, for each thing a reader is told. */
export const BASE_UNREACHABLE_CAUSE = {
    "head-unknown": "unknown-ref",
    "base-name-unknown": "unknown-ref",
    "no-remote": "no-remote",
    "full-base-unresolvable": "commit-gone",
    "full-unrelated-histories": "unrelated-histories",
    "full-commit-gone": "commit-gone",
    "deepened-unrelated-histories": "unrelated-histories",
    "deepened-commit-gone": "commit-gone",
    "deepen-exhausted": "deepen-exhausted",
};
function quoted(value) {
    return JSON.stringify(value ?? "");
}
/**
 * THE SENTENCE, WHOLE, INCLUDING THE REMEDY CLAUSE.
 *
 * WHOLE AND NOT IN TWO HALVES, deliberately. The runner used to receive a fact and append its own
 * remedy clause per cause, which is how it ended up telling two of these readers nothing they could
 * act on. A caller that is handed the finished sentence cannot word the ending differently from the
 * caller next to it.
 *
 * NO EM DASHES AND NO URLS, under the copy rules of 2026-08-26. Each one names what is true, then
 * what to do, or says plainly that there is nothing mechanical left.
 */
export function baseUnreachableSentence(situation, facts = {}) {
    const head = facts.head ?? "HEAD";
    switch (situation) {
        case "head-unknown":
            return `${quoted(head)} does not name a commit in this checkout`;
        case "base-name-unknown":
            return (`the base ${quoted(facts.base)} does not name a commit in this checkout` +
                " - name a ref or SHA this checkout contains");
        case "no-remote":
            return (`the base commit ${facts.base} is not in this checkout, and there is no remote to fetch it` +
                " from - run Abloh against a checkout that has the base branch's history");
        case "full-base-unresolvable":
            return (`the base ${quoted(facts.base)} does not resolve to a commit in this checkout, and the` +
                " checkout is not shallow - name a ref or SHA this checkout contains");
        case "full-unrelated-histories":
            return (`the base commit ${facts.baseSha} and ${head} share no common ancestor in this checkout, and` +
                " the checkout is not shallow, so no fetch can create one - check that the base names a" +
                " commit from this repository's own history");
        case "full-commit-gone":
            return (`the base commit ${facts.baseSha} is in neither this checkout nor ${facts.remote} - the base` +
                " branch was most likely force-pushed or rewritten after this run started; re-run the job so" +
                " it checks out against the base the pull request has now");
        case "deepened-unrelated-histories":
            return (`the base commit ${facts.baseSha} and ${head} share no common ancestor, and this checkout now` +
                " holds the remote's whole history, so no further fetch can create one - check that the" +
                " base names a commit from this repository's own history");
        case "deepened-commit-gone":
            return (`the base commit ${facts.baseSha} is in neither this SHALLOW checkout nor ${facts.remote}, so` +
                " deepening cannot reach it - the base branch was most likely force-pushed or rewritten" +
                " after this run started; re-run the job so it checks out against the base the pull" +
                " request has now");
        case "deepen-exhausted":
            return (`the base ${facts.base} is still out of reach after deepening this SHALLOW checkout to` +
                ` ${facts.depth ?? MAX_DEEPEN_DEPTH} commits per side, which is as far as Abloh will fetch` +
                " on its own; set `fetch-depth: 0` on actions/checkout so the full history is present");
    }
}
/** The refusal a caller returns, cause and sentence together, so the two cannot be paired wrongly. */
export function baseUnreachable(situation, facts = {}) {
    return {
        state: "unreachable",
        cause: BASE_UNREACHABLE_CAUSE[situation],
        remedy: baseUnreachableSentence(situation, facts),
    };
}
