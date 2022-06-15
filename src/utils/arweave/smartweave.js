import { getTransaction } from "../evm/ethers.js";
import { checkTopicAgainstAddress } from "../evm/web3.js";
import { ARWEAVE_ORACLE_ADDRESS, EVM_ORACLE_ADDRESS } from "../constants.js";
import { SmartWeaveNodeFactory, LoggerFactory } from "redstone-smartweave";
import { verifyUser } from "../../telegram/verify.js";
import { red, green } from "../chalk.js";
import { arweave } from "./network.js";
import "../setEnv.js";

const smartweave = SmartWeaveNodeFactory.memCached(arweave);

export async function evaluateOracleState() {
  try {
    const contract = smartweave.contract(ARWEAVE_ORACLE_ADDRESS);
    const contractState = (await contract.readState())?.state;

    return contractState;
  } catch (error) {
    console.log(error);
  }
}

export async function checkAndVerifyUser(userObject) {
  try {
    const pk = JSON.parse(process.env.JWK);

    const {
      arweave_address,
      evm_address,
      verification_req,
      identity_id,
      telegram_username,
    } = userObject;
    const evmVerificationReq = await getTransaction(verification_req);

    if (evmVerificationReq.to !== EVM_ORACLE_ADDRESS) {
      throw new Error(`invalid contract interaction`);
    }

    if (telegram_username) {
      const isValid = await verifyUser(identity_id, telegram_username);

      if (!isValid) {
        throw new Error(`Failed while verifying Telegram identity`);
      }
      console.log(green(`Telegram identity valid --> ${telegram_username}`));
    }

    const hashedArAddressLog = evmVerificationReq.logs[0].topics[2];
    const validity = await checkTopicAgainstAddress(
      hashedArAddressLog,
      arweave_address
    );

    const identityValidity = validity.is_equal ? true : false;

    const tx = await arweave.createTransaction(
      {
        data: "Ark Network verification",
      },
      pk
    );

    const input = `{"function": "verifyIdentity", "identityOf": "${arweave_address}", "validity": ${identityValidity}}`;

    tx.addTag("App-Name", "SmartWeaveAction");
    tx.addTag("App-Version", "0.3.0");
    tx.addTag("Contract", ARWEAVE_ORACLE_ADDRESS);
    tx.addTag("Input", input);
    tx.addTag("Protocol-Name", "Ark-Network");
    tx.addTag("Protocol-Action", "Verify-Identity");
    tx.addTag("Identity-ID", identity_id);
    tx.addTag("Content-Type", "text/plain");

    tx.reward = (+tx.reward * 100).toString();

    await arweave.transactions.sign(tx, pk);
    await arweave.transactions.post(tx);

    if (identityValidity) {
      console.log(
        green(`--> identity verified: ${arweave_address} <-> ${evm_address}`)
      );
      console.log(
        green(`--> verified identity ID ${identity_id} | verification TXID: ${tx.id}\n\n`)
      );
    } else {
      console.log(
        red(`--> verification failed: ${arweave_address} <-> ${evm_address}`)
      );
      console.log(
        red(`--> failed identity ID ${identity_id} | failing verification TXID: ${tx.id}\n\n`)
      );
    }
  } catch (error) {
    console.log(error);
  }
}
