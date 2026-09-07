/**
 * GENERATED FILE - DO NOT EDIT.
 *
 * Every input this Action declares, and whether a pull request is allowed to set it.
 *
 * Written by `scripts/generate-decision-copies.mts` from:
 *   packages/core/src/action-inputs.ts
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
 * EVERY INPUT THE ACTION DECLARES, AND WHETHER A PULL REQUEST MAY SET IT.
 *
 * WHAT THIS FIXES (divergence audit, F61, 2026-08-31). Four places decided which inputs a pull
 * request is not allowed to choose: the boundary's own list, the promise each input's description
 * makes in `action.yml`, and two hand-written attack tables in the Action's tests. They had already
 * come apart. The boundary refuses EIGHT inputs on a `pull_request` event; the tests attacked SIX of
 * them, and `record-loopback`'s description in the manifest never mentioned the refusal at all - so
 * a customer reading the manifest was told nothing about a refusal the product enforces.
 *
 * WHY THE CLASSIFICATION IS THE FACT, and not the list. What makes an input unsafe on a pull request
 * is a property of the input: whether a contributor could use it to have their own change MEASURED
 * ON WEAKER TERMS than the branch it targets. A list records the answers; a trust class records the
 * question, so a new input has to be classified rather than silently omitted.
 *
 * THE TWO CLASSES.
 *
 *   `pull-request-refused` - setting it on a `pull_request` run is refused at the boundary, before
 *   anything of the repository executes, and the trusted merge-base `abloh.yml` decides instead. A
 *   workflow is a file a contributor can propose, so an input that selects measurement settings is
 *   an input that lets the measured choose their own measurement.
 *
 *   `pull-request-safe` - it cannot weaken a measurement, so refusing it would refuse an input
 *   nothing could ever use. `sweep` is the instructive one: it measures NOTHING - no results file,
 *   no summary, no gate, no model call, nothing uploaded - so the worst a contributor can do with it
 *   is stop their own pull request from being answered, and a required check that never answers
 *   blocks a merge rather than passing one. It also HAS to be reachable on `pull_request`, because
 *   that is the only event this Action runs on.
 *
 * WHERE THIS IS READ. `scripts/generate-decision-copies.mts` writes the boundary's refusal list into
 * `apps/action/action-inputs.generated.mjs`, and writes the promise sentence into every refused
 * input's description in `apps/action/action.yml`. The Action's tests iterate this registry rather
 * than carrying a table of their own, so an input added without a trust class is an input the attack
 * suite immediately demands a refusal for.
 */
/** Declaration order is the manifest's order, which is the order a reader meets them in. */
export const ACTION_INPUTS = [
    { name: "repo-path", env: "REPO_PATH", trust: "pull-request-safe" },
    {
        name: "subdir",
        env: "SUBDIR",
        trust: "pull-request-refused",
        instead: "target.directory from the trusted merge-base abloh.yml",
        example: "packages/demo",
    },
    { name: "base", env: "DECLARED_BASE", trust: "pull-request-safe" },
    /*
     * `tier` IS OFF THE REFUSED LIST, and the history of that is worth the paragraph.
     *
     * It was refused because the engine that honoured it still shipped: on the v1 arm the tier gated
     * whether LLM triage ran and what left the customer's CI, so a contributor who could set it could
     * have their own change measured on weaker terms. That was true, and it is the test this class
     * exists to apply.
     *
     * IT IS NO LONGER TRUE. The v1 arm and the tier ladder are both deleted. `TIER` reaches nothing:
     * the boundary states that in its own words ("NO TIER CHECK"), `buildRunArguments` forwards no
     * `--tier` because the CLI has no such flag, and there is no default a dropped value could move a
     * workflow onto. An input that cannot change a measurement cannot weaken one, which is the whole
     * of `pull-request-safe`.
     *
     * WHY THE RECLASSIFICATION IS THE FIX AND NOT A RELAXATION. The input is declared for exactly one
     * reason - so a workflow written before the deprecation keeps running rather than failing on an
     * input the Action does not know. `pull_request` is the only event this Action runs on, so a
     * refusal there refused the one case the compatibility slot exists for: the manifest promised a
     * stale `tier:` line was harmless and the boundary failed the job over it. Keeping the refusal
     * would mean deleting that promise instead, and asking every customer to edit a workflow to
     * remove a value nothing reads.
     */
    { name: "tier", env: "TIER", trust: "pull-request-safe" },
    {
        name: "config",
        env: "CONFIG",
        trust: "pull-request-refused",
        instead: "<repo-path>/abloh.yml resolved from the trusted merge base",
        example: "config/abloh.yml",
    },
    /*
     * `policy` IS THE OLD NAME FOR `config`, AND IS DECLARED SO A PINNED WORKFLOW STILL PARSES.
     *
     * `abloh.yml` is the config file on every surface now, so the input that points at it is `config`.
     * The old name cannot simply go: GitHub fails a job outright on an input a manifest does not
     * declare, so deleting it would break every workflow that still names it - the same reasoning
     * `tier` is declared under, one row up.
     *
     * IT KEEPS ITS REFUSAL RATHER THAN BECOMING INERT, which is the one way it differs from `tier`.
     * `tier` reaches nothing, so admitting it changes no measurement. This one names the file every
     * measurement setting is read from, so a pull request that could set it could choose its own
     * terms - exactly what `pull-request-refused` exists for. Its description carries the new name so
     * a reader who set it learns what to write instead.
     */
    {
        name: "policy",
        env: "POLICY",
        trust: "pull-request-refused",
        instead: "<repo-path>/abloh.yml resolved from the trusted merge base",
        example: "config/abloh.yml",
    },
    {
        name: "environment-image",
        env: "ENVIRONMENT_IMAGE",
        trust: "pull-request-refused",
        instead: "environment.runtimeImage from the trusted merge-base abloh.yml",
        example: `attacker.invalid/node@sha256:${"a".repeat(64)}`,
    },
    {
        name: "test-command",
        env: "TEST_COMMAND",
        trust: "pull-request-refused",
        instead: "environment.testCommand from the trusted merge-base abloh.yml",
        example: "node fake-green-suite.mjs",
    },
    {
        name: "seed",
        env: "SEED",
        trust: "pull-request-refused",
        instead: "the seed Abloh mints and records, so a changed workflow cannot select its own mutants",
        example: "a",
    },
    {
        /*
         * REFUSED OUTRIGHT, and this one's refusal is about more than trusted settings. A recording pass
         * reaches the network - that is what it is for - and allowing it here would let a workflow
         * change, which a contributor can propose, turn the sealed measurement into an unsealed one.
         */
        name: "record-network",
        env: "RECORD_NETWORK",
        trust: "pull-request-refused",
        note: "It belongs in a workflow of your own that refreshes the file, never in the check on a pull " +
            "request.",
        example: "recordings.json",
    },
    {
        /*
         * IT FOLLOWS `record-network`, and it was the gap. The boundary has always refused it on a pull
         * request and the manifest never said so, because the promise was prose beside a list rather
         * than a rendering of one.
         */
        name: "record-loopback",
        env: "RECORD_LOOPBACK",
        trust: "pull-request-refused",
        note: "It only has meaning alongside record-network, which a pull request may not set either.",
        example: "true",
    },
    { name: "sweep", env: "SWEEP", trust: "pull-request-safe" },
    { name: "publish", trust: "pull-request-safe" },
    { name: "cli-tarball", env: "CLI_TARBALL", trust: "pull-request-safe" },
    { name: "job-status", env: "ABLOH_CALLER_JOB_STATUS", trust: "pull-request-safe" },
    /*
     * THE MODEL CREDENTIAL THE BORROW ROAD PRESENTS (Kenneth, 2026-09-03), and it is `pull-request-safe`
     * for a reason worth writing down rather than by omission.
     *
     * WHAT IT CARRIES is a repository-bound model-scope abloh key out of the repository's own Actions
     * secrets. GitHub hands a secret to the step whose line names it and to no other step, which is
     * the whole reason the credential is a secret rather than the `id-token: write` identity a job
     * scopes to everything in it.
     *
     * WHY A PULL REQUEST SETTING IT CHANGES NOTHING IT SHOULD NOT. The refused inputs on this list are
     * refused because they would let a pull request choose its own MEASUREMENT TERMS - which directory,
     * which command, which image - and be measured on weaker ones than the branch it targets. This
     * input chooses no terms. The worst a same-repository pull request can do by editing the `with:`
     * line is name a different secret of their own, which the gateway refuses because it is not a
     * model-scope key of that repository, or name nothing, which turns their own model arm off. A FORK
     * pull request gets no secrets at all, so the value is empty there and the run measures
     * mechanically with the environment-owned identity condition saying why.
     */
    { name: "model-token", env: "ABLOH_MODEL_TOKEN", trust: "pull-request-safe" },
];
/** Every input a `pull_request` run refuses, as the boundary reads them: variable, then input name. */
export const PULL_REQUEST_REFUSED_INPUTS = ACTION_INPUTS
    .filter((input) => input.trust === "pull-request-refused")
    .map((input) => [input.env, input.name]);
/**
 * THE PROMISE THE MANIFEST MAKES ABOUT ONE INPUT, in the words the refusal itself uses.
 *
 * IT OPENS THE SAME WAY EVERY TIME, deliberately: a reader scanning fourteen descriptions for what a
 * pull request may set should be able to find the answer by its shape rather than by reading each
 * one. That fixed opening is also how the generator finds a promise it wrote before, so a
 * reclassified input's old sentence cannot survive underneath its new one.
 */
export const PULL_REQUEST_PROMISE_OPENING = "pull_request runs refuse this input";
export function pullRequestPromise(input) {
    if (input.trust !== "pull-request-refused")
        return null;
    const first = input.instead === undefined
        ? `${PULL_REQUEST_PROMISE_OPENING} outright.`
        : `${PULL_REQUEST_PROMISE_OPENING} and use ${input.instead}.`;
    return input.note === undefined ? first : `${first} ${input.note}`;
}
