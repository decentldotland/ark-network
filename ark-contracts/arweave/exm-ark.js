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
 * @version EXM@v0.0.5
 * @author charmful0x
 * @license MIT
 * @website decent.land
 *
 **/

export async function handle(state, action) {
  const input = action.input;

  // STATE PROPERTIES
  const identities = state.identities;
  const evm_networks = state.evm_networks;
  const exotic_networks = state.exotic_networks;
  const networks = evm_networks.concat(exotic_networks);
  const verRequests = state.verRequests;

  // ERRORS CONSTANTS
  const ERROR_FUNCTION_MISSING_ARGUMENTS = `INSUFFICIENT_HAVE_BEEN_SUPPLIED_TO_THE_FUNCTION`;
  const ERROR_INVALID_USER = `CANNOT_FIND_USER_WITH_THE_GIVEN_ADDRESS`;
  const ERROR_ADDRESS_NOT_OWNED = `THE_ARWEAVE_CALLER_DONT_OWN_THE_EXOTIC_ADDR`;
  const ERROR_ADDRESS_ALREADY_PRIMARY = `THE_GIVEN_EXOTIC_ADDR_IS_ALREADY_PRIMARY`;
  const ERROR_ERROR_UNLINKING_ADDRESS = `SOMETHING_WENT_WRONG_WHILE_UNLINKING_ADDRESSES`;
  const ERROR_INVALID_EVALUATION = `EVALUATION_MUST_BE_A_BOOLEAN`;
  const ERROR_ADDRESS_ALREADY_EVALUATED = `THE_GIVEN_ADDR_HAS_BEEN_ALREADY_EVALUATED`;
  const ERROR_INVALID_ARWEAVE_ADDRESS = `INVALID_ARWEAVE_ADDR_SYNTAX`;
  const ERROR_INVALID_DATA_TYPE = `INPUT_SUPPOSED_TO_BE_A_STRING`;
  const ERROR_INVALID_EVM_ADDRESS_SYNTAX = `INVALID_EVM_ADDR_SYNTAX`;
  const ERROR_INVALID_EVM_TXID_SYNTAX = `INVALID_EVM_TXID_SYNTAX`;
  const ERROR_VER_ID_ALREADY_USED = `THE_GIVEN_VERIFICATION_REQUEST_HAS_BEEN_ALREADY_USED`;
  const ERROR_INVALID_NETWORK_SUPPLIED = `INVALID_NETWORK_KEY_HAS_BEEN_SUPPLIED`;
  const ERROR_ADDRESS_ALREADY_USED = `EXOTIC_ADDRESS_ALREADY_LINKED_TO_ANOTHER_USER`;
  const ERROR_ADDRESS_ALREADY_USED_FOR_LINKAGE = `YOU_HAVE_ALREADY_ADDED_THIS_ADDRESS`;
  const ERROR_NETWORK_ALREADY_ADDED = `THE_GIVEN_NETWORK_EXISTS_ALREADY`;
  const ERROR_INVALID_NETWORK_TYPE = `INVALID_NETWORK_KEY_TYPE`;
  const ERROR_NETWORK_NOT_FOUND = `CANNOT_FIND_A_NETWORK_WITH_THE_GIVEN_KEY`;

  // CALLABLE FUNCTIONS

  if (input.function === "linkIdentity") {
    /**
     * @dev the caller submits a linkage request to his
     * Arweave (master) address, linkable address are of
     * type "EVM" and "EXOTIC" (== non-EVM).
     *
     * @param caller the caller's Arweave addr
     * @param address the EVM or non-EVM address (foreign addr)
     * @param verificationReq the linkage TXID (on the foreign network)
     * @param network the network key
     *
     * @return state
     **/

    const caller = input.caller;
    const address = input?.address;
    const verificationReq = input?.verificationReq;
    const network = input?.network;

    if (!caller && !address && !verificationReq && !network) {
      throw new ContractError(ERROR_FUNCTION_MISSING_ARGUMENTS);
    }

    _validateArweaveAddress(caller);
    _checkAddrUsageDuplication(address);

    const userIndex = _getUserIndex(caller);

    // network checking is done inside `_validateAddrSig`
    _validateAddrSig(address, verificationReq, network);
    _checkSignature(verificationReq);

    const networkKey = _resolveNetwork(network);
    const currentTimestamp = await _getTimestamp();

    if (userIndex === -1) {
      identities.push({
        arweave_address: caller,
        primary_address: address,
        did: `did:ar:${caller}`,
        is_verified: false, // `true` when the user has his primary address evaluated & verified
        first_linkage: currentTimestamp,
        last_modification: currentTimestamp,
        unevaluated_addresses: [address],
        addresses: [
          {
            address: address,
            network: network,
            ark_key: networkKey,
            verification_req: verificationReq,
            is_verified: false,
            is_evaluated: false,
          },
        ],
      });

      return { state };
    }

    const user = identities[userIndex];

    _linkageFatFinger(address, userIndex);

    user.addresses.push({
      address: address,
      network: network,
      ark_key: networkKey,
      verification_req: verificationReq,
      is_verified: false,
      is_evaluated: false,
    });

    user.unevaluated_addresses.push(address);
    user.last_modification = currentTimestamp;

    return { state };
  }

  if (input.function === "setPrimaryAddress") {
    /**
     * @dev this function allows the user to determine his
     * primary address that resolves to his main identity.
     * The identity (user) is considered verified only if the
     * chosen primary_address has been evaluated and is verified.
     *
     * @param caller the caller's Arweave addr
     * @param primary_address the chosen ((non)-EVM) primary addr
     *
     * @return state
     **/
    const caller = input.caller;
    const primary_address = input.primary_address;

    _validateArweaveAddress(caller);

    const userIndex = _getUserIndex(caller);
    ContractAssert(userIndex >= 0, ERROR_INVALID_USER);

    const user = identities[userIndex];

    const addressIndex = user.addresses.findIndex(
      (addr) => addr["address"] === primary_address
    );
    ContractAssert(addressIndex >= 0, ERROR_ADDRESS_NOT_OWNED);

    ContractAssert(
      user.primary_address !== primary_address,
      ERROR_ADDRESS_ALREADY_PRIMARY
    );

    // change the primary address
    user.primary_address = primary_address;
    // user's verification is tied to the primary address validity
    user.is_verified = user.addresses[addressIndex].is_verified;
    // log the update's blockheight
    user.last_modification = await _getTimestamp();

    return { state };
  }

  if (input.function === "unlinkIdentity") {
    /**
     * @dev the reverse of the `linkIdentity` function.
     * This function allows the user to remove an addr (identity)
     * from his addresses book. A detailed description of how the
     * unlinking works in each case in detailed below in the function's
     * code blocks (1, 2a-b, & 3).
     *
     * @param caller the caller's Arweave addr
     * @param address the address to get unlinked
     *
     * @return state
     **/
    const caller = input.caller;
    const address = input.address;

    _validateArweaveAddress(caller);
    const userIndex = _getUserIndex(caller);

    ContractAssert(userIndex >= 0, ERROR_INVALID_USER);

    const user = identities[userIndex];
    const addressIndex = user.addresses.findIndex(
      (addr) => addr["address"] === address
    );
    ContractAssert(addressIndex >= 0, ERROR_ADDRESS_NOT_OWNED);

    // 1- if the user has only 1 address linked, then remove his identity
    if (user.addresses.length === 1) {
      identities.splice(userIndex, 1);
      return { state };
    }

    // 2-a if the user has more than 1 addr linked (array of (un)verified addresses),
    // then first check if the to-unlink address is eq to the primary address,
    // if so, then search for the first non-primary verified address and assign it
    // to the primary_address property after unlinking the to-unlink primary address.
    // 2-b if no non-primary verified addresses were found, then set the primary_address to
    // any !primary_address address and user's validity to the address's validity.

    if (user.addresses.length > 1) {
      if (user.primary_address === address) {
        // 2-a
        const verifiedAddrInBook = user.addresses.find(
          (addr) => addr["address"] !== address && !!addr.is_verified
        );
        if (verifiedAddrInBook) {
          user.primary_address = verifiedAddrInBook.address;
          user.is_verified = true;

          user.addresses.splice(addressIndex, 1);
          user.last_modification = await _getTimestamp();

          return { state };
        }
        // 2-b
        const firstNonEqualAddr = user.addresses.find(
          (addr) => addr["address"] !== address
        );
        if (firstNonEqualAddr) {
          user.primary_address = firstNonEqualAddr.address;
          user.is_verified = firstNonEqualAddr.is_verified;

          user.addresses.splice(addressIndex, 1);
          user.last_modification = await _getTimestamp();

          return { state };
        }
      }
      // 3- if the to-unlink address is !== primary_address, then remove the to-unlink
      // from the `addresses` array
      user.addresses.splice(addressIndex, 1);
      user.last_modification = await _getTimestamp();
      return { state };
    }

    throw new ContractError(ERROR_ERROR_UNLINKING_ADDRESS);
  }

  // ADMIN FUNTIONS

  if (input.function === "evaluate") {
    /**
     * @dev it's an admin's function automated
     * by the Ark Protocol node. The function push the
     * node's evaluation result of an identity linkage
     * request into the contract's state.
     *
     * @param arweave_address the identity's Master address
     * @param evaluated_address the request's foreign addr
     * @param evaluation the evaluation's result
     *
     * @return state
     **/
    const arweave_address = input.arweave_address;
    const evaluated_address = input.evaluated_address;
    const evaluation = input.evaluation;

    ContractAssert(
      [true, false].includes(evaluation),
      ERROR_INVALID_EVALUATION
    );

    _validateArweaveAddress(arweave_address);
    const userIndex = _getUserIndex(arweave_address);
    ContractAssert(userIndex >= 0, ERROR_INVALID_USER);

    const user = identities[userIndex];
    const evaluatedAddrIndex = user.addresses.findIndex(
      (addr) => addr["address"] === evaluated_address
    );
    ContractAssert(evaluatedAddrIndex >= 0, ERROR_ADDRESS_NOT_OWNED);

    _checkSignature(user.addresses[evaluatedAddrIndex].verification_req);

    ContractAssert(
      user.unevaluated_addresses.includes(evaluated_address),
      ERROR_ADDRESS_ALREADY_EVALUATED
    );

    const unevaluatedAddrIndex = user.unevaluated_addresses.findIndex(
      (addr) => addr === evaluated_address
    );

    if (user.primary_address === evaluated_address) {
      user.is_verified = evaluation;
    }

    user.addresses[evaluatedAddrIndex].is_verified = evaluation;
    user.addresses[evaluatedAddrIndex].is_evaluated = true;
    //  remove the address from the unevalated_addresses array
    user.unevaluated_addresses.splice(unevaluatedAddrIndex, 1);

    user.last_modification = await _getTimestamp();

    if (evaluation) {
      verRequests.push(user.addresses[evaluatedAddrIndex].verification_req);
    }

    return { state };
  }

  if (input.function === "addNetwork") {
    /**
     * @dev append a new KEY for a newly supported network.
     *
     * @param network_key the new network's KEY
     * @param type network's type ("EVM" or "EXOTIC")
     *
     * @return state
     *
     **/
    const network_key = input.network_key;
    const type = input.type;

    ContractAssert(
      !networks.includes(network_key),
      ERROR_NETWORK_ALREADY_ADDED
    );
    ContractAssert(
      ["EVM", "EXOTIC"].includes(type),
      ERROR_INVALID_NETWORK_TYPE
    );

    type === "EVM"
      ? evm_networks.push(network_key)
      : exotic_networks.push(network_key);

    return { state };
  }

  if (input.function === "removeNetwork") {
    /**
     * @dev remove a network support from the networks array
     *
     * @param network_key the KEY of the network to be removed
     * @param type network's type ("EVM" or "EXOTIC")
     *
     * @return state
     *
     **/
    const network_key = input.network_key;
    const type = input.type;

    ContractAssert(networks.includes(network_key), ERROR_NETWORK_NOT_FOUND);
    ContractAssert(
      ["EVM", "EXOTIC"].includes(type),
      ERROR_INVALID_NETWORK_TYPE
    );

    const networkIndex =
      type === "EVM"
        ? evm_networks.findIndex((net) => net === network_key)
        : exotic_networks.findIndex((net) => net === network_key);

    type === "EVM"
      ? evm_networks.splice(networkIndex, 1)
      : exotic_networks.splice(networkIndex, 1);

    return { state };
  }

  // HELPER FUNCTIONS

  function _validateArweaveAddress(address) {
    ContractAssert(
      /[a-z0-9_-]{43}/i.test(address),
      ERROR_INVALID_ARWEAVE_ADDRESS
    );
  }

  function _getUserIndex(address) {
    const index = identities.findIndex(
      (usr) => usr.arweave_address === address
    );
    return index;
  }

  function _validateAddrSig(address, signature, network) {
    _validateNetwork(network);

    if (evm_networks.includes(network)) {
      _validateEvmAddress(address);
      _validateEvmTx(signature);
    }

    // exotic networks are not checked
  }

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

  function _checkSignature(txid) {
    if (verRequests.includes(txid)) {
      throw new ContractError(ERROR_VER_ID_ALREADY_USED);
    }
  }

  function _validateNetwork(network) {
    ContractAssert(networks.includes(network), ERROR_INVALID_NETWORK_SUPPLIED);
  }

  function _resolveNetwork(network) {
    const key = evm_networks.includes(network) ? "EVM" : "EXOTIC";
    return key;
  }

  function _checkAddrUsageDuplication(address) {
    const isDuplicated = identities.findIndex((user) =>
      user.addresses.find(
        (addr) =>
          addr["address"]?.toUpperCase() === address.toUpperCase() &&
          !!addr.is_verified
      )
    );
    ContractAssert(isDuplicated < 0, ERROR_ADDRESS_ALREADY_USED);
  }

  function _linkageFatFinger(address, caller_index) {
    const fatFinger = state.identities[caller_index].addresses.findIndex(
      (addr) => addr["address"] === address
    );
    ContractAssert(fatFinger < 0, ERROR_ADDRESS_ALREADY_USED_FOR_LINKAGE);
  }

  async function _getTimestamp() {
    try {
      return EXM.getDate().getTime();
    } catch (error) {
      return null;
    }
  }
}
