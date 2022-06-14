import { ethers } from "ethers";
import { RPC_PROVIDER_URL, EVM_ORACLE_ADDRESS, GOERLI_RPC } from "../constants.js";
import { ArkNetwork } from "./web3.js";

const provider = new ethers.providers.JsonRpcProvider(GOERLI_RPC);
const decoder = new ethers.utils.AbiCoder();

// The Contract object
const ArkContract = new ethers.Contract(
  EVM_ORACLE_ADDRESS,
  ArkNetwork.abi,
  provider
);

export async function getTransaction(txid) {
  try {
    const tx = await provider.getTransactionReceipt(txid);
    console.log(tx)
    return tx;
  } catch (error) {
    console.log(error);
  }
}

// event listener
// ArkContract.on("LinkIdentity", (evmAddress, arweaveAddress, arweaveAddress2, event) => {
//   console.log(arweaveAddress2)
//   console.log(event)

// });
