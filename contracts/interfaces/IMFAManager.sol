// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./IMFA.sol";
import "./IzkVaultMFA.sol";
import "./IExternalSignerMFA.sol";

interface IMFAManager {
    function setzkVaultMFAAddress(address _zkVaultMFAAddress) external;

    function setzkVaultCoreAddress(address _zkVaultCoreAddress) external;

    function getZkVaultMFAAddress() external view returns (address);

    function setVaultMFAProviders(
        string memory username,
        uint256 requestId,
        address[] memory _mfaProviders
    ) external;

    function setLockMFAProviders(
        string memory username,
        uint256 requestId,
        address[] memory _mfaProviders
    ) external;

    function verifyVaultMFA(
        string memory username,
        uint256 requestId,
        uint256 timestamp,
        ProofParameters memory _zkpParams,
        MFAProviderData[] memory _mfaProviderData
    ) external returns (bool);

    function verifyLockMFA(
        string memory username,
        uint256 requestId,
        uint256 timestamp,
        ProofParameters memory _zkpParams,
        MFAProviderData[] memory _mfaProviderData
    ) external returns (bool);

    function getVaultRequestMFAProviderCount(
        string memory username,
        uint256 requestId
    ) external view returns (uint256);

    function getVaultRequestMFAProviders(
        string memory username,
        uint256 requestId,
        uint256 index
    ) external view returns (address);

    function getLockRequestMFAProviderCount(
        string memory username,
        uint256 requestId
    ) external view returns (uint256);

    function getLockRequestMFAProviders(
        string memory username,
        uint256 requestId,
        uint256 index
    ) external view returns (address);
}