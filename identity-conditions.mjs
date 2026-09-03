/**
 * WHICH IDENTITY CONDITION THIS RUNNER IS IN - and it is no longer decided here.
 *
 * WHAT WAS HERE. The reading of `ACTIONS_ID_TOKEN_REQUEST_URL` and `ABLOH_PR_FORK`, on the argument
 * that those two variables exist only inside a GitHub job so core could not answer it. The argument
 * held for WHO ASKS and not for WHO OWNS THE RULE: the CLI runs in the same job and sees the same
 * two variables, and because it had no shared rule to call it named a constant instead - every
 * hosted run with no model credential read `identity-fork-policy`'s sentence, so a job whose
 * permissions block merely omits `id-token: write` was told its pull request comes from a fork.
 *
 * SO THE RULE MOVED TO `packages/core/src/identity-condition.ts`, beside the enum and the three
 * sentences it selects between, and it arrives here the way those already did: rendered by
 * `pnpm gen:action` into `identity-condition.generated.mjs`. This file is the name the boundary
 * imports, kept so the Action's own import graph is unchanged.
 *
 * The three condition codes, their sentences and the job id a maintainer is sent to edit were
 * already generated rather than typed, since 2026-08-31.
 */
export { identityConditionOfEnvironment as identityCondition } from "./identity-condition.generated.mjs";
