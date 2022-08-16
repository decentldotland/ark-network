import nearAPI from "near-api-js";
const { connect, Contract, KeyPair, keyStores } = nearAPI;
import "../setEnv.js";

async function tesnetNetConfig() {
  const keyStore = new keyStores.InMemoryKeyStore();
  const keyPair = KeyPair.fromString(process.env.NEAR_TESTNET_PK);
  await keyStore.setKey("testnet", "decentland.testnet", keyPair);

  return {
    networkId: "testnet",
    keyStore,
    nodeUrl: "https://rpc.testnet.near.org",
    walletUrl: "https://wallet.testnet.near.org",
    helperUrl: "https://helper.testnet.near.org",
    explorerUrl: "https://explorer.testnet.near.org",
  };
}

export async function updateUserIndentityNear(newIdentity) {
  const connectionConfig = await tesnetNetConfig();
  const near = await connect(connectionConfig);
  const account = await near.account("decentland.testnet");
  const methodOptions = {
    changeMethods: ["update_ark_user_identity"],
  };
  const contract = new Contract(
    account,
    "dev-1660516310576-97373428914255",
    methodOptions
  );


  await contract.update_ark_user_identity({
    meta: "initial state",
    args: { updatedIdentity: newIdentity},
  });
}
