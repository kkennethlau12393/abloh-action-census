/**
 * THE ACTION'S COPY OF THE REFUSAL A REFUSED UPLOAD IS.
 *
 * WHY A COPY AT ALL. The Action ships as standalone `.mjs` onto a customer's runner with no
 * workspace resolution, so it cannot import `@abloh/core`, where the refusal registry and the
 * sentences live. This is the same arrangement, for the same reason, as `identity-conditions.mjs`
 * and `refusal-envelope.mjs`: a hand-copy of prose the other side owns, pinned equal by a contract
 * test - `scripts/upload-refusal-parity.test.ts` - rather than by two comments that agree today.
 *
 * WHAT IT REPLACES (cycle-2 retry census, 2026-08-30, finding 5). The boundary printed
 * `the control plane refused the evidence upload (HTTP 400)` and stopped. That is a status where a
 * cause, an owner, a next action and a reportable identifier belong, on the job whose only purpose
 * is to file the report. `packages/core/src/upload-refusal.ts` says why the response body is now
 * shown after having been withheld, and why the identifier is derived the way it is.
 *
 * EVERY FOLD THE REGISTRY APPLIES IS APPLIED HERE, in the same order, because parity is over the
 * PRINTED LINES and not over the inputs: `refuse` folds an egress-safe value to one printable ASCII
 * line and then bounds it, so a copy that skipped either would agree on a plain sentence and drift
 * on the one that carried a newline.
 *
 * ONE SENTENCE HERE IS NOT A COPY, AND THAT IS DELIBERATE. The abloh-owned closing line comes from
 * `nothing-waiting.generated.mjs`, which `pnpm gen:action` renders from the core module that
 * composes it, so this file cannot drift from the registry on the one line Kenneth ruled must read
 * identically on every surface. A hand copy here would have been a fifth spelling of it.
 */
import { ablohFailureClosingLine } from "./nothing-waiting.generated.mjs";

/** The cap `MAX_DIAGNOSTIC_REASON_CHARS` puts on a folded diagnostic. */
const MAX_DIAGNOSTIC_REASON_CHARS = 200;

/** The bound the `responseBody` slot declares. */
const RESPONSE_BODY_MAX_BYTES = 400;

/** BYTE-IDENTICAL TO `asciiDiagnostic` in `packages/core/src/findings.ts`. */
function asciiDiagnostic(reason) {
  const folded = reason
    .replace(/[\u2010-\u2015]/gu, "-")
    .replace(/[\u2018\u2019]/gu, "'")
    .replace(/[\u201C-\u201F]/gu, '"')
    .replace(/\u2026/gu, "...")
    .replace(/[\u00A0\u2007\u202F]/gu, " ")
    .replace(/[^\x20-\x7e]/gu, "")
    .replace(/\s+/gu, " ")
    .trim();
  return folded.length <= MAX_DIAGNOSTIC_REASON_CHARS
    ? folded
    : `${folded.slice(0, MAX_DIAGNOSTIC_REASON_CHARS - 1)}.`;
}

/** BYTE-IDENTICAL TO `bound` in `packages/core/src/refusal.ts`. */
function bound(value, maxBytes) {
  const buffer = Buffer.from(value, "utf8");
  if (buffer.byteLength <= maxBytes) return { value, truncated: false };
  return { value: buffer.subarray(0, maxBytes).toString("utf8"), truncated: true };
}

/** BYTE-IDENTICAL TO `uploadRefusalReportId` in `packages/core/src/upload-refusal.ts`. */
export function uploadRefusalReportId({ status, code }) {
  const safeStatus = Number.isInteger(status) && status > 0 ? status : 0;
  const slug =
    typeof code === "string" && /^[A-Za-z0-9_.-]{1,64}$/u.test(code)
      ? code.toLowerCase().replace(/[_.]/gu, "-")
      : "uncoded";
  return `upload-${safeStatus}-${slug}`;
}

/** BYTE-IDENTICAL TO `REPOSITORY_NOT_INSTALLED` in `packages/core/src/upload-refusal.ts`. */
const REPOSITORY_NOT_INSTALLED = "REPOSITORY_NOT_INSTALLED";

/** BYTE-IDENTICAL TO `REPOSITORY_TENANCY_MISMATCH` in `packages/core/src/upload-refusal.ts`. */
const REPOSITORY_TENANCY_MISMATCH = "REPOSITORY_TENANCY_MISMATCH";

/** BYTE-IDENTICAL TO `organizationFromHandoffUrl` in `packages/core/src/upload-refusal.ts`. */
export function organizationFromHandoffUrl(url) {
  if (typeof url !== "string" || url === "") return null;
  const match = /\/orgs\/([A-Za-z0-9_.-]{1,64})(?:\/|$)/u.exec(url);
  return match === null ? null : match[1];
}

/** BYTE-IDENTICAL TO `workflowFromRef` in `packages/core/src/upload-refusal.ts`. */
export function workflowFromRef(ref) {
  if (typeof ref !== "string" || ref === "") return null;
  const withoutRev = ref.split("@")[0] ?? "";
  const parts = withoutRev.split("/");
  if (parts.length < 3) return null;
  const path = parts.slice(2).join("/");
  return path === "" ? null : path;
}

/**
 * BYTE-IDENTICAL TO `uploadRefusalCode` in `packages/core/src/upload-refusal.ts`.
 *
 * Split audit S3: a customer who had never installed the Abloh app read the control plane saying so
 * and, on the next line, that there was nothing for them to fix because abloh had broken. Both facts
 * this reads were already in hand at the throw site.
 */
export function uploadRefusalCode(facts) {
  if (facts.status === 404 && facts.code === REPOSITORY_NOT_INSTALLED) {
    return "upload-repository-not-registered";
  }
  if (
    facts.status === 403 &&
    facts.code === REPOSITORY_TENANCY_MISMATCH &&
    typeof facts.organization === "string" &&
    facts.organization !== ""
  ) {
    return "upload-organization-mismatch";
  }
  return "upload-refused";
}

/** BYTE-IDENTICAL TO `uploadRefusalDetail` in `packages/core/src/upload-refusal.ts`. */
export function uploadRefusalDetail({ code, message }) {
  const token = typeof code === "string" && code !== "" ? code : null;
  const sentence = typeof message === "string" && message !== "" ? message : null;
  if (token !== null && sentence !== null) return `${token} - ${sentence}`;
  return token ?? sentence ?? "";
}

/**
 * THE BLOCK A JOB LOG PRINTS, line for line what `uploadRefusedLines` composes from the registry.
 *
 * The shape is the registry's: the sentence, then the evidence with its label and where it came
 * from, then `next:`, then the code line. Nothing here is interpolated prose - every fixed word
 * below is one the registry owns, and the parity test is what keeps that true.
 */
export function uploadRefusedLines(facts) {
  const code = uploadRefusalCode(facts);
  const registered = code === "upload-repository-not-registered";
  const mismatch = code === "upload-organization-mismatch";
  const lines = [
    registered
      ? "no abloh installation covers this repository, so the measurement is not on the pull request"
      : mismatch
        ? `your workflow names abloh organisation ${facts.organization} and this repository belongs to ` +
          "a different one, so this run was not filed"
        : "abloh's own service refused this run's result, so the measurement is not on the pull request",
  ];
  const detail = uploadRefusalDetail(facts);
  if (detail !== "") {
    const { value, truncated } = bound(asciiDiagnostic(detail), RESPONSE_BODY_MAX_BYTES);
    if (value !== "") {
      const cut = truncated ? " (cut to its limit)" : "";
      /* EVERY ARM'S SLOT NAMES ABLOH'S SERVICE NOW (Kenneth's delegation, wave 4, queue 30 and
         77). "the control plane" is abloh's own word for its own service, and a maintainer reading
         it on a pull request has never been taught it. The PROVENANCE keeps the internal name on
         the mismatch arm alone, exactly as it did before. */
      const from = mismatch ? "abloh's service" : "the control plane";
      lines.push(`what abloh's service said, from ${from}${cut}: ${value}`);
    }
  }
  if (registered) {
    lines.push("next: Install the abloh App on this repository, then re-run the job.");
    lines.push(
      "refusal code upload-repository-not-registered, owned by repository, at the boundary stage",
    );
    return lines;
  }
  if (mismatch) {
    /*
     * AN EDIT IN THEIR OWN WORKFLOW (split S3's remaining arm, ruled 2026-09-03). A 403 carrying
     * `REPOSITORY_TENANCY_MISMATCH` used to fall to `upload-refused` - abloh's own defect, no
     * action, an identifier to quote - so a maintainer whose workflow addressed the wrong
     * organisation was told abloh had broken and given nothing to change.
     */
    lines.push("next: Correct the organisation id in your workflow's abloh step and push.");
    if (typeof facts.workflow === "string" && facts.workflow !== "") {
      lines.push(`where: ${facts.workflow}, key handoff-url`);
    }
    lines.push(
      "refusal code upload-organization-mismatch, owned by repository, at the boundary stage",
    );
    return lines;
  }
  lines.push(ablohFailureClosingLine(uploadRefusalReportId(facts)));
  lines.push("refusal code upload-refused, owned by abloh, at the boundary stage");
  return lines;
}

/** The bound the `endpoint` and `transportError` slots declare. */
const UNREACHABLE_SLOT_MAX_BYTES = 200;

/** The bound the `expectedPath` slot declares. */
const EXPECTED_PATH_MAX_BYTES = 400;

/** One evidence line, folded and bounded exactly as `refuse` folds and bounds an egress-safe slot. */
function evidenceLine(label, at, value, maxBytes) {
  const { value: folded, truncated } = bound(asciiDiagnostic(String(value ?? "")), maxBytes);
  if (folded === "") return null;
  return `${label}, from ${at}${truncated ? " (cut to its limit)" : ""}: ${folded}`;
}

/**
 * THE BLOCK FOR AN UPLOAD THAT NEVER GOT AN ANSWER, line for line what `uploadUnreachableLines`
 * composes from the registry.
 *
 * WHAT IT REPLACES (Kenneth's error-plane step 12). One hand-written line - `the evidence upload
 * could not reach the control plane` - with no owner, no next action and no name for the host the
 * runner could not open a socket to. `upload-unreachable` has carried all three in the registry the
 * whole time and nothing raised it, which is `upload-refused`'s own history one branch over.
 */
export function uploadUnreachableLines({ endpoint, transportError }) {
  const lines = ["the result could not be sent to abloh, so the measurement is not on the pull request"];
  const host = evidenceLine(
    "where the result was sent",
    "the evidence handoff URL",
    endpoint,
    UNREACHABLE_SLOT_MAX_BYTES,
  );
  if (host !== null) lines.push(host);
  const transport = evidenceLine(
    "what the last attempt failed on",
    "the upload request",
    transportError,
    UNREACHABLE_SLOT_MAX_BYTES,
  );
  if (transport !== null) lines.push(transport);
  lines.push("next: Re-run the job once the runner can reach the network again.");
  lines.push("refusal code upload-unreachable, owned by environment, at the boundary stage");
  return lines;
}

/**
 * THE BLOCK FOR A BOUNDARY THAT FOUND NOTHING COMPLETE TO SEND.
 *
 * Same history and same fix as the one above: the boundary printed `no completed measurement
 * artifact to upload` and never named the directory it looked in, which is the one fact a reader
 * follows to the record `apps/cli/src/run-outcome.ts` leaves there.
 */
export function uploadNoArtifactLines({ expectedPath, reportId }) {
  const lines = ["abloh's run ended without writing its result, so there is nothing to upload for this run"];
  const where = evidenceLine(
    "where the artifact was expected",
    "the run's output directory",
    expectedPath,
    EXPECTED_PATH_MAX_BYTES,
  );
  if (where !== null) lines.push(where);
  lines.push(ablohFailureClosingLine(typeof reportId === "string" ? reportId : null));
  lines.push("refusal code upload-no-artifact, owned by abloh, at the boundary stage");
  return lines;
}
