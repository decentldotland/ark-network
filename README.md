<p align="center">
  <a href="https://decent.land">
    <img src="./img/logo25.png" height="124">
  </a>
  <h3 align="center"><code>@decentdotland/ark-network</code></h3>
  <p align="center">multi-chain identities linking protocol</p>
</p>

## Synopsis
Ark Network is a protocol for verified multi-chain addresses (identities) linking. The protocol consists of an oracle address on Arweave network and other data registry contracts on EVM (and possibly non-EVM chains) with a validation backend. The protocol support Telegram identity linkage with the multi-chain addresses as well.

## Install

```sh
git clone https://github.com/decentldotland/ark-network.git

cd ark-network

npm install .
```

## Build Ark EVM Contract

The repository `ark-network` is built with ES6 syntax, therefore building with truffle is not compatible

### 1- Create a new directory
```sh

mkdir ark-deploy

cd ark-deploy

truffle init


```

### 2- Copy `/contracts` directory to `ark-deploy`

```sh
cp -r ark-network/contracts ark-deploy 

```

### 3- compile & migrate
Make sure to edit `2_deploy_contract.js` to add the contract's constructor arguments inside the `/migrations` directory.

```sh

truffle dev

truffle compile

truffle migrate --network ganache

```

## How The Identity Verification Process Works

![logic-flow](/img/logic-flow.png)

### Detailed Logic Flow:

1- The user invoke `linkIdentity("ARWEAVE_ADDRESS")` function in the EVM registry contract.

2- The user invoke `linkIdentity("EVM_ADDRESS", "EVM_INVOC_TXID_FROM_1")` function in the Arweave oracle address.

3- The non-verified identity get added in the Arweave oracle address:

```json
//user_object
{
  "arweave_address": "AeK_9yb3f3HEK1Gzwky6tIx8ujW9Pxr_FkhCkWftFtw", // the TX caller address
  "evm_address": "0x197f818c1313dc58b32d88078ecdfb40ea822614", // the EVM identity to be verified
  "verification_req": "0x9c55114650dd08b7aec71e1152dc77eea05b499b836a08add2f0d4bd49e2b095", // TXID of the interaction with the EVM sc
  "telegram_username": null,
  "identity_id": "fAynsvkC8NG8JcEYkqonILmor2jHsIB07fSJRzLyqSo", // auto-generated, the SWC interactionTX.ID
  "is_verified": false, // initial value
  "is_evaluated": false, // initial value
  "last_modification": 953910
}

```


4- The node listens for new non-evaluated interactions (TXs) with the Arweave oracle SWC.

5- For non-evaluated TX, the node call `getTransactionReceipt(verification_req)` and get TX's metadata.

6- The metadata are used to validate that the `1` and `2` have been invoked by the same persona.

7- If the EVM TX logs (emmited events) match the `3` TX's property `user_object.arweave_address` -- the identity is considered valid.

8- The contract's admin invoke `verifyIdentity("arweave_address")` in the Arweave SWC address:

```json
// user_object
{
  "arweave_address": "AeK_9yb3f3HEK1Gzwky6tIx8ujW9Pxr_FkhCkWftFtw",
  "evm_address": "0x197f818c1313dc58b32d88078ecdfb40ea822614",
  "verification_req": "0x9c55114650dd08b7aec71e1152dc77eea05b499b836a08add2f0d4bd49e2b095",
  "telegram_username": null,
  "identity_id": "fAynsvkC8NG8JcEYkqonILmor2jHsIB07fSJRzLyqSo",
  "is_verified": true,
  "is_evaluated": true,
  "last_modification": 953928,
  "validator": "vZY2XY1RD9HIfWi8ift-1_DnHLDadZMWrufSh-_rKF0"
}
```
### Additional Verification: Telegram

If the user add his Telegram username in the `2` function invocation, it's required to add his `user_object.identity_id` in his Telegram bio under the form of `ark:identity_id` .

The node will `GET` the user's telegram profile by hitting his username, extract the bio and compare it to hsi `user_object.identity_id`. The logic behind Telegram identity verification can be found [here](./src/telegram).
 
## Ark Network Contracts

| Contract  | Source Code | Deployment | Network |
| ------------- |:-------------:| :-------------: | :-------------: |
| Arweave Oracle SWC      | [ark-contracts/arweave](./ark-contracts/arweave)     |   [YPf5wvXXnVk4Ats9CpllqlwdmwFHTZc1x-w4H1tz0no](https://viewblock.io/arweave/tx/YPf5wvXXnVk4Ats9CpllqlwdmwFHTZc1x-w4H1tz0no) | Arweave Mainnet |
| EVM Registry SC      | [ark-contracts/EVM](./ark-contracts/EVM/identity.vy)     |  [0xdE44d3fB118E0f007f2C0D8fFFE98b994383949A](https://goerli.etherscan.io/address/0xde44d3fb118e0f007f2c0d8fffe98b994383949a)          | Goerli Testnet |

## Ark Network API Methods
set of public API methods for the Ark Network node

### 1- get Arweave oracle state
- `GET /ark/oracle/state`

Reponse example: return a cached state of the Ark oracle smartweave oracle address

```json
{
  "res": [
    {
      "arweave_address": "vZY2XY1RD9HIfWi8ift-1_DnHLDadZMWrufSh-_rKF0",
      "evm_address": "0x13c36f5d2df9ec3472ca182c714fa4ffcdb4bdea",
      "verification_req": "0xeb659b796ce3837c4d3cc42ee551b3d593c76c78873e99ac23c610a21427a662",
      "telegram_username": "@AkaPepe007",
      "identity_id": "jzrSeqx3IzNMnEtspv47yhkOrPhz3TbAMLN8QhiNPwQ",
      "is_verified": true,
      "is_evaluated": true,
      "last_modification": 953271,
      "validator": "vZY2XY1RD9HIfWi8ift-1_DnHLDadZMWrufSh-_rKF0"
    },
    {
      "arweave_address": "AeK_9yb3f3HEK1Gzwky6tIx8ujW9Pxr_FkhCkWftFtw",
      "evm_address": "0x197f818c1313dc58b32d88078ecdfb40ea822614",
      "verification_req": "0x9c55114650dd08b7aec71e1152dc77eea05b499b836a08add2f0d4bd49e2b095",
      "telegram_username": null,
      "identity_id": "fAynsvkC8NG8JcEYkqonILmor2jHsIB07fSJRzLyqSo",
      "is_verified": true,
      "is_evaluated": true,
      "last_modification": 953928,
      "validator": "vZY2XY1RD9HIfWi8ift-1_DnHLDadZMWrufSh-_rKF0"
    }
  ]
}
```

### 2- get network stats
- `GET /ark/network/stats`

Response example:
```json
{"users_count":2,"hashed_state":"23df5db30b8596bf6b916bdd946093fe1741363376de78981f8670031e84715c","last_cached_block":954308}

```

### 3- get network addresses
- `GET /ark/network/addresses`

Reponse example: return the validators addresses and the smart contracts addresses

```json
{
  "validators": ["vZY2XY1RD9HIfWi8ift-1_DnHLDadZMWrufSh-_rKF0"],
  "arweave_oracle_addr": {
    "addr": "YPf5wvXXnVk4Ats9CpllqlwdmwFHTZc1x-w4H1tz0no",
    "network": "arweave-mainnet"
  },
  "evm_oracle_addr": {
    "addr": "0xdE44d3fB118E0f007f2C0D8fFFE98b994383949A",
    "network": "eth-goerli"
  }
}
```

## License
This project is licensed under the [MIT license](./LICENSE).