// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "../interfaces/IGroth16VerifierP2.sol";
import "../interfaces/IzkVaultCore.sol";

contract zkVaultMFA {
    IGroth16VerifierP2 private passwordVerifier;

    struct MFAData {
        bool success;
        uint256 timestamp;
    }

    mapping(string => mapping(uint256 => uint256))
        public MFARequestPasswordHashes;
    mapping(string => mapping(uint256 => MFAData)) public MFARequestData;

    address public zkVaultCoreAddress;

    constructor(address _passwordVerifier, address _zkVaultCoreAddress) {
        passwordVerifier = IGroth16VerifierP2(_passwordVerifier);
        zkVaultCoreAddress = _zkVaultCoreAddress;
    }

    function setRequestPasswordHash(
        string memory username,
        uint256 requestId,
        uint256 requestPasswordHash
    ) external {
        require(
            msg.sender == zkVaultCoreAddress ||
                IzkVaultCore(zkVaultCoreAddress).usernameAddress(username) ==
                msg.sender ||
                msg.sender ==
                IzkVaultCore(zkVaultCoreAddress).mfaManagerAddress(),
            "Only the zkVaultCore contract or the owner of the username can set the password hash"
        );
        MFARequestPasswordHashes[username][requestId] = requestPasswordHash;
    }

    function setMFAData(
        string memory username,
        uint256 requestId,
        uint256 timestamp,
        ProofParameters calldata params
    ) external {
        uint256 timeLimit = 600;
        require(timestamp <= block.timestamp);
        require(timestamp >= block.timestamp - timeLimit);

        require(
            msg.sender == zkVaultCoreAddress ||
                IzkVaultCore(zkVaultCoreAddress).usernameAddress(username) ==
                msg.sender ||
                msg.sender ==
                IzkVaultCore(zkVaultCoreAddress).mfaManagerAddress(),
            "Only the zkVaultCore contract or the owner of the username can set the MFA data"
        );

        uint256[2] memory pA = [params.pA0, params.pA1];
        uint256[2][2] memory pB = [
            [params.pB00, params.pB01],
            [params.pB10, params.pB11]
        ];
        uint256[2] memory pC = [params.pC0, params.pC1];
        uint256[2] memory pubSignals = [params.pubSignals0, params.pubSignals1];

        require(
            pubSignals[0] == MFARequestPasswordHashes[username][requestId] &&
                pubSignals[1] == timestamp &&
                passwordVerifier.verifyProof(pA, pB, pC, pubSignals),
            "ZKP verification failed."
        );

        MFARequestData[username][requestId].success = true;
        MFARequestData[username][requestId].timestamp = block.timestamp;
    }

    function getMFAData(string memory username, uint256 requestId)
        external
        view
        returns (MFAData memory)
    {
        return MFARequestData[username][requestId];
    }
}
