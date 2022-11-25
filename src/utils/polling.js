import { getLastInteractionBlock } from "./arweave/graphql.js";
import { getArweaveBlock } from "./arweave/network.js";
import {
  evaluateOracleState,
  checkAndVerifyUser,
} from "./arweave/smartweave.js";
import NodeCache from "node-cache";
import base64url from "base64url";
import sha256 from "sha256";

export const cacheNode = new NodeCache();

export async function runPolling() {
  try {
    // const arweaveLastBlock = (await getArweaveBlock())?.height;

    if (!cacheNode.has("oracle-cache-base64")) {
      const oracleState = await evaluateOracleState();
      // const filteredState = await _filterState(oracleState);

      // for (const user of filteredState) {
      //   await checkAndVerifyUser(user);
      // }

      cacheNode.set("last-cached-block", "deprecated");
      cacheNode.set(
        "oracle-cache-base64",
        base64url(JSON.stringify(oracleState))
      );
      cacheNode.set("oracle-cache-sha256", sha256(JSON.stringify(oracleState)));
    }

    return;

    // const lastInteractionBlock = await getLastInteractionBlock();
    // if (
    //   cacheNode.has("last-cached-block") &&
    //   cacheNode.get("last-cached-block") < lastInteractionBlock
    // ) {
    //   const oracleState = await evaluateOracleState();
    //   const filteredState = await _filterState(oracleState);

    //   for (const user of filteredState) {
    //     await checkAndVerifyUser(user);
    //   }

    //   cacheNode.set("last-cached-block", arweaveLastBlock);
    //   cacheNode.set(
    //     "oracle-cache-base64",
    //     base64url(JSON.stringify(oracleState))
    //   );
    //   cacheNode.set("oracle-cache-sha256", sha256(JSON.stringify(oracleState)));
    // }
  } catch (error) {
    console.log(error);
  }
}

async function _filterState(state) {
  // filter evaluated users
  try {
    const filteredUsers = state.identities.filter(
      (user) => !user.is_evaluated || user.has_unevaluated_exotic_addrs
    );

    return filteredUsers;
  } catch (error) {
    console.log(error);
  }
}
