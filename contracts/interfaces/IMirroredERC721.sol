// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IMirroredERC721 {
    function mint(address to, uint256 tokenId) external;
    function burn(uint256 tokenId) external;
    function ownerOfToken(uint256 tokenId) external view returns (address);
    function ownerOf(uint256 tokenId) external view returns (address);
    function disableTransfersPermanently() external;
    function setTransferUnlockTimestamp(uint256 unlockTime) external;
    function lockTokens(uint256 lockId) external;
    function unlockTokens() external;
    function getUsername() external returns(string memory);
}
