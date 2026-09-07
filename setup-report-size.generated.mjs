/**
 * GENERATED FILE - DO NOT EDIT.
 *
 * The setup report that is too large to file, refused in the product's own vocabulary.
 *
 * Written by `scripts/generate-decision-copies.mts` from:
 *   packages/core/src/setup-report-size.ts
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
 * THE SETUP REPORT THAT IS TOO LARGE TO FILE, SAID IN THE PRODUCT'S OWN VOCABULARY.
 *
 * WHAT THIS FIXES (tail probe, first full pass, 2026-08-30, finding 2). Scenario `ceiling-over`
 * handed the attestation job a trial report 4 KiB over the 256 KiB ceiling. The producer refused it
 * before the wire, which is correct and is the load-bearing half. What a maintainer read was the
 * whole of it:
 *
 *     Abloh: the setup report is too large to file, and stays in this run
 *
 * No registry code, so there was no entry to search for. No bound, so "too large" named no number.
 * No measured size, so the reader could not tell whether they were 4 KiB over or 40. No owner and
 * no next action. The same sentence was printed from two places - `stageForAttestation` in the
 * measuring job and `reportSetupTrial` in the attestation job - so it was also two sentences that
 * could drift.
 *
 * THE COMPARISON THE PROBE MADE IS THE STANDARD THIS MEETS. `WITHHELD_SIDECAR_CAUSES.oversize`, in
 * the same file three hundred lines away, names the bound in its own units, names the cause, names
 * the remedy and states what the run's score does. A second size ceiling in the same product
 * answering to a lower standard is the drift a registry exists to stop.
 *
 * WHOSE FAILURE IT IS, AND WHY IT IS NOT THE MAINTAINER'S. Abloh writes this report, abloh sets the
 * ceiling its own door accepts, and the field that can grow without limit is abloh's own target
 * inventory over the repository. There is no edit in the maintainer's repository that is known to
 * bring the document under the bound, and `docs/lessons/a-remedy-is-a-promise.md` is about exactly
 * the remedy that sounds actionable and is not. So the owner is `abloh`, the sentence says so in
 * those words, and the next action is to report it rather than to go looking for a cause in a
 * repository that does not have one.
 *
 * WHAT THE SENTENCE STILL OWES THE READER, and each of these is a thing the old line withheld: the
 * measured size, the bound, where the report actually is, and what the run's own conclusion now
 * means. A maintainer waiting on a setup check needs the last one most.
 *
 * THE ACTION CANNOT IMPORT THIS FILE, AND NO LONGER RETYPES IT. It ships standalone onto a runner,
 * so `scripts/generate-decision-copies.mts` renders this module into
 * `apps/action/setup-report-size.generated.mjs`. There was a hand-typed `apps/action/
 * setup-report-size.mjs` here until 2026-08-31, held to this file by
 * `scripts/setup-report-size-parity.test.ts`; both are deleted, for the reason written on
 * `identity-condition.ts`. Change a word here and run `pnpm gen:action`.
 */
/** The registry code this refusal is raised under, so no caller invents a second spelling. */
export const SETUP_REPORT_OVERSIZE_CODE = "setup-report-oversize";
/**
 * A BYTE COUNT IN THE UNITS THE BOUND IS WRITTEN IN.
 *
 * KiB rather than bytes, because 262144 and 266240 are two numbers a reader has to subtract before
 * they mean anything, and "256 KiB" is the unit the ceiling is declared in on both sides of the
 * wire. Whole where it divides and one decimal where it does not: a bound that reads as `256.0` is
 * a bound somebody will wonder about the tenths of.
 */
export function kibibytes(bytes) {
    const value = bytes / 1024;
    return `${Number.isInteger(value) ? value : value.toFixed(1)} KiB`;
}
/**
 * THE SENTENCE.
 *
 * IT OPENS WITH WHOSE FAILURE IT IS, on the rule every `abloh`-owned code in the registry follows:
 * everything around a refusal on a setup pull request is about the maintainer's repository, so a
 * reader who has to infer the owner infers the wrong one.
 *
 * NO SEMICOLONS, NO EM DASHES, NO URLS, under the copy rules of 2026-08-26.
 */
export function setupReportOversizeSentence(facts) {
    return (`this is a failure in abloh: the setup report abloh wrote is ${kibibytes(facts.bytes)} and the ` +
        `trial door accepts ${kibibytes(facts.maxBytes)}, so abloh refused it here rather than sending ` +
        "a body that door would drop for the same reason. Nothing about your repository or your tests " +
        "is wrong. The report is still on this run in the abloh-setup-trial artifact, and the setup " +
        "check will not answer for this run");
}
/**
 * THE NEXT ACTION, SPELLED HERE SO THE ACTION'S OWN RECORD CAN CARRY IT.
 *
 * It is `nextActionSentence` of this code's remedy. The Action writes a machine-readable record on
 * a runner and the reader of that record is a job log, so the sentence has to reach that side too -
 * which it does by being rendered, not by being retyped there.
 *
 * IT IS THE COMPOSED CLOSING LINE AND IT IS A LITERAL HERE, which is the one place those two facts
 * meet. `pnpm gen:action` refuses a source module that imports, so this file cannot read
 * `ablohFailureClosingLine` from `nothing-waiting.ts`; the agreement is pinned instead, by
 * `refusal.test.ts`, on `two-sites-must-agree-so-pin-them.md`'s own terms. This code carries no
 * report id - there is one failure under it and nothing about a run distinguishes two of them - so
 * the line is the ownership sentence with no clause after it.
 */
export const SETUP_REPORT_OVERSIZE_NEXT_ACTION = "This is a failure in abloh, not something in your repository.";
/**
 * ONE LINE FOR A JOB LOG: the code, then the sentence.
 *
 * THE CODE IS IN IT because a job log is where somebody pastes a line into a search, and the code
 * is the one token that finds the right registry entry rather than the right-looking one. That is
 * the property the tail probe measured absent.
 */
export function setupReportOversizeLine(facts) {
    return `Abloh [${SETUP_REPORT_OVERSIZE_CODE}]: ${setupReportOversizeSentence(facts)}\n`;
}
