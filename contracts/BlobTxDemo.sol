// SPDX-License-Identifier: MIT
pragma solidity 0.8.29;

contract BlobTxDemo {
    address private constant POINT_EVALUATION_PRECOMPILE_ADDRESS = 0x000000000000000000000000000000000000000A;
    uint256 private constant BLS_MODULUS = 52435875175126190479447740508185965837690552500527637822603658699938581184513;

    event BlobVerified(bytes32 indexed versionedHash, uint256 blobIndex);

    error InvalidParameters();
    error InvalidCommitmentLength();
    error InvalidProofLength();
    error CallToPrecompileFailed();
    error ProofVerificationFailed();

    function commitAndVerifyBlobs(bytes32[] calldata ys, bytes[] calldata commitments, bytes[] calldata proofs)
        external
    {
        require(ys.length == commitments.length && commitments.length == proofs.length, InvalidParameters());

        for (uint256 i = 0; i < ys.length; i++) {
            require(commitments[i].length == 48, InvalidCommitmentLength());
            require(proofs[i].length == 48, InvalidProofLength());

            // Get versionedHash of the blob at index i
            bytes32 versionedHash = blobhash(i);
            // Revert if there is more parameters than blobs
            require(versionedHash != bytes32(0), InvalidParameters());

            // Compute random z value for each blob
            uint256 z = uint256(keccak256(abi.encodePacked(versionedHash))) % BLS_MODULUS;

            bytes memory pointEvaluationCalldata = abi.encodePacked(versionedHash, z, ys[i], commitments[i], proofs[i]);

            // Call point evaluation precompile to verify the proof
            (bool success, bytes memory data) = POINT_EVALUATION_PRECOMPILE_ADDRESS.staticcall(pointEvaluationCalldata);
            require(success, CallToPrecompileFailed());

            // Decode the result from the precompile and check it
            (, uint256 result) = abi.decode(data, (uint256, uint256));
            require(result == BLS_MODULUS, ProofVerificationFailed());

            emit BlobVerified(versionedHash, i);
        }
    }
}
