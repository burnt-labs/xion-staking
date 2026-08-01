import { parse, printParseErrorCode } from "jsonc-parser";

export function parseJsonc(source) {
  const errors = [];
  const value = parse(source, errors, { allowTrailingComma: true });

  if (errors.length > 0) {
    throw new SyntaxError(
      `Invalid JSONC: ${errors.map(({ error }) => printParseErrorCode(error)).join(", ")}`,
    );
  }

  return value;
}

export function deploymentConfigurationErrors({
  deploymentPolicy,
  packageJson,
  qualityPolicy,
  workflows,
  wrangler,
}) {
  const errors = [];

  const requiredScripts = [
    "lint",
    "format:check",
    "type-check",
    "test",
    "test:coverage",
    "build:deploy",
  ];

  if (deploymentPolicy.topology !== "chain")
    errors.push("deployment topology must be chain");

  if (deploymentPolicy.promotionMode !== "manual")
    errors.push("mainnet promotion must remain manual");

  if (deploymentPolicy.targets.candidate.wranglerEnv !== "testnet")
    errors.push("candidate must target testnet");

  if (deploymentPolicy.targets.release.wranglerEnv !== "mainnet")
    errors.push("release must target mainnet");

  if (
    qualityPolicy.coverageThresholds.lines !== 100 ||
    qualityPolicy.coverageThresholds.functions !== 100 ||
    qualityPolicy.coverageThresholds.branches !== 100
  ) {
    errors.push("configuration tests must enforce 100% coverage");
  }

  if (requiredScripts.some((script) => !packageJson.scripts[script]))
    errors.push("all quality and deployment scripts are required");

  if (wrangler.assets.directory !== "./out")
    errors.push("default Wrangler commands must use the local bundle");

  if (wrangler.env.mainnet.assets.directory !== "./dist/mainnet")
    errors.push("mainnet must deploy the mainnet bundle");

  if (wrangler.env.testnet.assets.directory !== "./dist/testnet")
    errors.push("testnet must deploy the testnet bundle");

  if (workflows.length !== 3)
    errors.push("exactly three deployment entry points are required");

  if (
    workflows.some(
      (workflow) =>
        !workflow.includes(
          "@511b72fad7c0bd937e2820b8e4165b075a875cf9 # v1.2.8",
        ),
    )
  ) {
    errors.push("shared workflows must be pinned to v1.2.8");
  }

  return errors;
}
