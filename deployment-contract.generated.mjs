/**
 * GENERATED FILE - DO NOT EDIT.
 *
 * Written by `scripts/generate-deployment-metadata.mts` from:
 *   apps/api/src/deployment-contract.ts
 *   apps/cli/package.json
 *
 * Change the authority and run `pnpm build`. Editing this file is undone by the next build,
 * and `scripts/deployment-contract.test.ts` fails the suite while it disagrees.
 */

/** The hosted control plane, for the one step that is given another origin to compose against. */
export const HOSTED_API_ORIGIN = "https://api.abloh.dev";

/**
 * Every control-plane door this Action knocks on, and the audience it mints to enter each one.
 *
 * `url` is `HOSTED_API_ORIGIN` joined to `path`, precomputed so a runner never has to join two
 * strings; `path` is there for the attestation step, which may be handed a different origin.
 */
export const CONTROL_PLANE = {
  handoff: {
    path: "/api/v1/runs",
    url: "https://api.abloh.dev/api/v1/runs",
    audience: "abloh-evidence-handoff",
  },
  modelGateway: {
    path: "/api/v1/model/chat/completions",
    url: "https://api.abloh.dev/api/v1/model/chat/completions",
    audience: "abloh-model-gateway",
  },
  liveProgress: {
    path: "/api/v1/runs/live-progress",
    url: "https://api.abloh.dev/api/v1/runs/live-progress",
    audience: "abloh-live-progress",
  },
  checkAdmission: {
    path: "/api/v1/runs/admission",
    url: "https://api.abloh.dev/api/v1/runs/admission",
    audience: "abloh-check-admission",
  },
  setupTrial: {
    path: "/api/v1/setup/trial",
    url: "https://api.abloh.dev/api/v1/setup/trial",
    audience: "abloh-evidence-handoff",
  },
};

/** The Command Center a run's links point a person at. */
export const COMMAND_CENTER_ORIGIN = "https://abloh.dev";

/** The published CLI this Action installs when the caller names no tarball. */
export const DEFAULT_CLI_SPEC = "@abloh/cli@0.1.4";

/** The runtime range the published CLI says it supports; the Action enforces exactly this. */
export const CLI_NODE_RANGE = ">=20.6";
