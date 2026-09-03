/**
 * GENERATED FILE - DO NOT EDIT.
 *
 * What a pull-request checkout is, decided on the runner by the rule the CLI also runs on.
 *
 * Written by `scripts/generate-decision-copies.mts` from:
 *   packages/core/src/merge-ref-checkout.ts
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
 * WHAT THE CHECKOUT IN FRONT OF US IS, when it is not the pull request's head commit.
 *
 * WHY THIS EXISTS (postflip census, 2026-08-29). Six of the fourteen borrow-road repositories died
 * on one sentence - `electron/asar`, `Fission-AI/OpenSpec`, `ngx-formly/ngx-formly`, `unjs/jiti`,
 * `react-native-community/cli` and `vitejs/vite`. From `OpenSpec`'s run 33226670400, verbatim:
 *
 *   Abloh Action boundary: exact pull-request head required;
 *   expected ccbc6ba2bb42ecff9f57e3a50c1f39abd6f9a64d, found 54e279c78f3a6176618e154b4c9b0f2a8c3bf6fa
 *
 * The expected sha is `github.event.pull_request.head.sha`. The found sha is `github.sha`, which on
 * a `pull_request` event is GitHub's own test-merge commit - and `actions/checkout` with no `ref:`
 * checks out `refs/pull/N/merge`, which is that commit. So this was not a broken repository or a
 * hostile workflow. It is what MOST pull-request CI on GitHub looks like, and the borrow road
 * inherits the maintainer's checkout rather than writing its own.
 *
 * WHY THE RULE WAS RIGHT AND THE REFUSAL WAS NOT. Two things must hold together or a measurement is
 * a lie: the DIFF has to describe the TREE the providers execute, and the evidence has to be
 * labelled with the commit it is about. `apps/cli/src/index.ts` says the same thing in its own
 * words - "if --head resolves to another commit, the diff describes one tree while the providers
 * measure another... A merge commit must never be recorded as PR-head evidence." Comparing two shas
 * for equality is one way to establish that, and on a merge-ref checkout it is the wrong one: it
 * refuses a checkout whose content can be IDENTICAL to the head's for everything being measured.
 *
 * WHAT THE BOUNDARY PROVES NOW, and this is the identity every caller of this module is relying on:
 *
 *   1. LINEAGE. The checked-out commit M is a two-parent merge whose first parent is exactly the
 *      base sha GitHub reported for this pull request and whose second parent is exactly the head
 *      sha it reported. Nothing else contributed a commit to what is on disk. The parents are read
 *      out of M's own commit object, so a workflow cannot assert this - it is git's record of what
 *      GitHub built.
 *   2. TRIGGER. M is the commit GitHub started this workflow run on (`github.sha`). This is what
 *      makes M *this* run's merge rather than some merge commit that happens to have those parents:
 *      the sha comes from the event, not from the checkout, and the same value is bound to the OIDC
 *      `sha` claim the control plane checks on the handoff.
 *   3. CONTENT. For every path the pull request changes - `git diff --name-only base...head` - M's
 *      blob is byte-identical to head's. So the changed lines the engine measures, mutates and
 *      reports are the head commit's own bytes, at the head commit's own line numbers.
 *
 * WHY THAT IS SOUND FOR A MERGE-REF CHECKOUT, stated plainly because it is the whole claim. Under
 * (3), the subject of the measurement - the pull request's changed lines - is head's content
 * exactly, so evidence labelled with the head sha is evidence about the head sha. Under (1) and (2),
 * the rest of the tree is the base branch as GitHub merged it, which is the code this pull request
 * will actually run beside once it lands. A head checkout measures the changed lines against a base
 * that may be weeks old; this measures them against the base they are merging into. Neither is
 * wrong, and the one the maintainer's own CI chose is the one their own suite just passed on.
 *
 * WHAT IT STILL REFUSES, and why each refusal is a real one:
 *
 *   A MERGE THAT REWROTE A CHANGED FILE. When the base branch has moved a file this pull request
 *   also touches, M's blob for that path is git's merge of the two and is neither side's bytes. The
 *   diff's line numbers then describe head while the providers read M, which is the exact failure
 *   the original equality check existed to prevent. It is named, with the paths, and the remedy is
 *   one line in the job's own checkout step.
 *
 *   A BASE-SIDE RENAME OF A CHANGED FILE, which is the same refusal reached by a name rather than
 *   by a blob (assumption audit, 2026-08-29, rank 25). Base renames `old.txt` to `new.txt` while
 *   the pull request edits `old.txt`; M carries the edit into `new.txt` and holds no `old.txt` at
 *   all. Under git's DEFAULT rename detection the two reads below name that one file differently -
 *   `base...head` says `old.txt`, `head..M` says `new.txt` - the intersection is empty, and the
 *   checkout is admitted while the tree lacks a path the evidence claims to cover. Both reads
 *   therefore pass `--no-renames`, so a rename appears as its old AND its new name on the diverged
 *   side and the intersection finds `old.txt`. Rename detection can only ever HIDE a path from this
 *   comparison, never add a false one, so disabling it is strictly the safe direction.
 *   A CHECKOUT THAT IS NEITHER. Not the head, not this run's merge commit, or a merge whose parents
 *   are not the two shas the event reported: something rewrote the checkout, and nothing here can
 *   say what it is.
 *
 * WHERE IT RUNS. In the Action's boundary, before anything is measured, and in the CLI, which
 * repeats the proof rather than trusting it: a signal passed from the workflow would be a claim the
 * customer's own file could make. The boundary cannot import this package - it is a standalone
 * script with no workspace resolution that runs before the CLI is installed - so
 * `scripts/generate-decision-copies.mts` RENDERS this file into
 * `apps/action/merge-ref-checkout.generated.mjs` and the boundary imports that.
 *
 * IT USED TO BE WRITTEN TWICE, with `apps/action/merge-ref-parity.test.mjs` comparing the two
 * spellings; both are deleted as of 2026-08-31. That test could only fail in a checkout holding both
 * copies, and the drift it was written about is a customer's Action pinned by SHA meeting a service
 * that shipped later. Generation does not make that pair agree either - nothing in one repository
 * can - but it removes the second author, so the released pair can differ by version and never by
 * transcription. Change the rule here and run `pnpm gen:action`.
 */
const SHA = /^[0-9a-f]{40}$/u;
/**
 * DECIDE, from facts alone.
 *
 * PURE, AND THAT IS WHAT LETS IT BE RENDERED. Each caller reads git its own way - the boundary with
 * `spawnSync`, the CLI with its own helpers - and only this decides, so what the runner carries is
 * one rule rather than a second implementation of a process.
 */
export function classifyPullRequestCheckout(input) {
    const { checkoutSha, headSha, baseSha } = input;
    for (const [value, what] of [[checkoutSha, "checkout"], [headSha, "head"], [baseSha, "base"]]) {
        if (!SHA.test(value)) {
            return { kind: "unproven", conflicts: [], reason: `the ${what} commit is not a full Git object id` };
        }
    }
    if (checkoutSha === headSha)
        return { kind: "exact" };
    /* (2) THIS RUN'S COMMIT. Checked first because it is the cheapest way to separate "GitHub's merge
       ref" from "somebody checked out something else", and the sentence for the second is different. */
    if (input.triggerSha === null || input.triggerSha !== checkoutSha) {
        return {
            kind: "unproven",
            conflicts: [],
            reason: `the checkout is ${short(checkoutSha)}, which is neither this pull request's head ` +
                `${short(headSha)} nor the commit GitHub started this run on`,
        };
    }
    /* (1) LINEAGE. Exactly two parents, in GitHub's order: base first, head second. */
    if (input.parents.length !== 2 || input.parents[0] !== baseSha || input.parents[1] !== headSha) {
        return {
            kind: "unproven",
            conflicts: [],
            reason: `the checkout ${short(checkoutSha)} is not a merge of this pull request's base ` +
                `${short(baseSha)} and head ${short(headSha)}`,
        };
    }
    /* (3) CONTENT. Only the changed files matter: the base branch moving other files is what a merge
       ref IS, and refusing that would refuse every pull request that is not perfectly up to date. */
    const changed = new Set(input.changedPaths);
    const conflicts = [...new Set(input.divergedPaths)].filter((path) => changed.has(path)).sort();
    if (conflicts.length > 0) {
        return {
            kind: "unproven",
            conflicts,
            reason: `this job checks out the merge of your pull request rather than its head commit, and the ` +
                `merge rewrote ${conflicts.length === 1 ? "a file" : "files"} the pull request also changes ` +
                `(${conflicts.slice(0, 5).join(", ")}${conflicts.length > 5 ? ", and more" : ""}), so the ` +
                "changed lines Abloh would measure are not the ones on disk",
        };
    }
    return { kind: "merge-ref" };
}
/**
 * THE ONE EDIT THAT RESOLVES AN UNPROVEN CHECKOUT, in the words both doors print.
 *
 * IT IS A REMEDY AND NOT AN EXPLANATION. Every customer-facing refusal on this road carries the
 * exact line to add and where to add it, and pinning `ref:` to the head sha is the whole of it:
 * `actions/checkout` then produces the shape this product was written for, which is also the shape
 * `workflow-template.yml` has always published.
 */
export const MERGE_REF_REMEDY = "Pin the checkout in this job to the pull request's head commit - " +
    "`with: { ref: ${{ github.event.pull_request.head.sha }} }` on your `actions/checkout` step.";
function short(sha) {
    return sha.slice(0, 12);
}
