import { NearContract, NearBindgen, near, call, view } from "near-sdk-js";

@NearBindgen
class ArkOracle extends NearContract {
  constructor({ initState = [] }) {
    super();
    this.state = initState;
  }

  @call
  update_whole_ark_state({ newState = [] }) {
    _onlyOwner();
    this.state = newState;
    near.log(`new Ark state has been logged`);
  }

  @call
  update_ark_user_identity({ updatedIdentity = {} }) {
    _onlyOwner();
    const arkState = this.state;

    if (!arkState || arkState?.length <= 0) {
      near.panic("ERROR: Ark state not imported");
    }
    const newIdentity = updatedIdentity;
    const userIndex = arkState.findIndex(
      (user) => user.arweave_address === newIdentity?.arweave_address
    );

    if (userIndex === -1) {
      near.panic(
        `cannot find a user with the given arweave address: ${newIdentity?.arweave_address}`
      );
    }

    arkState.splice(userIndex, 1, newIdentity);
    this.state = arkState;

    near.log(
      `the identity of ${newIdentity?.arweave_address} has been updated`
    );
  }

  @call
  append_user_identity({ identity = {} }) {
    _onlyOwner();
    const arkState = this.state;

    if (!arkState) {
        near.panic("ERROR: Ark state not initialized");
    }

    // double check for identity existence
    const duplicationIndex = arkState.findIndex((user) => user.arweave_address === identity?.arweave_address);
    
    if (duplicationIndex >= 0) {
        near.panic("ERROR: identity already added");
    }

    if (!identity?.arweave_address) {
        near.panic(`ERROR: identity must be provided as an object`)
    }

    arkState.push(identity);

    this.state = arkState;

    near.log(`Added a new identity to the state: ${identity?.arweave_address}`);
  }

  @view
  readArkState() {
    return this.state;
  }

  @view
  getNearLinkedUsers() {
    return this.state.filter((user) =>
      user?.exotic_addresses.find(
        (addr) => addr?.ver_req_network === "NEAR-MAINNET"
      )
    );
  }

  @view
  getNearVerifiedUsersOnly() {
    const allNearUsers = this.getNearLinkedUsers();
    return allNearUsers.filter((user) =>
      user.exotic_addresses.find(
        (addr) => addr.is_verified && addr.is_evaluated
      )
    );
  }

  @view
  _onlyOwner() {
    const owner = near.predecessorAccountId();
    const caller = near.signerAccountId();

    if (owner !== caller) {
      near.panic(`invalid caller: ${caller} should be ${owner}`);
    }
  }

  default() {
    return new ArkOracle({ initState: [] });
  }
}
