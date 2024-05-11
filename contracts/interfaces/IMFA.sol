// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

interface IMFA {
    struct MFAData {
        bool success;
        uint256 timestamp;
    }

    function getMFAData(string memory username, uint256 requestId)
        external
        view
        returns (MFAData memory);
}

struct MFAProviderData {
    address providerAddress;
    string message;
    uint8 v;
    bytes32 r;
    bytes32 s;
}
