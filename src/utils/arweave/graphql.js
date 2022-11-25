import axios from "axios";
import { ARWEAVE_ORACLE_ADDRESS } from "../constants.js";

const arkNetworkActions = {
  body: {
    query: `query {
  transactions(
    tags: [
        { name: "Protocol-Name", values: "Ark-Network"},
        { name: "Protocol-Action", values: "Link-Identity"},
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

async function getActionPerAddress(address) {
  const actionPerAddress = {
    body: {
      query: `query {
  transactions(
  owners: ["${address}"]
    tags: [
        { name: "Protocol-Name", values: "Ark-Network"},
        { name: "Protocol-Action", values: "Link-Identity"},
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
        block { timestamp }
      }
    }
  }
}`,
    },
  };

  return actionPerAddress;
}

async function gqlQuery(query) {
  try {
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
        blockheight: tx.block?.height ? tx.block.height : tx.block?.timestamp,
        tags: tx.tags ? tx.tags : [],
      });
    }

    return transactionIds;
  } catch (error) {
    console.log(error);
    return [];
  }
}

export async function getLastInteractionBlock() {
  try {
    const interactions = await gqlQuery(arkNetworkActions.body);
    return interactions?.[0]?.blockheight;
  } catch (error) {
    console.log(error);
  }
}

export async function getUserRegistrationTimestamp(address) {
  try {
    const query = await getActionPerAddress(address);
    const interactions = await gqlQuery(query.body);
    return interactions?.[interactions.length - 1]?.blockheight;
  } catch (error) {
    console.log(error);
  }
}
