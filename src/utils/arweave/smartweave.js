import { getTransaction } from "../evm/ethers.js";
import { checkTopicAgainstAddress } from "../evm/web3.js";
import { ARWEAVE_ORACLE_ADDRESS, EVM_ORACLES_CONTRACTS } from "../constants.js";
import { SmartWeaveNodeFactory, LoggerFactory } from "redstone-smartweave";
import { verifyUser } from "../../telegram/verify.js";
import { red, green } from "../chalk.js";
import { arweave } from "./network.js";
import { canBeVerifiedNear } from "../near/config.js";
import { updateUserIndentityNear } from "../near/ark-oracle-utils.js";
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
      ver_req_network,
      telegram,
      identity_id,
      is_verified,
      is_evaluated,
      last_modification,
      has_unevaluated_exotic_addrs,
      exotic_addresses,
      last_validation,
      validator
    } = userObject;
    // if the verification is on an EVM network
    if (!is_evaluated && !has_unevaluated_exotic_addrs) {
      const evmVerificationReq = await getTransaction(
        verification_req,
        ver_req_network
      );
      if (!EVM_ORACLES_CONTRACTS.includes(evmVerificationReq.to)) {
        throw new Error(`invalid contract interaction/address`);
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

      const input = `{"function": "verifyIdentity", "identityOf": "${arweave_address}", "verificationReq": "${verification_req}", "validity": ${identityValidity}}`;

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

      // log the new identity updates on Near testnet oracle
      userObject.is_evaluated = true;
      userObject.is_verified = identityValidity;
      await updateUserIndentityNear(userObject);

      if (identityValidity) {
        console.log(
          green(
            `\n\n--> identity verified: ${arweave_address} <-> ${evm_address} || network: ${userObject.ver_req_network}`
          )
        );
        console.log(
          green(
            `--> verified identity ID ${identity_id} | verification TXID: ${tx.id}\n\n`
          )
        );
      } else {
        console.log(
          red(
            `\n\n--> verification failed: ${arweave_address} <-> ${evm_address} || network: ${userObject.ver_req_network}`
          )
        );
        console.log(
          red(
            `--> failed identity ID ${identity_id} | failing verification TXID: ${tx.id}\n\n`
          )
        );
      }
    }
    // if the verification is on an Exotic network
    if (has_unevaluated_exotic_addrs) {
      const unevaluatedAddr = exotic_addresses.find(
        (addr) => !addr.is_evaluated
      );
      const isVerifiable = await canBeVerifiedNear({
        arweave_address: arweave_address,
        verificationReq: unevaluatedAddr.verification_req,
        exotic_address: unevaluatedAddr.exotic_address,
      });
      const tx = await arweave.createTransaction(
        {
          data: "Ark Network verification",
        },
        pk
      );

      const input = `{"function": "verifyIdentity", "identityOf": "${arweave_address}", "verificationReq": "${unevaluatedAddr.verification_req}", "validity": ${isVerifiable}}`;

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

      // log the new identity updates on Near testnet oracle
      unevaluatedAddr.is_evaluated = true;
      unevaluatedAddr.is_verified = isVerifiable;
      await updateUserIndentityNear(userObject);

      if (isVerifiable) {
        console.log(
          green(
            `\n\n--> identity verified: ${arweave_address} <-> ${unevaluatedAddr.exotic_address} || network: ${unevaluatedAddr.ver_req_network}`
          )
        );
        console.log(
          green(
            `--> verified identity ID ${identity_id} | verification TXID: ${tx.id}\n\n`
          )
        );
      } else {
        console.log(
          red(
            `\n\n--> verification failed: ${arweave_address} <-> ${unevaluatedAddr.exotic_address} || network: ${userObject.ver_req_network}`
          )
        );
        console.log(
          red(
            `--> failed identity ID ${identity_id} | failing verification TXID: ${tx.id}\n\n`
          )
        );
      }
    }
  } catch (error) {
    console.log(error);
  }
}
