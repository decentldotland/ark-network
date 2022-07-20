import axios from "axios";
import { ARWEAVE_ORACLE_ADDRESS } from "../constants.js";

const arkNetworkActions = {
  body: {
    query: `query {
  transactions(
    tags: [
        { name: "Protocol-Name", values: "Ark-Network"},
        { name: "Protocol-Action", values: "LinkIdentity"},
        { name: "App-Name", values: "SmartWeaveAction"},
        { name: "Contract", values: "${ARWEAVE_ORACLE_ADDRESS}"},
        ]
    first: 250
  ) {
    edges {
      node {
        id
        owner { address }
        tags { name value }
        block { height }
      }
    }
  }
}`,
  },
};

async function gqlQuery(query) {
  const response = await axios.post("https://arweave.net/graphql", query, {
    headers: { "Content-Type": "application/json" },
  });

  const transactionIds = [];

  const res_arr = response.data.data.transactions.edges;

  for (let element of res_arr) {
    const tx = element["node"];

    transactionIds.push({
      id: tx.id,
      owner: tx.owner.address,
      // pending transactions do not have block value
      blockheight: tx.block?.height,
      tags: tx.tags ? tx.tags : [],
    });
  }

  return transactionIds;
}

export async function getLastInteractionBlock() {
  try {
    const interactions = await gqlQuery(arkNetworkActions.body);
    return interactions?.[0]?.blockheight;
  } catch (error) {
    console.log(error);
  }
}
