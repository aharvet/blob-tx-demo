import {
  Address,
  Hash,
  PublicClient,
  WalletClient,
  parseGwei,
  encodeFunctionData,
  SetupKzgParameters,
  decodeEventLog,
} from "viem";
import { Blob, blobToKzgCommitment, computeBlobKzgProof } from "c-kzg";
import { BlobVerificationData } from "./types";

export async function deployContract(
  walletClient: WalletClient,
  publicClient: PublicClient,
  hre: any
): Promise<Address> {
  if (!walletClient.account) {
    throw new Error("Wallet client must have an account configured");
  }

  await hre.run("compile", { verbose: true });
  const { bytecode } = await hre.artifacts.readArtifact("BlobTxDemo");

  const deployHash = await walletClient.sendTransaction({
    account: walletClient.account,
    chain: null,
    data: bytecode,
  });

  const deployReceipt = await publicClient.waitForTransactionReceipt({
    hash: deployHash,
  });

  if (!deployReceipt.contractAddress) {
    throw new Error("Contract deployment failed");
  }

  return deployReceipt.contractAddress;
}

export function createKzgAdapter(): SetupKzgParameters {
  return {
    loadTrustedSetup: () => {
      // The setup is already loaded
    },
    blobToKzgCommitment: (blob: Uint8Array) => blobToKzgCommitment(blob),
    computeBlobKzgProof: (blob: Uint8Array, commitment: Uint8Array) =>
      computeBlobKzgProof(blob, commitment),
  };
}

export async function sendBlobTransaction(
  walletClient: WalletClient,
  contractAddress: Address,
  blobVerificationData: BlobVerificationData[],
  blobs: Blob[]
): Promise<Hash> {
  if (!walletClient.account) {
    throw new Error("Wallet client must have an account configured");
  }

  const kzgAdapter = createKzgAdapter();

  return walletClient.sendTransaction({
    account: walletClient.account,
    chain: null,
    blobs: blobs,
    kzg: kzgAdapter,
    maxFeePerBlobGas: parseGwei("30"),
    to: contractAddress,
    data: encodeFunctionData({
      abi: [
        {
          name: "commitAndVerifyBlobs",
          type: "function",
          inputs: [
            { name: "ys", type: "bytes32[]" },
            { name: "commitments", type: "bytes[]" },
            { name: "proofs", type: "bytes[]" },
          ],
          outputs: [],
          stateMutability: "nonpayable",
        },
      ],
      functionName: "commitAndVerifyBlobs",
      args: [
        blobVerificationData.map((d) => d.y as `0x${string}`),
        blobVerificationData.map((d) => d.commitment as `0x${string}`),
        blobVerificationData.map((d) => d.proof as `0x${string}`),
      ],
    }),
  });
}

export function decodeEvents(logs: any[]) {
  return logs
    .map((log) => {
      try {
        const eventAbi = [
          {
            name: "BlobVerified",
            type: "event",
            inputs: [
              { name: "versionedHash", type: "bytes32", indexed: true },
              { name: "blobIndex", type: "uint256" },
            ],
          },
        ];

        return decodeEventLog({
          abi: eventAbi,
          data: log.data,
          topics: log.topics,
        });
      } catch (error) {
        console.error("Error decoding event:", error);
        return null;
      }
    })
    .filter(Boolean);
}
