#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  accessSync,
  chmodSync,
  constants,
  existsSync,
  lstatSync,
  mkdirSync,
  openSync,
  closeSync,
  cpSync,
  readFileSync,
  realpathSync,
  statSync,
  writeFileSync,
  writeSync,
} from "node:fs";
import { basename, delimiter, dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { pathToFileURL } from "node:url";
import { refusalCode, refusalMessage } from "./refusal-envelope.mjs";
import {
  planRefusalFactsOf,
  planRefusalRemedy,
  planRefusalSentence,
} from "./plan-refusal.generated.mjs";
import {
  CLI_NODE_RANGE,
  COMMAND_CENTER_ORIGIN,
  CONTROL_PLANE,
  DEFAULT_CLI_SPEC,
  HOSTED_API_ORIGIN,
} from "./deployment-contract.generated.mjs";
import {
  organizationFromHandoffUrl,
  uploadNoArtifactLines,
  uploadRefusedLines,
  uploadUnreachableLines,
  workflowFromRef,
} from "./upload-refusal.mjs";
import { identityCondition } from "./identity-conditions.mjs";
/*
 * THE DECISIONS, WRITTEN FROM `@abloh/core` RATHER THAN TYPED HERE.
 *
 * Every rule below - which identity condition applies and how it is worded, what an oversized setup
 * report is refused with, and what a pull-request checkout IS - used to be spelled a second time in
 * this file or beside it, with a test comparing the two spellings. `scripts/generate-decision-
 * copies.mts` renders the core modules into these files instead; change a rule in core and run
 * `pnpm gen:action`.
 */
import {
  ATTESTATION_JOB_ID,
  identityConditionLine,
} from "./identity-condition.generated.mjs";
import {
  SETUP_REPORT_OVERSIZE_CODE,
  SETUP_REPORT_OVERSIZE_NEXT_ACTION,
  setupReportOversizeLine,
  setupReportOversizeSentence,
} from "./setup-report-size.generated.mjs";
import {
  MERGE_REF_REMEDY,
  classifyPullRequestCheckout,
} from "./merge-ref-checkout.generated.mjs";
/*
 * The trial door's own body ceiling, so this side refuses before the wire does. It is the DOOR's
 * number, written here from the parser that enforces it rather than restated as `256 * 1024`.
 */
import { SETUP_TRIAL_MAX_BYTES } from "./wire-contract.generated.mjs";
import {
  coverageReportBytes,
  ENGINE_V2_PACKAGE_SIDECAR_INDEX,
  evidenceBasename,
  evidenceIndexMissingLines,
  evidenceUploadPlan,
  evidenceWithheldLine,
  manifestBasename,
  nonEvidenceBasename,
  parseEvidenceManifest,
  stagedEvidenceIsLedger,
  storedEvidenceBasename,
} from "./evidence-registry.generated.mjs";
import {
  DEEPEN_FETCH_TIMEOUT_MS,
  DEEPEN_LADDER,
  baseUnreachable,
} from "./base-reachability-plan.generated.mjs";
/*
 * F46: the interpreter-hook purge list. It was written out here and on every `shell:` line of both
 * manifests - thirteen copies of one security decision, one of which nothing tested. The reviewed
 * registry is `packages/core/src/ambient-interpreter-hooks.ts`; the manifests' `shell:` lines are
 * written from it by the same generator, so this process and the shell it runs under strip exactly
 * the same set.
 */
import { AMBIENT_INTERPRETER_HOOKS } from "./ambient-interpreter-hooks.generated.mjs";
import { nextActionLine } from "./nothing-waiting.generated.mjs";
/*
 * F61: which inputs a pull request may not set. This file used to carry the list, `action.yml`
 * promised the refusal in prose beside it, and two test tables named their own six of the eight -
 * so the manifest said nothing at all about `record-loopback`, which this boundary refuses. The
 * classification lives in `packages/core/src/action-inputs.ts`, which also writes the promise into
 * every refused input's description.
 */
import { PULL_REQUEST_REFUSED_INPUTS } from "./action-inputs.generated.mjs";

const SHA = /^[0-9a-f]{40}$/u;
const RUN_NUMBER = /^[1-9][0-9]*$/u;
const IMAGE = /^[A-Za-z0-9][^@\s]*@sha256:[0-9a-f]{64}$/u;
const SEED = /^[0-9a-fA-F]{1,64}$/u;
const CONTROL = /[\u0000-\u001f\u007f]/u;
const CONTROL_PLANE_SECRETS = [
  "ABLOH_API_TOKEN",
  "API_TOKEN",
  "GITHUB_TOKEN",
  "GH_TOKEN",
  "ACTIONS_ID_TOKEN_REQUEST_TOKEN",
  "ACTIONS_RUNTIME_TOKEN",
  "ACTIONS_CACHE_SERVICE_V2",
  "ACTIONS_RESULTS_URL",
];
const INSTALL_SECRETS = [
  ...CONTROL_PLANE_SECRETS,
  "ANTHROPIC_API_KEY",
  // Both spellings: `MODEL_API_KEY*` is canonical, `ATTEST_MODEL_API_KEY*` is the deprecated alias
  // still honoured for one release. A secret list that knew only one name would let the other
  // through, which is the same two-names-one-fact fault in its most expensive form.
  "MODEL_API_KEY",
  "MODEL_API_KEY_ALT",
  "ATTEST_MODEL_API_KEY",
  "ATTEST_MODEL_API_KEY_ALT",
  "AWS_ACCESS_KEY_ID",
  "AWS_SECRET_ACCESS_KEY",
  "AWS_SESSION_TOKEN",
  "OPENAI_API_KEY",
];
const DIRECT_MODEL_SECRETS = [
  "ANTHROPIC_API_KEY",
  "MODEL_API_KEY",
  "MODEL_API_KEY_ALT",
  "ATTEST_MODEL_API_KEY",
  "ATTEST_MODEL_API_KEY_ALT",
  "OPENAI_API_KEY",
];


/**
 * Remove every ambient interpreter hook from an environment, in place, and say so.
 *
 * IN PLACE, AND ON `process.env` FIRST. Deleting from this process's own environment is what makes
 * every child built as `{ ...environment }` clean by construction rather than by each spawn site
 * remembering - and this file has six spawn sites.
 */
export function neutralizeAmbientInterpreterHooks(environment = process.env) {
  const removed = [];
  for (const name of AMBIENT_INTERPRETER_HOOKS) {
    if (environment[name] === undefined) continue;
    removed.push(name);
    delete environment[name];
  }
  return removed;
}

function fail(message) {
  throw new Error(`Abloh Action boundary: ${message}`);
}

function required(value, label) {
  if (typeof value !== "string" || value.length === 0 || CONTROL.test(value)) {
    fail(`${label} must be a non-empty control-free string`);
  }
  return value;
}

function optional(value, label) {
  if (value === undefined || value === "") return "";
  if (CONTROL.test(value)) fail(`${label} must not contain control characters`);
  return value;
}

function credentialFreeHttps(value, label) {
  const candidate = required(value, label);
  let url;
  try {
    url = new URL(candidate);
  } catch {
    fail(`${label} must be an HTTPS URL`);
  }
  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    url.search ||
    url.hash
  ) {
    fail(`${label} must be credential-free HTTPS without query or fragment`);
  }
  return url.toString();
}

function sha(value, label) {
  const candidate = required(value, label);
  if (!SHA.test(candidate)) fail(`${label} must be a lowercase 40-character commit SHA`);
  return candidate;
}

function canonicalRelative(value, label, allowDot = false) {
  const candidate = required(value, label);
  if (allowDot && candidate === ".") return candidate;
  if (
    isAbsolute(candidate) ||
    candidate.startsWith("-") ||
    /^[A-Za-z]:/u.test(candidate) ||
    candidate.includes("\\") ||
    candidate.split("/").some((part) => part === "" || part === "." || part === "..")
  ) {
    fail(`${label} must be a canonical relative POSIX path`);
  }
  return candidate;
}

/**
 * THE CONFIG FILE'S INPUT, UNDER EITHER NAME.
 *
 * `config` is the input; `policy` is what it was called before `abloh.yml` got one name on every
 * surface, and it stays declared so a pinned workflow keeps parsing. ONE READER, so the two
 * spellings can never acquire two behaviours - which is the whole reason the alias is mapped here
 * rather than checked at each of the two sites that need it. `config` wins when both are set: it is
 * the one that is not deprecated.
 */
function configInput(environment) {
  const declared = optional(environment.CONFIG, "config");
  return declared !== "" ? declared : optional(environment.POLICY, "policy");
}

function assertTrustedPullRequestInputs(environment) {
  if (environment.GITHUB_EVENT_NAME !== "pull_request") return;
  const supplied = PULL_REQUEST_REFUSED_INPUTS
    .filter(([name]) => optional(environment[name], name) !== "")
    .map(([, label]) => label);
  if (supplied.length > 0) {
    fail(
      `pull_request runs must derive measurement settings from the trusted merge-base abloh.yml; ` +
      `remove Action override input${supplied.length === 1 ? "" : "s"}: ${supplied.join(", ")}`,
    );
  }
}

export function validateActionInputs(environment = process.env) {
  assertTrustedPullRequestInputs(environment);
  /* NO TIER CHECK. It was judged here because a value this boundary admitted was a value the v1
     engine acted on. Nothing acts on it now, and range-checking a number that reaches nothing would
     turn a stale line in a customer's workflow into a failed job for no gain. */
  const upload = required(environment.UPLOAD ?? "false", "upload");
  if (upload !== "true" && upload !== "false") fail("upload must be true or false");
  /*
   * UPLOAD IS ALLOWED, AND CARRIES NO LONG-LIVED CREDENTIAL.
   *
   * This used to refuse outright, on the grounds that uploading needs a token and a job running
   * customer code cannot hold one. That premise was about SHARED SECRETS. The upload below uses a
   * GitHub OIDC identity instead: minted here, scoped to one audience, valid for minutes, and
   * authorizing exactly one thing — posting evidence about this repository at this commit, which is
   * something a job that already runs the customer's tests can do regardless.
   *
   * What it still cannot do is prove ABLOH'S code did the measuring: a composite action is inlined
   * into the caller's job, so GitHub attests the repository, not the producer. The control plane
   * records no artifact digest for this path, so a certificate from it reads `standard` rather than
   * `service-verified`. The limit is stated in the grade instead of by refusing to upload at all.
   */
  if (optional(environment.PR_COMMENT, "pr-comment") !== "") {
    fail(
      "PR reporting is unavailable in the composite Action; use a separate " +
      "no-checkout privileged job or the Abloh GitHub App",
    );
  }
  const subdir = optional(environment.SUBDIR, "subdir");
  const configPath = configInput(environment);
  const image = optional(environment.ENVIRONMENT_IMAGE, "environment-image");
  const testCommand = optional(environment.TEST_COMMAND, "test-command");
  const seedValue = optional(environment.SEED, "seed");
  if (subdir !== "") canonicalRelative(subdir, "subdir");
  if (configPath !== "") canonicalRelative(configPath, "config");
  if (image !== "" && !IMAGE.test(image)) {
    fail("environment-image must be an immutable name@sha256:digest reference");
  }
  if (testCommand.startsWith("--")) fail("test-command must begin with an executable, not an option");
  if (seedValue !== "" && !SEED.test(seedValue)) fail("seed must be 1 to 64 hexadecimal characters");
  /*
   * The model gateway is OPTIONAL, and cannot be anything else here.
   *
   * Requiring it refused runs that would never have called a model: diff coverage and mutation
   * are entirely mechanical, so a tier-0 repository was stopped before its first
   * step with "model-gateway-url must be a non-empty control-free string" and could not use the
   * Action at all. Nor can this boundary decide the question by reading the tier — on a
   * pull_request event `assertTrustedPullRequestInputs` refuses a `tier` input outright, because
   * measurement settings must come from the trusted merge-base abloh.yml, which is not parsed
   * here. So the tier is unknown at exactly the moment the requirement would have to be judged.
   *
   * Absence is therefore carried through: `runAbloh` mints no identity and injects no model
   * environment. Nothing degrades silently as a result — a config file that names a hosted provider
   * fails in `resolveProvider` with "MODEL_ENDPOINT is not set", which names the missing
   * thing at the moment it is actually needed. That is a better error than this one, and it is
   * the only place with enough information to raise it.
   *
   * A gateway that IS supplied is still validated here rather than ignored: a malformed value a
   * reader believes is in force must be refused where it is written.
   */
  if (optional(environment.MODEL_GATEWAY_URL, "model-gateway-url") !== "") {
    credentialFreeHttps(environment.MODEL_GATEWAY_URL, "model-gateway-url");
    const audience = required(environment.MODEL_GATEWAY_AUDIENCE, "model-gateway-audience");
    if (audience.length > 512) fail("model-gateway-audience is too long");
  }
  /*
   * The handoff pair is checked HERE, not only in uploadEvidence.
   *
   * It used to be validated for the first time in the upload step — the last thing the Action does.
   * A half-configured handoff therefore ran the whole measurement first: baseline, coverage and
   * mutation, all of it published to a staging directory and then thrown away on
   * "handoff-audience must be a non-empty
   * control-free string". Minutes of a customer's CI spent to report a missing input that was
   * knowable before the first test ran.
   *
   * Same shape as the gateway above: no handoff configured is fine and means no upload; a URL
   * without its audience is half-configured and refused up front. uploadEvidence still validates
   * both at the point of use, because that is the boundary that must not be bypassed.
   */
  if (optional(environment.HANDOFF_URL, "handoff-url") !== "") {
    credentialFreeHttps(environment.HANDOFF_URL, "handoff-url");
    const handoffAudience = required(environment.HANDOFF_AUDIENCE, "handoff-audience");
    if (handoffAudience.length > 512) fail("handoff-audience is too long");
  }
}

function inside(root, candidate, allowRoot = true) {
  const rel = relative(root, candidate);
  if (rel === "") return allowRoot;
  return rel !== ".." && !rel.startsWith(`..${sep}`) && !isAbsolute(rel);
}

function executableOnPath(name, environment) {
  for (const entry of (environment.PATH ?? "").split(delimiter)) {
    if (entry === "") continue;
    const candidate = join(entry, name);
    try {
      accessSync(candidate, constants.X_OK);
      if (lstatSync(candidate).isFile() || lstatSync(candidate).isSymbolicLink()) return true;
    } catch {
      // Keep looking. PATH entries are allowed to be absent.
    }
  }
  return false;
}

function git(repositoryRoot, args, environment) {
  const result = spawnSync("git", ["-C", repositoryRoot, ...args], {
    encoding: "utf8",
    env: environment,
    stdio: ["ignore", "pipe", "pipe"],
  });
  if (result.error || result.status !== 0) {
    const detail = String(result.stderr ?? "").trim();
    fail(`git ${args[0] ?? "command"} failed${detail === "" ? "" : `: ${detail}`}`);
  }
  return String(result.stdout).trim();
}

/**
 * `raw` KEEPS THE BYTES GIT WROTE, and only the NUL-delimited path readers ask for it.
 *
 * Every other caller reads one sha or one ref name and wants it trimmed. A `-z` path list must not
 * be trimmed: a filename may legitimately begin with a space, and trimming the whole stream would
 * silently rename the first entry into a path that is not the one git reported - which in
 * `proveCheckoutIdentity` means a changed path that no longer matches its diverged twin.
 */
function gitQuiet(repositoryRoot, args, environment, timeoutMs = 10_000, raw = false) {
  const result = spawnSync("git", ["-C", repositoryRoot, ...args], {
    encoding: "utf8",
    env: environment,
    stdio: ["ignore", "pipe", "pipe"],
    timeout: timeoutMs,
    killSignal: "SIGKILL",
  });
  const stdout = String(result.stdout ?? "");
  return { ok: !result.error && result.status === 0, stdout: raw ? stdout : stdout.trim() };
}

/**
 * Bring the base commit into the checkout, and say what is still missing when it cannot be brought.
 *
 * WHAT THIS REPLACED, AND WHY A BETTER SENTENCE WAS NOT THE FIX. A missing base used to reach the
 * customer as `git cat-file failed: fatal: Not a valid object name <40 hex>^{commit}`; that was
 * then reworded into a refusal naming SHALLOW and `fetch-depth: 0`. Both refuse a run that could
 * have worked: `actions/checkout` clones at depth 1 by DEFAULT, so this is most real CI, and the
 * commit is one bounded fetch away on the remote the checkout already came from. It is now fetched.
 *
 * TWO QUESTIONS, not one. The object being present is not enough - `git diff base...head` needs a
 * common ancestor, and a shallow clone that was handed the base commit alone has none. Both are
 * asked, and a no to either is what deepening answers.
 *
 * WHAT STILL REFUSES: a commit on neither the runner nor the remote (a force-pushed or rewritten
 * base, where a deeper fetch cannot restore what is gone), a repository with no remote, histories
 * with no common ancestor in a full clone, and a shallow checkout still short after the ladder's
 * last rung. Each returns a SITUATION rather than a cause, and the sentence comes back finished.
 *
 * THE BOUND AND THE WORDS ARE NOT THIS FILE'S. `base-reachability-plan.generated.mjs` carries both,
 * written from `packages/core/src/base-reachability-plan.ts`, so the runner and the CLI deepen by
 * the same rungs and refuse in the same words. The git calls below are all that is local: this
 * process asks synchronously because it runs before anything asynchronous is installed.
 */
function reachBaseCommit(repositoryRoot, base, environment) {
  const hasCommit = (rev) => gitQuiet(repositoryRoot, ["cat-file", "-e", `${rev}^{commit}`], environment).ok;
  const hasMergeBase = () => {
    const probe = gitQuiet(repositoryRoot, ["merge-base", base, "HEAD"], environment);
    return probe.ok && SHA.test(probe.stdout);
  };
  const usable = () => hasCommit(base) && hasMergeBase();
  if (usable()) return { state: "already-reachable" };

  const isShallow = () =>
    gitQuiet(repositoryRoot, ["rev-parse", "--is-shallow-repository"], environment).stdout === "true";
  const remotes = gitQuiet(repositoryRoot, ["remote"], environment).stdout
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line !== "");
  const remote = remotes.includes("origin") ? "origin" : (remotes.length === 1 ? remotes[0] : null);
  if (remote === null) return baseUnreachable("no-remote", { base });

  /* Only a 40-hex SHA is ever put on a fetch command line, so no ref the caller wrote reaches
     git's argv and no local ref moves. A relative base like `HEAD~1` has no SHA to target and is
     served by the head-side deepen instead, which is exactly the history it is missing. */
  /* A SHA is its own target and must be read BEFORE rev-parse: the whole force-push case is a SHA
     that does not resolve here yet, and asking git to resolve it first would discard the one
     identifier the fetch needs. */
  const resolved = SHA.test(base)
    ? { ok: true, stdout: base }
    : gitQuiet(repositoryRoot, ["rev-parse", "--verify", `${base}^{commit}`], environment);
  const baseTarget = resolved.ok && SHA.test(resolved.stdout) ? resolved.stdout : null;
  const headProbe = gitQuiet(repositoryRoot, ["rev-parse", "--verify", "HEAD^{commit}"], environment);
  const headSha = headProbe.ok && SHA.test(headProbe.stdout) ? headProbe.stdout : null;
  const fetchCommit = (sha, depth) => gitQuiet(
    repositoryRoot,
    [
      "fetch", "--no-tags", "--no-recurse-submodules", "--quiet",
      ...(depth === null ? [] : [`--depth=${depth}`]),
      remote, sha,
    ],
    environment,
    DEEPEN_FETCH_TIMEOUT_MS,
  ).ok;

  if (!isShallow()) {
    /* A FULL clone missing the base is not a depth problem, and `--depth` here would TRUNCATE the
       history the customer already has. Either the old tip is still served - the usual case right
       after a force-push - or the commit is gone. */
    if (baseTarget === null) return baseUnreachable("full-base-unresolvable", { base });
    if (hasCommit(baseTarget)) return baseUnreachable("full-unrelated-histories", { baseSha: baseTarget });
    process.stdout.write(`Abloh: the base commit ${baseTarget} is not in this checkout; fetching it from ${remote}\n`);
    if (fetchCommit(baseTarget, null) && usable()) return { state: "deepened", depth: 0 };
    return baseUnreachable("full-commit-gone", { baseSha: baseTarget, remote });
  }

  for (const depth of DEEPEN_LADDER) {
    process.stdout.write(
      `Abloh: this checkout is SHALLOW and the base is out of reach; deepening to ${depth} ` +
      `commits per side from ${remote}\n`,
    );
    let moved = headSha === null ? false : fetchCommit(headSha, depth);
    if (!moved) {
      moved = gitQuiet(
        repositoryRoot,
        ["fetch", "--no-tags", "--no-recurse-submodules", "--quiet", `--deepen=${depth}`, remote],
        environment,
        DEEPEN_FETCH_TIMEOUT_MS,
      ).ok;
    }
    if (baseTarget !== null) fetchCommit(baseTarget, depth);
    if (usable()) return { state: "deepened", depth };
    /* A rung can bring the whole history, at which point git drops the shallow file. Deeper rungs
       would re-graft a complete checkout and there is nothing left to find. */
    if (!isShallow() || !moved) break;
  }

  if (baseTarget !== null && !hasCommit(baseTarget)) {
    return baseUnreachable("deepened-commit-gone", { baseSha: baseTarget, remote });
  }
  return baseUnreachable("deepen-exhausted", { base, depth: DEEPEN_LADDER.at(-1) });
}

/**
 * The pull-request entry point: deepen, and refuse only what deepening cannot repair.
 *
 * THE SENTENCE ARRIVES FINISHED, and that is the change of 2026-08-31. This function used to append
 * a remedy clause of its own, chosen from the cause - one for a commit that is gone, one for a spent
 * ladder, and a catch-all for everything else. The catch-all is what the divergence audit found:
 * told that their repository has no remote, or that two histories share no ancestor, a customer read
 * "Abloh cannot diff the pull request against a base it cannot reach", which restates the refusal and
 * offers nothing to do. The CLI's sentence for both of those says what to do, and there is one
 * sentence per situation now, in `base-reachability-plan.generated.mjs`.
 */
export function ensureBaseCommitReachable(repositoryRoot, base, environment) {
  const result = reachBaseCommit(repositoryRoot, base, environment);
  if (result.state !== "unreachable") return result;
  fail(result.remedy);
}

/**
 * Bring one commit into the checkout by SHA, and say whether it is there now.
 *
 * A SEPARATE FUNCTION FROM `reachBaseCommit`, deliberately. That one answers TWO questions - is the
 * object here, and is there a common ancestor - because `git diff base...head` needs both, and every
 * sentence it composes is about the base and its `fetch-depth` remedy. This one answers a third
 * question that only arises on a merge-ref checkout: the pull request's HEAD commit is a parent of
 * what is on disk, and on a shallow clone a parent is a sha in the commit object with no object
 * behind it. Nothing here needs an ancestor and nothing here has a remedy of its own - the caller
 * words the refusal, because the refusal is about the checkout rather than about the fetch.
 */
function ensureCommitPresent(repositoryRoot, sha, environment) {
  const present = () => gitQuiet(repositoryRoot, ["cat-file", "-e", `${sha}^{commit}`], environment).ok;
  if (present()) return true;
  if (!SHA.test(sha)) return false;
  const remotes = gitQuiet(repositoryRoot, ["remote"], environment).stdout
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line !== "");
  const remote = remotes.includes("origin") ? "origin" : (remotes.length === 1 ? remotes[0] : null);
  if (remote === null) return false;
  process.stdout.write(`Abloh: the pull request's head commit ${sha} is not in this checkout; fetching it from ${remote}\n`);
  gitQuiet(
    repositoryRoot,
    ["fetch", "--no-tags", "--no-recurse-submodules", "--quiet", "--depth=1", remote, sha],
    environment,
    DEEPEN_FETCH_TIMEOUT_MS,
  );
  return present();
}

/**
 * The parents of a commit, read out of its own object.
 *
 * `cat-file -p` AND NOT `rev-list --parents`. A shallow checkout is GRAFTED, and grafting hides a
 * commit's parents from every traversal command - on `actions/checkout`'s default depth of 1,
 * `git rev-list --parents -n 1 HEAD` reports HEAD with no parents at all and `HEAD^1` does not
 * resolve. The raw object is unchanged: grafting suppresses the parents, it does not rewrite the
 * commit. So the lineage proof reads the bytes git stored, which is also the strongest form of it.
 */
function commitParents(repositoryRoot, rev, environment) {
  const raw = gitQuiet(repositoryRoot, ["cat-file", "-p", `${rev}^{commit}`], environment);
  if (!raw.ok) return [];
  const parents = [];
  for (const line of raw.stdout.split("\n")) {
    /* The header ends at the first blank line; a `parent` word in the commit MESSAGE is not one. */
    if (line.trim() === "") break;
    const match = /^parent ([0-9a-f]{40})$/u.exec(line);
    if (match !== null) parents.push(match[1]);
  }
  return parents;
}


/**
 * WAS A DIAGNOSTIC SWEEP ASKED FOR?
 *
 * A BOOLEAN INPUT READ STRICTLY, because the two ways YAML users write "off" - `false` and the
 * empty string - must both mean off, and anything else must be an error rather than a truthy string.
 * The Action's other boolean, `record-loopback`, is compared against the literal `'true'` for the
 * same reason.
 */
export function sweepRequested(environment = process.env) {
  const value = optional(environment.SWEEP, "sweep").toLowerCase();
  if (value === "" || value === "false") return false;
  if (value === "true") return true;
  fail("sweep must be 'true' or 'false'");
}

/**
 * THE TWO BOUNDARY REFUSALS A SWEEP MAY RUN PAST, and nothing else (Kenneth, 2026-08-29).
 *
 * THE RULING. A sweep MAY run after an IDENTITY-class boundary refusal - the checkout is not the
 * commit the pull request names, or the runtime is older than Abloh supports - recorded as a
 * clearly-labelled non-attesting diagnostic, with the refusal logged first. It must NEVER run after
 * a seal-integrity refusal.
 *
 * WHY THE LINE IS THERE. An identity refusal says "Abloh cannot tell you this is the code you think
 * it is". Everything downstream of it is still real: the tree exists, the suite is installed, and
 * walking the stages over it tells a maintainer which of them would have worked. Nothing is
 * attested, so nothing false can be said. A SEAL-INTEGRITY refusal is the opposite: the event is
 * wrong, an input is trying to weaken the measurement, a secret was handed to the Action, the output
 * paths overlap the repository. Those are the conditions under which running ANYTHING is the
 * mistake - and a diagnostic that ran past one would be the product doing the thing it refused.
 *
 * AN ALLOW-LIST AND NEVER A DENY-LIST. "Identity-class only" means a refusal that is not on this
 * list stops the run, including one added tomorrow by somebody who has not read this comment.
 */
const IDENTITY_CLASS_REFUSALS = ["checkout-identity", "node-runtime-version"];

/**
 * THE CONTRACT FOR `cli-tarball`: THE PULL REQUEST MAY NOT CHOOSE THE PROGRAM THAT MEASURES IT.
 *
 * WHAT THIS FIXES (assumption audit, 2026-08-29, rank 19 / AUTH-18). Every other input that could
 * weaken a measurement is on {@link PULL_REQUEST_REFUSED_INPUTS} and is refused outright on a pull
 * request. `cli-tarball` was not on it - and it is strictly more powerful than any of them. It
 * names npm specs the Action installs into a private prefix and then EXECUTES as `bin/abloh`, with
 * the renamed OIDC request URL and token in its environment and with its output trusted as this
 * run's evidence. A contributor who could set it could mint identities in the repository's name and
 * author a green result for code nobody measured.
 *
 * WHY IT IS NOT SIMPLY REFUSED. This Action runs on `pull_request` and on nothing else - `preflight`
 * refuses every other event - so "restrict it to non-PR contexts" and "delete the input" are the
 * same change, and the input has one real consumer: the first-contact census, which measures local
 * `main` builds in forks it owns (`apps/study-live`). Deleting it would silently move that
 * instrument onto the PUBLISHED CLI, which is not the lineage it reports.
 *
 * SO THE RULE BINDS THE SOURCE INSTEAD OF THE VALUE, using the trust boundary the rest of this file
 * already uses: the MERGE BASE is a fact the pull request cannot write, and the pull request's own
 * diff is what it can. A `cli-tarball` is admitted only when the pull request changes NO CI
 * DEFINITION - nothing under `.github/`, and no `action.yml`/`action.yaml` anywhere - because those
 * are the files that can introduce the input or a local action that passes it. The value in the
 * running workflow then came from the base branch, which is the same authority the trusted
 * merge-base `abloh.yml` has. The census satisfies this by construction: it commits the edited
 * workflow to the fork's DEFAULT BRANCH and its head branch reverts a source fix and nothing else.
 *
 * IT IS NOT AIRTIGHT AND SAYS SO. A local action invoked from an unchanged workflow but living
 * outside `.github/` would not be caught by a path rule. What closes that completely is removing the
 * public input and confining overrides to a separately trusted workflow that binds the CLI package
 * digest, which is a release-shaped change rather than a boundary check.
 */
const CI_DEFINITION_BASENAMES = new Set(["action.yml", "action.yaml"]);

function changesCiDefinition(path) {
  return path.startsWith(".github/") || CI_DEFINITION_BASENAMES.has(basename(path));
}

/**
 * Admit the `cli-tarball` this run may use, or refuse the run.
 *
 * Returns the admitted value - empty when nothing was asked for - so `action.yml` can hand the
 * INSTALL step the string this boundary approved rather than the raw input. One decision, one home.
 */
function admitCliOverride(repositoryRoot, baseSha, headSha, environment) {
  const requested = optional(environment.CLI_TARBALL, "cli-tarball");
  if (requested === "") return "";
  if (environment.GITHUB_EVENT_NAME !== "pull_request") return requested;
  const diff = gitQuiet(
    repositoryRoot,
    ["diff", "--no-renames", "-z", "--name-only", `${baseSha}...${headSha}`],
    environment,
    60_000,
    true,
  );
  if (!diff.ok) {
    fail(
      "cli-tarball names the program that measures this pull request, and Abloh could not read " +
      "which files the pull request changes to decide whether that program came from the base " +
      "branch; remove the input",
    );
  }
  const touched = diff.stdout.split("\0").filter((path) => path !== "").filter(changesCiDefinition);
  if (touched.length > 0) {
    fail(
      "cli-tarball chooses the program that measures this pull request and receives Abloh's " +
      "identity, so it may only come from the base branch. This pull request changes " +
      `${touched.slice(0, 5).join(", ")}${touched.length > 5 ? ", and more" : ""}, so its value ` +
      "cannot be trusted; remove the input, or land the CI change on the base branch first",
    );
  }
  return requested;
}

/**
 * READ THE FACTS, DECIDE, AND REFUSE WHAT CANNOT BE PROVEN.
 *
 * THE GIT READS HAPPEN HERE AND THE DECISION HAPPENS IN CORE. `classifyPullRequestCheckout` and
 * `MERGE_REF_REMEDY` arrive from `merge-ref-checkout.generated.mjs`, which is
 * `packages/core/src/merge-ref-checkout.ts` written into this tree - so the rule the runner applies
 * and the rule the CLI applies are one rule rather than two that agree today. Only the cheap reads
 * run on the ordinary path: an exact head checkout is two `rev-parse`s and nothing else, which is
 * what it was before this existed.
 */
function proveCheckoutIdentity(repositoryRoot, checkoutSha, headSha, baseSha, environment) {
  const triggerSha = optional(environment.GITHUB_SHA_VALUE, "GITHUB_SHA");
  if (checkoutSha === headSha) return classifyPullRequestCheckout({
    checkoutSha, headSha, baseSha,
    triggerSha: triggerSha === "" ? null : triggerSha,
    parents: [], changedPaths: [], divergedPaths: [],
  });

  /* THE HEAD COMMIT'S OBJECT, which a shallow merge-ref checkout does not have: it is a parent, and
     a parent of a grafted commit is a sha with nothing behind it. Both diffs below need it, and so
     does the CLI's own `--head` check afterwards. */
  if (!ensureCommitPresent(repositoryRoot, headSha, environment)) {
    return {
      kind: "unproven",
      conflicts: [],
      reason:
        `the checkout is ${checkoutSha.slice(0, 12)} rather than this pull request's head ` +
        `${headSha.slice(0, 12)}, and that commit is in neither this checkout nor its remote`,
    };
  }
  /*
   * `--no-renames -z`, AND BOTH FLAGS ARE THE SOUNDNESS OF GATE (3) RATHER THAN TIDINESS.
   *
   * `--no-renames` (assumption audit, 2026-08-29, rank 25). Git detects renames by default, and the
   * two lists below are then written in DIFFERENT NAMES for the same bytes. Build the real thing:
   * an ancestor holding `old.txt`, a base that renames it to `new.txt`, a head that edits
   * `old.txt`, and GitHub's clean merge that carries the edit into `new.txt`. `base...head` reports
   * `old.txt`; `head..merge` reports the rename as `new.txt`. The intersection is EMPTY, so the
   * checkout is admitted as `merge-ref` - and the tree it admitted does not contain `old.txt` at
   * all. The evidence then claims to cover a pull-request path that was never executed, which is
   * the one thing gate (3) exists to prevent. With rename detection off the same case reports both
   * `old.txt` and `new.txt` on the diverged side, the intersection is `old.txt`, and the checkout
   * is refused with the remedy. Rename detection can only ever HIDE a path from this comparison,
   * so turning it off is strictly the safe direction.
   *
   * `-z` (the same read, the same soundness). Without it git QUOTES a path containing a newline,
   * a quote or a backslash, and the reader splits that one path into two names that match nothing.
   * A file whose name carries a newline would therefore drop out of the intersection - the same
   * false admission by a different route. NUL-delimited output cannot be quoted and cannot split.
   */
  const names = (args) => {
    const result = gitQuiet(
      repositoryRoot,
      ["diff", "--no-renames", "-z", "--name-only", ...args],
      environment,
      60_000,
      true,
    );
    return result.ok ? result.stdout.split("\0").filter((path) => path !== "") : null;
  };
  const changedPaths = names([`${baseSha}...${headSha}`]);
  const divergedPaths = names([headSha, checkoutSha]);
  if (changedPaths === null || divergedPaths === null) {
    return {
      kind: "unproven",
      conflicts: [],
      reason: `Abloh could not compare the checkout ${checkoutSha.slice(0, 12)} with this pull request's head`,
    };
  }
  return classifyPullRequestCheckout({
    checkoutSha, headSha, baseSha,
    triggerSha: triggerSha === "" ? null : triggerSha,
    parents: commitParents(repositoryRoot, checkoutSha, environment),
    changedPaths,
    divergedPaths,
  });
}

function appendOutput(path, fields) {
  const output = required(path, "GITHUB_OUTPUT");
  const info = lstatSync(output);
  if (info.isSymbolicLink() || !info.isFile()) fail("GITHUB_OUTPUT must be a regular non-symlink file");
  const noFollow = constants.O_NOFOLLOW ?? 0;
  const handle = openSync(output, constants.O_WRONLY | constants.O_APPEND | noFollow, 0o600);
  try {
    for (const [name, value] of Object.entries(fields)) {
      if (!/^[a-z][a-z0-9-]*$/u.test(name) || CONTROL.test(value)) {
        fail("refusing an unsafe GitHub output field");
      }
      // Values produced here are canonical paths, booleans, or commit SHAs. All are one line.
      writeAll(handle, `${name}=${value}\n`);
    }
  } finally {
    closeSync(handle);
  }
}

/**
 * Append validated `NAME=value` records to `$GITHUB_ENV`, one line each.
 *
 * A SEPARATE DOOR FROM `appendOutput` because the two files have different name shapes - step
 * outputs are lowercase-dashed, environment records are upper snake - and because this one is the
 * file that decides what EVERY LATER STEP OF THE JOB sees. It shares `writeAll` and the no-follow
 * open for the reason that function exists: a shell redirection here would follow a symlink and
 * would append whatever the shell interpolated.
 *
 * THE ONE-LINE RULE IS THE POINT (assumption audit, 2026-08-29, rank 11 / FS-03). `>> "$GITHUB_ENV"`
 * in bash writes whatever it was handed, so a value carrying a newline writes TWO records and the
 * second one is a variable nobody declared. The values written here come from ambient `ABLOH_DEV_*`
 * overrides, which any earlier step of the customer's job can set, so the newline is reachable.
 * `CONTROL` rejects every C0 character, `\n` among them, before a byte is written.
 */
function appendEnvironmentFile(path, fields) {
  const file = required(path, "GITHUB_ENV");
  const info = lstatSync(file);
  if (info.isSymbolicLink() || !info.isFile()) fail("GITHUB_ENV must be a regular non-symlink file");
  const noFollow = constants.O_NOFOLLOW ?? 0;
  const handle = openSync(file, constants.O_WRONLY | constants.O_APPEND | noFollow, 0o600);
  try {
    for (const [name, value] of Object.entries(fields)) {
      if (!/^[A-Z][A-Z0-9_]*$/u.test(name)) fail("refusing an unsafe GitHub environment name");
      if (CONTROL.test(value)) fail(`${name} must not contain control characters`);
      writeAll(handle, `${name}=${value}\n`);
    }
  } finally {
    closeSync(handle);
  }
}

/**
 * Validate an HTTPS endpoint and hand back THE STRING THAT WAS SUPPLIED.
 *
 * NOT `URL.toString()`, which normalises - it would turn the published `https://abloh.dev` into
 * `https://abloh.dev/` and quietly change a value the control plane compares against.
 */
function validatedHttpsValue(value, label) {
  credentialFreeHttps(value, label);
  return value;
}

/**
 * The environment-variable prefix each door is named by, and the ONLY place that naming is decided.
 *
 * The variable names are this Action's own override interface rather than part of the contract, so
 * they live here - but there is one mapping and three readers: the resolver below, the ambient-
 * override refusal, and the rehearsal rig, which imports the contract and keeps its own copy of
 * these prefixes. A door added to the contract with no entry here resolves to nothing, which is why
 * `resolveControlPlane` refuses rather than skipping it.
 */
export const DOOR_VARIABLE = {
  handoff: "HANDOFF",
  modelGateway: "MODEL_GATEWAY",
  liveProgress: "LIVE_PROGRESS",
  checkAdmission: "CHECK_ADMISSION",
  setupTrial: "SETUP_TRIAL",
};

/**
 * WHERE THIS RUN REPORTS TO, decided here rather than by a shell interpolation.
 *
 * The endpoints and audiences are constants of the deployment, and they are NOT WRITTEN HERE. They
 * come from `deployment-contract.generated.mjs`, which the control plane's own route and audience
 * table generates - because this Action and that service are released separately, and an address
 * spelled twice is an address that can be spelled differently. The undocumented `ABLOH_DEV_*`
 * overrides exist so our own tunnelled control plane can run this same Action from a branch. They
 * are ambient, so any earlier step of the customer's job can set them - which is why every one is
 * parsed as credential-free HTTPS or as a bounded control-free audience BEFORE it becomes a record
 * every later step inherits. See `appendEnvironmentFile` for the record the newline used to write.
 */
export function resolveControlPlane(environment = process.env) {
  const pick = (override, fallback) => {
    const supplied = environment[override];
    return supplied === undefined || supplied === "" ? fallback : supplied;
  };
  const url = (override, fallback) =>
    validatedHttpsValue(pick(override, fallback), override.toLowerCase().replaceAll("_", "-"));
  const audience = (override, fallback) => {
    const value = required(pick(override, fallback), override);
    if (value.length > 512) fail(`${override} is too long`);
    return value;
  };
  /* One door becomes one URL variable and one audience variable, named for the door. Every door in
     the contract, so a door added to the service reaches this record without an edit here - and one
     the mapping above does not name STOPS the job, because resolving it to nothing would silently
     leave that call pointed at whatever the generated default is. */
  const resolved = { COMMAND_CENTER_ORIGIN: url("ABLOH_DEV_COMMAND_CENTER_ORIGIN", COMMAND_CENTER_ORIGIN) };
  for (const [name, door] of Object.entries(CONTROL_PLANE)) {
    const prefix = DOOR_VARIABLE[name];
    if (prefix === undefined) fail(`the deployment contract names a control-plane door this Action cannot resolve: ${name}`);
    resolved[`${prefix}_URL`] = url(`ABLOH_DEV_${prefix}_URL`, door.url);
    resolved[`${prefix}_AUDIENCE`] = audience(`ABLOH_DEV_${prefix}_AUDIENCE`, door.audience);
  }
  return resolved;
}

// Isolated to make it impossible to accidentally use a shell redirection for GITHUB_OUTPUT.
function writeAll(handle, value) {
  const bytes = Buffer.from(value, "utf8");
  let offset = 0;
  while (offset < bytes.length) {
    const written = writeSync(
      handle,
      bytes,
      offset,
      bytes.length - offset,
    );
    offset += written;
  }
}

function privateDirectory(parent, parts, leafMustBeNew = false) {
  const canonicalParent = realpathSync(required(parent, "RUNNER_TEMP"));
  if (!lstatSync(canonicalParent).isDirectory()) fail("RUNNER_TEMP must be a directory");
  let current = canonicalParent;
  for (const [index, part] of parts.entries()) {
    if (!/^[A-Za-z0-9._-]+$/u.test(part) || part === "." || part === "..") {
      fail("private staging path contains an unsafe segment");
    }
    const next = join(current, part);
    const existed = existsSync(next);
    if (leafMustBeNew && index === parts.length - 1 && existed) {
      fail(`private staging leaf already exists: ${next}`);
    }
    if (!existed) mkdirSync(next, { mode: 0o700 });
    const info = lstatSync(next);
    if (info.isSymbolicLink() || !info.isDirectory()) {
      fail(`private staging path is not a real directory: ${next}`);
    }
    const canonical = realpathSync(next);
    if (!inside(canonicalParent, canonical, false)) fail("private staging path escaped RUNNER_TEMP");
    chmodSync(canonical, 0o700);
    current = canonical;
  }
  return current;
}

function requireWorkingCommand(command, args, environment, message) {
  const result = spawnSync(command, args, {
    env: environment,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  if (result.error || result.status !== 0) fail(message);
}

/**
 * THE FLOOR, READ OFF THE PUBLISHED CLI RATHER THAN RESTATED HERE.
 *
 * The Action refuses a runtime before it installs `@abloh/cli`, so the version it refuses on has to
 * be the version that package says it supports - `engines.node` in `apps/cli/package.json`, which is
 * also what npm enforces on a direct install. This Action used to carry its own `>=20.6` in a
 * comparison and again in a sentence, so raising the CLI's floor would have left the Action
 * installing a package neither of them could run, on the customer's runner rather than ours.
 *
 * ONLY `>=major.minor` IS UNDERSTOOD, AND ANYTHING ELSE ADMITS NOTHING. This file has no `semver` to
 * hand and never will: it runs from a bare checkout with nothing installed. A manifest declaring a
 * range shape this cannot enforce is a release mistake, and the safe reading of a floor nobody can
 * evaluate is that no runtime clears it - so an unparseable range refuses every version through the
 * one refusal this check already has, rather than silently admitting all of them.
 */
function nodeFloor(range = CLI_NODE_RANGE) {
  const text = String(range).trim();
  const match = /^>=\s*(\d+)\.(\d+)(?:\.\d+)?$/u.exec(text);
  if (match === null) return { major: Infinity, minor: Infinity, text };
  return { major: Number(match[1]), minor: Number(match[2]), text };
}

export function supportedNodeVersion(version) {
  const match = /^v?(\d+)\.(\d+)\.(\d+)(?:[-+].*)?$/u.exec(version ?? "");
  if (match === null) return false;
  const major = Number(match[1]);
  const minor = Number(match[2]);
  const floor = nodeFloor();
  return major > floor.major || (major === floor.major && minor >= floor.minor);
}

export function assertSupportedNodeVersion(version = process.versions.node) {
  if (!/^v?\d+\.\d+\.\d+(?:[-+].*)?$/u.test(version ?? "")) {
    fail("cannot determine the prepared Node runtime version");
  }
  if (!supportedNodeVersion(version)) {
    fail(`Node ${version} is unsupported; Abloh could not provision a Node ${nodeFloor().text} runtime of its own`);
  }
}

/**
 * THE NODE ABLOH INSTALLS FOR ITSELF when the runtime it was handed is older than it can run on.
 *
 * PINNED TO AN EXACT VERSION, for the reason `DEFAULT_CLI_SPEC` is: a range resolved at run time
 * would move the runtime this Action's own code executes on without anybody releasing anything, and
 * this pin is what makes "the same Abloh ran" a statement somebody can check.
 *
 * 22, because that is the major this repository's own CI runs and the major the CLI is built and
 * tested on. THE FLOOR IS A DIFFERENT FACT AND A DIFFERENT OWNER: `supportedNodeVersion` reads it
 * out of the published CLI's `engines.node`, and a customer whose job already prepared a runtime at
 * or above it keeps that runtime, with nothing here installed at all.
 */
export const ABLOH_NODE_SPEC = "node@22.23.2";

/**
 * PUT A NODE ABLOH CAN RUN ON UNDER THIS PROCESS'S CONTROL, and say where it is.
 *
 * WHY THIS EXISTS (postflip census, 2026-08-29). `alibaba/formily` was lost here and it is the whole
 * argument in one row. Their `ci.yml` runs `actions/setup-node@v1` with no version, which leaves the
 * runner on Node 16.20.2. The borrow road appends abloh's step to THEIR job, so abloh inherited that
 * runtime, and the preflight's own floor check refused: `Node 16.20.2 is unsupported; set up the
 * repository's Node >=20.6 runtime before Abloh`. That sentence was true and it was the wrong
 * mechanism - it asked a maintainer to change how their build runs so that a tool they had not
 * merged yet could run, which is precisely what appending one step is not a mandate to do.
 *
 * SO ABLOH BRINGS ITS OWN. The runtime the CUSTOMER prepared is theirs and is left exactly as it
 * was: nothing is written to `$GITHUB_PATH`, so their `node` is still the `node` every step of
 * theirs resolves, and the cold-lane setup script on the fallback road still runs under the Node
 * their workflow declared. What changes is which binary executes ABLOH's own code - this boundary,
 * and the CLI, which is spawned with this process's `execPath` rather than through a shebang.
 *
 * MEASUREMENT IS UNAFFECTED, and that is why this is safe rather than merely convenient. The suite
 * runs inside the sealed container, under `environment.runtimeImage`, and never under the runner's
 * Node at all. This one only decides what the orchestration runs on.
 *
 * THE FAST PATH IS NOT A COMPROMISE. A job that already prepared a runtime at or above the floor
 * gets no install:
 * abloh's requirement is met, and spending 5 seconds and a registry fetch of every customer's run to
 * replace a runtime that already satisfies the floor is a tax with nothing bought. What makes this
 * "abloh's own" is that ABLOH asks the question and ABLOH answers it, not that a download always
 * happens.
 *
 * FROM npm, PINNED, AND NOT FROM A THIRD-PARTY ACTION - the one-recipe ruling's own source (Kenneth,
 * 2026-08-27, `packages/core/src/setup-template.ts`). `actions/setup-node` would be the shorter line
 * and it writes `$GITHUB_PATH`, which is exactly the thing this must not do.
 *
 * INSTALL SCRIPTS RUN HERE, WHERE `installCli` FORBIDS THEM, and the difference is what is being
 * installed. The CLI is JavaScript, which npm places by itself, so its scripts are pure risk. A
 * RUNTIME is a platform binary and `node-bin-setup` placing it IS the install - `--ignore-scripts`
 * leaves `node_modules/.bin` empty. The exposure is bounded the same way either way: an exact pinned
 * version, a private prefix under RUNNER_TEMP, and every secret in INSTALL_SECRETS stripped from the
 * environment the install runs in.
 *
 * A JOB WITH NO NODE AT ALL STILL REFUSES, and the refusal is the one it always gave. There is no
 * npm on such a runner either, so there is nothing to install with; reaching for a tarball off
 * nodejs.org would be a second supply chain for a shape this census did not produce.
 */
export function provisionNodeRuntime(environment = process.env) {
  if (supportedNodeVersion(process.versions.node)) {
    return { path: process.execPath, installed: false };
  }
  const runId = required(environment.GITHUB_RUN_ID, "GITHUB_RUN_ID");
  const runAttempt = required(environment.GITHUB_RUN_ATTEMPT, "GITHUB_RUN_ATTEMPT");
  if (!RUN_NUMBER.test(runId) || !RUN_NUMBER.test(runAttempt)) fail("run id and attempt must be positive integers");
  process.stdout.write(
    `Abloh: this job prepared Node ${process.versions.node}, which Abloh cannot run on; installing ` +
    `${ABLOH_NODE_SPEC} for Abloh's own steps and leaving your runtime exactly as it is\n`,
  );
  const prefix = privateDirectory(environment.RUNNER_TEMP, [
    "abloh-node",
    `${runId}-${runAttempt}`,
  ], true);
  const installEnvironment = { ...environment };
  for (const key of INSTALL_SECRETS) delete installEnvironment[key];
  const install = spawnSync(
    "npm",
    ["install", "--no-save", "--no-audit", "--no-fund", "--prefix", prefix, "--", ABLOH_NODE_SPEC],
    { env: installEnvironment, stdio: "inherit" },
  );
  if (install.error || install.status !== 0) {
    fail(`npm could not install ${ABLOH_NODE_SPEC} (exit ${install.status ?? "unknown"})`);
  }
  const placed = join(prefix, "node_modules", ".bin", "node");
  if (!existsSync(placed)) fail(`${ABLOH_NODE_SPEC} did not place a node executable`);
  accessSync(placed, constants.X_OK);
  const target = realpathSync(placed);
  if (!inside(prefix, target, false) || !lstatSync(target).isFile()) {
    fail("the installed node executable resolves outside its private prefix");
  }
  /* ASKED, NOT ASSUMED. The pin says which version was requested and this is the version that
     answers when the binary is run - one `--version` against the same floor the fast path passes,
     so a prefix that resolved to something else cannot become the runtime everything below uses. */
  const reported = spawnSync(target, ["--version"], {
    encoding: "utf8",
    env: installEnvironment,
    stdio: ["ignore", "pipe", "pipe"],
  });
  if (reported.error || reported.status !== 0) fail("the installed node executable would not run");
  assertSupportedNodeVersion(String(reported.stdout).trim());
  return { path: target, installed: true };
}

export function preflight(environment = process.env) {
  if (environment.GITHUB_EVENT_NAME === "pull_request_target") {
    fail("pull_request_target is unsafe because untrusted pull-request code can receive base-repository secrets; use pull_request");
  }
  for (const tool of ["git", "node", "npm", "docker"]) {
    if (!executableOnPath(tool, environment)) fail(`${tool} must be installed before Abloh`);
  }
  assertSupportedNodeVersion();
  requireWorkingCommand("npm", ["--version"], environment, "npm must work before Abloh");
  requireWorkingCommand(
    "docker",
    ["info", "--format", "{{.ServerVersion}}"],
    environment,
    "Docker must have a reachable daemon before isolated HEAD/fault proofs",
  );
  validateActionInputs(environment);
  const workspace = realpathSync(required(environment.GITHUB_WORKSPACE, "GITHUB_WORKSPACE"));
  const repoPath = canonicalRelative(environment.REPO_PATH ?? ".", "repo-path", true);
  const lexicalRepository = resolve(workspace, repoPath);
  if (!inside(workspace, lexicalRepository)) fail("repo-path must stay inside GITHUB_WORKSPACE");
  if (!existsSync(lexicalRepository)) fail("repo-path does not exist");
  const requestedDirectory = realpathSync(lexicalRepository);
  if (!inside(workspace, requestedDirectory)) fail("repo-path resolves outside GITHUB_WORKSPACE");
  if (!lstatSync(requestedDirectory).isDirectory()) fail("repo-path must name a directory");
  const repositoryRoot = realpathSync(
    git(requestedDirectory, ["rev-parse", "--show-toplevel"], environment),
  );
  if (!inside(workspace, repositoryRoot) || !inside(repositoryRoot, requestedDirectory)) {
    fail("discovered Git repository must stay inside GITHUB_WORKSPACE and contain repo-path");
  }

  /*
   * ABLOH MEASURES PULL REQUESTS. Every other event is refused here (Kenneth, 2026-08-21).
   *
   * A push run used to be admitted, resolving its own base from the `base` input because a push
   * carries no base of its own. That path is gone: the customer had to nominate what to diff
   * against, every answer was a guess about intent the Action could not check, and the run that
   * came out of it measured a range nobody had asked a question about. A pull request states its
   * own base as a fact, which is why it is the only shape this measures.
   *
   * REFUSED AT THE BOUNDARY, not downstream. The CLI and the control plane refuse a run with no
   * pull request too, but a workflow that fails after cloning, installing and measuring has spent
   * a customer's minutes to reach the same answer this sentence gives immediately.
   */
  const eventName = required(environment.GITHUB_EVENT_NAME, "GITHUB_EVENT_NAME");
  if (eventName !== "pull_request") {
    fail("Abloh measures pull requests; run this on pull_request events");
  }
  const declaredBase = optional(environment.DECLARED_BASE, "base");
  const expectedHead = sha(environment.PR_HEAD_SHA, "pull-request head");
  const effectiveBase = sha(environment.PR_BASE_SHA, "pull-request base");

  const actualHead = git(repositoryRoot, ["rev-parse", "--verify", "HEAD^{commit}"], environment);
  /*
   * THE BASE FIRST, BECAUSE THE IDENTITY PROOF DIFFS AGAINST IT.
   *
   * It used to run after the head check, which was fine when that check was one string comparison.
   * `proveCheckoutIdentity` takes `git diff --name-only base...head`, so the base commit has to be
   * on the runner before it is asked - and on `actions/checkout`'s default depth it is not.
   */
  ensureBaseCommitReachable(repositoryRoot, effectiveBase, environment);
  /*
   * WHAT IS ON DISK, AND WHETHER IT IS THIS PULL REQUEST.
   *
   * WHAT THIS REPLACED (postflip census, 2026-08-29). One equality: `actualHead !== expectedHead` ->
   * `exact pull-request head required`. That refused six of the fourteen borrow-road repositories,
   * and every one of them was ordinary CI - `actions/checkout` with no `ref:` checks out
   * `refs/pull/N/merge`, and the borrow road appends Abloh's step to the maintainer's own job, so
   * Abloh inherits that checkout. A rule that refuses the default shape of the thing it measures is
   * the wrong rule, however true its sentence is.
   *
   * WHAT THE BOUNDARY PROVES INSTEAD is written whole in `packages/core/src/merge-ref-checkout.ts`,
   * beside the copy of the decision this file mirrors. In one sentence: the checkout is GitHub's own
   * merge of exactly this pull request's head into exactly its declared base, it is the commit
   * GitHub started this run on, and every file the pull request changes carries the head commit's
   * own bytes - so the changed lines being measured ARE head's lines, and evidence labelled with the
   * head sha is evidence about the head sha. The seal is unchanged: `head` below is still the pull
   * request's head commit and never the merge, which is what keeps the check run, the artifact's
   * `target.sha` and the control plane's `provenance.headSha` all naming a commit on the branch.
   */
  const identity = proveCheckoutIdentity(repositoryRoot, actualHead, expectedHead, effectiveBase, environment);
  /* WHOSE CLI THIS RUN INSTALLS, decided here and nowhere else. Read {@link admitCliOverride} for
     why the answer is a fact about the pull request's diff rather than about the input's value. It
     is asked before any private staging is created, because a refusal about WHO measures should
     cost nothing beyond the reads that were already needed. */
  const admittedCliTarball = admitCliOverride(repositoryRoot, effectiveBase, expectedHead, environment);
  /*
   * AND THE ONE PLACE A REFUSAL MAY BE SWEPT PAST (Kenneth's ruling, 2026-08-29).
   *
   * `checkout-identity` is an IDENTITY-class refusal: Abloh cannot say the tree in front of it is
   * the commit the pull request names. A sweep asked for explicitly may still walk the stages over
   * that tree, because a sweep attests nothing - and what it produces is the ledger a maintainer or
   * a census needs to see which stages would have worked. The refusal is LOGGED FIRST, so the log
   * reads as "this was refused, and here is a diagnostic about it" rather than as a run that
   * happened. See {@link IDENTITY_CLASS_REFUSALS} for why nothing else is on that list.
   */
  const sweep = sweepRequested(environment);
  let precedingRefusal = null;
  if (identity.kind === "unproven") {
    const sentence = `${identity.reason}. ${MERGE_REF_REMEDY}`;
    if (!sweep) fail(sentence);
    process.stderr.write(`Abloh Action boundary: ${sentence}\n`);
    process.stdout.write(
      "Abloh: THIS RUN ATTESTS NOTHING. The refusal above stands and no evidence will be produced " +
      "or uploaded. A diagnostic sweep was asked for, so Abloh walks its stages over the tree that " +
      "is here and writes a wall ledger saying which of them would have worked.\n",
    );
    precedingRefusal = { class: IDENTITY_CLASS_REFUSALS[0], reason: identity.reason, remedy: MERGE_REF_REMEDY };
  }
  if (identity.kind === "merge-ref") {
    process.stdout.write(
      `Abloh: this job checked out ${actualHead.slice(0, 12)}, GitHub's merge of this pull request ` +
      `into ${effectiveBase.slice(0, 12)}. Every file the pull request changes is byte-identical to ` +
      `head ${expectedHead.slice(0, 12)}, so that is the commit this run measures and reports.\n`,
    );
  }
  /* The `base` input is still accepted on a pull_request event, and it is still only ever a
     CHECK: it must agree with the base GitHub reported, or the run refuses. It cannot select a
     base, which is what made it dangerous on the push path that has now gone. */
  if (declaredBase !== "") {
    if (declaredBase.startsWith("-")) fail("base must not begin with '-'");
    const declaredSha = git(
      repositoryRoot,
      ["rev-parse", "--verify", `${declaredBase}^{commit}`],
      environment,
    );
    if (declaredSha !== effectiveBase) {
      fail(`declared base resolves to ${declaredSha}, but the pull-request base is ${effectiveBase}`);
    }
  }

  const runId = required(environment.GITHUB_RUN_ID, "GITHUB_RUN_ID");
  const runAttempt = required(environment.GITHUB_RUN_ATTEMPT, "GITHUB_RUN_ATTEMPT");
  if (!RUN_NUMBER.test(runId) || !RUN_NUMBER.test(runAttempt)) fail("run id and attempt must be positive integers");
  const runnerTemp = realpathSync(required(environment.RUNNER_TEMP, "RUNNER_TEMP"));
  for (const candidate of [
    join(runnerTemp, "abloh", `${runId}-${runAttempt}`),
    join(runnerTemp, "abloh-state", `${runId}-${runAttempt}`),
    join(runnerTemp, "abloh-cli", `${runId}-${runAttempt}`),
  ]) {
    if (inside(repositoryRoot, candidate) || inside(candidate, repositoryRoot)) {
      fail("Action-owned output, state, and CLI paths must not overlap the measured repository");
    }
  }
  const outputDirectory = privateDirectory(environment.RUNNER_TEMP, [
    "abloh",
    `${runId}-${runAttempt}`,
  ], true);

  const stateDirectory = privateDirectory(environment.RUNNER_TEMP, [
    "abloh-state",
    `${runId}-${runAttempt}`,
  ], true);
  const baselineDirectory = join(stateDirectory, "baseline-history");
  // Deliberately fresh on every run, never restored from GitHub cache: cache contents are
  // repository-controlled and a self-authored receipt cannot make restored executable code
  // trusted. The RUN populates it within THIS run - a vitest repository with no
  // `@vitest/coverage-v8` has the pair staged into it by the measuring process itself, with npm and
  // with lifecycle scripts disabled, receipt-validated by the CLI before use. There used to be a
  // separate "Prepare coverage provider cache" step for that, running a customer command called
  // `abloh prepare`; the captain retired it on 2026-09-02 (census run 4's F5) because a workspace
  // package the step's own walk could not classify was staged for by nobody, and the run then
  // refused for a provider its remedy told the maintainer to install with the command that had just
  // run. This variable is what still confines the cache to `RUNNER_TEMP` and stops the CLI
  // consulting a user-level cache outside the Action boundary.
  const coverageCacheDirectory = join(stateDirectory, "coverage-providers-fresh");
  /*
   * THE V2 ENGINE'S PER-REPOSITORY STATE: the carry-forward store, the predictor's described
   * outcomes, pool 2's pinned bugs and the line map.
   *
   * RESTORED FROM THE GITHUB CACHE, unlike the coverage provider directory two lines above - and the
   * difference between the two is the whole argument, so it is written down rather than left to be
   * inferred from which one has a restore step.
   *
   * The coverage directory holds EXECUTABLE CODE that this run will run. Restoring it means running
   * whatever a repository-controlled cache contained, and no receipt this process writes can make
   * that trusted. This directory holds DATA whose only use is bounded by rules that hold whatever
   * the data says: a carried triage verdict can only ever keep a gap open, because a verdict that
   * would remove one is re-asked live every run; a carried candidate is proposed source that is
   * executed, proved and suite-checked fresh here; a stored prediction only chooses what to spend
   * execution on, never what to report. Every record is re-validated on read and the store says
   * which repository wrote it, because `restore-keys` is a prefix match and can hand this run
   * another checkout's file.
   *
   * Without this, no v2 store survives a run at all: the predictor, pool 2 and the line map start
   * cold on every Action run, and a rerun on the same pull request pays full price for answers it
   * already has.
   */
  const engineV2Directory = join(stateDirectory, "engine-v2");
  /*
   * THE OTHER HALF OF CARRY-FORWARD, which lived somewhere this Action could not reach.
   *
   * Carry-forward has two stores. Generation proposals go to the directory above. Triage VERDICTS -
   * the expensive half, and the half that decides the score - go to the CLI's `--cache-dir`, which
   * defaults to `~/.abloh/triage-cache`. A GitHub-hosted runner gets a fresh home directory every
   * job, so that default was written to a disk that is destroyed minutes later and no push has ever
   * read a verdict another push wrote. Measured 2026-08-23: a run sharing a triage cache carried 13
   * of 15 verdicts and cost $0.98 against $1.59, and the shipping lane threw all of it away.
   *
   * It is named here, inside the Action's own state directory, for the same reason the v2 store is:
   * a cache step can only save a path it knows, and the CLI can only write to a path it is given.
   *
   * SAFE TO RESTORE ON EXACTLY THE ARGUMENT THAT COVERS THE V2 STORE, and no wider. A repository's
   * own tests can seed this cache, so a restored verdict is repository-controlled input - which is
   * why a carried verdict may only ever keep a gap OPEN. `likely-equivalent` is the one verdict that
   * would remove a gap and it is re-asked live on every run, by the direction rule the CLI enforces.
   * Data bounded by a rule that holds whatever the data says, never executable code.
   */
  const triageCacheDirectory = join(stateDirectory, "triage-cache");
  mkdirSync(baselineDirectory, { mode: 0o700 });
  mkdirSync(coverageCacheDirectory, { mode: 0o700 });
  mkdirSync(engineV2Directory, { mode: 0o700 });
  mkdirSync(triageCacheDirectory, { mode: 0o700 });

  /*
   * THE REFUSAL THE SWEEP RAN PAST, FILED BESIDE THE LEDGER IT PRECEDES.
   *
   * ON DISK AND NOT ONLY IN THE LOG. The ruling requires the refusal to be logged first and it is,
   * on stderr, above. This is the other half: the wall ledger is written into this same directory
   * and a caller that collects the directory - the census does exactly that - would otherwise carry
   * a ledger with no record of the wall that made it a diagnostic. Two files, one story.
   *
   * FAIL-OPEN, on the rule every diagnostic write in this product follows: the refusal is already on
   * stderr, and a boundary that crashed while filing a note about a refusal would turn a diagnostic
   * into a second failure.
   */
  if (precedingRefusal !== null) {
    try {
      writeFileSync(
        join(outputDirectory, nonEvidenceBasename("sweep-preceding-refusal")),
        `${JSON.stringify({ schema: "abloh-boundary-refusal/v1", attesting: false, ...precedingRefusal }, null, 2)}\n`,
        { encoding: "utf8", mode: 0o600 },
      );
    } catch (error) {
      /*
       * FILESYSTEM ERRORS ONLY, and this narrowing is not defensiveness - it is the bug this block
       * shipped with. Written as a bare `catch {}`, it swallowed a `ReferenceError` from a missing
       * import and the note simply never appeared, with nothing anywhere saying why. A full disk is
       * a reason to fail open; a mistake in this file is not.
       */
      if (error instanceof ReferenceError || error instanceof TypeError) throw error;
    }
  }

  return {
    repositoryRoot,
    expectedHead,
    /*
     * WHAT THE RUN IS ABOUT TO MEASURE, which is the head EXCEPT on a swept identity refusal.
     *
     * On every attesting run this is the pull request's head commit, exactly as it always was. On a
     * sweep that ran past an unproven checkout the head commit may not even be on this runner, and
     * a diagnostic that claimed to be about it would be the false label this whole boundary exists
     * to prevent - so the sweep is about the commit that is actually here, and says so.
     */
    measuredHead: precedingRefusal === null ? expectedHead : actualHead,
    attesting: precedingRefusal === null,
    effectiveBase,
    outputDirectory,
    baselineDirectory,
    coverageCacheDirectory,
    engineV2Directory,
    triageCacheDirectory,
    admittedCliTarball,
  };
}

/*
 * `DEFAULT_CLI_SPEC` - the published CLI this action installs when the caller names nothing - is
 * re-exported from the generated contract rather than written here.
 *
 * PINNED, not `latest`. This action is itself referenced by a 40-character commit SHA, so a caller
 * who pinned it has already decided which Abloh they are running; resolving `latest` at run time
 * would quietly change that for them. The version moves when a release moves it, and the release
 * moves it in ONE place: `version` in `apps/cli/package.json`, the manifest npm publishes. This
 * file's own copy of it was the thing a tagged Action could silently get wrong.
 */
export { DEFAULT_CLI_SPEC };

export function parsePackageSpecs(value) {
  /*
   * `cli-tarball` was REQUIRED, because nothing was on npm: every caller had to pack the CLI and
   * its six workspace dependencies and pass all seven paths. That is why the only repository that
   * could run this action was ours. With @abloh/cli published, absent means "install the release".
   */
  const input = typeof value === "string" ? value.trim() : "";
  if (input === "") return [DEFAULT_CLI_SPEC];
  const specs = input.split(/\s+/u);
  if (specs.length === 0 || specs.length > 20) fail("cli-tarball must contain 1 to 20 package specs");
  for (const spec of specs) {
    if (spec.startsWith("-") || CONTROL.test(spec)) fail("cli-tarball contains an unsafe package spec");
  }
  return specs;
}

export function installCli(environment = process.env) {
  const runId = required(environment.GITHUB_RUN_ID, "GITHUB_RUN_ID");
  const runAttempt = required(environment.GITHUB_RUN_ATTEMPT, "GITHUB_RUN_ATTEMPT");
  if (!RUN_NUMBER.test(runId) || !RUN_NUMBER.test(runAttempt)) fail("run id and attempt must be positive integers");
  const prefix = privateDirectory(environment.RUNNER_TEMP, [
    "abloh-cli",
    `${runId}-${runAttempt}`,
  ], true);
  const installEnvironment = { ...environment, npm_config_ignore_scripts: "true" };
  for (const key of INSTALL_SECRETS) delete installEnvironment[key];
  const result = spawnSync(
    "npm",
    [
      "install",
      "-g",
      "--prefix",
      prefix,
      "--ignore-scripts",
      "--no-audit",
      "--no-fund",
      "--",
      ...parsePackageSpecs(environment.CLI_TARBALL),
    ],
    { env: installEnvironment, stdio: "inherit" },
  );
  if (result.error || result.status !== 0) fail(`npm could not install the Abloh CLI (exit ${result.status ?? "unknown"})`);
  const cli = join(prefix, "bin", "abloh");
  if (!existsSync(cli)) fail("installed package did not provide the abloh executable");
  accessSync(cli, constants.X_OK);
  const target = realpathSync(cli);
  if (!inside(prefix, target, false) || !lstatSync(target).isFile()) {
    fail("installed abloh executable resolves outside its private package prefix");
  }
  return { cli, prefix };
}

/**
 * THE STATUSES GITHUB GIVES A JOB, and the only values this boundary will hand on to the CLI.
 *
 * WHY IT IS CHECKED AT ALL. `job-status` reaches this Action from a workflow file, which a
 * contributor can propose a change to, so it is untrusted text like every other input. It is NOT on
 * `PULL_REQUEST_REFUSED_INPUTS` and must not be - it has to be readable on `pull_request`, which is
 * the only event this Action runs on - and it passes that list's own test: the worst a value here can
 * do is stop a pull request being measured, which blocks a merge rather than passing one.
 *
 * EMPTY IS THE ORDINARY VALUE. Every standalone Abloh workflow and every local run says nothing, and
 * the CLI measures exactly as it always has.
 */
const CALLER_JOB_STATUSES = new Set(["", "success", "failure", "cancelled", "skipped"]);

/**
 * The caller's own job status, validated, or `""` when nobody said.
 *
 * REFUSED RATHER THAN IGNORED when it is unrecognised. An unreadable value here is a workflow that
 * has been edited into a shape this Action does not understand, and quietly treating it as "nobody
 * said" would measure a half-built tree on exactly the run the field exists to stop.
 */
export function callerJobStatus(environment = process.env) {
  const value = optional(environment.ABLOH_CALLER_JOB_STATUS, "job-status").trim().toLowerCase();
  if (!CALLER_JOB_STATUSES.has(value)) {
    fail(`job-status must be one of ${[...CALLER_JOB_STATUSES].filter(Boolean).join(", ")}`);
  }
  return value;
}

export function buildRunArguments(environment = process.env) {
  assertTrustedPullRequestInputs(environment);
  /* VALIDATED HERE, WHERE THE VALUE IS. It is set on the run step alone, so the preflight step never
     sees it; checking it in `validateActionInputs` would be checking an empty string. */
  callerJobStatus(environment);
  const repositoryRoot = realpathSync(required(environment.REPOSITORY_ROOT, "repository root"));
  const base = sha(environment.BASE, "base");
  const head = sha(environment.HEAD_SHA, "head");
  const outputDirectory = realpathSync(required(environment.ABLOH_OUTPUT_DIR, "output directory"));
  const runnerTemp = realpathSync(required(environment.RUNNER_TEMP, "RUNNER_TEMP"));
  if (!inside(runnerTemp, outputDirectory, false)) fail("output directory must stay inside RUNNER_TEMP");
  if (inside(repositoryRoot, outputDirectory) || inside(outputDirectory, repositoryRoot)) {
    fail("output directory and measured repository must not overlap");
  }

  const args = ["run", "--repo", repositoryRoot, "--base", base, "--head", head];
  /*
   * THE DIAGNOSTIC SWEEP, ASKED FOR BY THE CALLER AND PASSED STRAIGHT THROUGH.
   *
   * WHY THE ACTION NEEDED ONE (`sweep-cannot-run-in-job.md`, 2026-08-29). `--sweep` is a flag on
   * `abloh run`, and in a customer's CI nothing invokes `abloh run` except this Action, which builds
   * its own argv. So there was no supported way for any workflow to ask the in-job step for the
   * ledger that says which stages would have worked - the census could only have got one by editing
   * the argv this file assembles, which would have made it measure a product nobody ships.
   *
   * IT NEEDS NO PATH OF ITS OWN. The CLI writes `abloh-sweep.json` beside where `--json` points, and
   * `--json` below is `<RUNNER_TEMP>/abloh/<run>-<attempt>/abloh-run.json` - the directory a
   * collecting harness already takes. The ledger lands there with nothing further to wire.
   *
   * FIRST IN THE ARGV, ahead of every optional flag, because it is the flag that decides what the
   * others are for: a sweep publishes nothing, so `--config` and the rest are settings for a
   * measurement that is not going to happen.
   */
  if (sweepRequested(environment)) args.push("--sweep");
  const subdir = optional(environment.SUBDIR, "subdir");
  const configPath = configInput(environment);
  const image = optional(environment.ENVIRONMENT_IMAGE, "environment-image");
  const testCommand = optional(environment.TEST_COMMAND, "test-command");
  const seed = optional(environment.SEED, "seed");
  /*
   * THE `tier` INPUT IS ACCEPTED AND DROPPED.
   *
   * IT USED TO BE FORWARDED, and the reasoning was sound while it lasted: the shipped engine default
   * was v1, and under v1 the tier decided whether LLM triage ran at all and whether proven test
   * bodies and changed source spans were uploaded. Dropping the flag then would have moved a
   * `tier: 0` workflow onto the tier-2 defaults and begun egressing exactly what that customer had
   * opted out of. That is why an earlier attempt to stop forwarding it was reverted.
   *
   * The v1 arm and the tier ladder are both deleted. `--tier` is not a CLI flag any more, no value
   * of it changes what a run does or what leaves the customer's CI, and forwarding it would be
   * handing the run an argument nothing reads.
   *
   * THE INPUT STAYS DECLARED in action.yml. Deleting it would fail every workflow that still names
   * it with "Unexpected input", which is breakage rather than deprecation - and the workflows that
   * name it are exactly the ones written when the product told customers to.
   */
  if (subdir !== "") args.push("--subdir", canonicalRelative(subdir, "subdir"));
  if (configPath !== "") args.push("--config", canonicalRelative(configPath, "config"));
  if (image !== "") {
    if (!IMAGE.test(image)) fail("environment-image must be an immutable name@sha256:digest reference");
    args.push("--environment-image", image);
  }
  if (testCommand !== "") args.push("--test-command", testCommand);
  if (seed !== "") {
    if (!SEED.test(seed)) fail("seed must be 1 to 64 hexadecimal characters");
    args.push("--seed", seed);
  }
  /*
   * THE RECORDINGS PATH, THROUGH THE SAME CONTAINMENT CHECK EVERY OTHER PATH INPUT PASSES.
   *
   * `canonicalRelative` is what stops a workflow naming `../../etc/something` or an absolute path:
   * the file lands in the repository the run measured, and nowhere else. This is only reachable off
   * `pull_request` - see PULL_REQUEST_REFUSED_INPUTS - so it is a repository's own refresh workflow
   * asking for it, never a contributor's pull request.
   */
  const recordNetwork = optional(environment.RECORD_NETWORK, "record-network");
  if (recordNetwork !== "") {
    args.push("--record-network", canonicalRelative(recordNetwork, "record-network"));
    if (optional(environment.RECORD_LOOPBACK, "record-loopback") === "true") args.push("--record-loopback");
  }
  /*
   * THE TRIAGE CACHE, POINTED AT A DIRECTORY THE CACHE STEPS CAN SEE.
   *
   * Without this flag the CLI writes verdicts to `~/.abloh/triage-cache`, and a GitHub-hosted
   * runner's home directory does not survive the job - so the half of carry-forward that costs the
   * most money was built, tested, working, and thrown away on every push. This is not a new
   * behaviour being switched on; it is the existing behaviour being given somewhere to live.
   *
   * NOT A CALLER-CONTROLLED OVERRIDE. The path comes from the Action's own preflight, is required
   * to sit inside RUNNER_TEMP, and may not overlap the measured repository - the same three checks
   * the output directory passes, for the same reason.
   */
  const triageCacheDirectory = realpathSync(required(environment.ABLOH_TRIAGE_CACHE_DIR, "triage cache directory"));
  if (!inside(runnerTemp, triageCacheDirectory, false)) fail("triage cache directory must stay inside RUNNER_TEMP");
  if (inside(repositoryRoot, triageCacheDirectory) || inside(triageCacheDirectory, repositoryRoot)) {
    fail("triage cache directory and measured repository must not overlap");
  }
  args.push("--cache-dir", triageCacheDirectory);
  args.push(
    "--json", join(outputDirectory, evidenceBasename("artifact-json")),
    /* NO `--md` (manifest phase B, step 14). The prose summary is a rendering of the artifact this
       step already collects, nothing on a runner reads it, and the upload does not carry it - so
       asking for one wrote a second copy of the run's own result into the output directory to go
       stale beside it. A caller who wants the rendering has the artifact it is rendered from. */
    /* NO `--rationales` (manifest phase B, step 15). The model's full prose about the customer's
       source is inside `abloh-run.local.json` now, which is the one file that source is in and the
       one nothing sends - so there is nowhere for this step to point it and nothing to point. */
  );
  return args;
}

/** A provider credential handed to the customer Action, refused wherever it was found. */
export function refuseDirectModelSecrets(environment) {
  for (const name of DIRECT_MODEL_SECRETS) {
    if (optional(environment[name], name) !== "") {
      fail(
        `${name} must not be supplied to the customer Action; configure the provider ` +
        `credential only on the Abloh model gateway`,
      );
    }
  }
}

/** Validate the gateway target without minting — the credential is obtained at the point of use. */
export function validatedModelGatewayTarget(environment = process.env) {
  refuseDirectModelSecrets(environment);
  const gatewayUrl = credentialFreeHttps(environment.MODEL_GATEWAY_URL, "model-gateway-url");
  const audience = required(environment.MODEL_GATEWAY_AUDIENCE, "model-gateway-audience");
  if (audience.length > 512) fail("model-gateway-audience is too long");
  return { gatewayUrl, audience };
}

/**
 * IS THERE AN OIDC IDENTITY THIS JOB COULD MINT, AND IF NOT, WHICH OF THREE REASONS.
 *
 * READ FROM THE MINT ENDPOINT AND THE FORK FLAG, and nothing else. GitHub sets
 * `ACTIONS_ID_TOKEN_REQUEST_URL` only for a job that declares `id-token: write`, and sets it for
 * every step in such a job - which is the fact the whole identity split is about, and the reason
 * this is a QUESTION here rather than a requirement.
 *
 * IT ANSWERS WITH A CAUSE AND NOT A BOOLEAN (Kenneth's ruling, 2026-08-30). `hasMintableIdentity`
 * returned true or false, so every reader downstream had to re-derive WHY from an absence - and the
 * one sentence that came out of it offered a fork run an edit that no edit fixes. The cause travels
 * now: `identityCondition` in `identity-conditions.mjs` decides it, checking GitHub's fork rule
 * first because that rule outranks anything a workflow declares.
 */
export function identityConditionOf(environment) {
  return identityCondition(environment);
}

/**
 * WHY THE MODEL-BACKED ARM IS OFF ON THIS RUN, said as the concrete cause it is.
 *
 * IT IS NOT A REFUSAL (Kenneth's identity-split ruling, 2026-08-29). This used to fail the step, and
 * `electron/asar` run 33239137362 is the measured case: the repository's own CI passed in full and
 * abloh's step alone went red, over a permission the maintainer had not been asked for. Eleven of
 * the census's fourteen borrow-road repositories declare no `permissions:` block on the chosen job
 * at all, which is a reading of their workflows rather than a tally of failures.
 *
 * MECHANICAL MEASUREMENT IS UNAFFECTED, and that is the half worth being loud about: coverage, the
 * mutants, the gaps a suite would miss and the gate all run with no identity anywhere. What stops
 * is the model call that reads a survivor and proposes the test - and the reason it cannot be moved
 * to the attestation job like the publication was is that it happens WHILE the suite is being
 * measured, in the same job as the code being measured.
 */
export function modelArmOffLine(condition, environment = {}) {
  /*
   * THE REMEDY CLAUSE IS THE CALLER'S AND NOT THE SENTENCE'S, because the job it names is different
   * here from anywhere else in the product. The identity that FILES a result belongs on
   * `abloh-publish`; the identity the model arm needs belongs on the job that runs the suite, because
   * the model call happens while that suite is being measured. One sentence carrying both would name
   * the wrong job on one of them, which is the class of remedy Kenneth's ruling is about.
   */
  const job = optional(environment.GITHUB_JOB, "job") || undefined;
  /* THE SENTENCE ENDS WITHOUT A FULL STOP, on the registry's own convention: a summary is a
     fragment the renderer joins to a remedy. A caller appending a clause supplies the stop. */
  const cause = `${identityConditionLine(condition, { job }).trimEnd()}.`;
  if (condition === "fork-policy") {
    /* NO CLAUSE AT ALL. A fork run has no edit behind it, and appending one here would be the
       sentence that has a maintainer changing a permission and watching it fail again. */
    return `${cause} The model-backed arm needed that identity, so this run measures mechanically.\n`;
  }
  return (
    `${cause} The model-backed arm needs an identity in the job that runs your suite, because the ` +
    "model call happens while that suite is being measured, so this run measures mechanically. " +
    "Abloh does not write that line onto a job that runs your steps: it would reach every step in " +
    "the job and not only Abloh's. Add it yourself to turn the arm on, or leave it off.\n"
  );
}

export async function requestModelGatewayIdentity(environment = process.env, fetchImpl = fetch) {
  refuseDirectModelSecrets(environment);
  const gatewayUrl = credentialFreeHttps(
    environment.MODEL_GATEWAY_URL,
    "model-gateway-url",
  );
  const audience = required(environment.MODEL_GATEWAY_AUDIENCE, "model-gateway-audience");
  if (audience.length > 512) fail("model-gateway-audience is too long");
  return { gatewayUrl, token: await mintGitHubIdentity(environment, audience, "model-gateway", fetchImpl) };
}

/**
 * A short-lived GitHub OIDC identity for one audience.
 *
 * THIS IS WHY THE ACTION NEEDS NO API KEY. GitHub mints a JWT scoped to one audience, valid for
 * minutes, signed by GitHub, and carrying the repository and commit as claims the runner cannot
 * forge. It authorizes exactly one thing — talking to the service that audience names — so leaking it
 * grants nothing a job that already runs the customer's tests did not have.
 *
 * `ACTIONS_ID_TOKEN_REQUEST_TOKEN` is in CONTROL_PLANE_SECRETS, so it is stripped from every child
 * process this action spawns: the measured test suite and its dependencies cannot mint identities of
 * their own through us.
 */
export async function mintGitHubIdentity(
  environment,
  audience,
  label,
  fetchImpl = fetch,
) {
  const requestUrl = new URL(required(
    environment.ACTIONS_ID_TOKEN_REQUEST_URL,
    "GitHub OIDC request URL",
  ));
  if (requestUrl.protocol !== "https:" || requestUrl.username || requestUrl.password || requestUrl.hash) {
    fail("GitHub OIDC request URL is invalid");
  }
  requestUrl.searchParams.set("audience", audience);
  const requestToken = required(
    environment.ACTIONS_ID_TOKEN_REQUEST_TOKEN,
    "GitHub OIDC request token",
  );
  let response;
  try {
    response = await fetchImpl(requestUrl, {
      headers: { authorization: `Bearer ${requestToken}`, accept: "application/json" },
      redirect: "error",
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    fail(`GitHub could not mint the ${label} identity`);
  }
  if (!response.ok) fail(`GitHub could not mint the ${label} identity`);
  let body;
  try {
    body = await response.json();
  } catch {
    fail(`GitHub returned an invalid ${label} identity`);
  }
  const token = required(body?.value, `GitHub ${label} identity`);
  if (token.length > 8192 || !/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/u.test(token)) {
    fail(`GitHub returned an invalid ${label} identity`);
  }
  return token;
}

export async function runAbloh(environment = process.env, fetchImpl = fetch) {
  const cli = realpathSync(required(environment.ABLOH_CLI_PATH, "installed CLI path"));
  const prefix = realpathSync(required(environment.ABLOH_CLI_PREFIX, "installed CLI prefix"));
  if (!inside(prefix, cli, false) || !lstatSync(cli).isFile()) {
    fail("Abloh CLI executable must resolve inside the private installation prefix");
  }
  /*
   * No gateway configured means no model environment, and no OIDC identity minted for one.
   *
   * This used to run unconditionally, which is why a tier-0 repository could not use the Action:
   * every run demanded a gateway, including runs whose whole point is mechanical evidence. The
   * CLI is left to raise the missing-endpoint error if a policy actually names a hosted provider
   * — see the note in validateActionInputs for why this boundary cannot decide that itself.
   *
   * A JOB WITH NO MINTABLE IDENTITY IS THE SAME ANSWER (the identity split, 2026-08-29). A gateway
   * address with nothing to authenticate to it is not a gateway, and on the borrow road that is the
   * ordinary case rather than a misconfiguration: abloh writes no permission onto a job that runs
   * somebody else's steps. The run says which arm went off and measures mechanically.
   */
  /*
   * BEFORE ANY QUESTION ABOUT GATEWAYS OR IDENTITIES, because it is not a question about either.
   *
   * This check used to live inside the gateway branch, which meant it only ran on jobs that had both
   * a gateway URL and a mintable identity. Once a job without an identity became an ordinary job
   * rather than a refused one (the identity split, 2026-08-29), that branch stopped running on
   * exactly the jobs this rule is about - a raw provider key handed to the customer Action would
   * have been passed straight through to the measured suite. A credential is refused because it was
   * supplied, and nothing about the workflow's permissions changes that.
   */
  refuseDirectModelSecrets(environment);
  const childEnvironment = { ...environment };
  for (const key of INSTALL_SECRETS) delete childEnvironment[key];
  const gatewayConfigured = optional(environment.MODEL_GATEWAY_URL, "model-gateway-url") !== "";
  const condition = identityConditionOf(environment);
  /*
   * THE REPOSITORY'S OWN MODEL CREDENTIAL, WHICH IS WHAT THE BORROW ROAD HAS (Kenneth, 2026-09-03).
   *
   * WHY IT EXISTS. Abloh's model-backed arm calls a model WHILE the suite is being measured, in the
   * job that runs the suite. On the borrow road that job is the maintainer's own, and abloh writes
   * no `id-token: write` onto it because GitHub scopes that permission to the whole JOB - so the
   * arm had nothing to authenticate with and census run 4 recorded zero proposals on every one of
   * ten rows. GitHub hands a SECRET to the step whose own line names it and to no other step, so
   * the credential is a repository Actions secret wired into this Action's own `with:` block.
   *
   * IT IS SHAPE-CHECKED HERE AND AUTHENTICATED NOWHERE. A value that is not shaped like an abloh
   * key is treated as absent rather than presented, so a maintainer who wired the wrong secret in
   * gets the ordinary "the arm is off" sentence instead of a 401 from a gateway.
   */
  const repositoryModelToken = optional(environment.ABLOH_MODEL_TOKEN, "model-token").trim();
  const modelTokenUsable = /^abloh_sk_[0-9a-f]{12}_[A-Za-z0-9_-]{43}$/u.test(repositoryModelToken);
  if (gatewayConfigured && condition !== null && modelTokenUsable) {
    /*
     * NO IDENTITY, BUT A CREDENTIAL, WHICH IS THE ORDINARY BORROW-ROAD RUN.
     *
     * THE STATIC KEY GOES IN AS `MODEL_API_KEY` AND THAT IS THE WHOLE OF THE PRECEDENCE RULE. A
     * customer's own `MODEL_API_KEY` cannot be here - `refuseDirectModelSecrets` fails the job on
     * one - so this collides with nothing, and `resolveModelAccess` in core already prefers a
     * static key over any minter. Kenneth's order, "the customer's own key, then this token, then
     * nothing", therefore holds by construction rather than by a second rule.
     *
     * IT IS BELOW THE IDENTITY BRANCH ON PURPOSE. Where a job DOES declare `id-token: write` - a
     * maintainer's own choice, since abloh writes none - the minted identity is preferred: it lives
     * minutes where this key lives months, and the shorter-lived credential is the better one to
     * spend when both are present.
     */
    childEnvironment.MODEL_ENDPOINT = environment.MODEL_GATEWAY_URL;
    childEnvironment.MODEL_ENDPOINT_ALT = environment.MODEL_GATEWAY_URL;
    childEnvironment.MODEL_AUTH = "bearer";
    childEnvironment.MODEL_API_KEY = repositoryModelToken;
    childEnvironment.MODEL_API_KEY_ALT = repositoryModelToken;
  } else if (gatewayConfigured && condition !== null) {
    /* A GATEWAY WITH NOWHERE TO GET AN IDENTITY FROM IS NO GATEWAY. Said once, before the suite
       runs, so the log carries the reason at the top rather than leaving a reader to notice that a
       report has no generated tests in it - and it says WHICH reason, because a fork run and a
       missing permission are different facts with different answers. */
    process.stdout.write(modelArmOffLine(condition, environment));
  } else if (gatewayConfigured) {
    /*
     * The IDENTITY IS NOT MINTED HERE. The endpoint that mints it is passed through instead.
     *
     * A token obtained now is presented minutes later: everything mechanical — baseline, coverage,
     * mutation, per-test attribution — runs before the first model call. A GitHub OIDC token is
     * short-lived, so triage arrived at the gateway with an expired identity, got 401, and the run
     * reported "the provider is unusable (binary missing or auth dead)". The credential is now
     * obtained at the moment it is used.
     *
     * The gateway URL and audience are still validated here, so a misconfigured gateway fails
     * before the suite runs rather than after it.
     */
    /*
     * THE CANONICAL `MODEL_*` NAMES, and only those.
     *
     * This wrote `ATTEST_MODEL_*` - the v1 lane's names - so every Action run configured the v1
     * triage lane and left engine-v2 with no endpoint at all. v2 read `MODEL_*` and nothing wrote
     * them, so the shipped customer path triaged and then generated NOTHING, silently, on every
     * run with a gateway. That is the defect in its worst shape: not an operator's box, the
     * product's own Action. One family, written once, read by both lanes.
     */
    const gateway = await validatedModelGatewayTarget(environment);
    childEnvironment.MODEL_ENDPOINT = gateway.gatewayUrl;
    childEnvironment.MODEL_ENDPOINT_ALT = gateway.gatewayUrl;
    childEnvironment.MODEL_AUTH = "bearer";
    childEnvironment.MODEL_OIDC_REQUEST_URL = required(
      environment.ACTIONS_ID_TOKEN_REQUEST_URL,
      "GitHub OIDC request URL",
    );
    childEnvironment.MODEL_OIDC_REQUEST_TOKEN = required(
      environment.ACTIONS_ID_TOKEN_REQUEST_TOKEN,
      "GitHub OIDC request token",
    );
    childEnvironment.MODEL_OIDC_AUDIENCE = gateway.audience;
    /* The deprecated spellings are NOT written alongside. Writing both would put two names for one
       credential back into the very environment this change exists to clean, and the alias in
       `@abloh/core` already covers a box an operator configured by hand. */
    for (const stale of [
      "ATTEST_MODEL_ENDPOINT",
      "ATTEST_MODEL_ENDPOINT_ALT",
      "ATTEST_MODEL_AUTH",
      "ATTEST_MODEL_OIDC_REQUEST_URL",
      "ATTEST_MODEL_OIDC_REQUEST_TOKEN",
      "ATTEST_MODEL_OIDC_AUDIENCE",
    ]) {
      delete childEnvironment[stale];
    }
  }
  /*
   * LIVE PROGRESS — the same pass-through, for a different audience and a much smaller grant.
   *
   * The v2 check stream renders in-progress updates while a composed check measures; the CLI posts
   * them to the control plane, which is the only party holding App credentials. The MINT ENDPOINT is
   * passed through rather than a token, for the identical reason it is above: a composed check runs
   * long past the life of a token obtained now.
   *
   * A SEPARATE AUDIENCE, deliberately. A model-gateway identity buys model calls; a live-progress
   * identity buys one in-progress check-run update on the repository it was minted for. One audience
   * must buy one capability, or the smaller grant inherits the larger one's blast radius.
   *
   * ABSENT MEANS OFF, and off is what every run did before this existed: the CLI reads all four
   * variables together and streams nothing when any is missing. This is also why nothing here fails
   * the job — live progress is decoration on a measurement, and a job that cannot mint an identity
   * for it must still measure.
   */
  const liveProgressUrl = optional(environment.LIVE_PROGRESS_URL, "live-progress-url");
  if (liveProgressUrl !== "" && optional(environment.ACTIONS_ID_TOKEN_REQUEST_URL, "GitHub OIDC request URL") !== "") {
    credentialFreeHttps(liveProgressUrl, "live-progress-url");
    const liveAudience = required(environment.LIVE_PROGRESS_AUDIENCE, "live-progress-audience");
    if (liveAudience.length > 512) fail("live-progress-audience is too long");
    childEnvironment.ABLOH_LIVE_PROGRESS_URL = liveProgressUrl;
    childEnvironment.ABLOH_LIVE_PROGRESS_OIDC_REQUEST_URL = required(
      environment.ACTIONS_ID_TOKEN_REQUEST_URL,
      "GitHub OIDC request URL",
    );
    childEnvironment.ABLOH_LIVE_PROGRESS_OIDC_REQUEST_TOKEN = required(
      environment.ACTIONS_ID_TOKEN_REQUEST_TOKEN,
      "GitHub OIDC request token",
    );
    childEnvironment.ABLOH_LIVE_PROGRESS_OIDC_AUDIENCE = liveAudience;
  }
  /*
   * PREFLIGHT ADMISSION - the same pass-through again, for the smallest grant of the three.
   *
   * The CLI asks the control plane what this run may do before it does any of it: whether one pull
   * request has been pushed to in a loop, and whether the workspace's monthly allowance still funds
   * the generation arm. A model-gateway identity buys model calls and a live-progress identity buys
   * one check-run update; this one buys an answer to a question. One audience, one capability.
   *
   * THE MINT ENDPOINT RATHER THAN A TOKEN, for the same reason as both above, and here it barely
   * matters - this is asked in the first seconds of a job. It is passed the same way anyway,
   * because a second shape for one credential is how the two come apart later.
   *
   * ABSENT MEANS OFF, and off is the behaviour every run had before this existed: the CLI reads all
   * four variables together and asks nothing when any is missing. Nothing here fails the job -
   * admission may never be the reason a customer's check does not happen.
   */
  const checkAdmissionUrl = optional(environment.CHECK_ADMISSION_URL, "check-admission-url");
  if (
    checkAdmissionUrl !== "" &&
    optional(environment.ACTIONS_ID_TOKEN_REQUEST_URL, "GitHub OIDC request URL") !== ""
  ) {
    credentialFreeHttps(checkAdmissionUrl, "check-admission-url");
    const admissionAudience = required(environment.CHECK_ADMISSION_AUDIENCE, "check-admission-audience");
    if (admissionAudience.length > 512) fail("check-admission-audience is too long");
    childEnvironment.ABLOH_CHECK_ADMISSION_URL = checkAdmissionUrl;
    childEnvironment.ABLOH_CHECK_ADMISSION_OIDC_REQUEST_URL = required(
      environment.ACTIONS_ID_TOKEN_REQUEST_URL,
      "GitHub OIDC request URL",
    );
    childEnvironment.ABLOH_CHECK_ADMISSION_OIDC_REQUEST_TOKEN = required(
      environment.ACTIONS_ID_TOKEN_REQUEST_TOKEN,
      "GitHub OIDC request token",
    );
    childEnvironment.ABLOH_CHECK_ADMISSION_OIDC_AUDIENCE = admissionAudience;
  }
  const commandCenterOrigin = optional(environment.COMMAND_CENTER_ORIGIN, "command-center-origin");
  if (commandCenterOrigin !== "") {
    credentialFreeHttps(commandCenterOrigin, "command-center-origin");
    childEnvironment.ABLOH_COMMAND_CENTER_ORIGIN = commandCenterOrigin;
  }
  // These are Action orchestration paths, not customer test inputs.
  delete childEnvironment.ABLOH_CLI_PATH;
  delete childEnvironment.ABLOH_CLI_PREFIX;
  delete childEnvironment.ABLOH_OUTPUT_DIR;
  delete childEnvironment.MODEL_GATEWAY_URL;
  delete childEnvironment.MODEL_GATEWAY_AUDIENCE;
  delete childEnvironment.LIVE_PROGRESS_URL;
  delete childEnvironment.LIVE_PROGRESS_AUDIENCE;
  delete childEnvironment.CHECK_ADMISSION_URL;
  delete childEnvironment.CHECK_ADMISSION_AUDIENCE;
  delete childEnvironment.COMMAND_CENTER_ORIGIN;
  /*
   * SPAWNED WITH THIS PROCESS'S OWN NODE, never through the CLI's `#!/usr/bin/env node` shebang.
   *
   * The shebang resolves whatever `node` the customer's job put on PATH, which is the runtime the
   * step above may have just declined to run on - `alibaba/formily` leaves Node 16.20.2 there. Naming
   * `process.execPath` is what makes "abloh provisions its own runtime" true of the CLI as well as of
   * this boundary, and it does it without touching PATH, so everything the CLI spawns afterwards
   * still resolves the customer's own toolchain. See `provisionNodeRuntime`.
   */
  const result = spawnSync(process.execPath, [cli, ...buildRunArguments(environment)], {
    env: childEnvironment,
    stdio: "inherit",
  });
  if (result.error) throw result.error;
  return result.status ?? 2;
}

export function validateArtifact(environment = process.env) {
  const outputDirectory = realpathSync(required(environment.ABLOH_OUTPUT_DIR, "output directory"));
  const name = required(environment.ABLOH_ARTIFACT_NAME, "artifact name");
  if (!/^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/u.test(name)) fail("artifact name is unsafe");
  const artifact = join(outputDirectory, name);
  if (!existsSync(artifact)) return null;
  const info = lstatSync(artifact);
  if (info.isSymbolicLink() || !info.isFile()) fail(`${name} must be a regular non-symlink file`);
  const canonical = realpathSync(artifact);
  if (!inside(outputDirectory, canonical, false)) fail(`${name} escaped the output directory`);
  return canonical;
}

/** What the CLI leaves behind when a run produced no measurement. `apps/cli/src/run-outcome.ts`. */
const RUN_REFUSAL_FILE = nonEvidenceBasename("run-refusal");
const RUN_REFUSAL_SCHEMA = "abloh-run-refusal/v1";

/**
 * THE OTHER TWO RECORDS A RUN MAY LEAVE, and the boundary has to know all three.
 *
 * `apps/cli/src/run-outcome.ts` states the invariant in its own words: every exit of the `abloh run`
 * path leaves EXACTLY ONE machine-readable record - a measurement, a sweep ledger, or a refusal.
 * This boundary knew two of the three, and the missing one is the one every diagnostic run writes.
 */
const SWEEP_LEDGER_FILES = [nonEvidenceBasename("sweep-ledger"), nonEvidenceBasename("validation-ledger")];
const WALL_SWEEP_SCHEMA = "abloh-wall-sweep/v1";

/** A refusal record is four short sentences. Anything larger is not the file this reads. */
const MAX_RUN_REFUSAL_BYTES = 16 * 1024;

/**
 * A sweep ledger is one row per stage over ten stages, with a bounded refusal on each.
 *
 * Larger than a refusal record and bounded for the same reason: it arrives through a file on a disk
 * this process does not own, and what it says lands in a log that is public on a fork's pull request.
 */
const MAX_SWEEP_LEDGER_BYTES = 512 * 1024;

/**
 * WHY THERE IS NO MEASUREMENT, READ BACK INTO THE JOB LOG AT THE STEP THAT NOTICED.
 *
 * WHAT THIS FIXES (certification census, wave 3, `vitejs/vite` run 33249763448). "Validate completed
 * measurement artifact" answered `complete=false`, every step after it skipped, and the upload step
 * reported "No files were found with the provided path". Nothing in that sequence said WHY, because
 * nothing in it knew: the CLI had refused four steps earlier and left the reason on stderr only.
 * A reader scrolling back could find it; the step that made the decision could not, and neither
 * could anything reading the job through the API.
 *
 * NOW THE CLI FILES THE REASON AND THIS READS IT. The invariant on the other side is that every exit
 * of the run path leaves exactly one machine-readable record - a measurement, a sweep ledger, or
 * this - so `complete=false` with nothing to print is now a state that means something specific:
 * the run did not reach its own exit at all (the job was cancelled, or the runner died).
 *
 * IT NEVER FAILS THE STEP. This is a diagnostic about a failure that has already happened, and a
 * boundary that threw while explaining one would replace a legible refusal with an illegible one.
 * Every read is bounded and every field is checked, because the file is on a runner's disk and this
 * prints into a log that is public on a fork's pull request.
 */
export function explainMissingArtifact(environment = process.env, write = process.stderr) {
  const outputDirectory = realpathSync(required(environment.ABLOH_OUTPUT_DIR, "output directory"));
  const record = readRunRefusal(join(outputDirectory, RUN_REFUSAL_FILE));
  if (record === null) {
    /*
     * A SWEEP IS THE THIRD RECORD, AND IT WAS BEING READ AS A CANCELLED JOB (first full corpus pass,
     * 2026-08-30, finding 3).
     *
     * A sweep writes no run artifact BY DESIGN - it is a diagnostic that attests nothing -
     * so `complete=false` is its ordinary, correct, successful state. This step then looked for
     * `abloh-refusal.json`, found none because the sweep had left `abloh-sweep.json` instead, and
     * told the maintainer their job had been cancelled or their runner had gone away. Neither had
     * happened. `sweep` is a public input of `action.yml`, so this reached any customer who set it,
     * and every one of the twenty-nine corpus rows carried the sentence because every rehearsal is
     * a sweep.
     *
     * THE MAPPING BUG IS THE MISSING CASE, NOT THE SENTENCE. The cancelled-job sentence is right for
     * what it describes and stays exactly as it is; what was wrong is that one of the three records
     * the run path may leave was not on this side of the boundary at all.
     */
    const sweep = readSweepLedger(outputDirectory);
    if (sweep !== null) {
      write.write(`abloh: no measurement was produced, and none was meant to be. ${sweep.summary}\n`);
      for (const line of sweep.lines) write.write(`abloh: ${line}\n`);
      return sweep;
    }
    write.write(
      "abloh: this run produced no measurement and left no refusal record, so it did not reach " +
        "its own exit. A cancelled job or a runner that went away is the usual cause.\n",
    );
    return null;
  }
  write.write(`abloh: no measurement was produced. ${record.summary}.\n`);
  /* NEVER SKIPPED (error-plane plan, step 21). This line used to be conditional on the record
     carrying a next action, so a refusal that asks the customer for nothing - a diff with no
     executable line, a package abloh was never admitted to measure - printed a summary with
     nothing under it. The one composer answers the empty case with the one declared sentence. */
  write.write(`abloh: ${nextActionLine(record.nextAction, "")}\n`);
  write.write(`abloh: refusal code ${record.code}, owned by ${record.owner}, at the ${record.stage} stage.\n`);
  /* NO SECOND LINE FOR THE REPORT ID (Kenneth's wave-4 ruling 1, and his first instruction of that
     session about the clause it carried). The line above already IS the composed closing line, id
     included, because `nextActionLine` renders what the registry composed - so a second one printed
     the same identifier twice and appended the sentence he cut. `reportId` stays on the record,
     which is machine-readable and is not a customer surface. */
  return record;
}

/**
 * ONE SENTENCE TERMINATOR, NEVER TWO (third corpus rehearsal, 2026-08-30, finding 4).
 *
 * The wall lines below compose a sentence out of the stage and the refusal registry's own summary,
 * and they used to append a full stop unconditionally. Every summary the registry composes is now a
 * complete sentence carrying its own, so the maintainer's job log read `exited 1..` on the baseline
 * row and `so abloh installs it..` on the coverage row. The terminator belongs to the summary when
 * the summary has one and to this line when it does not, which is the same rule for every stage and
 * every row rather than a per-row exception.
 */
function endedWithOneStop(sentence) {
  return /[.!?]$/u.test(sentence) ? sentence : `${sentence}.`;
}

/**
 * THE SWEEP LEDGER, READ BACK AS WHAT IT IS: A COMPLETED DIAGNOSTIC.
 *
 * A sweep's own bytes say `attesting: false`, so a reader that finds this file does not have to know
 * which filename means "not a measurement" to know that it is not one. That field is checked here
 * rather than assumed, for the same reason the schema is: this file arrives from a disk this process
 * does not own.
 *
 * IT NAMES THE WALLS, THROUGH THE REFUSAL REGISTRY'S OWN SENTENCES. Each entry carries the summary
 * the registry composed for that stage, which is the copy the maintainer would have seen had the run
 * stopped there. Repeating it here means the step that noticed "no artifact" is also the step that
 * says what the run found, which is the whole point of the census-wave-3 fix this sits inside.
 *
 * `localDetail` IS NEVER READ. The sweep declares it local-only and this writes into a job log that
 * is public on a fork's pull request; the declared privacy has to be what happens.
 */
export function readSweepLedger(outputDirectory) {
  for (const name of SWEEP_LEDGER_FILES) {
    const path = join(outputDirectory, name);
    let parsed;
    try {
      const info = lstatSync(path);
      if (!info.isFile() || info.isSymbolicLink() || info.size > MAX_SWEEP_LEDGER_BYTES) continue;
      parsed = JSON.parse(readFileSync(path, "utf8"));
    } catch {
      continue;
    }
    if (parsed === null || typeof parsed !== "object") continue;
    if (parsed.schema !== WALL_SWEEP_SCHEMA || parsed.attesting !== false) continue;
    const entries = Array.isArray(parsed.entries) ? parsed.entries : [];
    const walls = entries.filter((entry) => entry !== null && typeof entry === "object" && entry.state === "failed");
    const validating = parsed.mode === "validate";
    const what = validating ? "an abloh init validation run" : "a diagnostic wall sweep";
    return {
      kind: "sweep-ledger",
      file: name,
      mode: validating ? "validate" : "sweep",
      wallCount: walls.length,
      summary:
        `this run was ${what}, which attests nothing and writes no measurement artifact by design. ` +
        (walls.length === 0
          ? "It reached the end of every stage it walked and found no wall."
          : `It found ${walls.length} wall(s) and carried on past each one to find the rest.`),
      lines: [
        ...walls.map((wall) => {
          const stage = boundedLogString(wall.stage, 32) ?? "an unnamed stage";
          const summary = boundedLogString(wall.refusal?.summary, 500);
          const never = wall.neverStarted === true ? " This stage never started against that wall." : "";
          return summary === null
            ? `wall at the ${stage} stage.`
            : `${endedWithOneStop(`wall at the ${stage} stage: ${summary}`)}${never}`;
        }),
        `the whole ledger is in ${name}, beside where the artifact would have gone.`,
      ],
    };
  }
  return null;
}

/**
 * The refusal record, or null when there is not a readable one.
 *
 * EVERY FIELD IS CHECKED AND BOUNDED. The strings were composed by abloh's own refusal registry, but
 * they arrive here through a file on a disk this process does not own, and their destination is a
 * public build log. Control characters become spaces so nothing can rewrite the log's own framing,
 * and each is capped - the same treatment `refusal-envelope.mjs` gives a control-plane sentence, for
 * the same reason.
 */
export function readRunRefusal(path) {
  let raw;
  try {
    const info = lstatSync(path);
    if (!info.isFile() || info.isSymbolicLink() || info.size > MAX_RUN_REFUSAL_BYTES) return null;
    raw = readFileSync(path, "utf8");
  } catch {
    return null;
  }
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (parsed === null || typeof parsed !== "object" || parsed.schema !== RUN_REFUSAL_SCHEMA) return null;
  const summary = boundedLogString(parsed.summary, 500);
  if (summary === null) return null;
  return {
    summary,
    nextAction: boundedLogString(parsed.nextAction, 500),
    code: boundedLogString(parsed.code, 64) ?? "unnamed",
    owner: boundedLogString(parsed.owner, 32) ?? "unnamed",
    stage: boundedLogString(parsed.stage, 32) ?? "unnamed",
    reportId: boundedLogString(parsed.reportId, 64),
  };
}

/** A remote string on its way to a public log: control characters flattened, length capped. */
function boundedLogString(value, max) {
  if (typeof value !== "string") return null;
  /* The SAME class `refusal-envelope.mjs` strips, written the same escaped way: a literal control
     character in this source would be invisible to a reviewer, which is not a property a sanitizer
     may have. */
  const flattened = value.replace(/[\u0000-\u001f\u007f]/gu, " ").trim();
  return flattened === "" ? null : flattened.slice(0, max);
}

/**
 * THE SETUP TRIAL'S REPORT, FILED FROM THE SETUP PULL REQUEST'S OWN JOB.
 *
 * WHAT THIS IS (Kenneth's onboarding-flip decision, 2026-08-28). The setup pull request appends one
 * Abloh step to the customer's own test job. That step walks the five stages, writes its report into
 * the run, and this is what carries the report to the control plane so the sticky comment and the
 * per-target receipt can happen.
 *
 * IT IS SELF-DETECTING, AND IT HAS TO BE. A `pull_request` run refuses every measurement input of
 * this Action by design, so there is no flag a setup pull request could pass to ask for a trial. The
 * detection is not done twice: the CLI decides whether a run is a setup trial, from the merge base,
 * in `apps/cli/src/trusted-policy.ts`, and a trial is the ONLY thing that writes
 * `abloh-setup-trial.json`. So the presence of that file IS the answer, read from the one program
 * that computed it. A second reading of "does the merge base carry a policy", written here in
 * another language against another git, is precisely the divergence `measurement-plan.ts` exists to
 * end - with a new place for it to happen.
 *
 * ONE THING HERE FAILS THE JOB, AND EVERYTHING ELSE DOES NOT. A trial that walled has already failed
 * its own step, which is what turns the setup check red; a trial that passed has already said so in
 * the log. What this step adds is delivery, and a delivery failure must not be the reason a
 * maintainer's setup pull request goes red - the report is still in the run, and the service reads
 * finished runs.
 *
 * THE EXCEPTION IS A REPORT OVER THE DOOR'S OWN CEILING, and it is an exception because that
 * justification is what fails for it rather than in spite of it: the door refuses the same number
 * this side refuses on, so the report being "still in the run" buys nobody anything and the setup
 * check will never answer. See the branch itself for the whole argument.
 *
 * THE IDENTITY IS GITHUB'S OWN `repository` CLAIM, presented in the header the trial door reads. It
 * is minted for the job that is running, so nothing in the workflow can choose it, which is the
 * property that makes a five-stage receipt unforgeable by anybody but the repository it is about.
 */
export async function reportSetupTrial(
  environment = process.env,
  fetchImpl = fetch,
  backoffMs = UPLOAD_RETRY_BACKOFF_MS,
) {
  const trialPath = validateArtifact({
    ...environment,
    ABLOH_ARTIFACT_NAME: SETUP_TRIAL_ARTIFACT,
  });
  /*
   * THE MEASURING JOB'S REFUSAL, WHEN IT LEFT ONE INSTEAD OF A REPORT.
   *
   * `stageForAttestation` refuses an oversized report before the artifact ever leaves the runner, so
   * on the borrow road THIS job never sees the report at all - it would find an empty directory and
   * return 0, which is the deepest form of the silence the tail probe measured. The one record it
   * left in the report's place is what carries the refusal across the artifact service to here.
   */
  const stagedRefusalPath = validateArtifact({
    ...environment,
    ABLOH_ARTIFACT_NAME: SETUP_TRIAL_REFUSAL_FILE,
  });
  const stagedRefusal = stagedRefusalPath === null ? null : readSetupReportRefusal(stagedRefusalPath);
  /* NOT A SETUP TRIAL. Every ordinary measurement run lands here, writes neither file, and this
     step is a no-op that costs two stat calls. */
  if (trialPath === null && stagedRefusal === null) return 0;

  const url = optional(environment.SETUP_TRIAL_URL, "setup-trial-url");
  if (url === "") {
    process.stdout.write(
      "Abloh: the setup report stays in this run - no control plane is configured for it\n",
    );
    return 0;
  }
  credentialFreeHttps(url, "setup-trial-url");
  const audience = required(environment.SETUP_TRIAL_AUDIENCE, "setup-trial-audience");
  if (audience.length > 512) fail("setup-trial-audience is too long");

  /*
   * THE ONE DELIVERY FAILURE THAT IS WORTH A RED JOB, and the rule is this function's own.
   *
   * TAIL PROBE, FIRST FULL PASS, 2026-08-30, FINDING 2. Nothing else here fails the job, and the
   * reason is stated above: a report that could not be delivered is still in the run, and the
   * service reads finished runs, so the check answers late rather than never. THAT JUSTIFICATION IS
   * FALSE FOR THIS ONE CASE. The door's ceiling is the same number this side refuses on, so a
   * service reading this finished run would refuse the body for the same reason abloh just did. The
   * check will never answer, and `attest`'s own words for that state are "worth a red job".
   *
   * IT IS THE ATTESTATION JOB THAT GOES RED AND NOT THE CUSTOMER'S. This runs in abloh's own job,
   * which is where a defect of abloh's belongs; the measuring job stages a record and stays green,
   * because the customer's tests are not what failed.
   */
  const bytes = trialPath === null ? null : readFileSync(trialPath);
  const oversize =
    stagedRefusal ??
    (bytes !== null && bytes.byteLength > SETUP_TRIAL_MAX_BYTES
      ? { bytes: bytes.byteLength, maxBytes: SETUP_TRIAL_MAX_BYTES }
      : null);
  if (oversize !== null) {
    process.stdout.write(setupReportOversizeLine(oversize));
    return 1;
  }

  let token;
  try {
    token = await mintGitHubIdentity(environment, audience, "setup report", fetchImpl);
  } catch {
    /*
     * THE CAUSE, NOT THE CATEGORY (Kenneth's ruling, 2026-08-30). This printed one sentence for
     * three different situations: a permission the maintainer can add, a fork GitHub has already
     * decided about, and abloh failing to mint a token it was entitled to. They have three owners
     * and three answers, and offering the fork case an edit is how somebody edits one line four
     * times and watches it fail again.
     *
     * AND IT NAMES THE ATTESTATION JOB WHERE IT NAMES A JOB AT ALL. It used to say "add
     * `id-token: write` to the job that runs the Abloh step", which is now the one edit that would
     * undo the split: the measuring step mints nothing on purpose, and the permission belongs on
     * `abloh-publish`, which is where the setup pull request wrote it.
     */
    const condition = identityConditionOf(environment) ?? "identity-issuance-or-publish-failed";
    const cause = identityConditionLine(condition, { stage: "mint", job: ATTESTATION_JOB_ID }).trimEnd();
    process.stdout.write(
      condition === "permission-missing"
        ? `${cause}. It belongs on the ${ATTESTATION_JOB_ID} job rather than on the one that runs your ` +
          "tests, where it would reach every step in the job. The report stays in this run either " +
          "way and is read from it later.\n"
        : `${cause}.\n`,
    );
    return 0;
  }

  const body = bytes.toString("utf8");
  for (let attempt = 1; ; attempt += 1) {
    let response = null;
    try {
      response = await fetchImpl(url, {
        method: "POST",
        headers: {
          /* THE TRIAL DOOR'S OWN HEADER, and not `authorization`. That one carries the escape-hatch
             CI secret for repositories that never installed the App, and presenting a GitHub
             identity there would ask the weaker check a question the stronger one answers. */
          "x-abloh-oidc": token,
          "content-type": "application/json",
          accept: "application/json",
        },
        body,
        redirect: "error",
        signal: AbortSignal.timeout(30_000),
      });
    } catch {
      response = null;
    }
    if (response !== null && response.ok) {
      process.stdout.write("Abloh: the setup report is filed - the setup PR carries it\n");
      return 0;
    }
    /*
     * A POST THAT DID NOT LAND IS OURS, AND THE LINE SAYS SO WITH ITS RETRY STATE (Kenneth's ruling,
     * 2026-08-30). The reader is looking at a run that cost them CI minutes and did not report, and
     * the two things they need are whether anybody is still trying and whether the measurement
     * survived. Both are in the sentence. The HTTP status rides alongside it and the BODY never
     * does: a remote string in a public build log is how a service's internals leak, and this
     * door's own refusals name repositories and installations.
     */
    const attempts = backoffMs.length + 1;
    if (response !== null && !RETRYABLE_UPLOAD_STATUS(response.status)) {
      process.stdout.write(
        `${identityConditionLine("identity-issuance-or-publish-failed", {
          stage: "publish",
          attempt: attempts,
          attempts,
        }).trimEnd()} (HTTP ${response.status}).\n`,
      );
      return 0;
    }
    if (attempt > backoffMs.length) {
      process.stdout.write(
        identityConditionLine("identity-issuance-or-publish-failed", {
          stage: "publish",
          attempt: attempts,
          attempts,
        }),
      );
      return 0;
    }
    process.stdout.write(
      identityConditionLine("identity-issuance-or-publish-failed", {
        stage: "publish",
        attempt,
        attempts,
      }),
    );
    await sleep(backoffMs[attempt - 1]);
  }
}

/** What the CLI's setup trial writes, and the only thing that writes it. */
const SETUP_TRIAL_ARTIFACT = nonEvidenceBasename("setup-trial");

/**
 * WHAT THE MEASURING JOB STAGES IN PLACE OF A REPORT ITS OWN DOOR WOULD REFUSE.
 *
 * TOTALITY, ON `apps/cli/src/run-outcome.ts`'s OWN TERMS. That file states the rule the run path
 * follows: every exit leaves EXACTLY ONE machine-readable record, and never zero, so "there is
 * nothing here" arrives with a reason attached rather than as an absence. The staging step had the
 * opposite property for one case - an oversized report was dropped, nothing was written in its
 * place, and the attestation job downstream found an empty directory it could only read as an
 * ordinary run with nothing to file.
 *
 * ONE RECORD, NEVER TWO. It is written INSTEAD OF the report and never beside it, because two
 * documents about one report is two answers to one question - which is the half of the invariant
 * "exactly one" carries that "never zero" does not.
 *
 * IT IS NOT THE REPORT AND NEVER BECOMES IT. It says `attesting: false` in its own bytes, the same
 * word `abloh-sweep.json` and `abloh-refusal.json` use for the same reason, so a reader that finds
 * it does not have to know which filename means "not a measurement" to know that it is not one.
 */
const SETUP_TRIAL_REFUSAL_FILE = nonEvidenceBasename("setup-trial-refusal");
const SETUP_TRIAL_REFUSAL_SCHEMA = "abloh-setup-report-refusal/v1";

/** A refusal record is one sentence and two integers. Anything larger is not the file this reads. */
const MAX_SETUP_TRIAL_REFUSAL_BYTES = 16 * 1024;

/**
 * THE RECORD, AS THE REGISTRY WOULD HAVE COMPOSED IT.
 *
 * The fields are `abloh-refusal.json`'s, so one reader can read both: code, stage, owner, the
 * sentence and the next action. The two integers are here as well as in the sentence because
 * everything downstream that wants them would otherwise have to parse prose back into numbers.
 */
function setupReportRefusalRecord(bytes) {
  const facts = { bytes, maxBytes: SETUP_TRIAL_MAX_BYTES };
  return {
    schema: SETUP_TRIAL_REFUSAL_SCHEMA,
    attesting: false,
    code: SETUP_REPORT_OVERSIZE_CODE,
    stage: "setup",
    owner: "abloh",
    summary: setupReportOversizeSentence(facts),
    nextAction: SETUP_REPORT_OVERSIZE_NEXT_ACTION,
    ...facts,
  };
}

/**
 * The two integers in a staged refusal record, or null when there is not a readable one.
 *
 * THE PROSE IN THE FILE IS NOT READ BACK, and that is deliberate. The record arrives through an
 * artifact - bytes a job this process does not control uploaded - and its destination is a log that
 * is public on a fork's pull request. Only the two numbers are taken, each checked to be a
 * non-negative safe integer, and the sentence is recomposed here from the one module that owns it.
 * A remote string can then decide nothing about what this log says.
 */
function readSetupReportRefusal(path) {
  let parsed;
  try {
    const info = lstatSync(path);
    if (!info.isFile() || info.isSymbolicLink() || info.size > MAX_SETUP_TRIAL_REFUSAL_BYTES) return null;
    parsed = JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return null;
  }
  if (parsed === null || typeof parsed !== "object") return null;
  if (parsed.schema !== SETUP_TRIAL_REFUSAL_SCHEMA || parsed.code !== SETUP_REPORT_OVERSIZE_CODE) return null;
  const count = (value) =>
    typeof value === "number" && Number.isSafeInteger(value) && value >= 0 ? value : null;
  const bytes = count(parsed.bytes);
  const maxBytes = count(parsed.maxBytes);
  return bytes === null || maxBytes === null ? null : { bytes, maxBytes };
}

/** The finished handoff envelope, as the measuring job hands it to the attestation job. */
const ATTESTATION_ENVELOPE_FILE = nonEvidenceBasename("handoff-envelope");

/* ------------------------------------------------------------------ the identity split */

/**
 * THE MEASURING JOB'S LAST ACT: leave what it would have sent, and send nothing.
 *
 * WHY IT EXISTS (Kenneth's identity-split ruling, 2026-08-29). On the borrow road abloh's step is
 * the last step of the customer's own test job, and that job now declares no `id-token: write` -
 * deliberately, because GitHub scopes that permission to a whole job and every step that ran before
 * abloh's would get the same mint endpoint. So this job cannot talk to abloh at all, which is the
 * point: neither can anything else in it. What it can do is leave its result on the run, and the
 * attestation job - abloh's own steps, in a job of its own, holding the permission there - files it.
 *
 * WHAT IT WRITES, AND NOTHING ELSE. At most two files: the setup trial's report exactly as the CLI
 * wrote it, and the handoff envelope exactly as the upload would have serialized it. Both are
 * documents that were already destined to leave this runner. The output directory as a whole is NOT
 * copied, because `abloh-run.local.json` lives there and embeds the customer's own source, and a
 * run artifact is readable by everyone who can read the repository.
 *
 * IT IS NOT A CLAIM ABOUT WHO PRODUCED THEM. Anything in the borrowed job can write a file and hand
 * it up under a name, so the attestation job's publication proves the REPOSITORY, which is what the
 * identity it mints says, and never that abloh's step is what produced the bytes. GitHub publishes
 * no claim that would let anybody prove the second thing from inside a composite action, so nothing
 * downstream may say it.
 */
export async function stageForAttestation(environment = process.env) {
  const staging = privateDirectory(environment.RUNNER_TEMP, ["abloh", "attestation"]);
  let staged = 0;

  const trialPath = validateArtifact({
    ...environment,
    ABLOH_ARTIFACT_NAME: SETUP_TRIAL_ARTIFACT,
  });
  if (trialPath !== null) {
    const bytes = readFileSync(trialPath);
    if (bytes.byteLength > SETUP_TRIAL_MAX_BYTES) {
      /*
       * REFUSED HERE, AND THE REFUSAL IS WHAT GOES UP IN THE REPORT'S PLACE.
       *
       * Dropping the report and staging nothing is what the tail probe measured: the attestation job
       * then found an empty directory, read it as an ordinary run with nothing to file, and
       * concluded success - so a maintainer's setup check never answered and no machine downstream
       * could say why. The record is one document, it is machine-readable, and it rides the same
       * artifact the report would have.
       *
       * THE MEASURING JOB STAYS GREEN. This step is the last step of the CUSTOMER'S test job, and
       * their tests are not what failed. The red belongs on `abloh-publish`, which is abloh's own
       * job and the one that reads this record.
       */
      process.stdout.write(
        setupReportOversizeLine({ bytes: bytes.byteLength, maxBytes: SETUP_TRIAL_MAX_BYTES }),
      );
      writeFileSync(
        join(staging, SETUP_TRIAL_REFUSAL_FILE),
        `${JSON.stringify(setupReportRefusalRecord(bytes.byteLength), null, 2)}\n`,
        { mode: 0o600 },
      );
      staged += 1;
    } else {
      writeFileSync(join(staging, SETUP_TRIAL_ARTIFACT), bytes, { mode: 0o600 });
      staged += 1;
    }
  }

  /* THE ENVELOPE ONLY WHEN THE RUN ACTUALLY FINISHED MEASURING. `validateArtifact` returning null is
     the same "there is nothing complete here" the upload step is already gated on - a sweep, a
     refused preflight, a trial that walled - and building an envelope from a partial run would hand
     the attestation job something to publish about a measurement that did not happen. */
  const resultsPath = validateArtifact({
    ...environment,
    ABLOH_ARTIFACT_NAME: evidenceBasename("artifact-json"),
  });
  if (resultsPath !== null) {
    const envelope = JSON.stringify(await buildEvidenceEnvelope(environment));
    writeFileSync(join(staging, ATTESTATION_ENVELOPE_FILE), envelope, { mode: 0o600 });
    staged += 1;
  }

  appendOutput(environment.GITHUB_OUTPUT, {
    path: staging,
    staged: staged === 0 ? "false" : "true",
  });
  if (staged === 0) {
    process.stdout.write(
      "Abloh: this run produced nothing to file, so the attestation job has nothing to do\n",
    );
  }
  return 0;
}

/** Refuses a symlink anywhere in a copied tree, by the same rule the top level applies. */
function notASymlink(source) {
  try {
    return !lstatSync(source).isSymbolicLink();
  } catch {
    return false;
  }
}

/**
 * THE COPY FILTER FOR A STAGED EVIDENCE DIRECTORY: no symlink, and no ledger, one level down.
 *
 * `evidenceUploadPlan` decides per manifest ROW, and a composed run's whole per-package tree is one
 * row - so the `.local.json` ledgers inside it were neither withheld nor named while the identical
 * files beside the artifact were both (`data/abloh-manifest-smoke-3/report.md`, finding L). The
 * permission comes from the same column here as it does up there, asked through
 * {@link stagedEvidenceIsLedger} so the registry stays the one author of the answer.
 *
 * IT NAMES WHAT IT HOLDS BACK, with the path INSIDE the tree rather than the basename: the same
 * ledger basename appears once per package, so a bare name would say one file where there are N and
 * point a maintainer at no particular one. Silence is what this cost - every other held-back file
 * is named, so the three that travelled looked like files the run never wrote.
 */
function stagedTreeFilter(root, label, withheld) {
  return (source) => {
    if (!notASymlink(source)) return false;
    if (!stagedEvidenceIsLedger(basename(source))) return true;
    withheld.push({
      basename: [label, ...relative(root, source).split(sep)].join("/"),
      reason: "local-only",
    });
    return false;
  };
}

/* ------------------------------------------------------ the run's own files, kept on the run */

/**
 * WHAT THE RUN WROTE, LEFT WHERE A MAINTAINER CAN DOWNLOAD IT (error-plane step 10).
 *
 * THE STATE THIS ENDS. Everything a run writes lands under `$RUNNER_TEMP`, and `$RUNNER_TEMP` is
 * deleted when the job ends. The verdict travelled - to the check run, to the control plane - and
 * the documents behind it did not, so a maintainer asking why a run said what it said had a
 * sentence and nothing to open. Wave 1's item 4 asked whether the artifact survives CI and measured
 * that it does not.
 *
 * IT ASKS THE RUN WHICH FILES THOSE ARE. `evidenceUploadPlan` reads the run's own manifest, not a
 * list in this Action: this Action is pinned by SHA in a customer's workflow and the CLI that wrote
 * the directory is resolved at run time, so a list here is one build's opinion about another
 * build's output. The census carried such a list and would have uploaded an empty artifact for
 * every repository the day the names changed.
 *
 * ONE NAME IS THIS ACTION'S TO STATE AND IT IS STAGED WHATEVER THE MANIFEST SAYS: the artifact
 * itself, whose path this Action DICTATED with `--json`. That is what makes an unreadable index a
 * degradation rather than an empty artifact, and it is exactly the sentence
 * `evidenceIndexMissingLines` already prints - the upload carries the artifact alone.
 *
 * A LEDGER IS NEVER STAGED. The registry's `role` column is what decides, an id this build cannot
 * look up is refused on the same rule, and every held-back file is NAMED in the log rather than
 * dropped in silence.
 *
 * WHICH IS A DIFFERENT LINE FROM THE ONE THE EVIDENCE UPLOAD DRAWS, and the difference is the
 * destination. A GitHub run artifact is readable by exactly the people who can read the repository,
 * so a span of that repository's own source inside it discloses nothing to anybody who could not
 * already read the line it came from - and `abloh-run.json` does carry those spans, in
 * `mutants[].originalText`. The evidence upload goes to a THIRD PARTY and its projection strips
 * them, which is why that boundary is tighter and not why this one should be. What
 * `abloh-run.local.json` adds on top of the repository's own bytes is the model's prose about them,
 * which is the reason it is a ledger and the reason `stageForAttestation` refuses to copy the
 * output directory whole.
 *
 * IT NEVER FAILS THE STEP. This runs after the measurement, over a verdict that has already been
 * decided and reported. A file that cannot be read is one file missing from a convenience download,
 * which is not worth turning a maintainer's check red for.
 */
export function stageRunEvidence(environment = process.env) {
  const staging = privateDirectory(environment.RUNNER_TEMP, ["abloh", "run-evidence"]);
  const resultsPath = validateArtifact({
    ...environment,
    ABLOH_ARTIFACT_NAME: evidenceBasename("artifact-json"),
  });
  if (resultsPath === null) {
    appendOutput(environment.GITHUB_OUTPUT, { path: staging, staged: "false" });
    return 0;
  }
  const outputDirectory = dirname(resultsPath);
  const { manifest, problem } = readEvidenceManifest(outputDirectory);
  reportMissingManifest(problem);
  const plan = evidenceUploadPlan(manifest);

  /* The dictated name first, then whatever the run listed, deduped - the manifest names the
     artifact too on every run that wrote one, and staging it twice would only be a slower copy. */
  const wanted = [basename(resultsPath), ...plan.upload];
  const withheld = [...plan.withheld];
  const seen = new Set();
  let staged = 0;
  for (const name of wanted) {
    if (seen.has(name)) continue;
    seen.add(name);
    /* EVERY WAY A NAMED FILE CAN FAIL TO GO UP IS THE SAME LINE, because a maintainer looking for a
       document in the download needs to be told it is absent whichever of these happened. Silence
       here is `docs/lessons/a-discarded-input-is-never-silent.md`: the run listed the name, so
       something under it existed when the run finished. */
    const unreadable = () => withheld.push({ basename: name, reason: "unreadable" });
    /* The manifest is a document written by a process this one does not own. `parseEvidenceManifest`
       already refuses a basename carrying a separator or a traversal; this is the second check, at
       the point the name becomes a path, because that is the one thing a stranger's file must not be
       able to say. */
    if (!/^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/u.test(name)) {
      unreadable();
      continue;
    }
    const source = join(outputDirectory, name);
    let info;
    try {
      info = lstatSync(source);
    } catch {
      unreadable();
      continue;
    }
    /* A SYMLINK IS NEVER FOLLOWED AND NEVER COPIED. It would put whatever it points at into an
       artifact readable by everyone who can read the repository, and nothing the run legitimately
       writes is one. The `filter` on the directory copy is the same rule one level down, and it is
       a filter rather than `dereference: false` because a link COPIED AS A LINK is not safe either:
       `actions/upload-artifact` resolves symlinks when it uploads. */
    if (info.isSymbolicLink()) {
      unreadable();
      continue;
    }
    try {
      if (info.isDirectory()) {
        cpSync(source, join(staging, name), {
          recursive: true,
          filter: stagedTreeFilter(source, name, withheld),
        });
      } else if (info.isFile()) writeFileSync(join(staging, name), readFileSync(source), { mode: 0o600 });
      else {
        unreadable();
        continue;
      }
    } catch {
      unreadable();
      continue;
    }
    staged += 1;
  }
  reportWithheldEvidence(withheld);
  appendOutput(environment.GITHUB_OUTPUT, {
    path: staging,
    staged: staged === 0 ? "false" : "true",
  });
  return 0;
}

/**
 * EVERY WAY THE AMBIENT ENVIRONMENT COULD TELL THE ATTESTATION JOB WHERE TO SEND AN IDENTITY.
 *
 * WHY THIS IS THE ONE JOB THAT HAS TO REFUSE THEM. The attestation job runs only abloh's own steps,
 * and that is exactly what makes it worth attacking: it is the one job in the customer's workflow
 * that holds `id-token: write`. A workflow-level `env:` block is inherited by EVERY job in the file,
 * including this one, and it sits hundreds of lines away from the job it affects - so a single line
 * added far from abloh's job could point abloh's own control-plane resolution at somebody else's
 * host and receive a freshly minted GitHub identity for this repository.
 *
 * A `with:` INPUT IS NOT THE SAME THING, and the difference is the whole rule. An input is written
 * on the job abloh added, in the diff a maintainer reviews, three lines from the permission it
 * affects. Ambient inheritance is invisible at the point of use. So the endpoints this job talks to
 * come from constants and from an input, and an ambient override is refused outright rather than
 * ignored - ignoring it would let an attacker learn nothing and try again, where a refusal puts the
 * attempt in the job log.
 *
 * IT RUNS BEFORE ANYTHING IS MINTED. A check after the mint would be a check on where a live
 * credential had already been sent.
 */
/**
 * Every name that could point the attestation job's minted identity at another host.
 *
 * DERIVED FROM THE CONTRACT, not listed. This was a hand-written list of sixteen names beside a
 * mapping of five doors, so a door added to the control plane would have had an override nothing
 * refused - and the whole point of this check is that a workflow-level `env:` block reaches every
 * job in the file, so a value there could send the identity this job mints somewhere else.
 *
 * TWO HALVES, and the second is deliberately narrower. Every door's `ABLOH_DEV_*` override is
 * refused, plus the command centre's. The RESOLVED names are refused only for the doors this job
 * actually posts to - `attestationEndpoints` sets those two and nothing else, and the measuring job
 * legitimately leaves the others in the environment the attestation job inherits.
 */
const ATTESTATION_DOORS = ["handoff", "setupTrial"];
const AMBIENT_ENDPOINT_OVERRIDES = [
  ...Object.keys(CONTROL_PLANE).flatMap((name) => {
    const prefix = DOOR_VARIABLE[name];
    if (prefix === undefined) fail(`the deployment contract names a control-plane door this Action cannot resolve: ${name}`);
    return [`ABLOH_DEV_${prefix}_URL`, `ABLOH_DEV_${prefix}_AUDIENCE`];
  }),
  "ABLOH_DEV_COMMAND_CENTER_ORIGIN",
  ...ATTESTATION_DOORS.flatMap((name) => [
    `${DOOR_VARIABLE[name]}_URL`,
    `${DOOR_VARIABLE[name]}_AUDIENCE`,
  ]),
];

export function refuseAmbientEndpointOverride(environment) {
  for (const name of AMBIENT_ENDPOINT_OVERRIDES) {
    if (typeof environment[name] === "string" && environment[name] !== "") {
      fail(
        `${name} was set in this job's environment, and the Abloh publish job resolves its ` +
        "control plane from the Action rather than from the environment it inherits. A " +
        "workflow-level `env:` block reaches every job in the file, so a value there could point " +
        "the identity this job mints at another host. Remove it, or pass `control-plane:` to the " +
        "attestation step where a reviewer can see it beside the permission it affects",
      );
    }
  }
}

/**
 * WHERE THE ATTESTATION JOB REPORTS TO.
 *
 * FROM CONSTANTS, and from one optional input that is written in the workflow file rather than
 * inherited. Our own development tier runs this Action against a tunnel instead of api.abloh.dev,
 * and it says so on the step - which is the same fact a customer's reviewer would see if anybody
 * ever tried to say it on somebody else's behalf.
 */
export function attestationEndpoints(environment = process.env) {
  const base = optional(environment.ABLOH_CONTROL_PLANE, "control-plane");
  const origin = base === "" ? HOSTED_API_ORIGIN : credentialFreeHttps(base, "control-plane");
  const root = origin.replace(/\/+$/u, "");
  /* The paths and audiences are the generated contract's, not this function's. This was the second
     place in this one file that spelled the handoff door out, and the two had to agree. */
  return {
    HANDOFF_URL: `${root}${CONTROL_PLANE.handoff.path}`,
    HANDOFF_AUDIENCE: CONTROL_PLANE.handoff.audience,
    SETUP_TRIAL_URL: `${root}${CONTROL_PLANE.setupTrial.path}`,
    SETUP_TRIAL_AUDIENCE: CONTROL_PLANE.setupTrial.audience,
  };
}

/**
 * THE ATTESTATION JOB'S WHOLE BODY OF WORK: file what the measuring job left, and nothing else.
 *
 * IT MEASURES NOTHING, BUILDS NOTHING AND RUNS NO CODE OF THE CUSTOMER'S. That is not an
 * implementation detail, it is the security property the split is for: this is the only job in the
 * customer's workflow that can mint abloh's identity, so the smaller the set of things that run
 * here, the smaller the set of things that could use it. It reads two files and posts them.
 *
 * A MISSING DIRECTORY IS A NO-OP AND NOT A FAILURE. The job runs on `!cancelled()`, so it runs after
 * a test job that failed before abloh's step ever started - and there is nothing to file then, which
 * is an ordinary outcome of an ordinary red build rather than a fault of abloh's to report.
 *
 * THE TRIAL REPORT IS FILED BEST-EFFORT AND THE EVIDENCE IS NOT, which is the rule each of them
 * already had in the job that used to send them. A trial that could not be delivered is still in the
 * run and the service reads finished runs; a measured run whose evidence never lands has a check
 * that will never answer, and that is worth a red job.
 *
 * THE ONE TRIAL FAILURE THAT IS ALSO WORTH A RED JOB is a report over the door's own ceiling, and
 * it is worth one on the rule directly above rather than despite it. "Still in the run and the
 * service reads finished runs" is what makes a delivery failure survivable, and it does not hold
 * here: the door refuses the same number this side refuses on, so the check will never answer
 * however long anybody waits. `reportSetupTrial` returns non-zero for that case alone.
 */
export async function attest(
  environment = process.env,
  fetchImpl = fetch,
  backoffMs = UPLOAD_RETRY_BACKOFF_MS,
) {
  refuseAmbientEndpointOverride(environment);
  const directory = optional(environment.ABLOH_ATTESTATION_DIR, "attestation directory");
  if (directory === "" || !existsSync(directory)) {
    process.stdout.write(
      "Abloh: the job that measured left nothing to file, so this job has nothing to do\n",
    );
    return 0;
  }
  const canonical = realpathSync(directory);
  if (!lstatSync(canonical).isDirectory()) fail("the attestation directory is not a directory");
  const resolved = { ...environment, ...attestationEndpoints(environment), ABLOH_OUTPUT_DIR: canonical };

  /* THE TRIAL FIRST. On a setup pull request it is the only document there, and it is the one a
     maintainer is waiting on - a slow or failing evidence post must not delay it. */
  let status = 0;
  if (
    existsSync(join(canonical, SETUP_TRIAL_ARTIFACT)) ||
    /* THE REFUSAL THE MEASURING JOB STAGED IN THE REPORT'S PLACE. Gating this call on the report
       alone is how an oversized one arrived here as silence: there was no report, so nothing ran,
       so nothing said anything, and the job concluded success. */
    existsSync(join(canonical, SETUP_TRIAL_REFUSAL_FILE))
  ) {
    status = await reportSetupTrial(resolved, fetchImpl, backoffMs);
  }

  const envelopePath = join(canonical, ATTESTATION_ENVELOPE_FILE);
  if (existsSync(envelopePath)) {
    const info = lstatSync(envelopePath);
    if (info.isSymbolicLink() || !info.isFile()) fail("the staged envelope is not a regular file");
    const posted = await postEvidenceEnvelope(
      resolved,
      readFileSync(envelopePath, "utf8"),
      fetchImpl,
      backoffMs,
    );
    if (posted !== 0) status = posted;
  }
  return status;
}

/**
 * Post the measured evidence to the control plane, authenticated by a fresh GitHub OIDC identity.
 *
 * Runs as its own step AFTER measurement, so the token is minted once the customer's tests have
 * finished — it never exists while their code is running. It is passed to no child process; the only
 * thing that sees it is this fetch.
 */
/**
 * THE UPLOAD IS RETRIED, because by the time it runs the measurement is already paid for.
 *
 * One transient network failure - a DNS blip, a closed connection, a control plane restarting -
 * used to lose the WHOLE run: baseline, coverage and mutation, minutes of
 * a customer's CI, discarded on `the evidence upload could not reach the control plane`. Nothing
 * about the measurement was wrong and nothing about it was recoverable, because the artifact lives
 * on a runner that is about to disappear.
 *
 * RETRYING IS SAFE HERE and would not be for an ordinary POST: the control plane matches a re-post
 * on body digest plus idempotency key and returns the ORIGINAL run id, so a request that landed
 * and then lost its response is deduplicated rather than double-counted. The body is serialized
 * once, above the loop, so every attempt is byte-identical and that match holds.
 *
 * ONLY TRANSIENT STATUSES. A 4xx is a decision the control plane made about this envelope and
 * repeating it changes nothing; 408, 429 and 5xx are the ones that mean "not now". 402 never
 * reaches here as a retry - it is the plan-limit outcome, and it is neutral, not a failure.
 *
 * 409 IS THE ONE 4xx THAT IS NOT A DECISION ABOUT THIS ENVELOPE (Kenneth, wave 4 split S3,
 * 2026-09-03: "that is a retry, not a message. It should never reach a customer at all"). The
 * control plane answers `IDEMPOTENCY_CONFLICT` when this run's CI identity already has a stored
 * body that is not this one - a re-delivered webhook, a re-run of the attestation job, two writers
 * racing. The measurement it describes is filed either way, so it is retried like a transient and,
 * if it is still the answer afterwards, it ends the upload with no refusal composed at all: see the
 * branch in `postEvidenceEnvelope`.
 */
const UPLOAD_RETRY_BACKOFF_MS = [1_000, 4_000];
const RETRYABLE_UPLOAD_STATUS = (status) =>
  status === 408 || status === 409 || status === 429 || status >= 500;

const sleep = (ms) => new Promise((resolve) => { setTimeout(resolve, ms); });

/* `backoffMs` is the one thing here a test cannot afford at its shipped value - proving the loop
   would cost five real seconds per case - so the table is a parameter. Production passes nothing. */
export async function uploadEvidence(
  environment = process.env,
  fetchImpl = fetch,
  backoffMs = UPLOAD_RETRY_BACKOFF_MS,
) {
  return await postEvidenceEnvelope(
    environment,
    JSON.stringify(await buildEvidenceEnvelope(environment)),
    fetchImpl,
    backoffMs,
  );
}

/**
 * THE ENVELOPE, BUILT WHERE THE FILES ARE.
 *
 * SPLIT OUT OF `uploadEvidence` FOR THE IDENTITY SPLIT (2026-08-29), along the one line that
 * matters: everything here reads this run's own output directory and needs no credential at all,
 * and everything in `postEvidenceEnvelope` needs an identity and no files. On the borrow road those
 * halves now happen in two different JOBS - the measuring job has the files and no identity, the
 * attestation job has the identity and no files - so what crosses between them is the finished
 * envelope and nothing else.
 *
 * THAT IS ALSO WHY THE ENVELOPE IS WHAT CROSSES, rather than the output directory. The envelope is
 * exactly the bytes that would have gone over the wire from this job, so handing it up as a run
 * artifact publishes nothing the upload would not have published anyway - where copying the
 * directory would put `abloh-run.local.json`, which embeds the customer's own source, into an
 * artifact anybody who can read the repository can download.
 */
export async function buildEvidenceEnvelope(environment = process.env) {
  /* The same proof the validate-artifact step performs: a regular file, not a symlink, inside the
     run's own output directory. Reused rather than re-implemented so both agree on what counts. */
  const resultsPath = validateArtifact({
    ...environment,
    ABLOH_ARTIFACT_NAME: evidenceBasename("artifact-json"),
  });
  /* THE DIRECTORY IS NAMED (Kenneth's error-plane step 12). This was one line with no owner, no
     next action and no statement of where abloh looked - and `apps/cli/src/run-outcome.ts` exists
     so that a refusing run leaves a machine-readable record in exactly that directory, which a
     reader cannot follow to if nothing names it. `upload-no-artifact` has owned the shape in the
     registry the whole time; `upload-refusal.mjs` is this side's copy of it. */
  if (resultsPath === null) {
    fail(
      uploadNoArtifactLines({
        expectedPath: join(
          optional(environment.ABLOH_OUTPUT_DIR, "output directory"),
          evidenceBasename("artifact-json"),
        ),
      }).join("\n"),
    );
  }

  const { buildStructuralHandoff, contextFromEnvironment } = await import("./build-handoff.mjs");
  const evidence = JSON.parse(readFileSync(resultsPath, "utf8"));
  /*
   * THE FOUR SIDECARS THAT LEAVE THIS RUNNER, AND THE TWO THAT NEVER DO.
   *
   * The model's rationales and the v1 fix loop's proofs USED TO BE READ HERE and handed on for a
   * tier-2 gate to decide about. The ladder is deleted, so there is no gate and no decision: the
   * receiving side deleted `acceptTier2Sidecars`, the fix bodies went with the v1 arm that proved
   * them, and the model's free-text triage prose went with the ladder that admitted it. They are not
   * read at all now rather than read and dropped, because a file this process never opens is a
   * stronger promise than one it opens and discards - and since phase B step 15 the promise is a
   * filename rather than a policy: the rationales are inside `abloh-run.local.json`, which is the
   * one file a run's own source is in and the one nothing sends. Both DIGESTS still travel in the
   * evidence block, which is what a verifier actually checks.
   */
  const outputDirectory = dirname(resultsPath);
  /*
   * WHICH FILE IS WHICH, ASKED OF THE RUN RATHER THAN ANSWERED BY THIS BUILD.
   *
   * These four names used to be written out here. That was one build's opinion about what a
   * DIFFERENT build wrote: a customer's workflow pins this Action by SHA and the CLI it installs is
   * resolved at run time, so the two are routinely different versions of this product, and the
   * agreement held only because no basename had ever changed. The manifest is the run's own index of
   * its output directory, so what the Action forwards is what the run says it wrote.
   *
   * A NAME THE RUN DID NOT WRITE IS ABSENT, which is the same answer the old `statSync` gave for a
   * file that was not there - so nothing downstream learned a new state. Most runs write no v2
   * evidence and every v1 run writes none.
   */
  const { manifest, problem: manifestProblem } = readEvidenceManifest(outputDirectory);
  reportMissingManifest(manifestProblem);
  const sidecarPath = (id) => {
    const name = manifestBasename(manifest, id);
    return name === null ? null : join(outputDirectory, name);
  };
  /* Filled by readOptionalFile with every sidecar that EXISTED and is not in the envelope, so a
     document dropped for size or permissions is named to the customer instead of vanishing. */
  const withheldSidecars = [];
  const sidecars = {
    /* Coverage is sent VERBATIM even though its absolute runner paths are not what gets stored: the
       control plane checks these exact bytes against `rawCoverageDigest` first and rewrites the
       paths afterwards. Normalizing here would produce bytes that match no commitment.

       WHAT IS ON DISK IS AN ENVELOPE and what goes up is the report inside it (manifest phase B,
       step 12). The coverage file now also carries the documents a merging run's report was derived
       from, which are LOCAL evidence and always were - and a monorepo's are N times the report, so
       forwarding them would push a real repository through the acceptor's own 4 MiB bound and lose
       the coverage view entirely. `coverageReportBytes` returns the input unchanged for a file
       written before that envelope existed, which is what a pinned older CLI still writes. */
    coverage: coverageBytes(readOptionalFile(sidecarPath("raw-coverage"), withheldSidecars)),
    /* The REDACTED report, never the verbatim one. That file embeds the customer's source and stays
       on this runner; this one is the source-free rewrite the CLI wrote and committed to. It rides
       on every run: the boundary is the redaction, which the CLI applied and the acceptor re-scans
       for, and it used to be gated at tier 1 and above by a number nothing writes any more. */
    mutationRedacted: readOptionalFile(sidecarPath("redacted-report"), withheldSidecars),
    /* The v2 engine's proofs. What bounds it is the acceptor, which verifies the bytes against
       `engineV2.proofsDigest` and keeps only candidates that PROVED. */
    engineV2Proofs: readOptionalFile(sidecarPath("engine-v2-proofs"), withheldSidecars),
    /* Pool 2's evidence: every agent-written bug this run handled, with its witness test. A second
       file rather than a wider first one, because the loop commits to the proofs sidecar's bytes
       before the pool has run - so this one carries its own commitment,
       `engineV2.disclosure.agentBugs.evidenceDigest`. Bounded the same way: the acceptor verifies
       the bytes against that digest and keeps only bugs the artifact SIGNED as survivors. */
    engineV2Pool2: readOptionalFile(sidecarPath("engine-v2-pool2"), withheldSidecars),
  };
  /* Said BEFORE the post, so a run whose upload then fails has still named what it could not carry. */
  reportWithheldSidecars(withheldSidecars);
  /* AND THE PER-PACKAGE V2 EVIDENCE A COMPOSED RUN WROTE, which the two fixed filenames above can
     never find (junction audit ACT-PKG-SIDECAR-01). */
  reportPackageSidecars(auditPackageSidecars(evidence, outputDirectory, manifest));
  /*
   * The artifact digest is computed HERE, over the exact bytes just read.
   *
   * contextFromEnvironment takes it from ABLOH_LOCAL_ARTIFACT_DIGEST, which the reusable workflow sets
   * from a shell `sha256sum`. This step has no such shell local, and an absent value becomes "" —
   * which the control plane refuses, so the omission would have failed every upload rather than
   * shipping a wrong digest. Computed from the file already in hand instead.
   */
  const artifactDigest = `sha256:${createHash("sha256").update(readFileSync(resultsPath)).digest("hex")}`;
  return buildStructuralHandoff(
    evidence,
    contextFromEnvironment({ ...environment, ABLOH_LOCAL_ARTIFACT_DIGEST: artifactDigest }),
    sidecars,
    /* THE INDEX TRAVELS TOO. The control plane names the documents a run produced, and until now it
       named them from a list in its own source - one deployment's opinion about a run performed
       weeks earlier by a version it never sees. It is already in hand: this step read it a few lines
       above to decide which sidecar was which. */
    manifest,
  );
}

/**
 * THE POST, WHEREVER THE IDENTITY IS.
 *
 * It takes the envelope as BYTES rather than as an object, because the retry loop's deduplication
 * depends on every attempt being byte-identical - and because on the borrow road these bytes were
 * serialized in another job, and re-serializing them here could only ever produce a body the
 * producer did not commit to.
 */
export async function postEvidenceEnvelope(
  environment = process.env,
  body,
  fetchImpl = fetch,
  backoffMs = UPLOAD_RETRY_BACKOFF_MS,
) {
  const handoffUrl = credentialFreeHttps(environment.HANDOFF_URL, "handoff-url");
  const audience = required(environment.HANDOFF_AUDIENCE, "handoff-audience");
  if (audience.length > 512) fail("handoff-audience is too long");
  const token = await mintGitHubIdentity(environment, audience, "evidence handoff", fetchImpl);
  let response;
  /* THE LAST ATTEMPT'S OWN WORDS, outside the loop because the block that prints them is outside it
     too. Every attempt overwrites it, so what a maintainer reads is the failure that ended the
     retries rather than the first one. */
  let transportError = null;
  for (let attempt = 1; ; attempt += 1) {
    let failure = null;
    try {
      response = await fetchImpl(handoffUrl, {
        method: "POST",
        headers: {
          authorization: `Bearer ${token}`,
          "content-type": "application/json",
          accept: "application/json",
        },
        body,
        redirect: "error",
        signal: AbortSignal.timeout(30_000),
      });
    } catch (error) {
      response = null;
      failure = "could not reach the control plane";
      /* KEPT FOR THE REFUSAL BLOCK BELOW. `upload-unreachable` declares the transport error as
         evidence, and it was discarded here - so the last attempt's own words never reached the
         maintainer whose runner could not open the socket. */
      transportError = error instanceof Error ? error.message : String(error);
    }
    if (response !== null && !RETRYABLE_UPLOAD_STATUS(response.status)) break;
    if (response !== null) failure = `HTTP ${response.status}`;
    if (attempt > backoffMs.length) {
      if (response === null) {
        fail(
          uploadUnreachableLines({
            endpoint: handoffUrl,
            transportError: transportError ?? "the request raised no message",
          }).join("\n"),
        );
      }
      break;
    }
    const wait = backoffMs[attempt - 1];
    process.stdout.write(
      `Abloh: the evidence upload did not land (${failure}); retrying in ${Math.round(wait / 1000)}s ` +
      `(attempt ${attempt + 1} of ${backoffMs.length + 1})\n`,
    );
    await sleep(wait);
  }
  if (response.status === 402) {
    /*
     * PLAN LIMIT — A NEUTRAL OUTCOME, NOT A FAILURE.
     *
     * The measurement already ran and said whatever it said; only the upload is declined, because
     * this repository is beyond what the organization's plan covers. Failing the job here would put
     * a red X on a pull request for a billing reason, on the very repository somebody was about to
     * expand into — the product looking broken when nothing about their tests is wrong.
     *
     * This is the ONE case where the response body is surfaced. The rule below exists because a
     * remote string in a public build log is how a service's internals leak; this message is one we
     * author for exactly this purpose, and it is bounded and stripped of control characters before
     * printing so a misbehaving control plane still cannot dictate what appears there.
     */
    /*
     * READ THROUGH THE SHARED ENVELOPE READER, because the shape read here was one nobody sends.
     *
     * The body is `{ error: { code, message } }` and this branch read `body.message`, so the
     * sentence was never found and the fallback below spoke for every real 402. For the
     * pull-request check ceiling - a limit on how many times ONE pull request is measured - that
     * fallback is false: the repository IS covered, and the message the service actually sent says
     * to open a new pull request. `refusalMessage` bounds the string and strips its control
     * characters, which is what this branch did by hand; refusal-envelope.mjs says why the reader
     * is shared with the service that writes the envelope.
     */
    /*
     * COMPOSED HERE FROM FACTS, AND FALLING BACK TO THE SERVICE'S SENTENCE (Kenneth, 2026-09-02).
     *
     * The branch printed `error.message` - prose the control plane composed - and the registry code
     * for it, `upload-plan-limit`, passed that prose straight back out under an `account` owner
     * nothing checked. It was one of the two `PASSTHROUGH_SUMMARY_EXEMPTIONS`. A sentence composed
     * at the service is composed by a build that never saw the run reading it, because a workflow
     * pins this Action by SHA while `api.abloh.dev` is whatever shipped last.
     *
     * SO THE FACTS TRAVEL AND THE WORDS ARE THIS BUILD'S, and the next action is printed beside
     * them - the old line had none at all, on the one refusal whose whole point is that there is
     * something the reader can do about it.
     *
     * BOTH SHAPES ACCEPTED. `planRefusalFactsOf` returns null against a control plane older than
     * the `facts` key, and the line below is then byte for byte what it always was. An old Action
     * meeting a new service reads `error.message`, which is still sent.
     */
    const body = await response.json().catch(() => null);
    const facts = planRefusalFactsOf(body);
    /* THE SENTENCE, FROM THIS BUILD WHERE THE FACTS ARRIVED AND FROM THE SERVICE WHERE THEY DID
       NOT. The fallback is byte for byte what this line printed before the facts existed. */
    const message =
      facts === null
        ? refusalMessage(body) ?? "this repository is beyond what your plan covers"
        : planRefusalSentence(facts);
    process.stdout.write(`Abloh: evidence not uploaded — ${message}\n`);
    /* AND THE NEXT ACTION, which this branch never carried at all - on the one refusal whose whole
       point is that there is something the reader can do about it. Absent against an older control
       plane, because a next action composed from facts nobody sent would be invented. */
    const nextAction = facts === null ? null : planRefusalRemedy(facts);
    if (nextAction !== null) process.stdout.write(`Abloh: next: ${nextAction}\n`);
    return 0;
  }
  if (response.status === 409) {
    /*
     * ALREADY FILED, WHICH IS NOT A REFUSAL (Kenneth, wave 4 split S3, 2026-09-03).
     *
     * `IDEMPOTENCY_CONFLICT` means this run's CI identity already carries a stored body and it is
     * not this one. The first body is the one on the pull request, so the thing a maintainer cares
     * about - is the measurement filed - is answered yes, and there is nothing for them to do about
     * which of two bodies won. Composing `upload-refused` here put "abloh's own service refused this
     * run's result" and a report id in front of a customer for a bookkeeping race.
     *
     * AND NOTHING IS PRINTED, WHICH IS THE RULING TAKEN LITERALLY: "it should never reach a
     * customer at all". Nothing is discarded either, which is why silence is honest here rather
     * than the shape `docs/lessons/a-discarded-input-is-never-silent.md` forbids - the measurement
     * this envelope describes is already filed under this run's identity, so the customer has the
     * result and the only thing dropped is a second copy of it. A line here would also be a raw
     * emission outside the message contract, on a runner where the Action cannot reach the
     * registry, which is the second reason it is not worth inventing one.
     */
    return 0;
  }
  if (!response.ok) {
    /*
     * NEVER A BARE STATUS (cycle-2 retry census, 2026-08-30, finding 5).
     *
     * This line used to be the whole message: `the control plane refused the evidence upload
     * (HTTP 400)`, on the job whose only purpose is to file the report. Nobody outside the control
     * plane's own logs could tell that refusal apart from any other 400 - the census reviewer read
     * "unregistered repository" as one plausible cause and had no evidence for it - and the run it
     * describes was a complete, correct measurement.
     *
     * `upload-refused` has owned this shape in the registry the whole time, with the sentence, the
     * owner, the reportable identifier and an evidence slot named "what the control plane said".
     * `upload-refusal.mjs` is this side's copy of it, pinned to the registry by
     * `scripts/upload-refusal-parity.test.ts`.
     *
     * THE BODY IS READ THROUGH THE SHARED ENVELOPE READER, exactly as the 402 branch above does.
     * The old comment here withheld it as "a remote string", which is sound about an arbitrary one
     * and wrong about this one: every 4xx this service returns is an envelope it authored, and
     * `refusalMessage`/`refusalCode` bound it and strip its control characters, so a misbehaving
     * control plane can still only choose which of its own sentences appears.
     *
     * ONE WRITE, NOT TWO STREAMS. The block goes to stderr in the same call that fails the step, so
     * a runner cannot interleave the explanation after the failure it explains.
     */
    const body = await response.json().catch(() => null);
    fail(
      uploadRefusedLines({
        status: response.status,
        code: refusalCode(body),
        message: refusalMessage(body),
        /* THE TWO FACTS THE TENANCY ARM NEEDS, AND NEITHER COMES FROM THE ANSWER (split S3's
           remaining arm, ruled 2026-09-03). The control plane names no organisation in a tenancy
           refusal - error text is a place tenancy leaks - so the id in that sentence is the one the
           WORKFLOW addressed, read off the handoff URL, and the file is the workflow this job came
           from. Both are the customer's own values, which is what makes the remedy an edit they can
           make rather than a fact they have to go and look up. */
        organization: organizationFromHandoffUrl(handoffUrl),
        workflow: workflowFromRef(environment.GITHUB_WORKFLOW_REF),
      }).join("\n"),
    );
  }
  return 0;
}

/** The bound one sidecar may not pass. Stated once so the refusal text and the check cannot drift. */
const SIDECAR_MAX_BYTES = 16 * 1024 * 1024;

/** How a sidecar that EXISTED came not to be forwarded, and the sentence a customer can act on. */
const WITHHELD_SIDECAR_CAUSES = {
  oversize:
    `a sidecar is bounded at 16 MiB. This is usually one pull request touching an unusually large ` +
    `number of changed functions - narrow the diff and rerun, and the evidence comes back`,
  empty:
    "the file is empty, which a finished run does not write - rerun the step that produced it",
  unreadable:
    "the file could not be read on this runner - check the permissions on the output directory and rerun",
};

/**
 * WHERE A COMPOSED RUN'S V2 EVIDENCE ACTUALLY IS, AND WHETHER IT IS STILL WHAT THE ARTIFACT SIGNED.
 *
 * Junction audit ACT-PKG-SIDECAR-01 (2026-08-28). A run that measures several packages writes ONE
 * v2 sidecar PER PACKAGE, under `abloh-engine-v2-packages/<slug>/`, and each package's block in the
 * artifact commits to that file's digest. This step read two fixed filenames in the artifact's own
 * directory and nothing else, so on every composed run it found neither, treated the absence as the
 * ordinary "this run produced no v2 evidence", and uploaded an envelope with none. The evidence
 * existed, it was signed, and nothing in the job log, the egress audit or the run page said it had
 * been left behind.
 *
 * THE ARTIFACT IS THE MANIFEST'S AUTHORITY. The package list comes from `evidence.engineV2.packages`
 * - which is inside the digested artifact - and the manifest file only says WHERE each package's
 * file was written. A manifest naming a package the artifact does not is ignored; a package the
 * artifact names and the manifest does not is reported missing. So a producer cannot add evidence by
 * editing a side file, and cannot hide evidence by deleting a row from one.
 *
 * WHAT IT DOES NOT DO IS UPLOAD THEM. The envelope carries one v2 proofs document and one pool-2
 * document, and widening that is a separate decision about what may leave a customer's CI. What this
 * closes is the silence: every package's evidence is named, its digest checked against the artifact,
 * and its absence from the upload stated in the job log.
 *
 * @returns {Array<{directory: string, path: string, state: "verified"|"missing"|"unlisted"|"digest-mismatch"|"unreadable"}>}
 */
export function auditPackageSidecars(evidence, outputDirectory, index = null, readFile = readFileSync) {
  const packages = evidence?.engineV2?.packages;
  if (!Array.isArray(packages) || packages.length === 0) return [];
  let listed = new Map();
  try {
    /* THE DIRECTORY'S NAME COMES FROM THE RUN, like every other name this step resolves. It was
       `"abloh-engine-v2-packages"` written out here until 2026-09-02 - this Action's opinion about
       what a CLI it never sees called a directory, on the one path where the two are most often
       different versions. Publication lists the directory row in the run's own index exactly as it
       lists the files, so there is nothing to guess; `storedEvidenceBasename` is the same ladder the
       sidecars above take, and it answers with today's name for a run that uploaded no index. */
    const sidecars = JSON.parse(
      readFile(
        join(
          outputDirectory,
          storedEvidenceBasename(index?.outputs ?? null, "engine-v2-packages"),
          ENGINE_V2_PACKAGE_SIDECAR_INDEX,
        ),
        "utf8",
      ),
    );
    if (Array.isArray(sidecars?.packages)) {
      for (const row of sidecars.packages) {
        if (typeof row?.directory === "string" && typeof row?.proofs === "string") {
          listed.set(row.directory, row.proofs);
        }
      }
    }
  } catch {
    /* No manifest is not an error here: an older CLI wrote none, and every package below is then
       reported `unlisted`, which is the true statement about what this runner can find. */
    listed = new Map();
  }
  const records = [];
  for (const entry of packages) {
    const directory = typeof entry?.directory === "string" ? entry.directory : "";
    /* THE DIGEST IS ON THE PACKAGE'S OWN BLOCK, WHICH IS WHERE THE PRODUCER PUT IT (finding E,
       `data/abloh-manifest-smoke-2/report.md` section 11). A `packages[]` entry is
       `{directory, block}` and has been since the composition was written - `composedProofsDigest`
       in `packages/engine-v2/src/composition.ts` is the authority and reads
       `entry.block.proofsDigest` for the same list. This read the field one level up, found
       nothing on every entry of every composed run, and printed "its block records no digest to
       check the file against" beside "0 matched the digest this run's artifact signed" - four
       false clauses over evidence that was present, signed and correct. It also disabled the only
       check that would notice a per-package sidecar that was NOT, which is what the step is for.

       THERE IS NO FLAT SPELLING TO FALL BACK TO. No producer has ever written one, so a fallback
       would be this Action inventing a shape to accept - the same thing this function was fixed for
       once already, one field over. A non-completed package block genuinely carries no digest, and
       `unreadable` is then the true statement about it. */
    const expected = typeof entry?.block?.proofsDigest === "string" ? entry.block.proofsDigest : null;
    const relativePath = listed.get(directory);
    if (relativePath === undefined) {
      records.push({ directory, path: "", state: "unlisted" });
      continue;
    }
    let bytes;
    try {
      bytes = readFile(join(outputDirectory, relativePath), "utf8");
    } catch {
      records.push({ directory, path: relativePath, state: "missing" });
      continue;
    }
    if (expected === null) {
      records.push({ directory, path: relativePath, state: "unreadable" });
      continue;
    }
    const actual = createHash("sha256").update(bytes, "utf8").digest("hex");
    records.push({
      directory,
      path: relativePath,
      state: actual === expected ? "verified" : "digest-mismatch",
    });
  }
  return records;
}

/** One line per package, because a composed run's evidence must not go quiet. */
function reportPackageSidecars(records) {
  if (records.length === 0) return;
  const verified = records.filter((record) => record.state === "verified");
  process.stdout.write(
    `Abloh: this run measured ${records.length} package(s), each with its own v2 evidence file. ` +
      `${verified.length} matched the digest this run's artifact signed. None of them is in this ` +
      "upload - the envelope carries one v2 document, so per-package evidence stays in CI with the " +
      "job's artifacts, where the artifact's own per-package digests identify it.\n",
  );
  for (const record of records) {
    if (record.state === "verified") continue;
    const why =
      record.state === "unlisted"
        ? "the run wrote no manifest row for it, so this step cannot say where its file is"
        : record.state === "missing"
          ? `its file (${record.path}) is not on this runner`
          : record.state === "digest-mismatch"
            ? `its file (${record.path}) does not match the digest the artifact signed`
            : "its block records no digest to check the file against";
    process.stdout.write(
      `Abloh: the v2 evidence for ${record.directory || "the repository root"} could not be ` +
        `verified - ${why}.\n`,
    );
  }
}

/**
 * A sidecar's raw bytes, or undefined when the run produced none.
 *
 * WHEN BYTES EXISTED AND ARE NOT RETURNED, THIS SAYS SO. The bound and the absent case used to
 * collapse into one `undefined`, and the caller could not tell them apart: a v2 run big enough to
 * pass 16 MiB - the loop's sidecar carries every candidate of every round with its body, plus the
 * triage records and the ledger, and nothing caps it producer-side - uploaded an envelope with no v2
 * evidence in it. The control plane then saw NO sidecar rather than a refused one, so its acceptor
 * recorded no proofs AND no refusal, and the tests the run proved disappeared with nothing said
 * about them in the job log, the egress audit, or the run page.
 *
 * A file that was never written stays silent: most runs write no v2 sidecar at all, and a line about
 * every file a run did not produce trains a reader to skip the log.
 */
/**
 * THE RUN'S OWN INDEX OF ITS OUTPUT DIRECTORY, or null when there is not a readable one.
 *
 * NULL IS ONE THING: this process could not read an index here. It is not "the run produced
 * nothing" - the caller has already proved a complete artifact is present - so the caller says so
 * out loud rather than quietly forwarding an envelope with no evidence in it.
 */
function readEvidenceManifest(outputDirectory) {
  let text;
  try {
    text = readFileSync(join(outputDirectory, evidenceBasename("evidence-manifest")), "utf8");
  } catch {
    return { manifest: null, problem: "absent" };
  }
  const manifest = parseEvidenceManifest(text);
  return { manifest, problem: manifest === null ? "unreadable" : null };
}

/**
 * Say it when the index is missing, because everything downstream of it goes quiet.
 *
 * A complete artifact with no readable index beside it is a CLI older than this Action, or a file
 * this runner could not read. Either way the sidecars cannot be identified, the upload carries the
 * artifact alone, and the run page shows a measurement with no evidence attached to it. Before this
 * the four names were written out here and that state could not arise; now it can, and the one
 * thing it must not be is silent (`docs/lessons/a-discarded-input-is-never-silent.md`).
 */
function reportMissingManifest(problem) {
  if (problem === null) return;
  for (const line of evidenceIndexMissingLines(problem)) process.stdout.write(`${line}\n`);
}

/**
 * Name every file the run listed that is not in the download, and why.
 *
 * ONE LINE PER FILE RATHER THAN A COUNT, on the same reasoning as the withheld-sidecar report the
 * upload step prints: a maintainer looking for a document needs the name they were looking for, and
 * a number tells them only that something is absent. The sentences are
 * `packages/core/src/evidence-registry.ts`'s, rendered in by `pnpm gen:action`, so this file
 * composes none of its own.
 */
function reportWithheldEvidence(entries) {
  for (const entry of entries) {
    const line = evidenceWithheldLine(entry);
    process.stdout.write(`${line}\n`);
  }
}

/**
 * The provider's merged report out of the coverage file, whichever shape that file is in.
 *
 * `undefined` in, `undefined` out - an absent sidecar stays absent rather than becoming an empty
 * string, because the envelope distinguishes "no coverage was written" from "coverage was written
 * and held nothing".
 */
function coverageBytes(text) {
  return text === undefined ? undefined : coverageReportBytes(text);
}

function readOptionalFile(path, withheld) {
  /* A path the manifest does not name is a file the run did not write - the same answer the stat
     below used to give for a name that was not there, so no caller has a new state to learn. */
  if (path === null) return undefined;
  let bytes;
  try {
    bytes = statSync(path).size;
  } catch {
    return undefined;
  }
  const cause = bytes < 1 ? "empty" : bytes > SIDECAR_MAX_BYTES ? "oversize" : null;
  if (cause !== null) {
    withheld?.push({ path, bytes, cause });
    return undefined;
  }
  try {
    return readFileSync(path, "utf8");
  } catch {
    withheld?.push({ path, bytes, cause: "unreadable" });
    return undefined;
  }
}

/**
 * Name every sidecar that existed on disk and is not in the envelope.
 *
 * The BASENAME, never the path: an absolute runner path in a public build log is the same leak the
 * refused-upload branch above avoids, and the file is beside the artifact where the customer already
 * knows to look. The step still exits 0 - the measurement ran and said whatever it said, and only a
 * document that describes it is missing.
 */
function reportWithheldSidecars(withheld) {
  for (const entry of withheld) {
    const mib = (entry.bytes / (1024 * 1024)).toFixed(1);
    process.stdout.write(
      `Abloh: ${basename(entry.path)} (${mib} MiB) was not uploaded - ` +
      `${WITHHELD_SIDECAR_CAUSES[entry.cause]}. The run's score is unaffected; ` +
      `the evidence this file carried is not on the pull request.\n`,
    );
  }
}

/**
 * The runner image this job is about to hand Abloh, said out loud before anything runs.
 *
 * A hosted check BORROWS the environment this job prepares: it copies the tree the customer's own
 * install and build steps left into the sealed image rather than reconstructing one. So which
 * runner image the job is on is a fact about what was measured, and the promise attached to it is
 * that every run records what it inherited.
 *
 * DISCLOSED, NEVER A CARRY KEY. GitHub reissues its hosted runner images roughly weekly. Treating a
 * new `ImageVersion` as an environment change would drop every stored verdict of every customer
 * every week for a change that in almost every case moved nothing a test can see, and carry-forward
 * plus the shared triage cache are worth 38 points of rerun saving. The fields that ARE allowed to
 * invalidate a verdict - node, the package manager, the declared runtimes, the lockfiles - are read
 * from the tree by the CLI and hashed into the preparation recipe there.
 *
 * The image id is absent off a GitHub-hosted runner, which self-hosted runners are, and an unknown
 * image is stated as unknown rather than left out.
 */
export function describeInheritedRunner(environment = process.env) {
  const os = environment.ImageOS ?? "unknown";
  const version = environment.ImageVersion ?? "unknown";
  const platform = environment.RUNNER_OS ?? "unknown";
  const arch = environment.RUNNER_ARCH ?? "unknown";
  return `Abloh: measuring inside the environment this job prepares - runner image ${os} ${version} on ${platform}/${arch}\n`;
}

async function main(environment = process.env) {
  /*
   * BEFORE ANY PHASE, AND BEFORE ANY CHILD. `action.yml` already stripped these with `env -u` in the
   * `shell:` command itself, which is the only moment early enough to stop bash sourcing `BASH_ENV`
   * and node preloading `NODE_OPTIONS`. This second pass is what keeps them out of the six child
   * environments this file builds from `{ ...environment }`, so a spawn site cannot reintroduce one
   * by forgetting. See `AMBIENT_INTERPRETER_HOOKS` for the whole argument.
   */
  neutralizeAmbientInterpreterHooks(environment);
  const command = process.argv[2];
  if (command === "resolve-control-plane") {
    appendEnvironmentFile(environment.GITHUB_ENV, resolveControlPlane(environment));
    return 0;
  }
  if (command === "provision-runtime") {
    const runtime = provisionNodeRuntime(environment);
    /*
     * A STEP OUTPUT, NOT `$GITHUB_PATH` AND NOT `$GITHUB_ENV`.
     *
     * `$GITHUB_PATH` would put abloh's node in front of the customer's for every later step of their
     * job and for every process the CLI spawns - including the cold-lane setup script, which is the
     * customer's own build recipe and must run on the runtime their workflow declared. `$GITHUB_ENV`
     * is narrower and still a variable somebody else's step could read or a later step of ours could
     * forget to set. An output is named at each use site in `action.yml`, so a step that forgot it
     * would be visible in the file rather than silently inheriting whatever was on PATH.
     */
    appendOutput(environment.GITHUB_OUTPUT, { "node-path": runtime.path });
    return 0;
  }
  if (command === "preflight") {
    const result = preflight(environment);
    process.stdout.write(describeInheritedRunner(environment));
    appendOutput(environment.GITHUB_OUTPUT, {
      base: result.effectiveBase,
      head: result.measuredHead,
      /* READ BY NOTHING IN `action.yml` TODAY, and emitted anyway: the upload step is already gated
         on a completed artifact, which a sweep never writes, so this changes no behaviour. It is
         here because "did this run attest" is the fact a later step or a collecting harness has to
         be able to ask without inferring it from the absence of a file. */
      attesting: result.attesting ? "true" : "false",
      "repository-root": result.repositoryRoot,
      "output-dir": result.outputDirectory,
      "baseline-dir": result.baselineDirectory,
      "coverage-cache-dir": result.coverageCacheDirectory,
      "v2-store-dir": result.engineV2Directory,
      "triage-cache-dir": result.triageCacheDirectory,
      /* THE ADMITTED SPEC, NOT THE INPUT. `action.yml` hands the install step this output rather
         than `inputs.cli-tarball`, so the install cannot be reached with a value this boundary did
         not approve - a structural contract rather than an ordering one. See `admitCliOverride`. */
      "cli-tarball": result.admittedCliTarball,
    });
    return 0;
  }
  if (command === "install-cli") {
    const result = installCli(environment);
    appendOutput(environment.GITHUB_OUTPUT, { path: result.cli, prefix: result.prefix });
    return 0;
  }
  if (command === "run") return runAbloh(environment);
  if (command === "upload") return await uploadEvidence(environment);
  if (command === "report-setup-trial") return await reportSetupTrial(environment);
  /* THE DIAGNOSTIC HALF OF `validate-artifact`, and it is a separate verb on purpose: that one is
     read by a shell that branches on its stdout, so a sentence printed from inside it would arrive
     as an artifact path. This one writes to stderr, returns nothing to the shell and always exits
     0 - a note about a failure may never become a second failure. */
  if (command === "explain-missing-artifact") {
    explainMissingArtifact(environment);
    return 0;
  }
  if (command === "stage-for-attestation") return await stageForAttestation(environment);
  if (command === "stage-run-evidence") return stageRunEvidence(environment);
  if (command === "attest") return await attest(environment);
  if (command === "validate-artifact") {
    const artifact = validateArtifact(environment);
    if (artifact !== null) process.stdout.write(artifact);
    return 0;
  }
  fail(
    "expected resolve-control-plane, provision-runtime, preflight, install-cli, prepare, run, " +
    "upload, report-setup-trial, stage-for-attestation, stage-run-evidence, attest, " +
    "validate-artifact, or explain-missing-artifact",
  );
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  try {
    process.exitCode = await main(process.env);
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 2;
  }
}
