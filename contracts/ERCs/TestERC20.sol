// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TestERC20 is ERC20 {
    constructor()
        ERC20("testcoin", "COIN")
    {
        // Mint 1B tokens to msg.sender
        _mint(msg.sender, 10**9 * 10 ** 18);
    }
}