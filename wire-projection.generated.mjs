/**
 * GENERATED FILE - DO NOT EDIT.
 *
 * Keep the declared keys, and spell each absence the way the contract's table says.
 *
 * Written by `scripts/generate-decision-copies.mts` from:
 *   packages/core/src/wire/run-finding-projection.ts
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
 * HOW A PROJECTION SPELLS "NOTHING TO SAY" - the rule, in the one form three processes can run.
 *
 * WHY THIS IS ITS OWN MODULE. The composite Action ships as dependency-free `.mjs` onto a customer's
 * runner and can import no `@abloh` package, so the projection it runs is RENDERED into it by
 * `pnpm gen:wire`. A rendered module has to be import-free, and the finding contract beside this one
 * is not - it reaches for core's closed vocabularies and its prose guards to judge VALUES. So the
 * rule that decides SHAPE lives here, takes its tables as arguments, and is the same function on the
 * runner and in the process that declares those tables.
 *
 * WHAT IT REPLACED (boundary contract divergence audit, D01 / F1). The Action projected every
 * fixed-shape object with one rule over every key: a missing value became `null`, on the reasoning
 * that a dropped key would fail an exact-key check downstream. That is right for `triage`, which a
 * hosted projection has always nulled and the door was taught to read as absent. It is wrong for
 * `coveredBy`, where absence means the run measured no covering population and the door refuses a
 * null - so a complete measurement was refused after the fact, twice, on `expressjs/express`.
 *
 * A PER-KEY ANSWER IS THE ONLY SHAPE THAT CAN BE RIGHT FOR BOTH, and it belongs beside the field
 * whose meaning decides it rather than in whichever process happens to serialize it.
 *
 * IT NEVER PARSES. A projection that refused would turn a producer's odd value into a lost
 * measurement on the runner, where the customer has no way to act on it. The door is where a value
 * is judged, and it judges with the contract this table was derived from.
 */
/**
 * Keep the declared keys, drop the rest, and spell each absence the way the table says.
 *
 * Dropping the undeclared keys is the same rule the ingest door's egress sanitizer applies from the
 * other side: a producer's in-memory record is wider than what the boundary agreed to carry, and the
 * two halves of that agreement must not be written twice.
 */
export function projectByAbsence(source, fields, absence, nested = {}) {
    const from = source ?? {};
    const out = {};
    for (const key of fields) {
        const child = nested[key];
        if (child !== undefined) {
            const raw = from[key];
            if (raw === null || raw === undefined || typeof raw !== "object") {
                if (child.whenAbsent === "null")
                    out[key] = null;
                continue;
            }
            out[key] = projectByAbsence(raw, child.fields, child.absence);
            continue;
        }
        const raw = from[key];
        if (raw === undefined) {
            if (absence[key] === "null")
                out[key] = null;
            continue;
        }
        out[key] = raw;
    }
    return out;
}
