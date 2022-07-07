<p align="center">
  <a href="https://decent.land">
    <img src="./img/logo25.png" height="124">
  </a>
  <h3 align="center"><code>@decentdotland/ark-network</code></h3>
  <p align="center">multi-chain identities linking protocol</p>
</p>

## Synopsis
Ark Network is a protocol for verified multi-chain addresses (identities) linking. The protocol consists of an oracle address on Arweave network and other data registry contracts on EVM (and possibly non-EVM chains) with a validation backend. The protocol support Telegram identity linkage with the multi-chain addresses as well.

## Install & run it

```sh
git clone https://github.com/decentldotland/ark-network.git

cd ark-network

npm install .

npm run polling
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

2- The user invoke `linkIdentity("EVM_ADDRESS", "EVM_INVOC_TXID_FROM_1", "EVM_NETWORK_KEY)` function in the Arweave oracle address.

3- The non-verified identity get added in the Arweave oracle address:

```json
//user_object
{
  "arweave_address": "AeK_9yb3f3HEK1Gzwky6tIx8ujW9Pxr_FkhCkWftFtw", // the TX caller address
  "evm_address": "0x197f818c1313dc58b32d88078ecdfb40ea822614", // the EVM identity to be verified
  "verification_req": "0x5030f945f09e39af85986807293220b1daa736fdee6b490ae78eb150f155072d", // TXID of the interaction with the EVM sc
  "ver_req_network": "AURORA-TESTNET", // the network KEY, where the verification_req took place
  "telegram_username": null,
  "identity_id": "ALcuqH1FfQvmx-8lL9P_fZJQQp0XUkcg7Sw5-PH9R7Q", // auto-generated, the SWC interactionTX.ID
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
  "verification_req": "0x5030f945f09e39af85986807293220b1daa736fdee6b490ae78eb150f155072d",
  "ver_req_network": "AURORA-TESTNET",
  "telegram_username": null,
  "identity_id": "ALcuqH1FfQvmx-8lL9P_fZJQQp0XUkcg7Sw5-PH9R7Q",
  "is_verified": true,
  "is_evaluated": true,
  "last_modification": 965730,
  "last_validation": 965730,
  "validator": "vZY2XY1RD9HIfWi8ift-1_DnHLDadZMWrufSh-_rKF0"
}

```
### Additional Verification: Telegram

If the user add his Telegram username in the `2` function invocation, it's required to add his `user_object.identity_id` in his Telegram bio under the form of `ark:identity_id` .

The node will `GET` the user's telegram profile by hitting his username, extract the bio and compare it to hsi `user_object.identity_id`. The logic behind Telegram identity verification can be found [here](./src/telegram).
 
## Ark Network Contracts

| Contract  | Source Code | Deployment | Network |
| ------------- |:-------------:| :-------------: | :-------------: |
| Arweave Oracle SWC   v0.0.3 (ETH Goerli only)   | [ark-contracts/arweave](https://github.com/decentldotland/ark-network/blob/f96086d6ed58341fe8326524ed79fac51f6761d3/ark-contracts/arweave/identity.js)     |   [qP614umsvOo9Szvl-xqvnXH0xLOg2eKOsLYnKx2l5SA](https://viewblock.io/arweave/tx/qP614umsvOo9Szvl-xqvnXH0xLOg2eKOsLYnKx2l5SA) | Arweave Mainnet |
| Arweave Oracle SWC   v0.0.4 (multichain support)   | [ark-contracts/arweave](https://github.com/decentldotland/ark-network/blob/28c37822d06010e015e96c360b4dc07c4813536c/ark-contracts/arweave/identity.js)     |   [i9Q9Y14HnJUmnSOVdxlPQkHHsT0W6kTv9PXCblZ_kAA](https://viewblock.io/arweave/tx/i9Q9Y14HnJUmnSOVdxlPQkHHsT0W6kTv9PXCblZ_kAA) | Arweave Mainnet |
| Arweave Oracle SWC   v0.0.5 (v0.0.4 + enhanced security)   | [ark-contracts/arweave](./ark-contracts/arweave)     |   [A5bLD0F5bZPhhKYijF2kdGnEgpaww_lEpzowC8dZmEc](https://viewblock.io/arweave/tx/A5bLD0F5bZPhhKYijF2kdGnEgpaww_lEpzowC8dZmEc) | Arweave Mainnet |
| Goerli Registry SC      | [ark-contracts/EVM](./ark-contracts/EVM/identity.vy)     |  [0xdE44d3fB118E0f007f2C0D8fFFE98b994383949A](https://goerli.etherscan.io/address/0xde44d3fb118e0f007f2c0d8fffe98b994383949a)          | Goerli Testnet |
| Aurora Registry SC      | [ark-contracts/EVM](./ark-contracts/EVM/identity.vy)     |  [0xfb0200C27185185D7DEe0403D5f102ADb59B7c34](https://testnet.aurorascan.dev/address/0xfb0200c27185185d7dee0403d5f102adb59b7c34)          | Aurora Testnet |
| BSC Registry SC      | [ark-contracts/EVM](./ark-contracts/EVM/identity.vy)     |  [0x90f36C4Fc09a2AD3B62Cc6F5f2BCC769aFAcB70d](https://testnet.bscscan.com/address/0x90f36c4fc09a2ad3b62cc6f5f2bcc769afacb70d)          | BSC Testnet |

## Ark Network API Methods
set of public API methods for the Ark Network node

- API endpoint (development - testnet): https://thawing-lowlands-08726.herokuapp.com/

### 1- get Arweave oracle state
- `GET /ark/oracle/state`

Reponse example: return a cached state of the Ark oracle smartweave oracle address

```json
{
  "res": [
    {
      "arweave_address": "AeK_9yb3f3HEK1Gzwky6tIx8ujW9Pxr_FkhCkWftFtw",
      "evm_address": "0x197f818c1313dc58b32d88078ecdfb40ea822614",
      "verification_req": "0x5030f945f09e39af85986807293220b1daa736fdee6b490ae78eb150f155072d",
      "ver_req_network": "AURORA-TESTNET",
      "telegram_username": null,
      "identity_id": "ALcuqH1FfQvmx-8lL9P_fZJQQp0XUkcg7Sw5-PH9R7Q",
      "is_verified": false,
      "is_evaluated": true,
      "last_modification": 965730,
      "last_validation": 965730,
      "validator": "vZY2XY1RD9HIfWi8ift-1_DnHLDadZMWrufSh-_rKF0"
    },
    {
      "arweave_address": "vZY2XY1RD9HIfWi8ift-1_DnHLDadZMWrufSh-_rKF0",
      "evm_address": "0x197f818c1313dc58b32d88078ecdfb40ea822614",
      "verification_req": "0x5030f945f09e39af85986807293220b1daa736fdee6b490ae78eb150f155072d",
      "ver_req_network": "AURORA-TESTNET",
      "telegram_username": null,
      "identity_id": "ZEJzVwFjdZPkuJiU6peJFF4FshYu5lAAgXn3jo__eE8",
      "is_verified": true,
      "is_evaluated": true,
      "last_modification": 965736,
      "last_validation": 965736,
      "validator": "vZY2XY1RD9HIfWi8ift-1_DnHLDadZMWrufSh-_rKF0"
    }
  ]
}

```

### 2- get network stats
- `GET /ark/network/stats`

Response example:
```json
{"users_count":1,"hashed_state":"9cc5786936b0f5c3507a3f87594e562d3367ee8e6c86417c7c5110807038711e","last_cached_block":965761}

```

### 3- get network addresses
- `GET /ark/network/addresses`

Reponse example: return the validators addresses and the smart contracts addresses

```json
{
  "validators": ["vZY2XY1RD9HIfWi8ift-1_DnHLDadZMWrufSh-_rKF0"],
  "arweave_oracle_addr": {
    "addr": "i9Q9Y14HnJUmnSOVdxlPQkHHsT0W6kTv9PXCblZ_kAA",
    "network": "arweave-mainnet"
  },
  "eth_oracle_addr": {
    "addr": "0xdE44d3fB118E0f007f2C0D8fFFE98b994383949A",
    "network": "eth-goerli"
  },
  "aurora_oracle_addr": {
    "addr": "0xfb0200C27185185D7DEe0403D5f102ADb59B7c34",
    "network": "aurora-testnet"
  },
  "bsc_oracle_addr": {
    "addr": "0x90f36C4Fc09a2AD3B62Cc6F5f2BCC769aFAcB70d",
    "network": "bsc-testnet"
  }
}


```

## License
This project is licensed under the [MIT license](./LICENSE).
