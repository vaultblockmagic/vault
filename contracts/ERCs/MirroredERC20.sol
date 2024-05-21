// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "../interfaces/IVaultCore.sol";

contract MirroredERC20 is ERC20 {
    address public underlyingAsset;
    uint256 public requestId;
    string public username;
    address public owner;
    bool public transfersDisabled;
    uint256 public transferUnlockTimestamp;
    address public VaultCoreAddress;
    bool public locked = false;
    uint256 public lockId;

    constructor(
        string memory name,
        string memory symbol,
        address _underlyingAsset,
        uint256 _requestId,
        string memory _username,
        address _owner,
        address _VaultCoreAddress
    ) ERC20(name, symbol) {
        underlyingAsset = _underlyingAsset;
        requestId = _requestId;
        username = _username;
        owner = _owner;
        VaultCoreAddress = _VaultCoreAddress;
    }

    function mint(address to, uint256 amount) public {
        require(msg.sender == owner, "Only the owner can mint tokens");
        _mint(to, amount);
    }

    function burnFrom(address account, uint256 amount) public {
        require(msg.sender == owner, "Only the owner can burn tokens");
        _burn(account, amount);
    }

    function disableTransfersPermanently() public {
        require(
            IVaultCore(VaultCoreAddress).usernameAddress(username) ==
                msg.sender,
            "Only the owner of the username can disable transfers"
        );
        require(!transfersDisabled, "Transfers already permanently disabled");
        transfersDisabled = true;
    }

    function setTransferUnlockTimestamp(uint256 unlockTime) public {
        require(
            IVaultCore(VaultCoreAddress).usernameAddress(username) ==
                msg.sender,
            "Only the owner of the username can set the unlock timestamp"
        );
        require(
            unlockTime > block.timestamp,
            "Unlock time must be in the future"
        );
        require(
            unlockTime > transferUnlockTimestamp,
            "New unlock time must be higher"
        );
        transferUnlockTimestamp = unlockTime;
    }

    function lockTokens(uint256 _lockId) public {
        require(
            msg.sender == VaultCoreAddress,
            "Only the VaultCore contract can lock tokens"
        );
        locked = true;
        lockId = _lockId;
    }

    function unlockTokens() public {
        require(
            msg.sender == VaultCoreAddress,
            "Only the VaultCore contract can unlock tokens"
        );
        locked = false;
    }

    function transfer(address recipient, uint256 amount)
        public
        virtual
        override
        returns (bool)
    {
        address usernameOwner = IVaultCore(VaultCoreAddress)
            .usernameAddress(username);
        require(
            msg.sender != usernameOwner || !locked,
            "Outgoing transfers from the username owner are locked"
        );
        require(
            msg.sender == owner ||
                recipient == owner ||
                recipient == usernameOwner ||
                (!transfersDisabled &&
                    block.timestamp >= transferUnlockTimestamp),
            "Outgoing transfers are disabled"
        );
        return super.transfer(recipient, amount);
    }

    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) public virtual override returns (bool) {
        address usernameOwner = IVaultCore(VaultCoreAddress)
            .usernameAddress(username);
        require(
            msg.sender != usernameOwner || !locked,
            "Outgoing transfers from the username owner are locked"
        );
        require(
            sender == owner ||
                recipient == owner ||
                recipient == usernameOwner ||
                (!transfersDisabled &&
                    block.timestamp >= transferUnlockTimestamp),
            "Outgoing transfers are disabled"
        );
        return super.transferFrom(sender, recipient, amount);
    }

    function getUsername() public view returns (string memory) {
        return username;
    }
}
