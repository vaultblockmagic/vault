// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import {IRouterClient} from "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouterClient.sol";
import {Client} from "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
import {CCIPReceiver} from "@chainlink/contracts-ccip/src/v0.8/ccip/applications/CCIPReceiver.sol";
import {OwnerIsCreator} from "@chainlink/contracts-ccip/src/v0.8/shared/access/OwnerIsCreator.sol";

interface IVaultCore {
    function setUsernameByExternalRegistrar(
        address _userAddress,
        string memory _username,
        uint256 _passwordHash
    ) external;
}

contract CrossChainNameService is CCIPReceiver, OwnerIsCreator {
    struct Chain {
        uint64 chainSelector;
        address ccnsReceiverAddress;
    }

    IRouterClient public immutable i_router;
    Chain[] public s_chains;
    mapping(string => address) public users;
    mapping(uint64 => mapping(address => bool)) public sourcePolicies;
    address public registrar;

    IVaultCore public vaultCore;

    constructor(
        address _router,
        address _registrar,
        address _vaultCore
    ) CCIPReceiver(_router) {
        i_router = IRouterClient(_router);
        registrar = _registrar;
        vaultCore = IVaultCore(_vaultCore);
    }

    receive() external payable {}

    function resetRegistrar(address _registrar) public onlyOwner {
        registrar = _registrar;
    }

    function enableChain(uint64 _chainSelector, address _ccnsReceiverAddress)
        external
        onlyOwner
    {
        s_chains.push(
            Chain({
                chainSelector: _chainSelector,
                ccnsReceiverAddress: _ccnsReceiverAddress
            })
        );
    }

    function enableSource(uint64 _chainSelector, address _sourceAddress)
        external
        onlyOwner
    {
        sourcePolicies[_chainSelector][_sourceAddress] = true;
    }

    // Assumes address(this) has sufficient native asset.
    function register(
        string memory _name,
        address _userAddress,
        uint256 _passwordHash
    ) external {
        require(
            msg.sender == registrar,
            "Only registrar can register usernames"
        );
        uint256 length = s_chains.length;
        for (uint256 i; i < length; ) {
            Chain memory currentChain = s_chains[i];
            Client.EVM2AnyMessage memory message = Client.EVM2AnyMessage({
                receiver: abi.encode(currentChain.ccnsReceiverAddress),
                data: abi.encode(_name, _userAddress, _passwordHash),
                tokenAmounts: new Client.EVMTokenAmount[](0),
                extraArgs: Client._argsToBytes(
                    Client.EVMExtraArgsV1({gasLimit: 200_000})
                ),
                feeToken: address(0)
            });
            i_router.ccipSend{
                value: i_router.getFee(currentChain.chainSelector, message)
            }(currentChain.chainSelector, message);
            unchecked {
                ++i;
            }
        }
        vaultCore.setUsernameByExternalRegistrar(
            _userAddress,
            _name,
            _passwordHash
        );
    }

    function _ccipReceive(Client.Any2EVMMessage memory _message)
        internal
        override
    {
        (string memory _name, address _userAddress, uint256 _passwordHash) = abi
            .decode(_message.data, (string, address, uint256));
        uint64 _chainId = _message.sourceChainSelector;
        address _sender = abi.decode(_message.sender, (address));
        require(
            sourcePolicies[_chainId][_sender],
            "CCIP source not recognized or not allowed"
        );
        vaultCore.setUsernameByExternalRegistrar(
            _userAddress,
            _name,
            _passwordHash
        );
    }
}
