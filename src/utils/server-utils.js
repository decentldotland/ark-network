import { getOracleState } from "./cache-utils.js";
import {
  ANS_CACHE_API,
  SERVER_ETH_RPC,
  AVALANCHE_MAINNET_RPC,
  URBIT_ID_CONTRACT,
  LENS_LPP_CONTRACT,
} from "./constants.js";
import { getUserRegistrationTimestamp } from "./arweave/graphql.js";
import { getWeaveAggregator } from "weave-aggregator";
import { ethers } from "ethers";
import { isVouched } from "vouchdao";
import AVVY from "@avvy/client";
import axios from "axios";
import base64url from "base64url";
import "./setEnv.js";

export async function getArkProfile(network, address) {
  try {
    let userProfile;
    const state = (await getOracleState())?.res;
    if (state === "e30" || !state) {
      return "e30";
    }

    if (!["arweave", "evm"].includes(network)) {
      return "e30";
    }

    const decodedState = JSON.parse(base64url.decode(state));

    if (network === "arweave") {
      userProfile = decodedState.res.find(
        (user) => user["arweave_address"] === address && !!user.is_verified
      );
    } else {
      userProfile = decodedState.res.find(
        (user) => user["evm_address"] === address && !!user.is_verified
      );
    }

    if (!userProfile) {
      return "e30";
    }

    userProfile.first_linkage = await getUserRegistrationTimestamp(
      userProfile.arweave_address
    );
    const koiiNfts = await getKoiiNfts(userProfile.arweave_address);
    const permapagesNfts = await getPermaPagesNfts(userProfile.arweave_address);
    const ercNfts = await getMoralisNfts(userProfile.evm_address);

    userProfile.ANS = await getAnsProfile(userProfile.arweave_address);
    userProfile.ENS = await getEnsProfile(userProfile.evm_address);
    userProfile.AVVY = await getAvvyProfile(userProfile.evm_address);
    userProfile.LINAGEE = await getLinageeDomains(userProfile.evm_address);
    userProfile.IS_VOUCHED = await isVouched(userProfile.arweave_address);
    userProfile.LENS_HANDLES = await getLensHandles(userProfile.evm_address);
    userProfile.GITPOAPS = await getGitPoaps(userProfile.evm_address);
    userProfile.POAPS = await getAllPoaps(userProfile.evm_address);
    userProfile.ERC_NFTS = ercNfts;
    userProfile.URBIT_IDS = ercNfts.filter(
      (nft) => nft.token_address == URBIT_ID_CONTRACT
    );
    userProfile.LENS_PROTOCOLS_ACTV = await getLensProtocolsActv(userProfile.evm_address);
    userProfile.RSS3 = await getRss3Profile(userProfile.evm_address);
    userProfile.GALAXY_CREDS = await getGalaxyCreds(userProfile.evm_address);
    userProfile.ANFTS =
      koiiNfts.length > 0 || permapagesNfts.length > 0
        ? { koii: koiiNfts, permapages_img: permapagesNfts }
        : {};
    userProfile.ARWEAVE_TRANSACTIONS = await retrieveArtransactions(
      userProfile.arweave_address
    );
    userProfile.STAMPS = await getPermaPagesStamps(userProfile.arweave_address);
    
    await retrievNearTransaction(userProfile);

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
    const profileConfig = {
      method: "get",
      url: `https://pregod.rss3.dev/v1.1.0/profiles/${eth_address}?network=ethereum`,
      headers: {
        Accept: "application/json",
      },
    };

    const notesConfig = {
      method: "get",
      url: `https://pregod.rss3.dev/v1.1.0/notes/${eth_address}?refresh=true&limit=100&include_poap=true`,
      headers: {
        Accept: "application/json",
      },
    };

    const res1 = (await axios(profileConfig))?.data?.result;
    const res2 = (await axios(notesConfig))?.data?.result;

    if (res1.length > 0) {
      return {
        profile: res1,
        transactions: res2,
      };
    }

    return { transactions: res2 };
  } catch (error) {
    console.log(error);
    return false;
  }
}

async function getLensProtocolsActv(eth_address) {
  try {
    const activities = {
      method: "get",
      url: `https://pregod.rss3.dev/v1/notes/${eth_address}?tag=social&network=polygon`,
      headers: {
        Accept: "application/json",
      },
    };

    const res = (await axios(activities))?.data?.result;

    return res;
  } catch (error) {
    console.log(error);
    return false;
  }
}


async function getAvvyProfile(evm_address) {
  try {
    const provider = new ethers.providers.JsonRpcProvider(
      AVALANCHE_MAINNET_RPC
    );
    const avvy = new AVVY(provider);
    const hash = await avvy.reverse(AVVY.RECORDS.EVM, evm_address);
    const name = await hash.lookup();
    return name.name;
  } catch (error) {
    console.log(error);
    return false;
  }
}

async function getKoiiNfts(arweave_address) {
  try {
    const nfts = await getWeaveAggregator("koii", arweave_address);
    return nfts;
  } catch (error) {
    return [];
  }
}

async function getPermaPagesNfts(arweave_address) {
  try {
    const nfts = await getWeaveAggregator("permapages-img", arweave_address);
    return nfts;
  } catch (error) {
    return [];
  }
}

async function getPermaPagesStamps(arweave_address) {
  try {
    const nfts = await getWeaveAggregator("permapages-stamps", arweave_address);
    return nfts;
  } catch (error) {
    return [];
  }
}

async function getAllPoaps(evm_address) {
  try {
    const API_KEY = process.env.POAP_API_KEY;
    const res = await axios.get(
      `https://api.poap.tech/actions/scan/${evm_address}`,
      {
        headers: { "Content-Type": "application/json", "X-API-Key": API_KEY },
      }
    );
    return res?.data;
  } catch (error) {
    return null;
  }
}

async function getGitPoaps(evm_address) {
  try {
    const ownedGitpoaps = (
      await axios.get(
        `https://public-api.gitpoap.io/v1/address/${evm_address}/gitpoaps`
      )
    )?.data;

    return ownedGitpoaps;
  } catch (error) {
    return [];
  }
}

async function retrieveArtransactions(arweave_address) {
  const q = {
    query: `query {
  transactions(
  owners: ["${arweave_address}"],
    first: 25
  ) {
    edges {
      node {
        id
        owner { address }
        tags { name value }
        block { timestamp }

      }
    }
  }
}`,
  };
  const response = await axios.post("https://arweave.net/graphql", q, {
    headers: { "Content-Type": "application/json" },
  });

  const transactions = [];

  const res_arr = response.data.data.transactions.edges;

  for (let element of res_arr) {
    const tx = element["node"];
    transactions.push({
      txid: tx.id,
      // pending transactions do not have block value
      timestamp: tx.block ? tx.block.timestamp : Date.now(),
      tags: tx.tags ? tx.tags : [],
    });
  }
  return transactions;
}

async function retrievNearTransaction(userProfile) {
  try {
    for (const identity of userProfile.exotic_addresses) {
      if (identity.ver_req_network === "NEAR-MAINNET" && identity.is_verified) {
        const transactions = (
          await axios.get(
            `https://nearblocks.io/api/account/txns?address=${identity.exotic_address}&limit=10&offset=0`
          )
        )?.data;
        identity.NEAR_TRANSACTIONS = transactions;
      }
    }
  } catch (error) {
    console.log(error);
    return false;
  }
}

async function getMoralisNfts(evm_address) {
  try {
    const res = (
      await axios.get(
        `https://deep-index.moralis.io/api/v2/${evm_address}/nft?chain=eth&format=decimal`,
        {
          headers: {
            Accept: "application/json",
            "X-API-Key": process.env.MORALIS_API_KEY,
          },
        }
      )
    )?.data;
    return res?.result;
  } catch (error) {
    console.log(error);
    return false;
  }
}

async function getLensHandles(evm_address) {
  try {
    const res = (
      await axios.get(
        `https://deep-index.moralis.io/api/v2/${evm_address}/nft?chain=polygon&format=decimal`,
        {
          headers: {
            Accept: "application/json",
            "X-API-Key": process.env.MORALIS_API_KEY,
          },
        }
      )
    )?.data;
    const handles = res?.result.filter(
      (nft) => nft.token_address == LENS_LPP_CONTRACT
    );
    if (handles.length) {
      return handles.map((handle) => JSON.parse(handle.metadata)?.name);
    }

    return handles;
  } catch (error) {
    console.log(error);
    return false;
  }
}

async function getLinageeDomains(address) {
  try {
    const options = {
      method: "GET",
      url: `https://deep-index.moralis.io/api/v2/${address}/nft`,
      params: {
        chain: "eth",
        format: "decimal",
        token_addresses: "0x2cc8342d7c8bff5a213eb2cde39de9a59b3461a7",
      },
      headers: { accept: "application/json", "X-API-Key": "test" },
    };

    const res = await axios.request(options);

    for (const domain of res?.data?.result) {
      domain.open_sea_url = `https://opensea.io/assets/ethereum/0x2cc8342d7c8bff5a213eb2cde39de9a59b3461a7/${domain.token_id}`;
      // delete unnecessay metadata
      delete domain.token_uri;
      delete domain.metadata;
      delete domain.last_token_uri_sync;
      delete domain.last_metadata_sync;
    }
    return res?.data?.result;
  } catch (error) {
    console.log(error);
    return [];
  }
}


async function getGalaxyCreds(address) {
  try {
    const q = {
      query: `query userCredentials {
  addressInfo(address: "${address}") {
    id
    avatar
    username
    eligibleCredentials(first: 1000, after: "") {
      list {
        id
        name
      }
    }
  }
}`,
    };
    const res = (
      await axios.post("https://graphigo.prd.galaxy.eco/query", q, {
        headers: { "Content-Type": "application/json" },
      })
    )?.data;

    return res?.data?.addressInfo;
  } catch (error) {
    return null;
  }
}
