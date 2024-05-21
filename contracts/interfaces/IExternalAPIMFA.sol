// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

interface IExternalAPIMFA {
    struct MFAData {
        bool success;
        uint256 timestamp;
    }

    function sendRequest(
        uint64 subscriptionId,
        string calldata username,
        uint256 mfaRequestId,
        string[] calldata args
    ) external returns (bytes32 requestId);

    function getMFAData(string memory username, uint256 mfaRequestId)
        external
        view
        returns (MFAData memory);
}
