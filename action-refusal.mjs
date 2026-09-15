/**
 * A REFUSAL THE ACTION RAISES, AS THE CLASS IT IS.
 *
 * WHY IT EXISTS (messages plan S3, 2026-09-07). The composite Action refuses two kinds of thing: an
 * INPUT its own boundary will not accept, and a run whose envelope it cannot carry. Both used to be
 * a bare `throw new Error(...)`, which `scripts/message-scan.mts` reads - correctly - as a
 * user-facing sentence with no owner, because a bare throw here is indistinguishable from one.
 *
 * WHAT THE CLASS SAYS: the sentence this carries is a fact about the caller's repository - their
 * workflow's inputs, or a run of theirs larger than one upload holds - and the words come from the
 * registry wherever a reader is offered something to do. `apps/action/action-notices.generated.mjs`
 * is where those words are rendered in from, because this process cannot import `@abloh/core`.
 *
 * It is the Action's counterpart to `cli-failure.ts`'s refusal classes, and the scanner reads it the
 * same way: by name.
 */
export class ActionRefusalError extends Error {
  constructor(message) {
    super(message);
    /* Read off the class rather than typed: a literal here is a string on a scanned surface. */
    this.name = ActionRefusalError.name;
  }
}
