/**
 * GENERATED FILE - DO NOT EDIT.
 *
 * Every variable that makes an interpreter run code before the program it was given.
 *
 * Written by `scripts/generate-decision-copies.mts` from:
 *   packages/core/src/ambient-interpreter-hooks.ts
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
 * EVERY VARIABLE THAT MAKES AN INTERPRETER RUN CODE BEFORE THE PROGRAM IT WAS ASKED TO RUN.
 *
 * WHAT THIS FIXES (assumption audit, 2026-08-29, rank 2 / AUTH-20). A composite action is inlined
 * into the caller's job, so it inherits the workflow's and the job's `env:` maps - and GitHub
 * documents `env:` at workflow, job and step scope while restricting only `$GITHUB_ENV`. Two of
 * those variables execute repository code at INTERPRETER STARTUP, which is before the first line of
 * any script the Action's boundary is reached from:
 *
 *   $ BASH_ENV=<(printf 'printf "BASH_ENV_EXECUTED\\n"\n') bash -c ':'
 *   BASH_ENV_EXECUTED
 *   $ NODE_OPTIONS='--import=data:text/javascript,console.log(%22NODE_OPTIONS_EXECUTED%22)' node -e ''
 *   NODE_OPTIONS_EXECUTED
 *
 * So `unset` inside a run step is always too late, and this list is applied in TWO places for two
 * different moments: `action.yml` strips it with `env -u` in the `shell:` command itself, which is
 * the only point earlier than bash's own startup, and the Action's boundary strips it again from
 * the environment every child inherits.
 *
 * WHY THE LIST LIVES HERE AND NOT IN EITHER OF THEM (divergence audit, F46, 2026-08-31). It was
 * written out THIRTEEN times: once in `action-boundary.mjs`, once on each of eleven `shell:` lines
 * in `action.yml`, and once more in `attest/action.yml` - the subaction that holds Abloh's identity,
 * and the one `ambient-hook-boundary.test.mjs` did not cover. A stale list there would let
 * repository-controlled interpreter hooks execute in the job that can mint Abloh's identity, which
 * is the worst place in the product for a list to be one entry out of date. This module is the
 * reviewed registry; `scripts/generate-decision-copies.mts` writes the boundary's copy and every
 * `shell:` line in both manifests from it.
 *
 * WHY THE SET IS COMPLETE FOR THE INTERPRETERS THIS ACTION INVOKES. It invokes exactly two: `bash`,
 * always as `bash --noprofile --norc -eo pipefail <file>`, and `node` (which in turn runs `npm`,
 * itself node). Taking them one at a time:
 *
 *   bash, non-interactive, not a login shell, not POSIX mode:
 *     BASH_ENV   the ONE startup file a non-interactive bash reads. `--noprofile --norc` already
 *                exclude /etc/profile, ~/.bash_profile and ~/.bashrc; BASH_ENV is what is left.
 *     ENV        the file bash reads INSTEAD of BASH_ENV when it runs in POSIX mode or as `sh`.
 *                Neither is how it is invoked here, and it is stripped anyway so that a future
 *                `shell: sh` cannot silently reopen the door this list closed.
 *     SHELLOPTS  imported and APPLIED at startup, so it can turn `xtrace` on for a script that
 *                never asked for it.
 *     PS4        expanded before every traced command, and the expansion performs command
 *                substitution. SHELLOPTS=xtrace plus PS4='$(...)' is arbitrary execution with no
 *                file involved, which is why the pair must go together.
 *     BASHOPTS   the same import-and-apply channel as SHELLOPTS for `shopt` options. None of them
 *                executes code by itself; it is stripped because it is the same channel.
 *
 *   node (and npm, which is node):
 *     NODE_OPTIONS                 preloads `--require` and `--import` modules before the entry
 *                                  point, which is the reproduction above.
 *     NODE_PATH                    adds directories to CommonJS resolution, so a bare specifier
 *                                  npm resolves can be answered by a planted module.
 *     NODE_REPL_EXTERNAL_MODULE    loads a module in place of the REPL. Not a path this Action
 *                                  takes, listed because it is the third variable Node documents
 *                                  as loading code from the environment.
 *
 * WHAT IS DELIBERATELY NOT ON THIS LIST, because it is a different mechanism and is closed
 * elsewhere: exported shell FUNCTIONS (`BASH_FUNC_name%%`), which bash imports at startup and which
 * outrank both external commands and builtins when a name is CALLED. `env -u` cannot name them -
 * the names are unbounded - so `action.yml` clears them with a builtin-only purge on the first line
 * of every step, which is early enough precisely because a function runs when it is called and not
 * when it is imported. `ambient-hook-boundary.test.mjs` holds both halves.
 *
 * NPM'S OWN `node-options` config is not here either: it is applied to lifecycle scripts, and every
 * npm invocation in the boundary passes `--ignore-scripts` or installs a runtime whose placement IS
 * its install (`provisionNodeRuntime`), under a pinned exact version in a private prefix.
 */
export const AMBIENT_INTERPRETER_HOOKS = [
    "BASH_ENV",
    "ENV",
    "SHELLOPTS",
    "BASHOPTS",
    "PS4",
    "NODE_OPTIONS",
    "NODE_PATH",
    "NODE_REPL_EXTERNAL_MODULE",
];
/**
 * THE TRUSTED SHELL, AS ONE STRING, because a `shell:` line that names nine of the ten is a door.
 *
 * `env -u` RUNS BEFORE BASH, which is the whole reason this is a `shell:` line rather than a first
 * line of the script: `BASH_ENV` is read during bash's own startup, so anything inside the body is
 * already too late. `--noprofile --norc` closes the other three startup files, and the first line of
 * every body clears imported shell FUNCTIONS, which `env -u` cannot name because their names are
 * unbounded.
 */
export function trustedShellCommand() {
    const unset = AMBIENT_INTERPRETER_HOOKS.map((name) => `-u ${name}`).join(" ");
    return `env ${unset} bash --noprofile --norc -eo pipefail {0}`;
}
/**
 * THE SECOND HALF OF THE SAME BOUNDARY: the first line of every `run:` body in every manifest.
 *
 * `env -u` CANNOT CLOSE THIS ONE, which is why it is a line of the script rather than part of the
 * `shell:` command. Exported shell FUNCTIONS arrive as `BASH_FUNC_name%%` and their names are
 * unbounded, so no list of names can strip them - and a function outranks both an external command
 * and a builtin when the name is CALLED. A line of the body is early enough for exactly that
 * reason: a function runs when it is called, not when it is imported, and `command -v node` and
 * `node ...` are such calls in the first step of both manifests.
 *
 * BUILTINS ONLY - `declare`, `read`, `unset` - so the purge cannot itself be hijacked by the thing
 * it is removing. It was written out by hand on all eleven `run:` bodies of the two manifests,
 * beside the `env -u` line it completes; `scripts/generate-decision-copies.mts` writes it now.
 */
export const IMPORTED_FUNCTION_PURGE = 'while read -r _ _ abloh_fn; do unset -f "$abloh_fn" || :; done < <(declare -F)';
/**
 * WHAT THE PUBLISH JOB EMPTIES ON ITS OWN STEP, AND WHY IT EMPTIES RATHER THAN REFUSES.
 *
 * A FOURTH LIST OF DANGEROUS VARIABLES LIVED IN `attest/action.yml`, hand-typed, and it disagreed
 * with the three above it: it blanked the dynamic linker's variables and `NODE_EXTRA_CA_CERTS`,
 * which the scrub list does not name, and named none of the bash startup hooks, which the scrub
 * list does. Two overlapping lists in the one job that holds `id-token: write`, neither generated
 * and neither tested, is the same defect F46 is about wearing different clothes.
 *
 * WHY IT IS NOT {@link AMBIENT_INTERPRETER_HOOKS}, and the difference is deliberate. That list is
 * what `env -u` REMOVES before bash starts, and it is complete for the two interpreters the Action
 * invokes. This list is what a step-level `env:` entry BLANKS, which is a second and different
 * lever: a step-level entry outranks the workflow-level one, so it reaches variables the shell
 * prefix is not the right place for - the dynamic linker's, which no `bash` or `node` flag touches,
 * and `NODE_EXTRA_CA_CERTS`, which is not an execution channel at all but points TLS trust at a
 * certificate from the same attacker-written directory.
 *
 * BLANKED RATHER THAN REFUSED, for the ones a repository legitimately sets. `NODE_OPTIONS:
 * --max-old-space-size=4096` at workflow level is ordinary in a large repository, and refusing it
 * would fail honest builds to close a hole that emptying the variable closes completely. The
 * control-plane addresses are the opposite case - nothing legitimate sets those on this job - and
 * the boundary refuses those outright rather than ignoring them.
 */
export const IDENTITY_JOB_BLANKED_ENVIRONMENT = [
    {
        name: "NODE_OPTIONS",
        why: "`--require`/`--import` would run a file out of the artifact this job just downloaded.",
    },
    {
        name: "NODE_PATH",
        why: "answers a bare specifier from a planted module in that same directory.",
    },
    {
        name: "NODE_EXTRA_CA_CERTS",
        why: "points TLS trust at a certificate from that directory, so a control plane can be answered for.",
    },
    {
        name: "NODE_REPL_EXTERNAL_MODULE",
        why: "the third variable Node documents as loading code from the environment.",
    },
    {
        name: "LD_PRELOAD",
        why: "loads a shared object into every dynamically linked program the step starts, node included.",
    },
    {
        name: "LD_LIBRARY_PATH",
        why: "answers a library the loader resolves by name, which is the same channel one step earlier.",
    },
    {
        name: "DYLD_INSERT_LIBRARIES",
        why: "the macOS spelling of LD_PRELOAD, blanked so a self-hosted macOS runner is not a gap.",
    },
];
