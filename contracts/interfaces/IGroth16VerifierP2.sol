// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

struct ProofParameters {
    uint256 pA0;
    uint256 pA1;
    uint256 pB00;
    uint256 pB01;
    uint256 pB10;
    uint256 pB11;
    uint256 pC0;
    uint256 pC1;
    uint256 pubSignals0;
    uint256 pubSignals1;
}

interface IGroth16VerifierP2 {
    function verifyProof(
        uint256[2] calldata _pA,
        uint256[2][2] calldata _pB,
        uint256[2] calldata _pC,
        uint256[2] calldata _pubSignals
    ) external view returns (bool);
}
