// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

interface IMFAProvider {
    struct MFAData {
        bool success;
        uint256 timestamp;
    }

    function getMFAData(string memory username, uint256 requestId)
        external
        view
        returns (MFAData memory);

    function getMFAType() external view returns (string memory);
}

struct MFAProviderData {
    address providerAddress;
    string message;
    uint8 v;
    bytes32 r;
    bytes32 s;
    uint64 subscriptionId;
    string username;
    uint256 mfaRequestId;
    string[] args;
}
