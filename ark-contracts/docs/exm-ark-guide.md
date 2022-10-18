## Guide For Ark EXM Implementation 

### Ark EVM Function IDS 
- v0.0.1: [6luWGmRv53cUUeIg6NJtyG9-x_1lKFNOETaHvQsjuTU](https://api.exm.dev/read/6luWGmRv53cUUeIg6NJtyG9-x_1lKFNOETaHvQsjuTU)
- v0.0.2 (chore): [h6PVMX0X-PTacaC2zqV3ks3mvK0yzpPsE0DhzXTTsyQ](https://api.exm.dev/read/h6PVMX0X-PTacaC2zqV3ks3mvK0yzpPsE0DhzXTTsyQ)
- v0.0.3 (fixes): [U5joFbWUAVSLuWlNT7q35ZGAuNzMQIXD73O5nGtxbH4](https://api.exm.dev/read/U5joFbWUAVSLuWlNT7q35ZGAuNzMQIXD73O5nGtxbH4)
- v0.0.4 (chore: ark key): [wfngDtq_XRdRX2NGrBDZjP0Mpr4Dk-guEJkG4RyNd4w](https://api.exm.dev/read/wfngDtq_XRdRX2NGrBDZjP0Mpr4Dk-guEJkG4RyNd4w)
- v0.0.5 (logging timestamp - imported state): [PDuEWiQK7gcy8ERrZub-cIzR19Zrt0WTMl7FGsImYgM](https://api.exm.dev/read/PDuEWiQK7gcy8ERrZub-cIzR19Zrt0WTMl7FGsImYgM)

### Requirements
- Token ID creation on [exm.dev](https://exm.dev/login).
- Deploy your EXM function using the contract's source code.

## CLI interactions

### 1- deploy the contract

```console
exm function:deploy --src ../arweave/exm-ark.js --init-state '{"evm_networks":["AURORA-MAINNET","AURORA-TESTNET","BSC-MAINNET","BSC-TESTNET","ETH-MAINNET","ETH-GOERLI","NEON-DEVNET","AVALANCHE-MAINNET","FUJI-C-CHAIN","FTM-MAINNET","OPTIMISM-MAINNET","ARBITRUM-MAINNET","POLYGON-MAINNET"],"exotic_networks":["NEAR-MAINNET"],"identities":[],"verRequests":[]}' --token YOUR_EXM_TOKEN_ID
```

### 2- Link an identity

```console
exm function:write YOUR_EXM_FUNCTION_ID --input '{"function": "linkIdentity", "caller": "ARWEAVE_ADDR", "address": "FOREIGN_ADDR", "network": "NETWORK_KEY", "verificationReq": "LINKAGE_TXID"}' --token YOUR_EXM_TOKEN_ID
```

### 3- Unlink an identity

```console
exm function:write YOUR_EXM_FUNCTION_ID --input '{"function": "unlinkIdentity", "caller": "ARWEAVE_ADDR", "address": "FOREIGN_ADDR"}' --token YOUR_EXM_TOKEN_ID
```

### 4- Set primary address

```console
exm function:write YOUR_EXM_FUNCTION_ID --input '{"function": "setPrimaryAddress", "caller": "ARWEAVE_ADDR", "primary_address":"FOREIGN_ADDR"}' --token YOUR_EXM_TOKEN_ID
```

### 5- Evaluate linkage request

```console
exm function:write YOUR_EXM_FUNCTION_ID --input '{"function": "evaluate","arweave_address": "ARWEAVE_ADDR", "evaluated_address": "FOREIGN_ADDR", "evaluation": BOOLEAN}' --token YOUR_EXM_TOKEN_ID
```

### 6- Add network key

```console
exm function:write YOUR_EXM_FUNCTION_ID --input '{"function": "addNetwork", "network_key": "KEY_VALUE", "type": "EVM_OR_EXOTIC"}' --token YOUR_EXM_TOKEN_ID

```

### 6- Remove network key

```console
exm function:write YOUR_EXM_FUNCTION_ID --input '{"function": "removeNetwork", "network_key": "KEY_VALUE", "type": "EVM_OR_EXOTIC"}' --token YOUR_EXM_TOKEN_ID

```
