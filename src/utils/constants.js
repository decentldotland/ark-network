import "./setEnv.js";
// Arweave Contracts
// export const ARWEAVE_ORACLE_ADDRESS = "qP614umsvOo9Szvl-xqvnXH0xLOg2eKOsLYnKx2l5SA" // v0.0.3
// export const ARWEAVE_ORACLE_ADDRESS = "i9Q9Y14HnJUmnSOVdxlPQkHHsT0W6kTv9PXCblZ_kAA"; // v0.0.4
// export const ARWEAVE_ORACLE_ADDRESS = `jRGJtaBjfvDJgpQATUiW3mBbB_wp71xrUmeQBalrm3k`; // v0.0.6 -- with FUJI Testnet integration
// export const ARWEAVE_ORACLE_ADDRESS = `44JMzVHrHFKDAf7M0VvqBZT2lXjNbyHrdtVoagx-i28`; // v0.0.7 (testnet ready);
// export const ARWEAVE_ORACLE_ADDRESS = `VWWz1k2u6LnfNLJVCQxVVE3b2ivTVBbgLkMrPe3naoY`; // v0.0.8 (fix telegram verification issue); 
export const ARWEAVE_ORACLE_ADDRESS = `5H5Hj81G5j5P2raDhe5VFU-zkf08KDc588GJ8dtlHTw`; // v0.0.9 (exotic hybrid)
// EVM ADDRESSES
export const ETH_ORACLE_ADDRESS = `0xdE44d3fB118E0f007f2C0D8fFFE98b994383949A`; // Goerli Testnet && ETH Mainnet
export const AURORA_TESTNET_ADDRESS = `0xfb0200C27185185D7DEe0403D5f102ADb59B7c34`;
export const BSC_TESTNET_ADDRESS = `0x90f36C4Fc09a2AD3B62Cc6F5f2BCC769aFAcB70d`;
export const AVAX_FUJI_TESTNET_ADDRESS = `0xdE44d3fB118E0f007f2C0D8fFFE98b994383949A`;
export const NEON_DEVNET_ADDRESS = `0xdE44d3fB118E0f007f2C0D8fFFE98b994383949A`;
export const AVALANCHE_MAINNET_ADDRESS = `0xE5E0A3380811aD9380F91a6996529da0a262EcD1`;
export const BSC_MAINNET_ADDRESS = `0xdE44d3fB118E0f007f2C0D8fFFE98b994383949A`;
export const FTM_MAINNET_ADDRESS = `0xdE44d3fB118E0f007f2C0D8fFFE98b994383949A`;
export const OPTIMISM_MAINNET_ADDRESS = `0xdE44d3fB118E0f007f2C0D8fFFE98b994383949A`;
export const ARBITRUM_MAINNET_ADDRESS = `0xdE44d3fB118E0f007f2C0D8fFFE98b994383949A`;
export const POLYGON_MAINNET_ADDRESS = `0xdE44d3fB118E0f007f2C0D8fFFE98b994383949A`;
export const NEAR_MAINNET_ADDRESS = `ark_station_1.near`;

export const EVM_ORACLES_CONTRACTS = [
  ETH_ORACLE_ADDRESS,
  AURORA_TESTNET_ADDRESS,
  BSC_TESTNET_ADDRESS,
  AVAX_FUJI_TESTNET_ADDRESS,
  NEON_DEVNET_ADDRESS,
  AVALANCHE_MAINNET_ADDRESS,
  BSC_MAINNET_ADDRESS,
  FTM_MAINNET_ADDRESS,
  OPTIMISM_MAINNET_ADDRESS,
  ARBITRUM_MAINNET_ADDRESS,
];

// RPCs
export const RPC_PROVIDER_URL = `http://127.0.0.1:9545/`;
export const GOERLI_ETH_RPC = `https://goerli.infura.io/v3/${process.env.INFURA_API_KEY}`;
export const MAINNET_ETH_RPC = `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`;
export const AURORA_TESTNET_RPC = `https://aurora-testnet.infura.io/v3/${process.env.INFURA_API_KEY}`;
export const BSC_TESTNET_RPC = `https://data-seed-prebsc-1-s1.binance.org:8545/`;
export const BSC_MAINNET_RPC = `https://bsc-dataseed.binance.org`;
export const FUJI_TESTNET_RPC = `https://api.avax-test.network/ext/bc/C/rpc`;
export const AVALANCHE_MAINNET_RPC = `https://api.avax.network/ext/bc/C/rpc`;
export const NEON_DEVNET_RPC = `https://proxy.devnet.neonlabs.org/solana`;
export const FTM_MAINNET_RPC = `https://rpc.ftm.tools/`;
export const OPTIMISM_MAINNET_RPC = `https://mainnet.optimism.io`;
export const ARBITRUM_MAINNET_RPC = `https://arb1.arbitrum.io/rpc`;
export const POLYGON_MAINNET_RPC = `https://polygon-rpc.com`;
export const RPC_PORT = 9545;

// APIs
export const ANS_CACHE_API = `https://ans-stats.decent.land/users`;
export const SERVER_ETH_RPC = `https://cloudflare-eth.com`;

// UTILS
export const URBIT_ID_CONTRACT = `0x33eecbf908478c10614626a9d304bfe18b78dd73`;
