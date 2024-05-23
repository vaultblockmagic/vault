// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./IMFAProvider.sol";
import "./IGroth16VerifierP2.sol";

interface IVaultCore {
    function usernames(address) external view returns (string memory);

    function usernameAddress(string memory) external view returns (address);

    function passwordHashes(address) external view returns (uint256);

    function crossChainNameService() external view returns (address);

    function setCrossChainNameService(address _crossChainNameService) external;

    function releaseOwnership() external;

    function vaultTokensFaucet(address _receiver) external;

    function setUsername(
        string memory _username,
        address _userAddress,
        uint256 _passwordHash
    ) external;

    function resetUsernameAddress(
        string memory _username,
        address _newUserAddress,
        uint256 _passwordHash,
        uint256 _timestamp,
        ProofParameters calldata _params
    ) external;

    function verifyPassword(
        uint256 passwordHash,
        uint256 timestamp,
        ProofParameters calldata params
    ) external view;

    function mirroredTokenVaultRequestCount(string memory)
        external
        view
        returns (uint256);

    function mirroredTokenLockRequestCount(string memory)
        external
        view
        returns (uint256);

    function mirroredERC20Tokens(string memory, uint256)
        external
        view
        returns (address);

    function mirroredERC721Tokens(string memory, uint256)
        external
        view
        returns (address);

    function lockRequestTokens(string memory, uint256)
        external
        view
        returns (address);

    function underlyingERC721TokenIds(string memory, uint256)
        external
        view
        returns (uint256);

    function vaultAsset(
        address _token,
        uint256 _amount,
        uint256 _tokenId,
        bool _isERC20,
        address[] memory _mfaProviders
    ) external;

    function unvaultAsset(
        address _token,
        uint256 _amount,
        uint256 _requestId,
        bool _isERC20
    ) external;

    function batchVaultAndSetMFA(
        address _token,
        uint256 _amount,
        uint256 _tokenId,
        bool _isERC20,
        uint256 _passwordHash,
        MFAProviderData[] memory _mfaProviderData
    ) external;

    function batchUnvaultAndVerifyMFA(
        address _token,
        uint256 _amount,
        uint256 _requestId,
        bool _isERC20,
        uint256 _timestamp,
        ProofParameters memory _params,
        MFAProviderData[] memory _mfaProviderData
    ) external;

    function lockAsset(
        address _token,
        bool _isERC20,
        address[] memory _mfaProviders
    ) external;

    function unlockAsset(uint256 _requestId, bool _isERC20) external;

    function batchLockAndSetMFA(
        address _token,
        bool _isERC20,
        MFAProviderData[] memory _mfaProviderData,
        uint256 _passwordHash
    ) external;

    function batchUnlockAndVerifyMFA(
        uint256 _requestId,
        bool _isERC20,
        uint256 _timestamp,
        ProofParameters memory _params,
        MFAProviderData[] memory _mfaProviderData
    ) external;

    function mfaManagerAddress() external view returns (address);
}
