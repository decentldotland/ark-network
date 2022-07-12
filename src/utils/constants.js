import "./setEnv.js";
// Arweave Contracts
// export const ARWEAVE_ORACLE_ADDRESS = "qP614umsvOo9Szvl-xqvnXH0xLOg2eKOsLYnKx2l5SA" // v0.0.3
// export const ARWEAVE_ORACLE_ADDRESS = "i9Q9Y14HnJUmnSOVdxlPQkHHsT0W6kTv9PXCblZ_kAA"; // v0.0.4
export const ARWEAVE_ORACLE_ADDRESS = `jRGJtaBjfvDJgpQATUiW3mBbB_wp71xrUmeQBalrm3k`; // v0.0.6 -- with FUJI Testnet integration
// EVM ADDRESSES
export const ETH_ORACLE_ADDRESS = `0xdE44d3fB118E0f007f2C0D8fFFE98b994383949A`; // Goerli Testnet && ETH Mainnet
export const AURORA_TESTNET_ADDRESS = `0xfb0200C27185185D7DEe0403D5f102ADb59B7c34`;
export const BSC_TESTNET_ADDRESS = `0x90f36C4Fc09a2AD3B62Cc6F5f2BCC769aFAcB70d`;
export const AVAX_FUJI_TESTNET_ADDRESS = `0xdE44d3fB118E0f007f2C0D8fFFE98b994383949A`;
export const EVM_ORACLES_CONTRACTS = [
  ETH_ORACLE_ADDRESS,
  AURORA_TESTNET_ADDRESS,
  BSC_TESTNET_ADDRESS,
  AVAX_FUJI_TESTNET_ADDRESS,
];

// RPCs
export const RPC_PROVIDER_URL = `http://127.0.0.1:9545/`;
export const GOERLI_ETH_RPC = `https://goerli.infura.io/v3/${process.env.INFURA_API_KEY}`;
export const MAINNET_ETH_RPC = `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`;
export const AURORA_TESTNET_RPC = `https://aurora-testnet.infura.io/v3/${process.env.INFURA_API_KEY}`;
export const BSC_TESTNET_RPC = `https://data-seed-prebsc-1-s1.binance.org:8545/`;
export const FUJI_TESTNET_RPC = `https://api.avax-test.network/ext/bc/C/rpc`;
export const RPC_PORT = 9545;
