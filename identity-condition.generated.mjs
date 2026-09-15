/**
 * GENERATED FILE - DO NOT EDIT.
 *
 * Why this run has no identity-proven result, said as one of three concrete causes.
 *
 * Written by `scripts/generate-decision-copies.mts` from:
 *   packages/core/src/identity-condition.ts
 *   packages/core/src/setup-template.ts
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
 * WHY THIS RUN HAS NO IDENTITY-PROVEN RESULT, AS ONE OF THREE CONCRETE CAUSES AND NEVER AS A WORD.
 *
 * KENNETH'S RULING, 2026-08-30. The word "unattested" is banned from every customer-facing surface
 * and discouraged internally. It is a category, and a category hides the three things a reader
 * actually needs to know apart: whether they have an edit to make, whether abloh broke, and whether
 * GitHub's own rules decided it. Those three have different owners, different remedies and different
 * emotional weight, and one word wearing all three is how a maintainer ends up looking for a bug in
 * their repository over a platform rule.
 *
 * SO THE STATE IS AN ENUM AND NOT A BOOLEAN. A `unattested: true` flag is the same failure in a
 * type: every reader downstream has to re-derive the cause, and each one derives it slightly
 * differently. What travels is the cause.
 *
 * THE THREE, AND WHAT EACH ONE OWES THE READER:
 *
 *   `permission-missing` - THEIRS TO FIX, and the remedy names the file, the key and the value.
 *   GitHub grants `id-token: write` to no job by default, so the attestation job abloh's setup pull
 *   request wrote is where it belongs. This is the only one of the three with an edit behind it.
 *
 *   `identity-issuance-or-publish-failed` - OURS, said as ours. GitHub would have minted it and the
 *   job asked correctly; the mint or the post did not land. It carries the retry state, so a reader
 *   can tell "we are still trying" from "we stopped trying", and it says where the measurement
 *   still is - on the run, in the artifact - because the thing a reader fears here is that the CI
 *   minutes were wasted, and they were not.
 *
 *   `fork-policy` - NEITHER PARTY'S, and stated as the platform rule it is. A pull request opened
 *   from a fork gets a read-only token whatever any job declares, and GitHub mints no OIDC identity
 *   for it. No edit fixes this one, and offering an edit here is the shape that has a maintainer
 *   changing a permission four times and watching it fail again.
 *
 * WHAT DOES NOT CHANGE. Only a green, identity-proven trial activates gating. This module renames
 * nothing about that rule - it names the states a customer and an operator READ, and those are the
 * causes rather than the umbrella they used to sit under.
 *
 * THE ACTION CANNOT IMPORT THIS FILE, AND NO LONGER RETYPES IT. It ships standalone onto a runner
 * with no workspace resolution. `scripts/generate-decision-copies.mts` renders this module - every
 * line of it, comments included - into `apps/action/identity-condition.generated.mjs`, which the
 * boundary imports. There was a hand-typed second copy here until 2026-08-31, held to this file by
 * `scripts/identity-condition-parity.test.ts`; both are deleted. A parity test can only fail in a
 * checkout holding both sides, and the failure it was written about is a customer's Action pinned by
 * SHA meeting a control plane that shipped afterwards - which no test in one repository can reach.
 *
 * SO THIS FILE IS THE ONLY PLACE THESE SENTENCES ARE WRITTEN. Change one and run `pnpm gen:action`.
 */
/** The registry code each condition is raised under, so no caller invents a fourth spelling. */
export const IDENTITY_CONDITION_CODES = {
    "permission-missing": "identity-permission-missing",
    "identity-issuance-or-publish-failed": "identity-publish-failed",
    "fork-policy": "identity-fork-policy",
};
/**
 * THE SENTENCE, ONE PER CONDITION.
 *
 * EACH ONE OPENS WITH WHOSE PROBLEM IT IS, because that is the reader's first question and every
 * other clause is useless until it is answered. Then the fact, then the action or the explicit
 * statement that there is none.
 *
 * NO SEMICOLONS, NO EM DASHES, NO URLS, under the copy rules of 2026-08-26. The remedy carries the
 * location as typed coordinates rather than as prose, so nothing here spells a path.
 */
export function identityConditionSentence(kind, facts = {}) {
    if (kind === "fork-policy") {
        /*
         * BOTH CONSEQUENCES, ON ONE SENTENCE (wave 4 merge, 2026-09-03). `model-identity-not-mintable`
         * said the same thing about the same fact - a fork run gets no identity - and drew the other
         * consequence from it: nothing that needs the model can run either, because the model gateway
         * takes the same identity. Same diagnosis, same owner, nothing to do, so by the registry's own
         * merge rule they are one message, and the surviving one has to carry what the retired one
         * said. The ruled clause is "so abloh could not file this result or run anything that needs
         * the model".
         */
        return ("this pull request comes from a fork, and GitHub issues no identity to a fork run whatever " +
            "the workflow declares, so abloh could not file this result or run anything that needs the " +
            "model. It stays on this workflow run as the abloh artifact");
    }
    if (kind === "permission-missing") {
        const job = facts.job === undefined || facts.job === "" ? "this job" : `the ${facts.job} job`;
        /* THE POLICY SENTENCE IS GONE (Kenneth's delegation, wave 4, queue 51). "GitHub grants that
           permission to no job by default, under either repository setting" is true and is explaining
           after the fact: the reader has one line to add and the sentence before it already said which
           job. */
        return `${job} has no id-token: write permission, so GitHub issued no identity for it`;
    }
    /*
     * OURS, AND THE FIRST FOUR WORDS SAY SO. The reader is looking at a run that cost them CI minutes
     * and did not report, and the worst thing this sentence could do is imply they broke something.
     */
    /*
     * THE OWNERSHIP CLAUSE IS THE COMPOSED CLOSING LINE'S NOW (Kenneth, wave 4, rulings 1 and 16).
     * "this is a failure in abloh" was typed into the sentence and is said once, at the end of every
     * abloh-owned message, so what is left here is what happened and where the measurement is. The
     * clearing clause - the job DOES grant it - stays, because the alternative reading of a missing
     * identity is a permission the maintainer forgot, and that is the wrong place to send them.
     */
    const retry = facts.attempt !== undefined && facts.attempts !== undefined
        ? facts.attempt >= facts.attempts
            ? ` abloh stopped after ${facts.attempts} attempts.`
            : ` abloh is retrying, attempt ${facts.attempt} of ${facts.attempts}.`
        : "";
    /* THE TWO HALVES STAY TWO SENTENCES. `stage` is which of them failed, and a mint failure and a
       post failure are different news: one is an identity the job granted and abloh could not get,
       the other is an identity it had and a result it could not file. */
    const what = facts.stage === "publish"
        ? "abloh has its GitHub identity and could not file this run's result with abloh"
        : "abloh could not obtain its GitHub identity even though your job grants it, so this run's " +
            "result was not filed with abloh";
    return `${what}.${retry} The measurement is saved on this workflow run as the abloh artifact`;
}
/**
 * ONE LINE FOR A JOB LOG: the code, then the sentence.
 *
 * THE CODE IS IN IT because a job log is where somebody pastes a line into a search, and the code
 * is the one token that finds the right registry entry rather than the right-looking one.
 *
 * IT LIVES HERE RATHER THAN ON THE RUNNER because the Action used to author it, and an authored
 * line is a second decision about what a customer reads: the same arrangement, and the same
 * deletion, as `setupReportOversizeLine`.
 */
export function identityConditionLine(kind, facts = {}) {
    return `Abloh [${IDENTITY_CONDITION_CODES[kind]}]: ${identityConditionSentence(kind, facts)}\n`;
}
/**
 * WHICH CONDITION A JOB IS IN, read from that job's own environment, or `null` when an identity is
 * mintable.
 *
 * IT MOVED HERE FROM THE ACTION, AND THE REASON IS A DEFECT THIS FILE'S OWN RULE FORBIDS. The
 * reading lived in `apps/action/identity-conditions.mjs` on the argument that only a runner can
 * answer it, and that argument holds for WHO ASKS and not for WHO OWNS THE RULE: the CLI runs in
 * the same job, sees the same two variables, and had to answer the same question. It answered it by
 * naming a constant - `resolveModelAccess` read `identity-fork-policy`'s sentence for EVERY hosted
 * run with no credential - so a job whose permissions block simply omits `id-token` was told its
 * pull request comes from a fork. That is the one word wearing three causes, back again as a
 * hardcoded code, and it is what the enum above exists to prevent. `apps/rehearsal`'s `no-id-token`
 * scenario is the standing guard, and it is what caught this.
 *
 * THE ORDER IS THE POINT. A fork run has no identity AND usually no `id-token: write` either, and
 * telling that maintainer to add the permission is the sentence that has somebody edit one line
 * four times. GitHub's rule is checked first because it outranks anything the workflow declares.
 *
 * THE TWO VARIABLES ARE THE JOB'S. `ACTIONS_ID_TOKEN_REQUEST_URL` is GitHub's, present exactly when
 * the job holds the grant. `ABLOH_PR_FORK` is written by `action.yml`, true when the pull request's
 * HEAD repository differs from its BASE repository, which is what "comes from a fork" means - NOT
 * `head.repo.fork`, which says the repository is itself a fork of something, and a same-repository
 * pull request inside a forked repository gets full permissions and a mintable identity (census run
 * 4, F2, 2026-09-02).
 *
 * OUTSIDE A JOB IT ANSWERS NOTHING. A local run has neither variable and is not in any of the three
 * conditions - it is a run that was never going to have an identity - so the caller asks
 * `GITHUB_ACTIONS` first and this function is never handed a laptop's environment.
 */
export function identityConditionOfEnvironment(
/* AN ENVIRONMENT, not a named pair: the callers hand it `process.env` whole, and an all-optional
   object type has no property in common with `NodeJS.ProcessEnv`'s index signature. */
environment) {
    const fork = String(environment.ABLOH_PR_FORK ?? "")
        .trim()
        .toLowerCase();
    const mintable = String(environment.ACTIONS_ID_TOKEN_REQUEST_URL ?? "").trim() !== "";
    if (mintable)
        return null;
    if (fork === "true")
        return "fork-policy";
    return "permission-missing";
}
export function repositoryModelCredentialOfEnvironment(environment) {
    const flag = String(environment.ABLOH_MODEL_CREDENTIAL_PRESENT ?? "")
        .trim()
        .toLowerCase();
    if (flag !== "true" && flag !== "false")
        return null;
    const condition = identityConditionOfEnvironment(environment);
    if (condition === null || condition === "fork-policy")
        return null;
    return flag === "true" ? "present" : "absent";
}

/**
 * The job id abloh writes its second job under, in the customer's own workflow. The refusal this
 * Action prints names the job a maintainer has to go and edit, so a stale spelling here sends
 * somebody to a job that is not in their file.
 */
export const ATTESTATION_JOB_ID = "abloh-publish";
