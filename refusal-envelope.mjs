/**
 * THE ONE SHAPE A CONTROL-PLANE REFUSAL ARRIVES IN, and the one place that reads it.
 *
 * Every refusal this service returns is `{ "error": { "code": ..., "message": ... } }` -
 * `refusalEnvelope` in `apps/api/src/refusal-envelope.ts` builds it, and every 4xx door sends what
 * that function returned, unchanged.
 *
 * THE ACTION USED TO READ A SHAPE NOBODY SENDS. On HTTP 402 - the plan-limit outcome, and the one
 * status whose body is deliberately shown to the customer - the boundary read `body.message`. That
 * key does not exist at the top level of any refusal, so the read always missed and every real 402
 * printed the fallback sentence "this repository is beyond what your plan covers". For the ceiling
 * on how many times ONE PULL REQUEST may be checked, that sentence is FALSE: the repository is
 * covered, the pull request has simply been pushed to enough times, and the true message
 * ("Open a new pull request and it will be checked normally") never reached the log. The test that
 * covered this path mocked an empty body and asserted only the words "evidence not uploaded", so it
 * could not see the mismatch.
 *
 * WHY A SEPARATE FILE ON THIS SIDE AT ALL. The Action ships as plain .mjs onto a customer's runner
 * with no workspace resolution, so it cannot import the service's TypeScript. What it can do is
 * carry values WRITTEN from that contract rather than typed beside it: the cap, the code grammar
 * and the order the two message keys are tried in come from `wire-contract.generated.mjs`, and
 * `apps/api/src/refusal-envelope-contract.test.ts` still feeds the REAL envelope this service
 * builds into the reader below.
 */

/*
 * WRITTEN FROM THE CONTRACT, NOT TYPED HERE. The cap, the code grammar and the ORDER of the two
 * places a sentence is looked for all come from `@abloh/core`'s refusal envelope through
 * `wire-contract.generated.mjs`. They used to be literals in this file, pinned to the producer by a
 * contract test over current-tree combinations - which is the one pairing that cannot fail.
 */
import {
  REFUSAL_CODE_RE,
  REFUSAL_MESSAGE_MAX,
  REFUSAL_MESSAGE_PATHS,
} from "./wire-contract.generated.mjs";

/** Read a value at one of REFUSAL_MESSAGE_PATHS out of a parsed body. */
function at(body, path) {
  let value = body;
  for (const key of path) {
    if (value === null || typeof value !== "object") return undefined;
    value = value[key];
  }
  return value;
}

/**
 * The refusal sentence in a parsed control-plane body, or null when there is none.
 *
 * BOUNDED AND STRIPPED, because the string is remote and the destination is a public build log: a
 * misbehaving or hostile control plane must not be able to dictate what appears there, only which
 * of its own authored sentences appears. Control characters become spaces and the result is capped.
 *
 * `{ message }` at the top level is accepted BESIDE the envelope, and only because a customer's
 * workflow pins the Action by SHA: a runner installed today may be answered for months by a service
 * that has moved on, and reading one extra key is cheaper than a wrong sentence on a pull request.
 * The order the two are tried in is the contract's, not this file's.
 */
export function refusalMessage(body) {
  for (const path of REFUSAL_MESSAGE_PATHS) {
    const candidate = at(body, path);
    if (typeof candidate !== "string") continue;
    const message = candidate.replace(/[\u0000-\u001f\u007f]/gu, " ").trim();
    if (message !== "") return message.slice(0, REFUSAL_MESSAGE_MAX);
  }
  return null;
}

/**
 * The refusal code, for a caller that branches on WHICH refusal this was.
 *
 * Codes are structural tokens the service authors (`PULL_REQUEST_CHECK_CEILING`,
 * `REPOSITORY_LIMIT_REACHED`), never customer text, and an unrecognized one is returned as-is
 * rather than mapped: this file forwards, it does not decide.
 */
export function refusalCode(body) {
  const code = at(body, ["error", "code"]);
  return typeof code === "string" && REFUSAL_CODE_RE.test(code) ? code : null;
}
