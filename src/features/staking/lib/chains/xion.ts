import xionMainnetChainAssets from "chain-registry/mainnet/xion/assets";
import xionMainnetChainInfo from "chain-registry/mainnet/xion/chain";
import xionTestnetChainAssets from "chain-registry/testnet/xiontestnet/assets";
import xionTestnetChainInfo from "chain-registry/testnet/xiontestnet/chain";
import xionTestnet2ChainAssets from "chain-registry/testnet/xiontestnet2/assets";
import xionTestnet2ChainInfo from "chain-registry/testnet/xiontestnet2/chain";

// @todo Add testnet-2 here when the times comes
export const assets = [xionMainnetChainAssets, xionTestnetChainAssets, xionTestnet2ChainAssets];
export const chains = [xionMainnetChainInfo, xionTestnetChainInfo, xionTestnet2ChainInfo];
