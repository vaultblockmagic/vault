// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

interface IExternalSignerMFA {
    struct MFAData {
        bool success;
        uint256 timestamp;
    }

    function setValue(
        string memory username,
        uint256 requestId,
        uint256 timestamp,
        string memory message,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external;

    function getMFAData(string memory username, uint256 requestId)
        external
        view
        returns (MFAData memory);
}
