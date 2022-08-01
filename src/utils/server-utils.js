import { getOracleState } from "./cache-utils.js";
import { ANS_CACHE_API, SERVER_ETH_RPC } from "./constants.js";
import { ethers } from "ethers";
import axios from "axios";
import base64url from "base64url";

export async function getArkProfile(arweave_address) {
  try {
    const state = (await getOracleState())?.res;
    if (state === "e30" || !state) {
      return "e30";
    }

    if (!/[a-z0-9_-]{43}/i.test(arweave_address)) {
      return "e30";
    }

    const decodedState = JSON.parse(base64url.decode(state));
    const userProfile = decodedState.res.find(
      (user) => user["arweave_address"] === arweave_address
    );
    await getAnsProfile(arweave_address);
    if (!userProfile) {
      return "e30";
    }

    userProfile.ANS = await getAnsProfile(arweave_address);
    userProfile.ENS = await getEnsProfile(userProfile.evm_address);
    userProfile.RSS3 = await getRss3Profile(userProfile.evm_address);

    return base64url(JSON.stringify({ res: userProfile }));
  } catch (error) {
    console.log(error);
    return "e30";
  }
}

// helper functions
async function getAnsProfile(arweave_address) {
  try {
    const domains = (await axios.get(ANS_CACHE_API))?.data;
    if (!domains) {
      return false;
    }
    const profile = domains.res.find((usr) => usr.user === arweave_address);
    const res = profile ? profile : false;

    return res;
  } catch (error) {
    console.log(error);
    return false;
  }
}

async function getEnsProfile(eth_address) {
  try {
    const provider = new ethers.providers.JsonRpcProvider(SERVER_ETH_RPC);
    const domain = await provider.lookupAddress(eth_address);
    return domain;
  } catch (error) {
    console.log(error);
    return false;
  }
}

async function getRss3Profile(eth_address) {
  try {
    const config = {
      method: "get",
      url: `https://pregod.rss3.dev/v1.1.0/profiles/${eth_address}?network=ethereum`,
      headers: {
        Accept: "application/json",
      },
    };

    const res = (await axios(config))?.data?.result;

    if (res.length > 0) {
      return {
        ethereum: res,
      };

      return res;
    }
  } catch (error) {
    console.log(error);
    return false;
  }
}
