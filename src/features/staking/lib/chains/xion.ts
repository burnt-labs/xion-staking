import xionMainnetChainAssets from "chain-registry/mainnet/xion/assets";
import xionMainnetChainInfo from "chain-registry/mainnet/xion/chain";
import xionTestnetChainAssets from "chain-registry/testnet/xiontestnet/assets";
import xionTestnetChainInfo from "chain-registry/testnet/xiontestnet/chain";

// @todo Add testnet-2 here when the times comes
export const assets = [xionMainnetChainAssets, xionTestnetChainAssets];
export const chains = [xionMainnetChainInfo, xionTestnetChainInfo];
