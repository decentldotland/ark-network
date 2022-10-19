import { ethers } from "ethers";
import {
  ETH_ORACLE_ADDRESS,
  AURORA_TESTNET_ADDRESS,
  BSC_TESTNET_ADDRESS,
  BSC_MAINNET_ADDRESS,
  AVAX_FUJI_TESTNET_ADDRESS,
  AVALANCHE_MAINNET_ADDRESS,
  NEON_DEVNET_ADDRESS,
  FTM_MAINNET_ADDRESS,
  OPTIMISM_MAINNET_ADDRESS,
  ARBITRUM_MAINNET_ADDRESS,
  POLYGON_MAINNET_ADDRESS,
  EVMOS_MAINNET_ADDRESS,
  GOERLI_ETH_RPC,
  MAINNET_ETH_RPC,
  AURORA_TESTNET_RPC,
  BSC_TESTNET_RPC,
  BSC_MAINNET_RPC,
  AVALANCHE_MAINNET_RPC,
  FUJI_TESTNET_RPC,
  NEON_DEVNET_RPC,
  FTM_MAINNET_RPC,
  OPTIMISM_MAINNET_RPC,
  ARBITRUM_MAINNET_RPC,
  POLYGON_MAINNET_RPC,
  EVMOS_MAINNET_RPC,
} from "../constants.js";
import { ArkNetworkVyper, ArkNetworkSolidity } from "./abis.js";

const decoder = new ethers.utils.AbiCoder();

export async function getTransaction(txid, network) {
  try {
    const { RPC_URL, CONTRACT_ADDRESS, ABI } = await resolveNetworkKey(network);
    const provider = new ethers.providers.JsonRpcProvider(RPC_URL);

    const ArkContract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
    const tx = await provider.getTransactionReceipt(txid);
    return tx;
  } catch (error) {
    console.log(error);
  }
}

async function resolveNetworkKey(network_key) {
  switch (network_key) {
    case "ETH-GOERLI":
      return {
        RPC_URL: GOERLI_ETH_RPC,
        CONTRACT_ADDRESS: ETH_ORACLE_ADDRESS,
        ABI: ArkNetworkVyper,
      };

    case "ETH-MAINNET":
      return {
        RPC_URL: MAINNET_ETH_RPC,
        CONTRACT_ADDRESS: ETH_ORACLE_ADDRESS,
        ABI: ArkNetworkVyper,
      };

    case "AURORA-TESTNET":
      return {
        RPC_URL: AURORA_TESTNET_RPC,
        CONTRACT_ADDRESS: AURORA_TESTNET_ADDRESS,
        ABI: ArkNetworkVyper,
      };
    case "BSC-TESTNET":
      return {
        RPC_URL: BSC_TESTNET_RPC,
        CONTRACT_ADDRESS: BSC_TESTNET_ADDRESS,
        ABI: ArkNetworkVyper,
      };
    case "BSC-MAINNET":
      return {
        RPC_URL: BSC_MAINNET_RPC,
        CONTRACT_ADDRESS: BSC_MAINNET_ADDRESS,
        ABI: ArkNetworkVyper,
      };
    case "FUJI-C-CHAIN":
      return {
        RPC_URL: FUJI_TESTNET_RPC,
        CONTRACT_ADDRESS: AVAX_FUJI_TESTNET_ADDRESS,
        ABI: ArkNetworkVyper,
      };
    case "AVALANCHE-MAINNET":
      return {
        RPC_URL: AVALANCHE_MAINNET_RPC,
        CONTRACT_ADDRESS: AVALANCHE_MAINNET_ADDRESS,
        ABI: ArkNetworkVyper,
      };
    case "NEON-DEVNET":
      return {
        RPC_URL: NEON_DEVNET_RPC,
        CONTRACT_ADDRESS: NEON_DEVNET_ADDRESS,
        ABI: ArkNetworkVyper,
      };
    case "FTM-MAINNET":
      return {
        RPC_URL: FTM_MAINNET_RPC,
        CONTRACT_ADDRESS: FTM_MAINNET_ADDRESS,
        ABI: ArkNetworkVyper,
      };
    case "OPTIMISM-MAINNET":
      return {
        RPC_URL: OPTIMISM_MAINNET_RPC,
        CONTRACT_ADDRESS: OPTIMISM_MAINNET_ADDRESS,
        ABI: ArkNetworkSolidity,
      };
    case "ARBITRUM-MAINNET":
      return {
        RPC_URL: ARBITRUM_MAINNET_RPC,
        CONTRACT_ADDRESS: ARBITRUM_MAINNET_ADDRESS,
        ABI: ArkNetworkSolidity,
      };
    case "POLYGON-MAINNET":
      return {
        RPC_URL: POLYGON_MAINNET_RPC,
        CONTRACT_ADDRESS: POLYGON_MAINNET_ADDRESS,
        ABI: ArkNetworkSolidity,
      };
    case "EVMOS-MAINNET":
      return {
        RPC_URL: EVMOS_MAINNET_RPC,
        CONTRACT_ADDRESS: EVMOS_MAINNET_ADDRESS,
        ABI: ArkNetworkVyper,
      };
    default:
      return {
        RPC_URL: GOERLI_ETH_RPC,
        CONTRACT_ADDRESS: ETH_ORACLE_ADDRESS,
        ABI: ArkNetworkVyper,
      };
  }
}
