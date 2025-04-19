import { task, types } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";
import { Blob } from "c-kzg";
import { Address } from "viem";
import { createBlobData, prepareBlobVerification } from "./utils/blob";
import { BlobVerificationData } from "./utils/types";
import { createClients } from "./utils/client";
import {
  deployContract,
  sendBlobTransaction,
  decodeEvents,
} from "./utils/contract";
import blobTxDemoAddress from "../config/blobTxDemoAddress.json";

function validateBlobCount(count: number) {
  if (count < 1) throw new Error("Blob count must be at least 1");
  if (count > 6) throw new Error("Maximum blob count is 6");
}

async function createBlobsAndVerificationData(count: number) {
  const blobs: Blob[] = [];
  const verificationData: BlobVerificationData[] = [];

  for (let i = 0; i < count; i++) {
    const blob = createBlobData(`Mock data for blob ${i}`);
    console.log(`Blob ${i} content: ${blob}`);
    blobs.push(blob);
    const data = await prepareBlobVerification(blob);
    console.log(
      `Blob ${i} verification data: ${JSON.stringify(data, null, 2)}`
    );
    console.log();
    verificationData.push(data);
  }

  return { blobs, verificationData };
}

async function getContractAddress(
  network: string,
  walletClient: any,
  publicClient: any,
  hre: any
): Promise<Address> {
  if (network === "local") {
    const contractAddress = await deployContract(
      walletClient,
      publicClient,
      hre
    );
    console.log("Contract deployed at:", contractAddress);
    return contractAddress;
  }

  if (network === "holesky" || network === "sepolia") {
    const address = blobTxDemoAddress[network] as Address;
    if (!address)
      throw new Error(`Contract address not found for network ${network}`);
    console.log("Using contract address:", address);
    return address;
  }

  throw new Error(`Unsupported network: ${network}`);
}

task("commitAndVerifyBlob", "Commits and verifies blobs")
  .addParam("blobCount", "Number of blobs to commit and verify", "1", types.int)
  .setAction(async (taskArgs, hre) => {
    try {
      validateBlobCount(taskArgs.blobCount);

      const { blobs, verificationData } = await createBlobsAndVerificationData(
        taskArgs.blobCount
      );
      const { walletClient, publicClient } = createClients(hre);

      const contractAddress = await getContractAddress(
        hre.network.name,
        walletClient,
        publicClient,
        hre
      );

      const txReceipt = await sendBlobTransaction(
        walletClient,
        publicClient,
        contractAddress,
        verificationData,
        blobs
      );

      decodeEvents(txReceipt.logs);
    } catch (error) {
      console.error("Error in commitAndVerifyBlob task:", error);
      throw error;
    }
  });
