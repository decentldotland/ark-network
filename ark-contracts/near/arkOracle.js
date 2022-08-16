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

    if(!arkState || arkState?.length <= 0) {
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

  @view
  readArkState() {
    return this.state;
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
