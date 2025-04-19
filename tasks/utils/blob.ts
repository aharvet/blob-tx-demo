import {
  bytesToHex,
  commitmentToVersionedHash,
  keccak256,
  toBytes,
  encodeAbiParameters,
} from "viem";
import {
  Blob,
  blobToKzgCommitment,
  computeKzgProof,
  BYTES_PER_BLOB,
  loadTrustedSetup,
} from "c-kzg";
import { BlobVerificationData } from "./types";

loadTrustedSetup(0, "node_modules/c-kzg/deps/c-kzg/trusted_setup.txt");

export function createBlobData(text: string): Blob {
  const encodedText = toBytes(
    encodeAbiParameters([{ type: "string" }], [text])
  );

  const requiredPadding = BYTES_PER_BLOB - encodedText.length;
  const padding = Buffer.alloc(requiredPadding, 0);
  const blobData = Buffer.concat([padding, encodedText]);

  return blobData;
}

export async function prepareBlobVerification(
  blob: Blob
): Promise<BlobVerificationData> {
  const commitment = blobToKzgCommitment(blob);
  const versionedHash = commitmentToVersionedHash({ commitment });

  const BLS_MODULUS =
    52435875175126190479447740508185965837690552500527637822603658699938581184513n;
  const zValue = BigInt(keccak256(versionedHash)) % BLS_MODULUS;
  const z = toBytes(zValue);

  const [proof, y] = computeKzgProof(blob, z);

  return {
    z: bytesToHex(z),
    y: bytesToHex(y),
    commitment: bytesToHex(commitment),
    proof: bytesToHex(proof),
    versionedHash: bytesToHex(versionedHash),
  };
}
