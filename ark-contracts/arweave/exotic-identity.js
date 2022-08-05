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
 * @title Ark Network Arweave oracle
 * @version 0.0.9
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
  const evm_networks = state.evm_networks;
  const exotic_networks = state.exotic_networks;
  const verRequests = state.verRequests;

  const ERROR_INVALID_DATA_TYPE = `EVM address/TXID must be a string`;
  const ERROR_INVALID_EVM_ADDRESS_SYNTAX = `invalid EVM address syntax`;
  const ERROR_INVALID_EVM_TXID_SYNTAX = `invalid EVM TXID syntax`;
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
  const ERROR_IDENTITY_DUPLICATION = `an Arweave address is already linked with the given EVM address`;
  const ERROR_VER_ID_ALREADY_USED = `the given verification request TXID has been already used by a valid identity`;
  const ERROR_CALLER_ALREADY_ADDED_EXOTIC_NET = `the caller has already added a verification request for the given exotic addr`;
  const ERROR_VER_REQ_NOT_FOUND = `cannot find an exotic verification request with the given string`;

  // USERS FUNCTION

  if (input.function === "linkEvmIdentity") {
    /**
     * @dev register an identity linkage request. The
     *  caller links his Arweave addr with an EVM addr.
     *
     * @param address the EVM addr to be linked
     * @param verificationReq the TXID of linkage
     * request on the EVM chain
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
      _validateEvmAddress(address);
      _validateNetwork(network, "EVM");
      _validateEvmTx(verificationReq);
      _checkSignature(verificationReq);

      identities.push({
        arweave_address: caller,
        evm_address: address,
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
        has_unevaluated_exotic_addrs: false,
        exotic_addresses: [],
      });

      return { state };
    }

    if (address) {
      _validateEvmAddress(address);
      _validateEvmTx(verificationReq);
      _checkSignature(verificationReq);
      _validateNetwork(network, "EVM");
      // updating the address means that
      // the verificationReq should exist
      identities[userIndex].evm_address = address;
      identities[userIndex].verification_req = verificationReq;
      identities[userIndex].ver_req_network = network;
      // reset the account verification state
      identities[userIndex].is_evaluated = false;
      identities[userIndex].is_verified = false;
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

  if (input.function === "linkExoticIdentity") {
    /**
     * @dev register an identity linkage request. The
     *  caller links his Arweave addr with an Exotic addr.
     *  This function cannot be used to link a TG username.
     *
     * @param address the Exotic addr to be linked
     * @param verificationReq the TXID of linkage
     * request on the Exotic chain
     * @param network the network KEY of where
     * verificationReq took place
     *
     * @return state
     *
     **/
    const address = input?.address;
    const verificationReq = input.verificationReq;
    const network = input.network;

    _isString(address);
    _isString(verificationReq);
    _validateNetwork(network, "EXOTIC");
    _checkSignature(verificationReq);
    _checkExoticIdentityDuplication(address, caller);

    const userIndex = _getUserIndex(caller);

    if (userIndex === -1) {
      identities.push({
        arweave_address: caller,
        evm_address: null,
        verification_req: null,
        ver_req_network: null,
        telegram: {
          username: null,
          is_verified: false,
          is_evaluated: false,
        },
        identity_id: SmartWeave.transaction.id,
        is_verified: false,
        is_evaluated: false,
        last_modification: SmartWeave.block.height,
        has_unevaluated_exotic_addrs: true,
        exotic_addresses: [
          {
            exotic_address: address,
            verification_req: verificationReq,
            ver_req_network: network,
            is_evaluated: false,
            is_verified: false,
          },
        ],
      });

      return { state };
    }

    const userIdentityObject = identities[userIndex].exotic_addresses;
    userIdentityObject.push({
      exotic_address: address,
      verification_req: verificationReq,
      ver_req_network: network,
      is_evaluated: false,
      is_verified: false,
    });
    identities[userIndex].has_unevaluated_exotic_addrs = true;
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
     * @param verificationRq the TX hash on the EVM/Exotic chain
     * of the linkage transaction on that network.
     * @param validity boolean (true or false)
     *
     * @return state
     *
     **/
    const identityOf = input?.identityOf;
    const validity = input?.validity;
    const verificationReq = input?.verificationReq;

    _validateArweaveAddress(identityOf);
    _isAdmin(caller);

    const identityIndex = _getUserIndex(identityOf);

    ContractAssert([true, false].includes(validity), ERROR_INVALID_VALIDITY);
    ContractAssert(identityIndex !== -1, ERROR_USER_NOT_FOUND);
    ContractAssert(
      identities[identityIndex].last_modification < SmartWeave.block.height + 3,
      ERROR_DOUBLE_INTERACTION
    );
    // if the verification request is on an EVM network
    if (identities[identityIndex].verification_req === verificationReq) {
      _adminEvmDoubleVerification(
        identities[identityIndex].verification_req,
        identities[identityIndex].arweave_address
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

    // if the verification request is not stated in EVM, then it's exotic ver req
    const exoticVerReqIndex = identities[
      identityIndex
    ].exotic_addresses.findIndex(
      (addr) => addr.verification_req === verificationReq
    );
    ContractAssert(exoticVerReqIndex !== -1, ERROR_VER_REQ_NOT_FOUND);

    const exoticIdentity =
      identities[identityIndex].exotic_addresses[exoticVerReqIndex];
    _adminExoticDoubleVerification(
      exoticIdentity.verification_req,
      identities[identityIndex].arweave_address
    );

    exoticIdentity.is_verified = validity;
    exoticIdentity.is_evaluated = true;
    exoticIdentity.validator = caller;
    identities[identityIndex].last_modification = SmartWeave.block.height;
    // if the identity still have unchecked exotic addresses
    identities[identityIndex].has_unevaluated_exotic_addrs =
      _hasUnevaluatedExoticAddr(identityIndex);

    if (validity) {
      // log the verification requests used for a valid identity
      state.verRequests.push(exoticIdentity.verification_req);
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
     * @param type network's type ("EVM" or "EXOTIC")
     *
     * @return state
     *
     **/
    const network = input.network;
    const type = input.type;

    _isAdmin(caller);
    ContractAssert(["EVM", "EXOTIC"].includes(type));
    ContractAssert(
      !evm_networks.includes(network) || !exotic_networks.includes(network),
      ERROR_NETWORK_ALREADY_ADDED
    );
    const net = type === "EVM" ? evm_networks : exotic_networks;

    net.push(network);

    return { state };
  }

  if (input.function === "removeNetwork") {
    /**
     * @dev remove a network support from the `state.networks` array
     *
     * @param network the KEY of the network to be removed
     * @param type network's type ("EVM" or "EXOTIC")
     *
     * @return state
     *
     **/
    const network = input.network;
    const type = input.type;

    _isAdmin(caller);
    ContractAssert(["EVM", "EXOTIC"].includes(type));

    const net = type === "EVM" ? evm_networks : exotic_networks;
    const networkIndex = net.findIndex((netwrk) => netwrk === network);

    ContractAssert(networkIndex !== -1, ERROR_NETWORK_NOT_EXIST);
    net.splice(networkIndex, 1);

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

  function _validateNetwork(network, key) {
    const net = key === "EVM" ? evm_networks : exotic_networks;
    ContractAssert(net.includes(network), ERROR_INVALID_NETWORK_SUPPLIED);
  }

  function _checkIdentityDuplication(evm_address, arweave_address) {
    const possibleDupIndex = identities.findIndex(
      (usr) =>
        usr.evm_address === evm_address &&
        !!usr.is_verified &&
        !!usr.is_evaluated &&
        usr.arweave_address !== arweave_address
    );

    if (possibleDupIndex === -1) {
      return false;
    }

    throw new ContractError(ERROR_IDENTITY_DUPLICATION);
  }

  function _checkExoticIdentityDuplication(exotic_address, arweave_address) {
    for (const usr of identities) {
      for (const addr of usr.exotic_addresses) {
        if (
          addr.exotic_address === exotic_address &&
          addr.is_evaluated &&
          addr.is_verified &&
          usr.arweave_address !== arweave_address
        ) {
          throw new ContractError(ERROR_IDENTITY_DUPLICATION);
        }
        // if the caller has already pushed the same address twice of more
        if (
          addr.exotic_address === exotic_address &&
          usr.arweave_address === arweave_address
        ) {
          throw new ContractError(ERROR_CALLER_ALREADY_ADDED_EXOTIC_NET);
        }
      }
    }
  }

  function _checkSignature(txid) {
    if (verRequests.includes(txid)) {
      throw new ContractError(ERROR_VER_ID_ALREADY_USED);
    }
  }

  function _adminEvmDoubleVerification(verificationReq, arweave_address) {
    const possibleDupIndex = identities.findIndex(
      (usr) =>
        usr.arweave_address !== arweave_address &&
        usr.verification_req === verificationReq &&
        !!usr.is_evaluated &&
        !!usr.is_verified
    );
    ContractAssert(possibleDupIndex === -1, ERROR_IDENTITY_DUPLICATION);
  }

  function _adminExoticDoubleVerification(verificationReq, arweave_address) {
    for (const usr of identities) {
      for (const addr of usr.exotic_addresses) {
        if (
          addr.verification_req === verificationReq &&
          addr.is_evaluated &&
          addr.is_verified &&
          usr.arweave_address !== arweave_address
        ) {
          throw new ContractError(ERROR_IDENTITY_DUPLICATION);
        }
      }
    }
  }

  function _isString(str) {
    ContractAssert(
      typeof str === "string" && str.length > 0,
      `the given argument: "${str}" must be a string`
    );
  }

  function _hasUnevaluatedExoticAddr(user_index) {
    // user_index is passed from the `verifyIdentity()` fc after validating it
    const hasUnvaluatedAddrs = identities[user_index].exotic_addresses.find(
      (addr) => !addr.is_evaluated
    );
    if (hasUnvaluatedAddrs) {
      return true;
    }

    return false;
  }
}
