import nearAPI from "near-api-js";
import base64url from "base64url";
import { NEAR_MAINNET_ADDRESS } from "../constants.js";
const { connect, Contract } = nearAPI;

const connectionConfig = {
  networkId: "mainnet",
  nodeUrl: "https://rpc.mainnet.near.org",
  walletUrl: "https://wallet.mainnet.near.org",
  helperUrl: "https://helper.mainnet.near.org",
  explorerUrl: "https://explorer.mainnet.near.org",
};

export async function canBeVerifiedNear({
  verificationReq,
  arweave_address,
  exotic_address,
} = {}) {
  try {
    const nearConnection = await connect(connectionConfig);

    const response = await nearConnection.connection.provider.txStatus(
      verificationReq,
      "decentland.near"
    );

    if (!response) {
      return false;
    }

    if (!["", true].includes(response?.status?.["SuccessValue"])) {
      return false;
    }

    if (
      response.transaction?.signer_id !== exotic_address ||
      response.transaction?.receiver_id !== NEAR_MAINNET_ADDRESS
    ) {
      return false;
    }
    const contractAction = response.transaction?.actions?.[0]?.FunctionCall;

    if (!contractAction || contractAction.method_name !== "set_id") {
      return false;
    }

    const decodedArgs = JSON.parse(base64url.decode(contractAction?.args));

    if (decodedArgs?.arweave_addr !== arweave_address) {
      return false;
    }

    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}
