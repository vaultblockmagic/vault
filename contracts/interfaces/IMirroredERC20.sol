// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IMirroredERC20 {
    function mint(address to, uint256 amount) external;
    function burnFrom(address account, uint256 amount) external;
    function balanceOf(address account) external view returns (uint256);
    function disableTransfersPermanently() external;
    function setTransferUnlockTimestamp(uint256 unlockTime) external;
    function lockTokens(uint256 lockId) external;
    function unlockTokens() external;
    function getUsername() external returns(string memory);
}