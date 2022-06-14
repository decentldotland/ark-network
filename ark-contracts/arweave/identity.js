export async function handle(state, action) {
  const input = action.input;
  const caller = action.caller;

  const admins = state.admins;
  const identities = state.identities;

  const ERROR_INVALID_DATA_TYPE = "EVM address must be a string";
  const ERROR_INVALID_EVM_ADDRESS_SYNTAX = "invalid EVM address syntax";
  const ERROR_USER_NOT_FOUND =
    "cannot find a user with the given Arweave address";
  const ERROR_DOUBLE_INTERACTION =
    "cannot reverse an identity validity within less than 3 network blocks";
  const ERROR_INVALID_ARWEAVE_ADDRESS = "invalid Arweave address syntax";
  const ERROR_CALLER_NOT_ADMIN = "invalid function caller";
  const ERROR_USERNAME_NOT_STRING = "Telegram username must be a string";
  const ERROR_INVALID_TELEGRAM_SYNTAX = "invalid Telegram username syntax";

  // USERS FUNCTION

  if (input.function === "linkIdentity") {
    const address = input?.address;
    const verificationReq = input.verificationReq;
    let telegram = input?.telegram;

    _validateEvmAddress(address);

    if (telegram) {
      telegram = _validateTelegramUsername(telegram);
    }

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

  // ADMINS FUNCTION

  if (input.function === "verifyIdentity") {
    // verify (or reverse verification) the identity of an Arweave
    // available in the contract state
    const identityOf = input?.identityOf;

    _validateArweaveAddress(identityOf);
    _isAdmin(caller);

    const identityIndex = identities.findIndex(
      (id) => id["arweave_address"] === identityOf
    );

    ContractAssert(identityIndex !== -1, ERROR_USER_NOT_FOUND);
    ContractAssert(
      identities[identityIndex].last_modification < SmartWeave.block.height + 3,
      ERROR_DOUBLE_INTERACTION
    );

    identities[identityIndex].last_modification = SmartWeave.block.height;
    identities[identityIndex].is_verified =
      !identities[identityIndex].is_verified;
    identities[identityIndex].is_evaluated = true;

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
}
