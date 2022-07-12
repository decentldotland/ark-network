import { ethers } from "ethers";
import {
  ETH_ORACLE_ADDRESS,
  AURORA_TESTNET_ADDRESS,
  BSC_TESTNET_ADDRESS,
  AVAX_FUJI_TESTNET_ADDRESS,
  GOERLI_ETH_RPC,
  MAINNET_ETH_RPC,
  AURORA_TESTNET_RPC,
  BSC_TESTNET_RPC,
  FUJI_TESTNET_RPC,
} from "../constants.js";
import { ArkNetwork } from "./web3.js";

const decoder = new ethers.utils.AbiCoder();

export async function getTransaction(txid, network) {
  try {
    const { RPC_URL, CONTRACT_ADDRESS } = await resolveNetworkKey(network);
    const provider = new ethers.providers.JsonRpcProvider(RPC_URL);

    const ArkContract = new ethers.Contract(
      CONTRACT_ADDRESS,
      ArkNetwork.abi,
      provider
    );
    const tx = await provider.getTransactionReceipt(txid);
    return tx;
  } catch (error) {
    console.log(error);
  }
}

async function resolveNetworkKey(network_key) {
  switch (network_key) {
    case "ETH-GOERLI":
      return { RPC_URL: GOERLI_ETH_RPC, CONTRACT_ADDRESS: ETH_ORACLE_ADDRESS };

    case "ETH-MAINNET":
      return { RPC_URL: MAINNET_ETH_RPC, CONTRACT_ADDRESS: ETH_ORACLE_ADDRESS };

    case "AURORA-TESTNET":
      return {
        RPC_URL: AURORA_TESTNET_RPC,
        CONTRACT_ADDRESS: AURORA_TESTNET_ADDRESS,
      };
    case "BSC-TESTNET":
      return {
        RPC_URL: BSC_TESTNET_RPC,
        CONTRACT_ADDRESS: BSC_TESTNET_ADDRESS,
      };
    case "FUJI-C-CHAIN":
      return {
        RPC_URL: FUJI_TESTNET_RPC,
        CONTRACT_ADDRESS: AVAX_FUJI_TESTNET_ADDRESS,
      };
    default:
      return { RPC_URL: GOERLI_ETH_RPC, CONTRACT_ADDRESS: ETH_ORACLE_ADDRESS };
  }
}

