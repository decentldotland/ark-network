export const ArkNetworkVyper = [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "name": "evmAddress",
        "type": "address"
      },
      {
        "indexed": true,
        "name": "arweaveAddress",
        "type": "string"
      },
      {
        "indexed": false,
        "name": "arAddress",
        "type": "string"
      }
    ],
    "name": "LinkIdentity",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "name": "network",
        "type": "string"
      }
    ],
    "name": "LaunchContract",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "name": "isPaused",
        "type": "bool"
      }
    ],
    "name": "PauseState",
    "type": "event"
  },
  {
    "inputs": [
      {
        "name": "_network",
        "type": "string"
      },
      {
        "name": "_pausedContract",
        "type": "bool"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "gas": 41645,
    "inputs": [
      {
        "name": "_pause",
        "type": "bool"
      }
    ],
    "name": "reversePauseState",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "gas": 15741,
    "inputs": [
      {
        "name": "_arweave_address",
        "type": "string"
      }
    ],
    "name": "linkIdentity",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "gas": 10538,
    "inputs": [],
    "name": "network",
    "outputs": [
      {
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "gas": 2550,
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "gas": 2580,
    "inputs": [],
    "name": "pausedContract",
    "outputs": [
      {
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  }
];

export const ArkNetworkSolidity = [
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_network",
        "type": "string"
      },
      {
        "internalType": "bool",
        "name": "_pausedContract",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "string",
        "name": "network",
        "type": "string"
      }
    ],
    "name": "LaunchContract",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "evmAddress",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "string",
        "name": "arweaveAddress",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "arAddress",
        "type": "string"
      }
    ],
    "name": "LinkIdentity",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "bool",
        "name": "isPaused",
        "type": "bool"
      }
    ],
    "name": "PauseState",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "network",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [],
    "name": "pausedContract",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_arweave_address",
        "type": "string"
      }
    ],
    "name": "linkIdentity",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bool",
        "name": "_pause",
        "type": "bool"
      }
    ],
    "name": "reversePauseState",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];
