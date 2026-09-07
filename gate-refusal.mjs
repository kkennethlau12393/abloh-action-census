/**
 * THE REFUSAL A RUN PRODUCED, PROJECTED FOR THE UPLOAD - owned here, imported by whoever sends it.
 *
 * IT WAS WRITTEN FOR TWO BUILDERS. `build-handoff.mjs` built the hosted envelope and
 * `prepare-upload.mjs` built the self-vouched body; a field that reached one and not the other is
 * the shape `apps/api/src/ci-handoff-projection-contract.test.ts` exists for, and it has cost four
 * uploads already. The second builder is deleted (error-plane step 15), having been unreachable
 * from every workflow since 2026-08-03.
 *
 * IT IS STILL THE ONE OWNER AND NOT AN INLINING WAITING TO HAPPEN. The near side reads the same
 * projection - the local Markdown renders `report.gate.refusal` rather than looking the code up
 * again - so folding this back into the envelope builder would put the sentence a maintainer reads
 * and the object the control plane stores back under two authors.
 *
 * IT SHIPS ONTO A CUSTOMER'S RUNNER as plain `.mjs` with no workspace resolution, so it imports
 * nothing but the generated wire contract. The bounds and the vocabularies below are written from
 * `@abloh/core` by `pnpm gen:wire`, never typed here.
 */
import {
  EVIDENCE_EGRESS_SAFE,
  EVIDENCE_SOURCES,
  REFUSAL_DESTINATIONS,
  REFUSAL_OWNERS,
  REFUSAL_PRIVACY,
  REFUSAL_STAGES,
  RUN_REFUSAL_CODE_RE,
  RUN_REFUSAL_LIMITS,
} from "./wire-contract.generated.mjs";

/** First line, printable ASCII, bounded — the shape the control plane accepts for a reason. */
export function printableLine(value, max = 400) {
  const firstLine = String(value).split(/\r?\n/u)[0] ?? "";
  const ascii = firstLine.replace(/[^\x20-\x7e]/gu, "?").trim();
  return ascii.length <= max ? ascii : ascii.slice(0, max);
}

/** A refusal's own string field, bounded. Empty for anything that is not a string - `String(undefined)`
    is the word "undefined", and a bound is not a type check. */
function refusalText(value, max) {
  return typeof value === "string" ? printableLine(value, max) : "";
}

/**
 * THE REFUSAL THE RUN COMPOSED, CARRIED WHOLE (error-plane plan, step 7).
 *
 * WHAT CHANGED AND WHY. This used to forward the ADMISSION stage and drop every other one, on the
 * argument that the rest were "reconstructible server-side from evidence the envelope already
 * carries". They are - by a copy of `REFUSAL_REGISTRY` that is deployed separately from the CLI that
 * produced the run, so what a maintainer read on a pull request was a sentence composed by a build
 * that never saw their run. Reconstruction IS the defect: the object crosses now, and the code
 * crosses with it because the code is still the stable identity a reader groups by.
 *
 * IT IS PROJECTED FIELD BY FIELD, on this file's own rule: the key list is the schema, so a producer
 * key nobody here named cannot ride along, and every string is cut to the bound the DOOR enforces
 * (`RUN_REFUSAL_LIMITS`, written here from the contract - see `wire-contract.generated.mjs`).
 *
 * THE EVIDENCE FILTER IS NOT A JUDGEMENT THIS FILE MAKES. Every slot declares its own egress class
 * WITH THE CODE, in the registry, so what happens here is that a label the contract already stamped
 * on each byte is obeyed. What is dropped is NAMED in `withheld`, because a reader on a pull request
 * who is told nothing assumes there was nothing.
 *
 * A SUGGESTION IS STILL NEVER CARRIED. It is a one-click commit into the customer's branch, and
 * offering one built from bytes a runner posted is a different decision from printing a sentence.
 */
export function gateRefusal(gate) {
  const refusal = (gate ?? {}).refusal;
  if (refusal === null || typeof refusal !== "object") return {};
  const L = RUN_REFUSAL_LIMITS;
  const code = refusalText(refusal.code, L.code);
  if (!RUN_REFUSAL_CODE_RE.test(code)) return {};
  if (!REFUSAL_STAGES.includes(refusal.stage)) return {};
  if (!REFUSAL_OWNERS.includes(refusal.owner)) return {};
  if (!REFUSAL_PRIVACY.includes(refusal.privacy)) return {};
  const summary = refusalText(refusal.summary, L.summary);
  if (summary === "") return {};
  const remedy = refusal.remedy ?? {};
  let projectedRemedy;
  if (remedy.kind === "customer-action") {
    const text = refusalText(remedy.text, L.remedyText);
    if (text === "") return {};
    const location = remedy.location ?? null;
    projectedRemedy = {
      kind: "customer-action",
      text,
      ...(location === null || typeof location !== "object"
        ? {}
        : {
            location: {
              file: refusalText(location.file, L.file),
              key: typeof location.key === "string" ? printableLine(location.key, L.key) : null,
              line: typeof location.line === "number" ? location.line : null,
              shape: typeof location.shape === "string" ? printableLine(location.shape, L.shape) : null,
            },
          }),
    };
  } else if (remedy.kind === "none") {
    if (remedy.because !== "abloh-defect" && remedy.because !== "no-action-exists") return {};
    projectedRemedy = {
      kind: "none",
      because: remedy.because,
      ...(typeof remedy.reportId === "string" && remedy.reportId !== ""
        ? { reportId: refusalText(remedy.reportId, L.reportId) }
        : {}),
    };
  } else {
    return {};
  }
  const evidence = Array.isArray(refusal.evidence) ? refusal.evidence : [];
  return {
    refusal: {
      code,
      stage: refusal.stage,
      owner: refusal.owner,
      privacy: refusal.privacy,
      summary,
      evidence: evidence
        .filter(
          (item) =>
            item !== null &&
            typeof item === "object" &&
            item.egress === EVIDENCE_EGRESS_SAFE &&
            EVIDENCE_SOURCES.includes((item.provenance ?? {}).source),
        )
        .slice(0, L.evidenceItems)
        .map((item) => ({
          key: refusalText(item.key, L.evidenceKey),
          label: refusalText(item.label, L.evidenceLabel),
          value: refusalText(item.value, L.evidenceValue),
          source: item.provenance.source,
          at: refusalText(item.provenance.at, L.evidenceAt),
          truncated: item.truncated === true,
        })),
      remedy: projectedRemedy,
      destinations: Array.isArray(refusal.destinations)
        ? refusal.destinations.filter((entry) => REFUSAL_DESTINATIONS.includes(entry)).slice(0, L.destinations)
        : [],
      withheld: evidence
        .filter((item) => item !== null && typeof item === "object" && item.egress !== EVIDENCE_EGRESS_SAFE)
        .slice(0, L.withheldItems)
        .map((item) => refusalText(item.label, L.withheldLabel)),
    },
  };
}
