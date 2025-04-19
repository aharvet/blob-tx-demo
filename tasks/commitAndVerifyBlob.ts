import { task, types } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";
import { Blob } from "c-kzg";
import { createBlobData, prepareBlobVerification } from "./utils/blob";
import { createClients } from "./utils/client";
import {
  deployContract,
  sendBlobTransaction,
  decodeEvents,
} from "./utils/contract";

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

      // Create blobs
      for (let i = 0; i < blobCount; i++) {
        const blob = createBlobData(`Mock data for blob ${i}`);
        blobs.push(blob);
        const verificationData = await prepareBlobVerification(blob);
        blobVerificationData.push(verificationData);
      }

      const { walletClient, publicClient } = createClients(hre);

      // Deploy contract
      const contractAddress = await deployContract(
        walletClient,
        publicClient,
        hre
      );
      console.log("Contract deployed at:", contractAddress);

      // Send transaction type 3
      const txHash = await sendBlobTransaction(
        walletClient,
        contractAddress,
        blobVerificationData,
        blobs
      );
      console.log("Transaction hash:", txHash);

      const txReceipt = await publicClient.waitForTransactionReceipt({
        hash: txHash,
      });
      console.log("Transaction successful");

      // Decode events
      const events = decodeEvents(txReceipt.logs);
      console.log("Decoded events:", events);
    } catch (error) {
      console.error("Error in commitAndVerifyBlob task:", error);
      throw error;
    }
  });
