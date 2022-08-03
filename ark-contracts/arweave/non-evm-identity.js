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
 * @title Ark Network Arweave oracle (Non-EVM Chains Oracle)
 * @version 0.0.1
 * @author charmful0x
 * @license MIT
 * @website decent.land
 *
 **/

export async function handle(state, action) {
  const input = action.input;
  const caller = action.caller;

  const admins = state.admins;
  const identities = state.identities;
  const networks = state.networks;
  const verRequests = state.verRequests;

  const ERROR_INVALID_DATA_TYPE = `Exotic address/TXID must be a string`;
  const ERROR_USER_NOT_FOUND = `cannot find a user with the given Arweave address`;
  const ERROR_DOUBLE_INTERACTION = `cannot reverse an identity validity within less than 3 network blocks`;
  const ERROR_INVALID_ARWEAVE_ADDRESS = `invalid Arweave address syntax`;
  const ERROR_CALLER_NOT_ADMIN = `invalid function caller`;
  const ERROR_USERNAME_NOT_STRING = `Telegram username must be a string`;
  const ERROR_FUNCTION_MISSING_ARGUMENTS = `None of the function's required paramters have been passed in`;
  const ERROR_INVALID_VALIDITY = `the admin has passed an invalid validity`;
  const ERROR_INVALID_NETWORK_SUPPLIED = `network not supported`;
  const ERROR_NETWORK_ALREADY_ADDED = `the given network has been already added`;
  const ERROR_NETWORK_NOT_EXIST = `cannot find a network with the given ID-name`;
  const ERROR_IDENTITY_DUPLICATION = `an Arweave address is already linked with the given Exotic address`;
  const ERROR_VER_ID_ALREADY_USED = `the given verification request TXID has been already used by a valid identity`;

  // USERS FUNCTION

  if (input.function === "linkIdentity") {
    /**
     * @dev register an identity linkage request. The
     *  caller links his Arweave addr with an Exotic addr.
     *
     * @param address the Exotic addr to be linked
     * @param verificationReq the TXID of linkage
     * request on the Exotic chain
     * @param network the network KEY of where
     * verificationReq took place
     * @param telegram_acc optional input, the
     * user's TG username encoded in AES
     *
     * @return state
     *
     **/
    const address = input?.address;
    const verificationReq = input?.verificationReq;
    const network = input.network;
    let telegram_enc = input?.telegram_enc; // telegram username passed under AES encryption

    if (!address && !verificationReq && !telegram_enc && !network) {
      throw new ContractError(ERROR_FUNCTION_MISSING_ARGUMENTS);
    }

    const userIndex = _getUserIndex(caller);

    // allow one-to-one addresses linkage only
    _checkIdentityDuplication(address, caller);

    if (telegram_enc) {
      telegram_enc = _validateTelegramUsername(telegram_enc);
    }

    if (userIndex === -1) {
      _validateExoticAddress(address);
      _validateNetwork(network);
      _validateExoticTx(verificationReq);
      _checkSignature(verificationReq);

      identities.push({
        arweave_address: caller,
        exotic_address: address,
        verification_req: verificationReq,
        ver_req_network: network,
        telegram: {
          username: telegram_enc ? telegram_enc : null,
          is_verified: false,
          is_evaluated: false,
        },
        identity_id: SmartWeave.transaction.id,
        is_verified: false,
        is_evaluated: false,
        last_modification: SmartWeave.block.height,
      });

      return { state };
    }

    if (address) {
      _validateExoticAddress(address);
      _validateExoticTx(verificationReq);
      _checkSignature(verificationReq);
      _validateNetwork(network);
      // updating the address means that
      // the verificationReq should exist
      identities[userIndex].exotic_address = address;
      identities[userIndex].verification_req = verificationReq;
      identities[userIndex].ver_req_network = network;
      // reset the account verification state
      identities[userIndex].is_evaluated = false;
      identities[userIndex].is_verified = false;
      // generate a new identity ID for the new address
      identities[userIndex].identity_id = SmartWeave.transaction.id;
    }

    if (telegram_enc) {
      // telegram username got already checked
      identities[userIndex].telegram = {
        username: telegram_enc ? telegram_enc : null,
        is_verified: false,
        is_evaluated: false,
      };
    }

    // log the update's blockheight
    identities[userIndex].last_modification = SmartWeave.block.height;

    return { state };
  }

  // ADMINS FUNCTION

  if (input.function === "verifyIdentity") {
    /**
     * @dev verify (or reverse verification) the identity of
     * an identity registered in the contract state
     *
     * @param identityOf the Arweave addr of the identity
     * @param validity boolean (true or false)
     *
     * @return state
     *
     **/
    const identityOf = input?.identityOf;
    const validity = input?.validity;

    _validateArweaveAddress(identityOf);
    _isAdmin(caller);

    const identityIndex = _getUserIndex(identityOf);

    ContractAssert([true, false].includes(validity), ERROR_INVALID_VALIDITY);
    ContractAssert(identityIndex !== -1, ERROR_USER_NOT_FOUND);
    ContractAssert(
      identities[identityIndex].last_modification < SmartWeave.block.height + 3,
      ERROR_DOUBLE_INTERACTION
    );

    _adminDoubleVerification(
      identities[identityIndex].verification_req,
      identities[identityIndex].exotic_address
    );
    
    identities[identityIndex].last_modification = SmartWeave.block.height;
    identities[identityIndex].is_verified = validity;
    identities[identityIndex].is_evaluated = true;
    identities[identityIndex].last_validation = SmartWeave.block.height;
    identities[identityIndex].validator = caller;

    if (validity) {
      // log the verification requests used for a valid identity
      state.verRequests.push(identities[identityIndex]["verification_req"]);
    }

    return { state };
  }
  if (input.function === "verifyTelegram") {
    /**
     * @dev verify (or reverse verification) the validity
     * of a linked Telegram username.
     *
     * @param identityOf the Arweave addr of the identity
     * @param validity boolean (true or false)
     *
     * @return state
     *
     **/
    const identityOf = input?.identityOf;
    const validity = input?.validity;

    _validateArweaveAddress(identityOf);
    _isAdmin(caller);

    const identityIndex = _getUserIndex(identityOf);

    ContractAssert([true, false].includes(validity), ERROR_INVALID_VALIDITY);
    ContractAssert(identityIndex !== -1, ERROR_USER_NOT_FOUND);
    ContractAssert(
      identities[identityIndex].last_modification < SmartWeave.block.height + 3,
      ERROR_DOUBLE_INTERACTION
    );

    identities[identityIndex].last_modification = SmartWeave.block.height;
    identities[identityIndex].telegram.is_verified = validity;
    identities[identityIndex].telegram.is_evaluated = true;
    identities[identityIndex].last_validation = SmartWeave.block.height;
    identities[identityIndex].validator = caller;

    return { state };
  }

  if (input.function === "addNetwork") {
    /**
     * @dev append a new KEY for a newly supported network.
     *
     * @param network the new network's KEY
     *
     * @return state
     *
     **/
    const network = input.network;

    _isAdmin(caller);
    ContractAssert(!networks.includes(network), ERROR_NETWORK_ALREADY_ADDED);

    networks.push(network);

    return { state };
  }

  if (input.function === "removeNetwork") {
    /**
     * @dev remove a network support from the `state.networks` array
     *
     * @param network the KEY of the network to be removed
     *
     * @return state
     *
     **/
    const network = input.network;

    _isAdmin(caller);
    const networkIndex = network.findIndex((net) => net === network);

    ContractAssert(networkIndex !== -1, ERROR_NETWORK_NOT_EXIST);
    networks.splice(networkIndex, 1);

    return { state };
  }

  // HELPER FUNCTIONS

  function _validateExoticAddress(address) {
    ContractAssert(typeof address === "string", ERROR_INVALID_DATA_TYPE);
  }

  function _validateExoticTx(txid) {
    ContractAssert(typeof txid === "string", ERROR_INVALID_DATA_TYPE);
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

  function _validateTelegramUsername(encrypted_username) {
    ContractAssert(
      typeof encrypted_username === "string",
      ERROR_USERNAME_NOT_STRING
    );

    return encrypted_username.trim();
  }

  function _getUserIndex(address) {
    const index = identities.findIndex(
      (usr) => usr.arweave_address === address
    );
    return index;
  }

  function _validateNetwork(network) {
    ContractAssert(networks.includes(network), ERROR_INVALID_NETWORK_SUPPLIED);
  }

  function _checkIdentityDuplication(exotic_address, arweave_address) {
    const possibleDupIndex = identities.findIndex(
      (usr) =>
        usr.exotic_address === exotic_address &&
        !!usr.is_verified &&
        !!usr.is_evaluated &&
        usr.arweave_address !== arweave_address
    );

    if (possibleDupIndex === -1) {
      return false;
    }

    throw new ContractError(ERROR_IDENTITY_DUPLICATION);
  }

  function _checkSignature(txid) {
    if (verRequests.includes(txid)) {
      throw new ContractError(ERROR_VER_ID_ALREADY_USED);
    }
  }

  function _adminDoubleVerification(verificationReq, arweave_address) {
    const possibleDupIndex = identities.findIndex(
      (usr) =>
        usr.arweave_address !== arweave_address &&
        usr.verification_req === verificationReq &&
        !!usr.is_evaluated &&
        !!usr.is_verified
    );
    ContractAssert(possibleDupIndex === -1, ERROR_IDENTITY_DUPLICATION);
  }
}
