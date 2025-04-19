import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const BlobTxDemoModule = buildModule("BlobTxDemo", (m) => {
  const blobTxDemo = m.contract("BlobTxDemo");

  return { blobTxDemo };
});

export default BlobTxDemoModule;
