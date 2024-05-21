// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "../interfaces/IMFAProvider.sol";
import "../interfaces/IMFAManager.sol";
import "../interfaces/IVaultCore.sol";

contract MFAManager is IMFAManager {
    mapping(string => mapping(uint256 => mapping(uint256 => IMFAProvider)))
        public vaultRequestMFAProviders;
    mapping(string => mapping(uint256 => uint256))
        public vaultRequestMFAProviderCount;
    mapping(string => mapping(uint256 => mapping(uint256 => IMFAProvider)))
        public lockRequestMFAProviders;
    mapping(string => mapping(uint256 => uint256))
        public lockRequestMFAProviderCount;

    address public VaultMFAAddress;
    address public VaultCoreAddress;
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    function setVaultMFAAddress(address _VaultMFAAddress) external {
        require(
            msg.sender == owner,
            "Only owner can set the VaultMFA address"
        );
        VaultMFAAddress = _VaultMFAAddress;
    }

    function setVaultCoreAddress(address _VaultCoreAddress) external {
        require(
            msg.sender == owner,
            "Only owner can set the VaultCore address"
        );
        VaultCoreAddress = _VaultCoreAddress;
    }

    function getVaultMFAAddress() external view returns (address) {
        return VaultMFAAddress;
    }

    function setVaultMFAProviders(
        string memory username,
        uint256 requestId,
        address[] memory _mfaProviders
    ) external {
        require(
            (msg.sender == VaultCoreAddress &&
                VaultCoreAddress != address(0)) ||
                IVaultCore(VaultCoreAddress).usernameAddress(username) ==
                msg.sender ||
                msg.sender == address(this),
            "Only the VaultCore contract, the owner of the username, or the MFA manager can set MFA providers"
        );

        for (uint256 i = 0; i < _mfaProviders.length; ++i) {
            vaultRequestMFAProviders[username][requestId][i] = IMFAProvider(
                _mfaProviders[i]
            );
        }
        vaultRequestMFAProviderCount[username][requestId] = _mfaProviders
            .length;
    }

    function setLockMFAProviders(
        string memory username,
        uint256 requestId,
        address[] memory _mfaProviders
    ) external {
        require(
            (msg.sender == VaultCoreAddress &&
                VaultCoreAddress != address(0)) ||
                IVaultCore(VaultCoreAddress).usernameAddress(username) ==
                msg.sender ||
                msg.sender == address(this),
            "Only the VaultCore contract, the owner of the username, or the MFA manager can set lock MFA providers"
        );

        for (uint256 i = 0; i < _mfaProviders.length; ++i) {
            lockRequestMFAProviders[username][requestId][i] = IMFAProvider(
                _mfaProviders[i]
            );
        }
        lockRequestMFAProviderCount[username][requestId] = _mfaProviders.length;
    }

    function verifyVaultMFA(
        string memory username,
        uint256 requestId,
        uint256 timestamp,
        ProofParameters memory _params,
        MFAProviderData[] memory _mfaProviderData
    ) external returns (bool) {
        require(
            (msg.sender == VaultCoreAddress &&
                VaultCoreAddress != address(0)) ||
                IVaultCore(VaultCoreAddress).usernameAddress(username) ==
                msg.sender,
            "Only the VaultCore contract or the owner of the username can verify MFA"
        );

        uint256 timeLimit = 3600; // 60 minutes

        for (uint256 i = 0; i < _mfaProviderData.length; ++i) {
            IMFAProvider mfaProvider = IMFAProvider(
                _mfaProviderData[i].providerAddress
            );
            string memory mfaType = mfaProvider.getMFAType();

            if (compareStrings(mfaType, "VaultMFA")) {
                IVaultMFA(address(mfaProvider)).setMFAData(
                    username,
                    requestId,
                    timestamp,
                    _params
                );
            } else if (compareStrings(mfaType, "ExternalSignerMFA")) {
                IExternalSignerMFA(address(mfaProvider)).setValue(
                    username,
                    requestId,
                    timestamp,
                    _mfaProviderData[i].message,
                    _mfaProviderData[i].v,
                    _mfaProviderData[i].r,
                    _mfaProviderData[i].s
                );
            }
        }

        for (
            uint256 i = 0;
            i < vaultRequestMFAProviderCount[username][requestId];
            ++i
        ) {
            IMFAProvider.MFAData memory mfaData = vaultRequestMFAProviders[
                username
            ][requestId][i].getMFAData(username, requestId);
            require(mfaData.success, "MFA verification failed");
            require(
                mfaData.timestamp >= block.timestamp - timeLimit,
                "MFA data expired"
            );
        }

        return true;
    }

    function verifyLockMFA(
        string memory username,
        uint256 requestId,
        uint256 timestamp,
        ProofParameters memory _params,
        MFAProviderData[] memory _mfaProviderData
    ) external returns (bool) {
        require(
            (msg.sender == VaultCoreAddress &&
                VaultCoreAddress != address(0)) ||
                IVaultCore(VaultCoreAddress).usernameAddress(username) ==
                msg.sender,
            "Only the VaultCore contract or the owner of the username can verify lock MFA"
        );

        uint256 timeLimit = 3600; // 60 minutes

        for (uint256 i = 0; i < _mfaProviderData.length; ++i) {
            IMFAProvider mfaProvider = IMFAProvider(
                _mfaProviderData[i].providerAddress
            );
            string memory mfaType = mfaProvider.getMFAType();

            if (compareStrings(mfaType, "VaultMFA")) {
                IVaultMFA(address(mfaProvider)).setMFAData(
                    username,
                    requestId,
                    timestamp,
                    _params
                );
            } else if (compareStrings(mfaType, "ExternalSignerMFA")) {
                IExternalSignerMFA(address(mfaProvider)).setValue(
                    username,
                    requestId,
                    timestamp,
                    _mfaProviderData[i].message,
                    _mfaProviderData[i].v,
                    _mfaProviderData[i].r,
                    _mfaProviderData[i].s
                );
            }
        }

        for (
            uint256 i = 0;
            i < lockRequestMFAProviderCount[username][requestId];
            ++i
        ) {
            IMFAProvider.MFAData memory mfaData = lockRequestMFAProviders[
                username
            ][requestId][i].getMFAData(username, requestId);
            require(mfaData.success, "MFA verification failed");
            require(
                mfaData.timestamp >= block.timestamp - timeLimit,
                "MFA data expired"
            );
        }

        return true;
    }

    function getVaultRequestMFAProviderCount(
        string memory username,
        uint256 requestId
    ) external view returns (uint256) {
        return vaultRequestMFAProviderCount[username][requestId];
    }

    function getVaultRequestMFAProviders(
        string memory username,
        uint256 requestId,
        uint256 index
    ) external view returns (address) {
        return address(vaultRequestMFAProviders[username][requestId][index]);
    }

    function getLockRequestMFAProviderCount(
        string memory username,
        uint256 requestId
    ) external view returns (uint256) {
        return lockRequestMFAProviderCount[username][requestId];
    }

    function getLockRequestMFAProviders(
        string memory username,
        uint256 requestId,
        uint256 index
    ) external view returns (address) {
        return address(lockRequestMFAProviders[username][requestId][index]);
    }

    function compareStrings(string memory a, string memory b)
        public
        pure
        returns (bool)
    {
        return keccak256(abi.encodePacked(a)) == keccak256(abi.encodePacked(b));
    }
}
