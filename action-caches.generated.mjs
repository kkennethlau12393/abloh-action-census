/**
 * GENERATED FILE - DO NOT EDIT.
 *
 * Where each cached directory lives and what its two steps agree about.
 *
 * Written by `scripts/generate-decision-copies.mts` from:
 *   packages/core/src/action-caches.ts
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
 * WHAT THE ACTION CACHES, WRITTEN ONCE PER CACHE AND RENDERED INTO BOTH HALVES.
 *
 * WHAT THIS FIXES (audit F104). A GitHub cache is TWO steps that have to agree about four things -
 * the directory, the key the run writes under, the prefix a later run restores by, and the condition
 * that decides whether the save happens at all. `action.yml` had three such caches, and all six
 * steps spelled those four facts out independently: three restore steps near the top of the file,
 * three save steps two hundred lines below them, with no mechanism holding a pair together.
 *
 * WHY THAT IS EXPENSIVE RATHER THAN UNTIDY, and it is expensive in a customer's money. A save key
 * that stops matching its restore prefix does not fail: every run writes an entry nothing will ever
 * read, so baseline history, the engine's carry-forward store and the triage verdicts a customer
 * already paid for are silently re-earned on every push. The measured value of the triage half alone
 * was $1.59 down to $0.98 on one run (2026-08-23). A drift there is invisible in every artifact and
 * every test that only asks whether the steps exist.
 *
 * SO THE PAIR IS ONE DATUM. Each descriptor below states the four facts once, and
 * `scripts/generate-decision-copies.mts` writes both steps of `action.yml` from it. A key that
 * changes changes in both halves or in neither, because there is only one place to change it.
 *
 * THE PROSE ABOVE EACH STEP STAYS IN THE MANIFEST. `action.yml` is a file a maintainer reads, and
 * the argument for a repository-wide restore prefix belongs where they will meet it. What is
 * generated is the step - its name, its pin, its condition and its `with:` block - and nothing else.
 *
 * WHY THE KEY HAS THIS SHAPE, stated here because it is now stated nowhere else:
 *
 *   `<namespace>-<os>-<repository id>-<run id>-<run attempt>` for the WRITE, so every run writes its
 *   own entry and no run overwrites another's. GitHub cache keys are immutable once written; a
 *   shared key would mean the first run of a repository was the only one that ever saved.
 *
 *   `<namespace>-<os>-<repository id>-` for the RESTORE, which is a prefix match rather than an
 *   equality check: a rerun restores its own branch's previous run, and a pull request's FIRST run
 *   restores the base branch's records, which are valid for every file it did not touch. GitHub
 *   scopes cache reads to the branch and its base, so one pull request can never read another's -
 *   the isolation this needs, for free.
 *
 *   The operating system is in both because a cache written on one runner image is not readable
 *   material for another, and the repository id rather than the name because a rename must not
 *   silently orphan a repository's whole history.
 *
 * AND THE DIRECTORY IS THE FOURTH FACT, WHICH THIS FILE DID NOT OWN AND NOW DOES.
 *
 * `actions/cache` versions an entry by the PATHS it covers as well as by the key, so a key that
 * prefix-matches perfectly still meets nothing when the directory moves. The Action built its own
 * state directory as `$RUNNER_TEMP/abloh-state/<run id>-<run attempt>/<name>`, so every save went
 * under a path no later run would ever ask for: `Vero-Technology/ofetch-abloh` held 73 saved entries
 * and had read none of them, each run logging `Cache not found for input keys` beside a key whose
 * prefix was right. The carried-bugs section therefore never appeared on a second push, and every
 * push re-measured the baseline from cold and re-paid for every triage verdict - which is the
 * silent, expensive failure this file's header describes, arriving through the path rather than
 * through the key, where the guard could not see it.
 *
 * So `directory` is a segment under {@link ACTION_CACHE_STATE_ROOT} and carries nothing about the
 * run that wrote it. The Action reads both from the copy `pnpm gen:action` renders, so the path
 * drifts only where the key can drift: here, in one place, with `scripts/decision-copies.test.ts`
 * between the two halves.
 *
 * WHAT THE REPEATING PATH GIVES UP, and what replaces it. A directory named for the run could never
 * hold an earlier run's leftovers, and the boundary refused one that already existed. A repeating
 * one can, on a runner that does not empty `RUNNER_TEMP` between jobs, so the boundary empties each
 * of these leaves before the restore step runs: the only records a run measures with are the ones
 * its own restore put there.
 *
 * WHAT IS STILL A MISS, stated because it is a property of the mechanism rather than an oversight:
 * the version is computed from the path as written, and the path opens at `RUNNER_TEMP`. Every
 * GitHub-hosted runner answers `/home/runner/work/_temp`, so a repository on hosted runners restores
 * across every run. Two SELF-HOSTED runners installed under different roots answer differently, and
 * a run on one reads nothing an entry from the other saved - it re-measures and re-pays exactly as
 * every run did before this, and no run reads another repository's records or a stale one.
 */
/** The pinned `actions/cache` release both halves of every pair use. */
export const ACTION_CACHE_PIN = "0400d5f644dc74513175e3cd8d07132dd4860809";
/** The human-readable release the pin is, carried as the comment GitHub's own convention expects. */
export const ACTION_CACHE_VERSION = "v4.2.4";
/**
 * WHEN A SAVE HAPPENS, and it is the same answer for all three.
 *
 * `always()` because the save must survive a red gate - a run that measured correctly and failed the
 * check has produced exactly the history the next run needs - and the artifact-completion test
 * because a run that never finished writing its artifact did not finish measuring, so what it
 * managed to put on disk is a partial view of a push nobody will read.
 */
export const ACTION_CACHE_SAVE_CONDITION = "${{ always() && steps.artifact_state.outputs.complete == 'true' }}";
/**
 * WHERE THE CACHED DIRECTORIES LIVE, under `RUNNER_TEMP` and under nothing run-scoped.
 *
 * Only the three below go here. State that must NOT be shared between runs - the coverage provider
 * directory, which holds executable code the run will execute - keeps a root of its own, named by
 * the Action, so nothing can arrive under this one by sitting beside something that belongs here.
 */
export const ACTION_CACHE_STATE_ROOT = "abloh-state";
/**
 * THE THREE CACHES THIS ACTION KEEPS.
 *
 * THE COVERAGE PROVIDER DIRECTORY IS DELIBERATELY ABSENT and must stay absent: it holds executable
 * code the run will execute, where these three hold data whose every use is bounded by a rule that
 * holds whatever the data says. The Action's own boundary test asserts that directory is never given
 * a cache pair, and adding a descriptor for it here is what that test exists to catch.
 */
export const ACTION_CACHES = [
    {
        what: "exact-commit baseline history",
        restoreId: "baseline_history_restore",
        directory: "baseline-history",
        pathOutput: "baseline-dir",
        namespace: "abloh-baseline-v1",
    },
    {
        what: "marigold per-repository state",
        restoreId: "v2_store_restore",
        directory: "marigold",
        pathOutput: "v2-store-dir",
        namespace: "abloh-v2-store-v1",
    },
    {
        what: "triage verdict cache",
        restoreId: "triage_cache_restore",
        directory: "triage-cache",
        pathOutput: "triage-cache-dir",
        namespace: "abloh-triage-cache-v1",
    },
];
/** The directory both halves point at, as the manifest expression that resolves it. */
export function actionCachePath(cache) {
    return `\${{ steps.environment_preflight.outputs.${cache.pathOutput} }}`;
}
/**
 * The same directory as the path segments it is, for the process that has to create it.
 *
 * The manifest names it through the preflight's output because a step cannot compute a path; the
 * preflight names it here. One declaration, two spellings of the same directory, so neither can be
 * moved without the other.
 */
export function actionCacheSegments(cache) {
    return [ACTION_CACHE_STATE_ROOT, cache.directory];
}
/** The prefix a restore matches on: everything up to and including the repository, then nothing. */
export function actionCacheRestorePrefix(cache) {
    return `${cache.namespace}-\${{ runner.os }}-\${{ github.repository_id }}-`;
}
/** The full key a run writes under: the restore prefix, then this run and this attempt. */
export function actionCacheKey(cache) {
    return `${actionCacheRestorePrefix(cache)}\${{ github.run_id }}-\${{ github.run_attempt }}`;
}
