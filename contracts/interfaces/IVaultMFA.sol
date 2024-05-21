// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "./IGroth16VerifierP2.sol";

interface IVaultMFA {
    struct MFAData {
        bool success;
        uint256 timestamp;
    }

    function setRequestPasswordHash(
        string memory username,
        uint256 requestId,
        uint256 requestPasswordHash
    ) external;

    function setMFAData(
        string memory username,
        uint256 requestId,
        uint256 timestamp,
        ProofParameters calldata params
    ) external;

    function getMFAData(string memory username, uint256 requestId)
        external
        view
        returns (MFAData memory);
}
