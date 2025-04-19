import { PublicClient, WalletClient } from "viem";

export interface BlobVerificationData {
  z: string;
  y: string;
  commitment: string;
  proof: string;
  versionedHash: string;
}

export interface ClientPair {
  walletClient: WalletClient;
  publicClient: PublicClient;
}
