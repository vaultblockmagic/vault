// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./ERCs/MirroredERC721Factory.sol";
import "./ERCs/MirroredERC20Factory.sol";
import "./interfaces/IMirroredERC721.sol";
import "./interfaces/IMirroredERC20.sol";
import "./interfaces/IMFAManager.sol";
import "./interfaces/IExternalAPIMFA.sol";

/*           d8                         88           
`8b         d8'                         88    ,d     
 `8b       d8'                          88    88     
  `8b     d8'  ,adPPYYba,  88       88  88  MM88MMM  
   `8b   d8'   ""     `Y8  88       88  88    88     
    `8b d8'    ,adPPPPP88  88       88  88    88     
     `888'     88,    ,88  "8a,   ,a88  88    88,    
      `8'      `"8bbdP"Y8   `"YbbdP'Y8  88    "Y8*/

contract VaultCore is ERC20 {
    mapping(address => string) public usernames;
    mapping(string => address) public usernameAddress;
    mapping(address => uint256) public passwordHashes;

    //ZKP Solidity verifier
    IGroth16VerifierP2 public passwordVerifier;

    address public owner;
    address public deployer;

    address public mfaManagerAddress;
    IMFAManager public mfaManager;

    MirroredERC721Factory public mirroredERC721Factory;
    MirroredERC20Factory public mirroredERC20Factory;

    address public crossChainNameService;

    constructor(address _mfaManagerAddress, address _passwordVerifier)
        ERC20("vault", "VAULT")
    {
        _mint((address(this)), 10000000000 * 10**18);
        owner = msg.sender;
        deployer = msg.sender;
        mfaManager = IMFAManager(_mfaManagerAddress);
        mfaManagerAddress = _mfaManagerAddress;
        passwordVerifier = IGroth16VerifierP2(_passwordVerifier);
        mirroredERC721Factory = new MirroredERC721Factory();
        mirroredERC20Factory = new MirroredERC20Factory();
    }

    function setCrossChainNameService(address _crossChainNameService) external {
        require(
            msg.sender == owner,
            "Only owner can set CrossChainNameService"
        );
        crossChainNameService = _crossChainNameService;
    }

    function releaseOwnership() public {
        require(msg.sender == owner, "Not owner");
        owner = address(0);
    }

    function vaultTokensFaucet(address _receiver) public {
        require(
            msg.sender == crossChainNameService || msg.sender == _receiver,
            "Only CrossChainNameService or the user can trigger faucet"
        );
        _transfer(address(this), _receiver, 10000 * 10**18);
    }

    function setUsername(
        string memory _username,
        address _userAddress,
        uint256 _passwordHash
    ) external {
        require(
            msg.sender == _userAddress || msg.sender == crossChainNameService,
            "Only the user or CrossChainNameService can set username"
        );
        require(
            bytes(usernames[_userAddress]).length == 0,
            "Username already set"
        );
        usernames[_userAddress] = _username;
        usernameAddress[_username] = _userAddress;
        passwordHashes[_userAddress] = _passwordHash;
        vaultTokensFaucet(_userAddress);
    }

    function resetUsernameAddress(
        string memory _username,
        address _newUserAddress,
        uint256 _passwordHash,
        uint256 _timestamp,
        ProofParameters calldata _params
    ) external {
        address oldUserAddress = usernameAddress[_username];
        require(oldUserAddress != address(0), "Username does not exist");
        require(
            msg.sender == crossChainNameService || msg.sender == oldUserAddress,
            "Only registrar or old user address can reset username"
        );

        // Verify password
        verifyPassword(passwordHashes[oldUserAddress], _timestamp, _params);

        // Recover mirrored ERC20 tokens
        uint256 requestCount = mirroredTokenVaultRequestCount[_username];
        for (uint256 i = 0; i < requestCount; ++i) {
            address mirroredToken = mirroredERC20Tokens[_username][i];
            if (mirroredToken != address(0)) {
                uint256 balance = IMirroredERC20(mirroredToken).balanceOf(
                    oldUserAddress
                );
                if (balance > 0) {
                    // Burn tokens from the old user address
                    IMirroredERC20(mirroredToken).burnFrom(
                        oldUserAddress,
                        balance
                    );
                    // Mint tokens to the new user address
                    IMirroredERC20(mirroredToken).mint(
                        _newUserAddress,
                        balance
                    );
                }
            }
        }

        // Recover mirrored ERC721 tokens
        for (uint256 i = 0; i < requestCount; ++i) {
            address mirroredToken = mirroredERC721Tokens[_username][i];
            if (mirroredToken != address(0)) {
                uint256 tokenId = underlyingERC721TokenIds[_username][i];
                if (
                    IMirroredERC721(mirroredToken).ownerOfToken(tokenId) ==
                    oldUserAddress
                ) {
                    // Burn token from the old user address
                    IMirroredERC721(mirroredToken).burn(tokenId);
                    // Mint token to the new user address
                    IMirroredERC721(mirroredToken).mint(
                        _newUserAddress,
                        tokenId
                    );
                }
            }
        }

        // Reset mappings
        delete usernames[oldUserAddress];
        usernames[_newUserAddress] = _username;
        usernameAddress[_username] = _newUserAddress;
        passwordHashes[_newUserAddress] = _passwordHash;

        vaultTokensFaucet(_newUserAddress);
    }

    function verifyPassword(
        uint256 passwordHash,
        uint256 timestamp,
        ProofParameters calldata params
    ) public view {
        uint256 timeLimit = 600;
        require(timestamp <= block.timestamp);
        require(timestamp >= block.timestamp - timeLimit);

        uint256[2] memory pA = [params.pA0, params.pA1];
        uint256[2][2] memory pB = [
            [params.pB00, params.pB01],
            [params.pB10, params.pB11]
        ];
        uint256[2] memory pC = [params.pC0, params.pC1];
        uint256[2] memory pubSignals = [params.pubSignals0, params.pubSignals1];

        require(
            pubSignals[0] == passwordHash &&
                pubSignals[1] == timestamp &&
                passwordVerifier.verifyProof(pA, pB, pC, pubSignals),
            "ZKP verification failed."
        );
    }

    mapping(string => uint256) public mirroredTokenVaultRequestCount;
    mapping(string => uint256) public mirroredTokenLockRequestCount;
    mapping(string => mapping(uint256 => address)) public mirroredERC20Tokens;
    mapping(string => mapping(uint256 => address)) public mirroredERC721Tokens;
    mapping(string => mapping(uint256 => address)) public lockRequestTokens;
    mapping(string => mapping(uint256 => uint256))
        public underlyingERC721TokenIds;

    event MirroredERC20Minted(
        string username,
        string tokenSymbol,
        uint256 amount
    );

    event MirroredERC721Minted(
        string username,
        string tokenName,
        string tokenSymbol
    );

    function vaultAsset(
        address _token,
        uint256 _amount,
        uint256 _tokenId,
        bool _isERC20,
        address[] memory _mfaProviders
    ) public {
        require(
            _mfaProviders.length > 0,
            "At least one MFA provider is required"
        );

        _transfer(msg.sender, address(this), _mfaProviders.length * 10**18);

        if (_isERC20) {
            require(_amount > 0, "Invalid amount");
            require(
                IERC20(_token).balanceOf(msg.sender) >= _amount,
                "Insufficient balance"
            );
            require(
                IERC20(_token).allowance(msg.sender, address(this)) >= _amount,
                "Insufficient allowance"
            );
            IERC20(_token).transferFrom(msg.sender, address(this), _amount);
        } else {
            require(
                IERC721(_token).ownerOf(_tokenId) == msg.sender,
                "Caller is not owner of token"
            );
            IERC721(_token).transferFrom(msg.sender, address(this), _tokenId);
        }

        string memory username = usernames[msg.sender];
        uint256 requestId = mirroredTokenVaultRequestCount[username];

        if (_isERC20) {
            string memory name = string(
                abi.encodePacked("Mirrored ", ERC20(_token).name())
            );
            string memory symbol = string(
                abi.encodePacked("m", ERC20(_token).symbol())
            );
            address mirroredToken = mirroredERC20Factory.createMirroredERC20(
                name,
                symbol,
                _token,
                requestId,
                username,
                address(this),
                address(this)
            );
            mirroredERC20Tokens[username][requestId] = mirroredToken;
            IMirroredERC20(mirroredToken).mint(msg.sender, _amount);

            emit MirroredERC20Minted(username, ERC20(_token).symbol(), _amount);
        } else {
            string memory name = string(
                abi.encodePacked("Mirrored ", ERC721(_token).name())
            );
            string memory symbol = string(
                abi.encodePacked("m", ERC721(_token).symbol())
            );
            address mirroredToken = mirroredERC721Factory.createMirroredERC721(
                name,
                symbol,
                _token,
                requestId,
                username,
                address(this),
                address(this)
            );
            mirroredERC721Tokens[username][requestId] = mirroredToken;
            underlyingERC721TokenIds[username][requestId] = _tokenId;
            IMirroredERC721(mirroredToken).mint(msg.sender, 0);

            emit MirroredERC721Minted(
                username,
                ERC721(_token).name(),
                ERC721(_token).symbol()
            );
        }

        mirroredTokenVaultRequestCount[username]++;

        mfaManager.setVaultMFAProviders(username, requestId, _mfaProviders);
    }

    function unvaultAsset(
        address _token,
        uint256 _amount,
        uint256 _requestId,
        bool _isERC20
    ) public {
        string memory username = usernames[msg.sender];
        uint256 timeLimit = 3600; // 60 minutes

        for (
            uint256 i = 0;
            i <
            mfaManager.getVaultRequestMFAProviderCount(username, _requestId);
            ++i
        ) {
            IMFAProvider mfaProvider = IMFAProvider(
                mfaManager.getVaultRequestMFAProviders(username, _requestId, i)
            );
            IMFAProvider.MFAData memory mfaData = mfaProvider.getMFAData(
                username,
                _requestId
            );
            require(mfaData.success, "MFA verification failed");
            require(
                mfaData.timestamp >= block.timestamp - timeLimit,
                "MFA data expired"
            );
        }

        if (_isERC20) {
            address mirroredToken = mirroredERC20Tokens[username][_requestId];
            require(
                mirroredToken != address(0),
                "Mirrored token does not exist"
            );
            require(
                IMirroredERC20(mirroredToken).balanceOf(msg.sender) >= _amount,
                "Insufficient mirrored token balance"
            );
            require(
                IERC20(_token).balanceOf(address(this)) >= _amount,
                "Insufficient balance in contract"
            );

            IMirroredERC20(mirroredToken).burnFrom(msg.sender, _amount);
            IERC20(_token).transfer(msg.sender, _amount);
        } else {
            address mirroredToken = mirroredERC721Tokens[username][_requestId];
            require(
                mirroredToken != address(0),
                "Mirrored token does not exist"
            );
            require(
                IMirroredERC721(mirroredToken).ownerOf(0) == msg.sender,
                "Caller is not owner of mirrored token"
            );

            uint256 tokenId = underlyingERC721TokenIds[username][_requestId];
            require(
                IERC721(_token).ownerOf(tokenId) == address(this),
                "Contract is not owner of token"
            );

            IMirroredERC721(mirroredToken).burn(0);
            IERC721(_token).transferFrom(address(this), msg.sender, tokenId);
        }
    }

    function batchVaultAndSetMFA(
        address _token,
        uint256 _amount,
        uint256 _tokenId,
        bool _isERC20,
        uint256 _passwordHash,
        MFAProviderData[] memory _mfaProviderData
    ) external {
        string memory username = usernames[msg.sender];
        uint256 requestId = mirroredTokenVaultRequestCount[username];

        address[] memory mfaProviders = new address[](_mfaProviderData.length);
        for (uint256 i = 0; i < _mfaProviderData.length; ++i) {
            IMFAProvider mfaProvider = IMFAProvider(
                _mfaProviderData[i].providerAddress
            );
            string memory mfaType = mfaProvider.getMFAType();

            if (compareStrings(mfaType, "vaultMFA")) {
                IVaultMFA(address(mfaProvider)).setRequestPasswordHash(
                    username,
                    requestId,
                    _passwordHash
                );
            } else if (compareStrings(mfaType, "ExternalAPIMFA")) {
                IExternalAPIMFA(address(mfaProvider)).sendRequest(
                    _mfaProviderData[i].subscriptionId,
                    username,
                    requestId,
                    _mfaProviderData[i].args
                );
            }

            mfaProviders[i] = _mfaProviderData[i].providerAddress;
        }

        vaultAsset(_token, _amount, _tokenId, _isERC20, mfaProviders);
    }

    function batchUnvaultAndVerifyMFA(
        address _token,
        uint256 _amount,
        uint256 _requestId,
        bool _isERC20,
        uint256 _timestamp,
        ProofParameters memory _params,
        MFAProviderData[] memory _mfaProviderData
    ) external {
        string memory username = usernames[msg.sender];

        require(
            mfaManager.verifyVaultMFA(
                username,
                _requestId,
                _timestamp,
                _params,
                _mfaProviderData
            ),
            "MFA verification failed"
        );

        unvaultAsset(_token, _amount, _requestId, _isERC20);
    }

    function lockAsset(
        address _token,
        bool _isERC20,
        address[] memory _mfaProviders
    ) public {
        require(
            _mfaProviders.length > 0,
            "At least one MFA provider is required"
        );

        string memory username = usernames[msg.sender];
        require(
            keccak256(bytes(username)) ==
                keccak256(
                    bytes(
                        (
                            _isERC20
                                ? IMirroredERC20(_token).getUsername()
                                : IMirroredERC721(_token).getUsername()
                        )
                    )
                ),
            "Username mismatch: token username must match the caller's username"
        );

        uint256 requestId;
        if (mirroredTokenLockRequestCount[username] == 0) {
            requestId = type(uint256).max;
        } else {
            requestId = mirroredTokenLockRequestCount[username] - 1;
        }
        mirroredTokenLockRequestCount[username] = requestId;

        if (_isERC20) {
            IMirroredERC20(_token).lockTokens(requestId);
        } else {
            IMirroredERC721(_token).lockTokens(requestId);
        }

        lockRequestTokens[username][requestId] = _token;

        mfaManager.setLockMFAProviders(username, requestId, _mfaProviders);
    }

    function unlockAsset(uint256 _requestId, bool _isERC20) public {
        string memory username = usernames[msg.sender];
        uint256 timeLimit = 3600; // 60 minutes

        for (
            uint256 i = 0;
            i < mfaManager.getLockRequestMFAProviderCount(username, _requestId);
            ++i
        ) {
            IMFAProvider mfaProvider = IMFAProvider(
                mfaManager.getLockRequestMFAProviders(username, _requestId, i)
            );
            IMFAProvider.MFAData memory mfaData = mfaProvider.getMFAData(
                username,
                _requestId
            );
            require(mfaData.success, "MFA verification failed");
            require(
                mfaData.timestamp >= block.timestamp - timeLimit,
                "MFA data expired"
            );
        }

        address mirroredToken = lockRequestTokens[username][_requestId];

        if (_isERC20) {
            IMirroredERC20(mirroredToken).unlockTokens();
        } else {
            IMirroredERC721(mirroredToken).unlockTokens();
        }
    }

    function batchLockAndSetMFA(
        address _token,
        bool _isERC20,
        MFAProviderData[] memory _mfaProviderData,
        uint256 _passwordHash
    ) external {
        string memory username = usernames[msg.sender];

        uint256 requestId;
        if (mirroredTokenLockRequestCount[username] == 0) {
            requestId = type(uint256).max;
        } else {
            requestId = mirroredTokenLockRequestCount[username] - 1;
        }

        address[] memory mfaProviders = new address[](_mfaProviderData.length);
        for (uint256 i = 0; i < _mfaProviderData.length; ++i) {
            IMFAProvider mfaProvider = IMFAProvider(
                _mfaProviderData[i].providerAddress
            );
            string memory mfaType = mfaProvider.getMFAType();

            if (compareStrings(mfaType, "vaultMFA")) {
                IVaultMFA(address(mfaProvider)).setRequestPasswordHash(
                    username,
                    requestId,
                    _passwordHash
                );
            } else if (compareStrings(mfaType, "ExternalAPIMFA")) {
                IExternalAPIMFA(address(mfaProvider)).sendRequest(
                    _mfaProviderData[i].subscriptionId,
                    username,
                    requestId,
                    _mfaProviderData[i].args
                );
            }

            mfaProviders[i] = _mfaProviderData[i].providerAddress;
        }

        lockAsset(_token, _isERC20, mfaProviders);
    }

    function batchUnlockAndVerifyMFA(
        uint256 _requestId,
        bool _isERC20,
        uint256 _timestamp,
        ProofParameters memory _params,
        MFAProviderData[] memory _mfaProviderData
    ) external {
        string memory username = usernames[msg.sender];

        require(
            mfaManager.verifyLockMFA(
                username,
                _requestId,
                _timestamp,
                _params,
                _mfaProviderData
            ),
            "MFA verification failed"
        );

        unlockAsset(_requestId, _isERC20);
    }

    function compareStrings(string memory a, string memory b)
        public
        pure
        returns (bool)
    {
        return keccak256(abi.encodePacked(a)) == keccak256(abi.encodePacked(b));
    }
}
