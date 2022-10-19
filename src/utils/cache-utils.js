import { cacheNode } from "./polling.js";
import {
  ARWEAVE_ORACLE_ADDRESS,
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
  NEAR_MAINNET_ADDRESS,
  EVMOS_MAINNET_ADDRESS,
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
        network: "goerli&&mainnet",
      },
      aurora_oracle_addr: {
        addr: AURORA_TESTNET_ADDRESS,
        network: "aurora-testnet",
      },
      bsc_oracle_addr: {
        addr: BSC_MAINNET_ADDRESS,
        network: "bsc-mainnet",
      },
      avalanche_oracle_addr: {
        addr: AVALANCHE_MAINNET_ADDRESS,
        network: "avax-c-chain",
      },
      ftm_oracle_addr: {
        addr: FTM_MAINNET_ADDRESS,
        network: "ftm-mainnet",
      },
      optimism_oracle_addr: {
        addr: OPTIMISM_MAINNET_ADDRESS,
        network: "optimism-mainnet",
      },
      arbitrum_oracle_addr: {
        addr: ARBITRUM_MAINNET_ADDRESS,
        network: "arbitrum-one",
      },
      polygon_oracle_addr: {
        addr: POLYGON_MAINNET_ADDRESS,
        network: "polygon-mainnet",
      },
      evmos_mainnet_addr: {
        addr: EVMOS_MAINNET_ADDRESS,
        network: "evmos-mainnet",
      },
      near_mainnet_addr: {
        addr: NEAR_MAINNET_ADDRESS,
        network: "near-mainnet",
      },
      neon_devnet_oracle_addr: {
        addr: NEON_DEVNET_ADDRESS,
        network: "neon-devnet",
      },
    };
  } catch (error) {
    console.log(error);
  }
}
