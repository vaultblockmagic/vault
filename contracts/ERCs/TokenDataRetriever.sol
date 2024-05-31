// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IERC20 {
    function name() external view returns (string memory);

    function symbol() external view returns (string memory);

    function decimals() external view returns (uint8);

    function balanceOf(address account) external view returns (uint256);
}

interface IERC721 {
    function name() external view returns (string memory);

    function symbol() external view returns (string memory);

    function ownerOf(uint256 tokenId) external view returns (address);

    function balanceOf(address owner) external view returns (uint256);
}

interface IMFAManager {
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

interface IMirroredERC20 {
    function requestId() external view returns (uint256);

    function username() external view returns (string memory);

    function owner() external view returns (address);

    function locked() external view returns (bool);

    function lockId() external view returns (uint256);

    function name() external view returns (string memory);

    function symbol() external view returns (string memory);

    function decimals() external view returns (uint8);

    function balanceOf(address account) external view returns (uint256);

    function allowance(address owner, address spender)
        external
        view
        returns (uint256);

    function approve(address spender, uint256 amount) external returns (bool);
}

interface IMirroredERC721 {
    function requestId() external view returns (uint256);

    function username() external view returns (string memory);

    function owner() external view returns (address);

    function locked() external view returns (bool);

    function lockId() external view returns (uint256);

    function ownerOfToken(uint256 tokenId) external view returns (address);

    function getUsername() external view returns (string memory);

    function name() external view returns (string memory);

    function symbol() external view returns (string memory);

    function balanceOf(address owner) external view returns (uint256);

    function ownerOf(uint256 tokenId) external view returns (address);
}

contract TokenDataRetriever {
    address public mfaManagerAddress;

    constructor(address _mfaManagerAddress) {
        mfaManagerAddress = _mfaManagerAddress;
    }

    struct ERC20TokenData {
        address tokenAddress;
        string name;
        string symbol;
        uint8 decimals;
        uint256 balance;
        bool vaulted;
        bool locked;
        address[] vaultAuthOptions;
        address[] lockAuthOptions;
    }

    struct ERC721TokenData {
        address tokenAddress;
        string name;
        string symbol;
        uint256 balance;
        uint256 tokenId;
        bool vaulted;
        bool locked;
        address[] vaultAuthOptions;
        address[] lockAuthOptions;
    }

    function getERC20TokenData(
        address[] memory tokenAddresses,
        address userAddress
    ) public view returns (ERC20TokenData[] memory) {
        uint256 length = tokenAddresses.length;
        ERC20TokenData[] memory tokenDataArray = new ERC20TokenData[](length);

        for (uint256 i = 0; i < length; i++) {
            IERC20 token = IERC20(tokenAddresses[i]);
            tokenDataArray[i] = ERC20TokenData(
                tokenAddresses[i],
                token.name(),
                token.symbol(),
                token.decimals(),
                token.balanceOf(userAddress),
                false, // vaulted
                false, // locked
                new address[](0), // vaultAuthOptions
                new address[](0) // lockAuthOptions
            );
        }

        return tokenDataArray;
    }

    function getERC721TokenData(
        address[] memory tokenAddresses,
        uint256[] memory tokenIds,
        address userAddress
    ) public view returns (ERC721TokenData[] memory) {
        uint256 length = tokenAddresses.length;
        ERC721TokenData[] memory tokenDataArray = new ERC721TokenData[](length);

        for (uint256 i = 0; i < length; i++) {
            IERC721 token = IERC721(tokenAddresses[i]);
            uint256 balance = token.balanceOf(userAddress);

            uint256 tokenId = tokenIds[i];
            tokenDataArray[i] = ERC721TokenData(
                tokenAddresses[i],
                token.name(),
                token.symbol(),
                balance,
                tokenId,
                false, // vaulted
                false, // locked
                new address[](0), // vaultAuthOptions
                new address[](0) // lockAuthOptions
            );
        }

        return tokenDataArray;
    }

    function getMirroredERC20TokenData(
        address[] memory tokenAddresses,
        address userAddress
    ) public view returns (ERC20TokenData[] memory) {
        uint256 length = tokenAddresses.length;
        ERC20TokenData[] memory tokenDataArray = new ERC20TokenData[](length);

        for (uint256 i = 0; i < length; i++) {
            IMirroredERC20 token = IMirroredERC20(tokenAddresses[i]);
            IMFAManager mfaManager = IMFAManager(mfaManagerAddress);

            uint256 requestId = token.requestId();
            bool locked = token.locked();
            uint256 lockId = token.lockId();

            uint256 vaultAuthOptionsCount = mfaManager
                .getVaultRequestMFAProviderCount(token.username(), requestId);
            address[] memory vaultAuthOptions = new address[](
                vaultAuthOptionsCount
            );
            for (uint256 j = 0; j < vaultAuthOptionsCount; j++) {
                vaultAuthOptions[j] = mfaManager.getVaultRequestMFAProviders(
                    token.username(),
                    requestId,
                    j
                );
            }

            uint256 lockAuthOptionsCount = mfaManager
                .getLockRequestMFAProviderCount(token.username(), lockId);
            address[] memory lockAuthOptions = new address[](
                lockAuthOptionsCount
            );
            for (uint256 j = 0; j < lockAuthOptionsCount; j++) {
                lockAuthOptions[j] = mfaManager.getLockRequestMFAProviders(
                    token.username(),
                    lockId,
                    j
                );
            }

            tokenDataArray[i].tokenAddress = tokenAddresses[i];
            tokenDataArray[i].name = token.name();
            tokenDataArray[i].symbol = token.symbol();
            tokenDataArray[i].decimals = token.decimals();
            tokenDataArray[i].balance = token.balanceOf(userAddress);
            tokenDataArray[i].vaulted = true;
            tokenDataArray[i].locked = locked;
            tokenDataArray[i].vaultAuthOptions = vaultAuthOptions;
            tokenDataArray[i].lockAuthOptions = lockAuthOptions;
        }

        return tokenDataArray;
    }

    function getMirroredERC721TokenData(
        address[] memory tokenAddresses,
        address userAddress
    ) public view returns (ERC721TokenData[] memory) {
        uint256 length = tokenAddresses.length;
        ERC721TokenData[] memory tokenDataArray = new ERC721TokenData[](length);

        for (uint256 i = 0; i < length; i++) {
            IMirroredERC721 token = IMirroredERC721(tokenAddresses[i]);
            IMFAManager mfaManager = IMFAManager(mfaManagerAddress);

            uint256 requestId = token.requestId();
            bool locked = token.locked();
            uint256 lockId = token.lockId();

            uint256 vaultAuthOptionsCount = mfaManager
                .getVaultRequestMFAProviderCount(
                    token.getUsername(),
                    requestId
                );
            address[] memory vaultAuthOptions = new address[](
                vaultAuthOptionsCount
            );
            for (uint256 j = 0; j < vaultAuthOptionsCount; j++) {
                vaultAuthOptions[j] = mfaManager.getVaultRequestMFAProviders(
                    token.getUsername(),
                    requestId,
                    j
                );
            }

            uint256 lockAuthOptionsCount = mfaManager
                .getLockRequestMFAProviderCount(token.getUsername(), lockId);
            address[] memory lockAuthOptions = new address[](
                lockAuthOptionsCount
            );
            for (uint256 j = 0; j < lockAuthOptionsCount; j++) {
                lockAuthOptions[j] = mfaManager.getLockRequestMFAProviders(
                    token.getUsername(),
                    lockId,
                    j
                );
            }

            tokenDataArray[i].tokenAddress = tokenAddresses[i];
            tokenDataArray[i].name = token.name();
            tokenDataArray[i].symbol = token.symbol();
            tokenDataArray[i].balance = token.balanceOf(userAddress);
            tokenDataArray[i].tokenId = 0;
            tokenDataArray[i].vaulted = true;
            tokenDataArray[i].locked = locked;
            tokenDataArray[i].vaultAuthOptions = vaultAuthOptions;
            tokenDataArray[i].lockAuthOptions = lockAuthOptions;
        }

        return tokenDataArray;
    }
}
