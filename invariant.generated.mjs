/**
 * GENERATED FILE - DO NOT EDIT.
 *
 * The class a throw about abloh's own code carries.
 *
 * Written by `scripts/generate-decision-copies.mts` from:
 *   packages/core/src/invariant.ts
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
 * A STATEMENT ABOUT ABLOH'S OWN CODE, THROWN WHERE IT STOPS BEING TRUE.
 *
 * WHAT THIS IS FOR (messages plan S3, 2026-09-07). Roughly half of the frozen message ledger was one
 * kind of sentence wearing a `throw new Error(...)`: a knob handed a value its own header says has
 * no default, a switch reaching a variant the union does not have, a document abloh wrote failing
 * abloh's own reader. None of them is a fact about the customer's repository and none of them has a
 * remedy anybody outside this codebase can act on, so none of them belongs in the refusal registry -
 * `refusal.ts` says so at `artifact-output-path-unusable`: "the rest stay under `abloh-failed` with
 * a report id, which is what they are."
 *
 * SO THE OWNER IS ALREADY DECLARED AND THIS CLASS IS HOW A SITE SAYS SO. `apps/cli/src/cli-failure.ts`
 * routes every uncaught throw through the registry's `abloh-failed`, which declares `owner: "abloh"`,
 * `ablohKind: "defect"`, no next action and a derived report id. That is the right entry for an
 * invariant abloh broke, and AGENTS.md records why moving one into a `DeclaredRefusalError` is wrong:
 * `isCliRefusal` would then print it alone as a fact about the customer's repository and drop the id.
 *
 * WHAT CHANGES BY NAMING IT. Nothing at run time - the class extends `Error` and adds no field, so
 * the same bytes reach the same door. What changes is that `scripts/message-scan.mts` can tell the
 * two populations apart: an invariant is contracted (its owner and remedy are `abloh-failed`'s), and
 * a bare `throw new Error(...)` on a customer-facing path is still refused by the contract. Before
 * this the two were indistinguishable, so the ledger held them together and neither could be
 * answered.
 *
 * THE PROPERTY THAT KEEPS IT HONEST, checked by `scripts/failure-contract.test.ts`: NOTHING CATCHES
 * IT. No `instanceof` check on this class anywhere, and no renderer, so its text cannot become a
 * sentence anybody reads except through `abloh-failed`, which owns it. A statement a customer is
 * meant to act on is not an invariant, and the moment somebody wants to catch one, the message it
 * carries is a refusal code with an owner and a remedy instead.
 *
 * IMPORT-FREE, so the two dependency-free apps can declare the same class locally - `apps/web`
 * declares no dependency on `@abloh/core` and `@abloh/github-app` declares none at all. The scanner
 * reads the class by NAME, exactly as it reads `cli-failure.ts`'s refusal classes.
 */
/**
 * An invariant of abloh's own code that stopped being true.
 *
 * The message states what was expected, in whatever words the site already used: it is read by
 * whoever is holding the report id, never by a customer deciding what to do.
 */
export class InvariantError extends Error {
    constructor(message) {
        super(message);
        this.name = "InvariantError";
    }
}
