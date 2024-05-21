// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./MirroredERC721.sol";

contract MirroredERC721Factory {
    function createMirroredERC721(
        string memory name,
        string memory symbol,
        address underlyingAsset,
        uint256 requestId,
        string memory username,
        address owner,
        address VaultCoreAddress
    ) external returns (address) {
        MirroredERC721 mirroredToken = new MirroredERC721(
            name,
            symbol,
            underlyingAsset,
            requestId,
            username,
            owner,
            VaultCoreAddress
        );
        return address(mirroredToken);
    }
}