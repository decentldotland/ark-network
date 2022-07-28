import { require } from "../require.js";
import { RPC_PORT } from "../constants.js";
import Web3 from "web3";

export const web3 = new Web3(`ws://localhost:${RPC_PORT}`);

export async function checkTopicAgainstAddress(topic_hash, arweave_address) {
  try {
    const hashedArAddress = web3.utils.sha3(arweave_address);
    const is_equal = hashedArAddress === topic_hash;

    return {
      topic_hash,
      arweave_address,
      is_equal,
    };
  } catch (error) {
    console.log(error);
  }
}
