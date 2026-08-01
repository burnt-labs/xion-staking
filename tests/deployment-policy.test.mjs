import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  deploymentConfigurationErrors,
  parseJsonc,
} from "../scripts/deployment-policy.mjs";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");

test("JSONC parsing supports inline comments and trailing commas", () => {
  assert.deepEqual(
    parseJsonc(`{
      "url": "https://staking.burnt.com", // inline comment
      "literal": "/* text inside a string */",
      "targets": ["testnet",], /* block comment */
    }`),
    {
      literal: "/* text inside a string */",
      targets: ["testnet"],
      url: "https://staking.burnt.com",
    },
  );

  assert.throws(() => parseJsonc("{ invalid"), /Invalid JSONC: /);
});

test("deployment configuration follows the Burnt shared-workflow contract", async () => {
  const [
    deploymentSource,
    qualitySource,
    packageSource,
    wranglerSource,
    ...workflows
  ] = await Promise.all([
    read(".github/deployment-policy.jsonc"),
    read(".github/quality-policy.jsonc"),
    read("package.json"),
    read("wrangler.jsonc"),
    read(".github/workflows/pull-request.yml"),
    read(".github/workflows/push-main.yml"),
    read(".github/workflows/release.yml"),
  ]);

  assert.deepEqual(
    deploymentConfigurationErrors({
      deploymentPolicy: parseJsonc(deploymentSource),
      packageJson: JSON.parse(packageSource),
      qualityPolicy: parseJsonc(qualitySource),
      workflows,
      wrangler: parseJsonc(wranglerSource),
    }),
    [],
  );
});

test("deployment configuration reports every contract violation", () => {
  const invalid = {
    deploymentPolicy: {
      promotionMode: "automatic",
      targets: {
        candidate: { wranglerEnv: "staging" },
        release: { wranglerEnv: "production" },
      },
      topology: "standard",
    },
    packageJson: { scripts: {} },
    qualityPolicy: {
      coverageThresholds: { branches: 99, functions: 99, lines: 99 },
    },
    workflows: ["unpinned"],
    wrangler: {
      assets: { directory: "./dist" },
      env: {
        mainnet: { assets: { directory: "./out" } },
        testnet: { assets: { directory: "./out" } },
      },
    },
  };

  assert.deepEqual(deploymentConfigurationErrors(invalid), [
    "deployment topology must be chain",
    "mainnet promotion must remain manual",
    "candidate must target testnet",
    "release must target mainnet",
    "configuration tests must enforce 100% coverage",
    "all quality and deployment scripts are required",
    "default Wrangler commands must use the local bundle",
    "mainnet must deploy the mainnet bundle",
    "testnet must deploy the testnet bundle",
    "exactly three deployment entry points are required",
    "shared workflows must be pinned to v1.2.8",
  ]);
});
