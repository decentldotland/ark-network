// XCC testnet address: dev-1661421940325-29536476165397
// ArkOracle testnet address: dev-1660516310576-97373428914255

import { NearContract, NearBindgen, call, near, bytes } from "near-sdk-js";

const TGAS = 10000000000000;

@NearBindgen
class ArkOracleExample extends NearContract {
  constructor({ arkOracle = "dev-1660516310576-97373428914255" }) {
    super();
    this.arkOracle = arkOracle;
  }

  @call
  queryArk() {
    const call = near.promiseBatchCreate(this.arkOracle);
    near.promiseBatchActionFunctionCall(
      call,
      "readArkState",
      bytes(JSON.stringify({})),
      0,
      5 * TGAS
    );
    
    const then = near.promiseThen(
      call,
      near.currentAccountId(),
      "queryArkCallback",
      bytes(JSON.stringify({})),
      0,
      5 * TGAS
    );
    return near.promiseReturn(then);
  }

  @call
  queryArkCallback() {
    if (near.currentAccountId() !== near.predecessorAccountId()) {
      near.panic(`This is a private method`);
    }
    const state = near.promiseResult(0);
    return state;
  }

  @call
  getArkAddress() {
    near.log(`Ark oracle addr: ${this.arkOracle}`)
    return this.arkOracle
  }

  default() {
    return new ArkOracleExample({ arkOracle: "dev-1660516310576-97373428914255" });
  }
}
