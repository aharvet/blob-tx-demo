import { HardhatUserConfig, vars } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";
import "./tasks/commitAndVerifyBlob";

const ANVIL_PRIVATE_KEY = vars.get("ANVIL_PRIVATE_KEY", "");

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.29",
    settings: {
      evmVersion: "cancun",
    },
  },
  networks: {
    anvil: {
      url: "http://127.0.0.1:8545",
      accounts: [ANVIL_PRIVATE_KEY],
    },
  },
};

export default config;
