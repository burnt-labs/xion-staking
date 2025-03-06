import { IS_MAINNET } from "./config";

// // Even if this can be retrieved from the params, hardcode it to avoid an
// // extra request. It can be retrieved with this:
// const params = await queryClient.staking.params();
export const UNBONDING_DAYS = IS_MAINNET ? 21 : 3;

// Arbitrary value to avoid using a bigger fee than the actual reward
export const MIN_CLAIMABLE_XION = 0.00001;
export const MIN_DISPLAYED_XION_DECIMALS = 6;
export const MIN_DISPLAYED_XION = 10 ** -MIN_DISPLAYED_XION_DECIMALS;
