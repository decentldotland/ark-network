/**
 * 
 * 
 * 
 *         ░█████╗░██████╗░██╗░░██╗        ███╗░░██╗███████╗████████╗░██╗░░░░░░░██╗░█████╗░██████╗░██╗░░██╗
 *         ██╔══██╗██╔══██╗██║░██╔╝        ████╗░██║██╔════╝╚══██╔══╝░██║░░██╗░░██║██╔══██╗██╔══██╗██║░██╔╝
 *         ███████║██████╔╝█████═╝░        ██╔██╗██║█████╗░░░░░██║░░░░╚██╗████╗██╔╝██║░░██║██████╔╝█████═╝░
 *         ██╔══██║██╔══██╗██╔═██╗░        ██║╚████║██╔══╝░░░░░██║░░░░░████╔═████║░██║░░██║██╔══██╗██╔═██╗░
 *         ██║░░██║██║░░██║██║░╚██╗        ██║░╚███║███████╗░░░██║░░░░░╚██╔╝░╚██╔╝░╚█████╔╝██║░░██║██║░╚██╗
 *         ╚═╝░░╚═╝╚═╝░░╚═╝╚═╝░░╚═╝        ╚═╝░░╚══╝╚══════╝░░░╚═╝░░░░░░╚═╝░░░╚═╝░░░╚════╝░╚═╝░░╚═╝╚═╝░░╚═╝
 * 
 * @title: Ark Network Arweave oracle
 * @version 0.0.2
 * @author: charmful0x
 * @license: MIT
 * @website decent.land
 * 
 **/


export async function handle(state, action) {
  const input = action.input;
  const caller = action.caller;

  const admins = state.admins;
  const identities = state.identities;

  const ERROR_INVALID_DATA_TYPE = "EVM address/TXID must be a string";
  const ERROR_INVALID_EVM_ADDRESS_SYNTAX = "invalid EVM address syntax";
  const ERROR_INVALID_EVM_TXID_SYNTAX = "invalid EVM TXID syntax";
  const ERROR_USER_NOT_FOUND =
    "cannot find a user with the given Arweave address";
  const ERROR_DOUBLE_INTERACTION =
    "cannot reverse an identity validity within less than 3 network blocks";
  const ERROR_INVALID_ARWEAVE_ADDRESS = "invalid Arweave address syntax";
  const ERROR_CALLER_NOT_ADMIN = "invalid function caller";
  const ERROR_USERNAME_NOT_STRING = "Telegram username must be a string";
  const ERROR_INVALID_TELEGRAM_SYNTAX = "invalid Telegram username syntax";
  const ERROR_FUNCTION_MISSING_ARGUMENTS =
    "None of the function's required paramters have been passed in";
  const ERROR_INVALID_VALIDITY = "the admin has passed an invalid validity";

  // USERS FUNCTION

  if (input.function === "linkIdentity") {
    const address = input?.address;
    const verificationReq = input?.verificationReq;
    let telegram = input?.telegram;

    if (!address && !verificationReq && !telegram) {
      throw new ContractError(ERROR_FUNCTION_MISSING_ARGUMENTS);
    }

    const userIndex = _getUserIndex(caller);

    if (telegram) {
      telegram = _validateTelegramUsername(telegram);
    }

    if (userIndex === -1) {
      _validateEvmAddress(address);
      _validateEvmTx(verificationReq);

      identities.push({
        arweave_address: caller,
        evm_address: address,
        verification_req: verificationReq,
        telegram_username: telegram ? telegram : null,
        identity_id: SmartWeave.transaction.id,
        is_verified: false,
        is_evaluated: false,
        last_modification: SmartWeave.block.height,
      });

      return { state };
    }

    if (address) {
      _validateEvmAddress(address);
      _validateEvmTx(verificationReq);
      // updating the address means that
      // the verificationReq should exist
      identities[userIndex].evm_address = address;
      identities[userIndex].verification_req = verificationReq;
      // reset the account verification state
      identities[userIndex].is_evaluated = false;
      identities[userIndex].is_verified = false;
      // generate a new identity ID for the new address
      identities[userIndex].identity_id = SmartWeave.transaction.id;
    }

    if (telegram) {
      // telegram username got already checked
      identities[userIndex].telegram_username = telegram;
      // reset the account verification state
      identities[userIndex].is_evaluated = false;
      identities[userIndex].is_verified = false;
    }

    // log the update's blockheight
    identities[userIndex].last_modification = SmartWeave.block.height;

    return { state };
  }

  // ADMINS FUNCTION

  if (input.function === "verifyIdentity") {
    // verify (or reverse verification) the identity of an Arweave
    // available in the contract state
    const identityOf = input?.identityOf;
    const validity = input?.validity;

    _validateArweaveAddress(identityOf);
    _isAdmin(caller);

    const identityIndex = _getUserIndex(identityOf);

    ContractAssert([true, false].includes(validity), ERROR_INVALID_VALIDITY)
    ContractAssert(identityIndex !== -1, ERROR_USER_NOT_FOUND);
    ContractAssert(
      identities[identityIndex].last_modification < SmartWeave.block.height + 3,
      ERROR_DOUBLE_INTERACTION
    );

    identities[identityIndex].last_modification = SmartWeave.block.height;
    identities[identityIndex].is_verified = validity;
    identities[identityIndex].is_evaluated = true;
    identities[identityIndex].last_validation = SmartWeave.block.height;
    identities[identityIndex].validator = caller;
    return { state };
  }

  // HELPER FUNCTIONS

  function _validateEvmAddress(address) {
    ContractAssert(typeof address === "string", ERROR_INVALID_DATA_TYPE);
    ContractAssert(
      /^0x[a-fA-F0-9]{40}$/.test(address),
      ERROR_INVALID_EVM_ADDRESS_SYNTAX
    );
  }

  function _validateEvmTx(txid) {
    ContractAssert(typeof txid === "string", ERROR_INVALID_DATA_TYPE);
    ContractAssert(
      /^0x([A-Fa-f0-9]{64})$/.test(txid),
      ERROR_INVALID_EVM_TXID_SYNTAX
    );
  }

  function _validateArweaveAddress(address) {
    ContractAssert(
      /[a-z0-9_-]{43}/i.test(address),
      ERROR_INVALID_ARWEAVE_ADDRESS
    );
  }

  function _isAdmin(address) {
    _validateArweaveAddress(address);
    ContractAssert(admins.includes(address), ERROR_CALLER_NOT_ADMIN);
  }

  function _validateTelegramUsername(username) {
    ContractAssert(typeof username === "string", ERROR_USERNAME_NOT_STRING);
    // trim and remove whitespaces from the string's characters
    const trimmed = username
      .trim()
      .split("")
      .filter((char) => char !== " ")
      .join("");
    const isValid =
      /.*\B@(?=\w{5,32}\b)[a-zA-Z0-9]+(?:_[a-zA-Z0-9]+)*.*/gm.test(trimmed);

    ContractAssert(isValid, ERROR_INVALID_TELEGRAM_SYNTAX);

    return trimmed;
  }

  function _getUserIndex(address) {
    const index = identities.findIndex(
      (usr) => usr.arweave_address === address
    );
    return index;
  }
}
