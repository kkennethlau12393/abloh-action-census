#!/usr/bin/env node
/**
 * THE RUNNER-SIDE ENTRY POINT for the `abloh-ci-handoff/v2` envelope.
 *
 * The composer itself is `handoff-envelope.mjs` and this file is what a GitHub job reaches it
 * through: it reads the environment the job set, reads the artifact off disk, and prints the
 * envelope. It moved out of this file so the CLI could import the composer without importing a
 * module that runs itself - see that file's header.
 *
 * Everything published from here is re-exported below, so every caller and every test that already
 * names this file keeps naming it.
 */

import { readFileSync, realpathSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { InvariantError } from "./invariant.generated.mjs";
/*
 * WHETHER THIS JOB WAS HANDED THE REPOSITORY'S MODEL CREDENTIAL, read by the rule that owns it.
 *
 * The rule lives in `packages/core/src/identity-condition.ts` and arrives here through
 * `pnpm gen:action`, exactly as the three identity sentences do. It is asked HERE rather than
 * carried from the measuring step, because both roads out - the upload and the staging for the
 * attestation job - build the envelope in the same job the measurement ran in, and both read the
 * same two variables. A second reading written into this file would be the shape that told every
 * hosted run its pull request comes from a fork.
 */
import { repositoryModelCredentialOfEnvironment } from "./identity-condition.generated.mjs";
import { buildStructuralHandoff, L0_REASON_CODES, MAX_UPLOADED_FINDINGS, normalizeL0Reason } from "./handoff-envelope.mjs";

export { buildStructuralHandoff, L0_REASON_CODES, MAX_UPLOADED_FINDINGS, normalizeL0Reason };

export function contextFromEnvironment(environment = process.env) {
  return {
    repository: environment.GITHUB_REPOSITORY ?? "",
    triggerSha: environment.ABLOH_TRIGGER_SHA ?? "",
    headSha: environment.ABLOH_HEAD_SHA ?? "",
    pullRequest: environment.ABLOH_PULL_REQUEST ?? "",
    workflowRef: environment.GITHUB_WORKFLOW_REF ?? "",
    workflowSha: environment.GITHUB_WORKFLOW_SHA ?? "",
    runId: environment.GITHUB_RUN_ID ?? "",
    runAttempt: environment.GITHUB_RUN_ATTEMPT ?? "",
    artifactDigest: environment.ABLOH_LOCAL_ARTIFACT_DIGEST ?? "",
    policySource: environment.ABLOH_POLICY_SOURCE ?? "",
    policyPath: environment.ABLOH_POLICY_PATH ?? "",
    policyDigest: environment.ABLOH_POLICY_DIGEST ?? "",
    /*
     * WHAT THE JOB CAN SAY ABOUT THE REPOSITORY'S MODEL CREDENTIAL, or null when it can say nothing.
     *
     * `null` IS THE ORDINARY ANSWER and is what every environment that predates the variable gives,
     * along with every job that could mint an identity and every fork run - see the rule's own
     * header for why each of those three is silence rather than an absence.
     */
    modelCredential: repositoryModelCredentialOfEnvironment(environment),
  };
}

/*
 * `readSidecar` STOOD HERE and is deleted with the two files it read.
 *
 * It was this entry point's bounded reader for `attest-rationales.json` and `attest-fix-proofs.json`
 * - the tier-2 pair - and it had no other caller. The live envelope's four sidecars are read by
 * `readOptionalFile` in `action-boundary.mjs`, which also names to the customer any document it
 * could not carry.
 */

function main() {
  const evidencePath = process.env.ABLOH_EVIDENCE_PATH;
  if (!evidencePath) throw new InvariantError("ABLOH_EVIDENCE_PATH is required");
  const evidence = JSON.parse(readFileSync(evidencePath, "utf8"));
  /*
   * THE TWO SIDECARS THIS USED TO READ ARE THE TWO NOTHING ACCEPTS.
   *
   * `ABLOH_RATIONALES_PATH` and `ABLOH_FIX_PROOFS_PATH` were read here and handed on for the tier-2
   * gate to decide about. The ladder is deleted and `buildStructuralHandoff` carries neither key, so
   * reading them would be opening the model's triage prose to drop it. The live envelope is built by
   * `action-boundary.mjs`, which reads the four sidecars the control plane actually accepts.
   */
  const sidecars = undefined;
  process.stdout.write(
    JSON.stringify(buildStructuralHandoff(evidence, contextFromEnvironment(), sidecars)),
  );
}

/*
 * Run as a script, stay silent when imported.
 *
 * Two traps here, both of which produce an EMPTY envelope rather than an error:
 *
 *  - The workflow pipes this file to `node --input-type=module` on STDIN, where
 *    process.argv[1] is undefined. Any comparison against it fails, main() never
 *    runs, and the upload step writes a zero-byte payload.
 *  - argv[1] is the path as given, while import.meta.url is fully resolved. On
 *    macOS /var is a symlink to /private/var, so the two disagree for the same
 *    file. Both sides are therefore reduced to a real path before comparison.
 */
function isEntryPoint() {
  const entry = process.argv[1];
  if (!entry) return true; /* stdin: nothing else could have imported us */
  try {
    return realpathSync(entry) === realpathSync(fileURLToPath(import.meta.url));
  } catch {
    return false;
  }
}

if (isEntryPoint()) main();
