// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract TestERC721 is ERC721 {
    constructor() ERC721("testNFT", "TOKEN") {
        mint(msg.sender, 0);
    }

    function mint(address to, uint256 tokenId) public {
        _safeMint(to, tokenId);
    }
}