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
 * SO THE STATE IS DECLARED, once, here. A surface reads {@link nextActionLine} and prints what it is
 * handed. It does not test the remedy itself, it does not compose an alternative, and it has no
 * empty case to compose for.
 *
 * AND WHAT IT IS HANDED FOR THIS STATE IS NOTHING (the captain's ruling of 2026-09-10: "DROP IT
 * EVERYWHERE"). The line was built to stop three surfaces disagreeing, and it did - at the cost of
 * printing a sentence on every one of them that tells a reader the thing they already concluded
 * from a passing run. He ruled it off the check run first and then off the rest in the same words:
 * CLI terminal, setup pull-request comment, Slack and the run page print no next-action line at all
 * when the refusal asks for nothing. The composer returns `null` and every surface drops the line,
 * so the state is still decided in ONE place and the surfaces still decide nothing.
 *
 * WHY `null` RATHER THAN AN EMPTY STRING. Half of these callers interpolate the result into a
 * bigger line - a Slack context element, a Markdown bullet, a ` - ` separator - so an empty string
 * leaves the punctuation that framed it and prints ` - _`. A null is a value a caller cannot print
 * by accident, and the compiler names every site that has to decide what to do without one.
 *
 * WHY THE LABEL IS PART OF THE DECLARATION AND NOT THE SURFACE'S. Every surface has its own word for
 * the line that carries a next action - the terminal writes `next:`, the check run writes `Fix:`,
 * the local Markdown writes `_Fix: ..._`, the setup comment writes `What to do next:`. Those are
 * right for a remedy and wrong for an abloh-owned closing line, which is the state that still
 * overrides the label, and that is what makes "the same sentence on every surface" a property of
 * one function rather than a rule eight renderers have to remember.
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
/**
 * The label this state used to override every surface's own with.
 *
 * NO SURFACE PRINTS IT SINCE 2026-09-10 - see the header - and it is kept declared because the
 * sentence it labels is still what the registry composes for a `no-action-exists` remedy, and
 * because `scripts/refusal-render-matrix.test.ts` holds every surface to NOT printing this exact
 * line. A constant nothing renders is how that absence is stated rather than remembered.
 */
export const NOTHING_IS_WAITING_LABEL = "Next:";
/** The whole line, as it was printed until the captain's ruling of 2026-09-10 dropped it. */
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
 * THE TWO PIECES, or NULL where the refusal asks the reader for nothing.
 *
 * `label` is the surface's own word for this line, used for every ordinary remedy and OVERRIDDEN
 * for the abloh-owned closing line - see the header. An empty or absent next action is the
 * nothing-waiting state too, and it returns null with it: that reading is here rather than at each
 * caller because a caller that has to remember it is a caller that can forget.
 *
 * AN EMPTY LABEL IS A SURFACE THAT CARRIES ITS OWN PREFIX. The Action's job log writes `abloh: ` in
 * front of every line it emits, so a second word there would read as two labels. It still gets the
 * declared wording for the declared state, which is the whole point of routing it through here.
 */
export function nextActionParts(nextAction, label) {
    const text = (nextAction ?? "").trim();
    /* NOTHING TO SAY IS SAID BY SAYING NOTHING (the captain, 2026-09-10). An absent next action and
       the declared nothing-waiting sentence are one state - a refusal that asks the reader for
       nothing - and both now yield no line on every surface. The predicate is asked HERE and nowhere
       else, which is the half of the old design that survives the ruling intact. */
    if (text === "" || isNothingWaiting(text))
        return null;
    /* THE ABLOH-OWNED CLOSING LINE OVERRIDES THE LABEL TOO, and for the same reason the state above
       it does: `next:` in front of "this is a failure in abloh" labels as an action a line that is
       the statement that there is none. Kenneth's ruling 1 drops the label; this is where it drops,
       so no surface has to remember to. See {@link ablohFailureClosingLine}. */
    if (isAblohFailureClosing(text))
        return { label: "", text };
    return { label, text };
}
/** The whole line for a surface that prints one string, or null where there is no line to print. */
export function nextActionLine(nextAction, label) {
    const parts = nextActionParts(nextAction, label);
    if (parts === null)
        return null;
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
/**
 * THE SAME SENTENCE FOR A READER WITH NO REPOSITORY (the captain's ruling, 2026-09-07, Q1).
 *
 * The playground shows a stranger the ending of a run over two files they pasted into a page. They
 * have no repository, no run record they could quote and no support relationship with us, so the
 * clause about their repository is false, the report id names nothing they can reach and the
 * address asks them to write to somebody they have never met. What survives is the ownership.
 *
 * IT IS A PREFIX OF THE FULL SENTENCE ON PURPOSE, so {@link isAblohFailureClosing} answers for both
 * with one reading and no surface has to learn a second shape.
 */
export const ABLOH_FAILURE_OWNERSHIP_ANONYMOUS = "This is a failure in abloh.";
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
    const text = nextAction.trim();
    return (text.startsWith(ABLOH_FAILURE_OWNERSHIP) || text.startsWith(ABLOH_FAILURE_OWNERSHIP_ANONYMOUS));
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
/* ------------------------------------------------------------------- one line of evidence */
/** What a value that was already cut to its own limit before it crossed says about itself. */
export const EVIDENCE_CUT_CLAUSE = "(cut to its limit)";
/**
 * ONE PIECE OF EVIDENCE AS ONE LINE, COMPOSED ONCE FOR EVERY SURFACE THAT PRINTS ONE.
 *
 * WHAT THIS FIXES (the displayer divergence audit of 2026-09-12, C5). The terminal and the setup
 * trial comment printed `<label>, from <where it came from> (cut to its limit): <value>` and every
 * hosted surface printed the VALUE alone - the check run as a code span, Slack as a field, the run
 * page as a bare string - so a reader comparing two of them could not tell which tool had said what,
 * where it had come from, or that they were looking at a quotation the producer had already cut.
 * The served projection dropped `truncated` outright, so the hosted surfaces could not have said it.
 *
 * IT LIVES HERE BECAUSE THREE OF THE READERS CANNOT IMPORT THE REGISTRY. `apps/web` owns no
 * dependency on core, `apps/github-app` declares none at all, and the Action ships as plain `.mjs`;
 * this module is already rendered into all three for the two sentences above it, and a fourth
 * hand-written copy of this line is the divergence that was just measured.
 *
 * THE VALUE GOES ON ITS OWN LINE WHEN IT HAS NEWLINES IN IT, so a multi-line tool capture reads as
 * a block under its own label rather than folding into the label's line.
 */
export function evidenceLine(item) {
    const body = item.value.includes("\n") ? `\n${item.value}` : ` ${item.value}`;
    return `${evidenceLabelLine(item)}${body}`;
}
/**
 * THE SAME LINE WITHOUT THE VALUE, for a surface that draws the value as a block of its own.
 *
 * TWO OF THEM DO - the setup trial comment and the setup pull request's body both put a tool's
 * output in a fenced block under its own label - and both used to ask {@link evidenceLine} with an
 * empty value and strip the trailing space back off with a regular expression. A caller
 * post-processing a composer's output is the composer having two authors again, one layer along, so
 * the label half is asked for rather than derived.
 */
export function evidenceLabelLine(item) {
    const cut = item.truncated === true ? ` ${EVIDENCE_CUT_CLAUSE}` : "";
    const where = item.at.trim() === "" ? "" : `, from ${item.at}`;
    return `${item.label}${where}${cut}:`;
}
