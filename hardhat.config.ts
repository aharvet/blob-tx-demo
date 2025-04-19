import { HardhatUserConfig, vars } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";
import "./tasks/commitAndVerifyBlob";

const ANVIL_PRIVATE_KEY = vars.get("ANVIL_PRIVATE_KEY", "");
const HOLESKY_PRIVATE_KEY = vars.get("HOLESKY_PRIVATE_KEY", "");
const SEPOLIA_PRIVATE_KEY = vars.get("SEPOLIA_PRIVATE_KEY", "");
const HOLESKY_RPC_URL = vars.get("HOLESKY_RPC_URL", "");
const SEPOLIA_RPC_URL = vars.get("SEPOLIA_RPC_URL", "");
const ETHERSCAN_API_KEY = vars.get("ETHERSCAN_API_KEY", "");

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.29",
    settings: {
      optimizer: {
        enabled: true,
        runs: 999999,
      },
      evmVersion: "cancun",
    },
  },
  networks: {
    ...(ANVIL_PRIVATE_KEY
      ? {
          local: {
            url: "http://127.0.0.1:8545",
            accounts: [ANVIL_PRIVATE_KEY],
          },
        }
      : {}),
    ...(HOLESKY_PRIVATE_KEY && HOLESKY_RPC_URL
      ? {
          holesky: {
            url: HOLESKY_RPC_URL,
            accounts: [HOLESKY_PRIVATE_KEY],
            chainId: 17000,
          },
        }
      : {}),
    ...(SEPOLIA_PRIVATE_KEY && SEPOLIA_RPC_URL
      ? {
          sepolia: {
            url: SEPOLIA_RPC_URL,
            accounts: [SEPOLIA_PRIVATE_KEY],
          },
        }
      : {}),
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
    customChains: [
      {
        network: "holesky",
        chainId: 17000,
        urls: {
          apiURL: "https://api-holesky.etherscan.io/api",
          browserURL: "https://holesky.etherscan.io",
        },
      },
    ],
  },
};

export default config;
