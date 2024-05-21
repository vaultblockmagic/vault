// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./MirroredERC20.sol";

contract MirroredERC20Factory {
    function createMirroredERC20(
        string memory name,
        string memory symbol,
        address underlyingAsset,
        uint256 requestId,
        string memory username,
        address owner,
        address VaultCoreAddress
    ) external returns (address) {
        MirroredERC20 mirroredToken = new MirroredERC20(
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