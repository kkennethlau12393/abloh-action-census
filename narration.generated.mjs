/**
 * GENERATED FILE - DO NOT EDIT.
 *
 * The channel a run's account of what it did goes out on.
 *
 * Written by `scripts/generate-decision-copies.mts` from:
 *   packages/core/src/narration.ts
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
 * WHAT A RUN DID, AS IT DOES IT - the channel that is not a message about a failure.
 *
 * WHY IT IS A CHANNEL AND NOT A REGISTRY CODE (messages plan S3, 2026-09-07). A stage's log carries
 * two different kinds of sentence. One says a run stopped and why: it names an owner, offers a next
 * action, and belongs in `refusal.ts`. The other is the running account of what was measured - how
 * many changed lines are comments, which chained stage the reporter flags attached to, how many
 * verdicts were carried. Those name no owner and ask for nothing, so `registryEntryProblems` would
 * refuse every one of them as a registry code; and while both went out through one `log`, neither
 * population could be answered, because nothing could tell them apart. That is the same split
 * `InvariantError` makes on the throw side.
 *
 * THE ONE RULE, checked by `scripts/failure-contract.test.ts`: A NARRATION LINE NEVER TELLS THE
 * READER WHAT TO DO. It is read with the `IMPERATIVE` rule the message inventory reads a remedy out
 * of a sentence with, so an instruction here fails the build. A line that RENDERS a registry
 * sentence is not narration either: that has an author already, and rendering it is what
 * `renderRefusal` is for.
 *
 * WHAT THIS DOES NOT CATCH, stated rather than left to be discovered. A sentence that diagnoses a
 * failure and asks for nothing can still be written on this channel, and only reading it says so.
 * That is the hole `log` already had; what changes is that the population it can hide in is now the
 * small one, and that every line in it is one somebody chose to put there.
 *
 * THE SINK IS THE CALLER'S, because a stage prints through whatever it was handed - the CLI's
 * timestamped stderr line, a test's collector, nothing at all. What this function owns is the name.
 */
/**
 * The narration channel over one sink.
 *
 * Bound rather than passed per call so the MESSAGE is the first argument at every site, which is
 * what lets `scripts/message-scan.mts` read the line and hold it to the rule above.
 */
export function narrationTo(sink) {
    return (line) => {
        sink(line);
    };
}
