import { createWalletClient, http, createPublicClient } from "viem";
import { anvil, holesky } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import { ClientPair } from "./types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

export function createClients(hre: HardhatRuntimeEnvironment): ClientPair {
  const networkConfig = hre.network.config as {
    accounts: string[];
    url: string;
  };
  const account = privateKeyToAccount(
    networkConfig.accounts[0] as `0x${string}`
  );

  const chain = (() => {
    switch (hre.network.name) {
      case "anvil":
        return anvil;
      case "holesky":
        return holesky;
      default:
        throw new Error(`Unsupported network: ${hre.network.name}`);
    }
  })();

  const walletClient = createWalletClient({
    account,
    chain,
    transport: http(networkConfig.url),
  });

  const publicClient = createPublicClient({
    chain,
    transport: http(networkConfig.url),
  });

  return { walletClient, publicClient };
}
