import { cacheNode } from "./polling.js";
import {
  ARWEAVE_ORACLE_ADDRESS,
  ETH_ORACLE_ADDRESS,
  AURORA_TESTNET_ADDRESS,
  BSC_TESTNET_ADDRESS,
  AVAX_FUJI_TESTNET_ADDRESS,
} from "./constants.js";
import base64url from "base64url";

export async function getOracleState() {
  try {
    const state = cacheNode.get("oracle-cache-base64");

    if (!state) {
      return base64url(`{}`);
    }
    const decodedState = JSON.parse(base64url.decode(state));
    const res = base64url(JSON.stringify({ res: decodedState.identities }));

    return {
      res,
      decodedState,
    };
  } catch (error) {
    console.log(error);
  }
}

export async function getStats() {
  try {
    const decodedState = JSON.parse(
      base64url.decode((await getOracleState())?.res)
    );

    const users_count = decodedState?.res
      ? decodedState.res.filter((usr) => usr.is_verified).length
      : "pending";
    const hashed_state = cacheNode.has("oracle-cache-sha256")
      ? cacheNode.get("oracle-cache-sha256")
      : "pending";
    const last_cached_block = cacheNode.has("last-cached-block")
      ? cacheNode.get("last-cached-block")
      : "pending";

    return {
      users_count,
      hashed_state,
      last_cached_block,
    };
  } catch (error) {
    console.log(error);
  }
}

export async function getNetworkAddresses() {
  try {
    const state = (await getOracleState())?.decodedState;
    const validators = state?.admins ? state.admins : ["pending"];

    return {
      validators: validators,
      arweave_oracle_addr: {
        addr: ARWEAVE_ORACLE_ADDRESS,
        network: "arweave-mainnet",
      },
      eth_oracle_addr: {
        addr: ETH_ORACLE_ADDRESS,
        network: "eth-goerli",
      },
      aurora_oracle_addr: {
        addr: AURORA_TESTNET_ADDRESS,
        network: "aurora-testnet",
      },
      bsc_oracle_addr: {
        addr: BSC_TESTNET_ADDRESS,
        network: "bsc-testnet",
      },
      avax_fuji_oracle_addr: {
        addr: AVAX_FUJI_TESTNET_ADDRESS,
        network: "avax-fuji-testnet",
      },
    };
  } catch (error) {
    console.log(error);
  }
}
