// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

interface IzkVaultCore {
    function usernames(address _address) external view returns (string memory);

    function usernameAddress(string memory _username)
        external
        view
        returns (address);

    function passwordHashes(address _address) external view returns (uint256);

    function mfaManagerAddress() external view returns (address);
}
