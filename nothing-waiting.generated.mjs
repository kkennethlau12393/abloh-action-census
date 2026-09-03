/**
 * GENERATED FILE - DO NOT EDIT.
 *
 * The line a run prints when there is nothing for the customer to do about it.
 *
 * Written by `scripts/generate-decision-copies.mts` from:
 *   packages/core/src/nothing-waiting.ts
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
 * THE ONE STATE THAT SAYS NOTHING IS WAITING ON THE CUSTOMER, AND THE ONE SENTENCE FOR IT.
 *
 * WHAT THIS FIXES (error-plane plan, step 21). A run whose refusal asks the customer for nothing is
 * a real state and a common one: a diff with no executable line, a change that only deletes code, a
 * package abloh was never admitted to measure. Every surface decided for itself what to say about
 * it, and two of them decided to say nothing. The v2 run page composed "there is nothing here for
 * you to do next" of its own, the target inventory put `null` in the row's action column, and the
 * Action's job log printed the summary and skipped the line underneath it. A reader shown nothing
 * concludes they missed something, and three readers shown three sentences conclude they are
 * looking at three products.
 *
 * SO THE STATE IS DECLARED AND THE SENTENCE IS DECLARED, once, here. A surface reads
 * {@link nextActionLine} and prints what it is handed. It does not test the remedy itself, it does
 * not compose an alternative for the empty case, and it has no empty case to compose for.
 *
 * WHY THE LABEL IS PART OF THE DECLARATION AND NOT THE SURFACE'S. Every surface has its own word for
 * the line that carries a next action - the terminal writes `next:`, the check run writes `Fix:`,
 * the local Markdown writes `_Fix: ..._`, the setup comment writes `What to do next:`. Those are
 * right for a remedy and wrong for this state: `Fix:` in front of "nothing is waiting on you" is a
 * contradiction on one line. So this state overrides the label as well as the sentence, which is
 * what makes "the same sentence on every surface" a property of one function rather than a rule
 * eight renderers have to remember.
 *
 * IMPORT-FREE ON PURPOSE. The composite Action, the GitHub App and the web app each print this line
 * and none of them can import `@abloh/core`, so `pnpm gen:action` renders this module into all
 * three. See `scripts/generate-decision-copies.mts`.
 */
/**
 * THE SENTENCE, WITHOUT ITS TERMINATOR.
 *
 * It sits where a remedy's own text sits, and remedy texts carry no trailing stop - several callers
 * append one themselves, and a sentence that brought its own would render `you..` there. The stop
 * belongs to the LINE, which is the thing a reader actually sees.
 */
export const NOTHING_IS_WAITING = "nothing is waiting on you";
/** The label this state overrides every surface's own with, so one line reads the same everywhere. */
export const NOTHING_IS_WAITING_LABEL = "Next:";
/** The whole line, exactly as every surface prints it. */
export const NOTHING_IS_WAITING_LINE = `${NOTHING_IS_WAITING_LABEL} ${NOTHING_IS_WAITING}.`;
/**
 * Is this next action the declared nothing-waiting state?
 *
 * ASKED ON THE SENTENCE RATHER THAN ON THE REMEDY, because most of the surfaces that print it are
 * downstream of the wire and hold a rendered string rather than a typed remedy. One predicate for
 * both halves is what keeps the near side and the far side saying the same thing.
 */
export function isNothingWaiting(nextAction) {
    return nextAction.trim() === NOTHING_IS_WAITING;
}
/**
 * THE TWO PIECES, and neither is ever blank in a way a reader could mistake for an omission.
 *
 * `label` is the surface's own word for this line, used for every ordinary remedy and OVERRIDDEN
 * for the declared state - see the header. An empty or absent next action is the declared state
 * too: that is the "never silence" half, and it is here rather than at each caller because a caller
 * that has to remember it is a caller that can forget.
 *
 * AN EMPTY LABEL IS A SURFACE THAT CARRIES ITS OWN PREFIX. The Action's job log writes `abloh: ` in
 * front of every line it emits, so a second word there would read as two labels. It still gets the
 * declared wording for the declared state, which is the whole point of routing it through here.
 */
export function nextActionParts(nextAction, label) {
    const text = (nextAction ?? "").trim();
    if (text === "" || isNothingWaiting(text)) {
        return { label: NOTHING_IS_WAITING_LABEL, text: `${NOTHING_IS_WAITING}.` };
    }
    /* THE ABLOH-OWNED CLOSING LINE OVERRIDES THE LABEL TOO, and for the same reason the state above
       it does: `next:` in front of "this is a failure in abloh" labels as an action a line that is
       the statement that there is none. Kenneth's ruling 1 drops the label; this is where it drops,
       so no surface has to remember to. See {@link ablohFailureClosingLine}. */
    if (isAblohFailureClosing(text))
        return { label: "", text };
    return { label, text };
}
/** The whole line for a surface that prints one string. */
export function nextActionLine(nextAction, label) {
    const parts = nextActionParts(nextAction, label);
    return parts.label === "" ? parts.text : `${parts.label} ${parts.text}`;
}
/* ------------------------------------------------------------- the abloh-owned closing line */
/**
 * THE ONE LINE AN ABLOH-OWNED DEFECT ENDS ON, COMPOSED ONCE (Kenneth, wave 4, 2026-09-03).
 *
 * WHAT THIS REPLACES. Every abloh-owned code used to end on a `next:` line whose sentence was
 * "there is nothing for you to fix: this is a failure in abloh", followed on 30 renderings by
 * ` - this identifier is derived from the failure itself, so quoting it identifies exactly this
 * one`. Kenneth's first instruction of the wave-4 review was that the clause goes - "It's too
 * clunky" - and his ruling 1 was that the `next:` label goes with it: a failure the customer cannot
 * act on has no next action, so labelling one is a contradiction on the line that carries it.
 *
 * IT IS COMPOSED FROM THE OWNER FIELD AND FROM NOTHING ELSE, which is what makes it identical on
 * all of them. A surface does not decide to print it, does not have a variant of it, and cannot
 * reach the pieces: {@link ablohFailureClosingLine} is the whole sentence and
 * {@link isAblohFailureClosing} is how {@link nextActionParts} recognises it in order to drop the
 * label, exactly as it drops the label for {@link NOTHING_IS_WAITING}.
 *
 * A LIMITATION IS NOT A DEFECT AND DOES NOT GET THIS LINE (Kenneth, same session): "for the 2 of
 * these they are not product defects and they are honest limitations so no need to quote report cuz
 * there is no report". The class is declared per code in `refusal.ts` rather than decided here, so
 * no renderer ever answers it by reading a code name.
 *
 * IMPORT-FREE, in this module rather than in `refusal.ts`, for the same reason the sentence above
 * it is: the Action, the GitHub App and the web app all print this line and none of them can import
 * `@abloh/core`.
 */
export const ABLOH_FAILURE_OWNERSHIP = "This is a failure in abloh, not something in your repository.";
/** Where a reader takes a report id. Named once so no surface writes an address of its own. */
export const ABLOH_SUPPORT_ADDRESS = "support@abloh.dev";
/**
 * THE WHOLE CLOSING LINE, with the report id where the failure produced one.
 *
 * A defect with no report id keeps the ownership sentence and drops the clause that would have had
 * nothing in it: an id is what makes the defect reportable, and "Quote report id undefined" is
 * worse than a sentence that simply does not ask.
 */
export function ablohFailureClosingLine(reportId) {
    const id = (reportId ?? "").trim();
    if (id === "")
        return ABLOH_FAILURE_OWNERSHIP;
    return `${ABLOH_FAILURE_OWNERSHIP} Quote report id ${id} if you contact ${ABLOH_SUPPORT_ADDRESS}.`;
}
/**
 * Is this next-action sentence the composed closing line?
 *
 * ASKED ON THE SENTENCE, like {@link isNothingWaiting} and for the same reason: most surfaces that
 * print it are downstream of the wire and hold a rendered string rather than a typed remedy.
 */
export function isAblohFailureClosing(nextAction) {
    return nextAction.trim().startsWith(ABLOH_FAILURE_OWNERSHIP);
}
/* --------------------------------------------------------------- the withheld-evidence line */
/**
 * WHAT THIS SURFACE IS NOT SHOWING, AS ONE LINE, COMPOSED ONCE (Kenneth, wave 4, 2026-09-03).
 *
 * WHAT IT REPLACES. Four surfaces each wrote this sentence themselves and all four wrote it
 * differently - the terminal ended "and is not on this surface", the setup comment "and is not on
 * this pull request", the check run "and is in that run's own JSON", the run page nothing at all -
 * and the terminal and the setup comment printed one line PER withheld item while the two hosted
 * surfaces already folded theirs. Kenneth ruled the tail off ("the coverage run's last lines stayed
 * on the machine that ran it.") and the folding on, so both halves are settled here rather than in
 * four renderers that had already proved they drift.
 *
 * FOLDED, ALWAYS, AND THE LABELS ARE JOINED WITH "; ". Two withheld lines under one refusal read as
 * two separate events; one line naming both reads as what it is, which is the one thing this
 * destination could not carry. An empty list returns null, so a caller cannot print the sentence
 * about nothing - which is the state where the destination is showing everything.
 *
 * IT NAMES WHAT IS MISSING RATHER THAN DROPPING IT, which is
 * `docs/lessons/a-discarded-input-is-never-silent.md` at a rendering boundary: a reader on a pull
 * request who is shown less and told nothing does not know there is more.
 */
export function withheldEvidenceLine(labels) {
    const named = labels.map((label) => label.trim()).filter((label) => label !== "");
    if (named.length === 0)
        return null;
    return `${named.join("; ")} stayed on the machine that ran it.`;
}
