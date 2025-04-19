import { task, types } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";
import { Blob } from "c-kzg";
import { Address } from "viem";
import { createBlobData, prepareBlobVerification } from "./utils/blob";
import { createClients } from "./utils/client";
import {
  deployContract,
  sendBlobTransaction,
  decodeEvents,
} from "./utils/contract";
import blobTxDemoAddress from "../config/blobTxDemoAddress.json";

task("commitAndVerifyBlob", "Commits and verifies blobs")
  .addParam("blobCount", "Number of blobs to commit and verify", "1", types.int)
  .setAction(async (taskArgs, hre) => {
    try {
      // Check param
      const blobCount = taskArgs.blobCount;
      if (blobCount < 1) {
        console.log("Blob count must be at least 1");
        process.exit(1);
      }
      if (blobCount > 6) {
        console.log("Warning: Maximum blob count is 6");
        process.exit(1);
      }

      const blobs: Blob[] = [];
      const blobVerificationData = [];

      // Create blobs and verification data
      for (let i = 0; i < blobCount; i++) {
        const blob = createBlobData(`Mock data for blob ${i}`);
        console.log(`\nBlob ${i} created: ${blob}`);
        blobs.push(blob);
        const verificationData = await prepareBlobVerification(blob);
        console.log(`Blob ${i} verification data:`);
        console.log(JSON.stringify(verificationData, null, 2));
        blobVerificationData.push(verificationData);
      }

      const { walletClient, publicClient } = createClients(hre);

      console.log(`\nUsing account: ${walletClient.account?.address}`);

      let contractAddress: Address;
      switch (hre.network.name) {
        // Deploy contract if local network
        case "anvil":
          contractAddress = await deployContract(
            walletClient,
            publicClient,
            hre
          );
          console.log("Contract deployed at:", contractAddress);
          break;
        case "holesky":
        case "sepolia":
          contractAddress = blobTxDemoAddress[hre.network.name] as Address;
          if (!contractAddress) {
            throw new Error(
              `Contract address not found for network ${hre.network.name}`
            );
          }
          console.log("Using contract address:", contractAddress);
          break;
        default:
          throw new Error(`Unsupported network: ${hre.network.name}`);
      }

      // Send transaction type 3
      const txHash = await sendBlobTransaction(
        walletClient,
        contractAddress,
        blobVerificationData,
        blobs
      );
      console.log("\nTransaction hash:", txHash);

      const txReceipt = await publicClient.waitForTransactionReceipt({
        hash: txHash,
      });
      console.log("Transaction successful");

      // Decode events
      const events = decodeEvents(txReceipt.logs);
      console.log("\nDecoded events:", events);
    } catch (error) {
      console.error("Error in commitAndVerifyBlob task:", error);
      throw error;
    }
  });
