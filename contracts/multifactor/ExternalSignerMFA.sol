// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "../interfaces/IMFAProvider.sol";

contract ExternalSignerMFA is IMFAProvider {
    address public externalSigner;

    mapping(string => mapping(uint256 => MFAData)) public MFARequestData;

    constructor(address _externalSigner) {
        externalSigner = _externalSigner;
    }

    function setValue(
        string memory username,
        uint256 requestId,
        uint256 timestamp,
        string memory message,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) public {
        uint256 timeLimit = 3600; // 60 minutes
        require(timestamp <= block.timestamp);
        require(timestamp >= block.timestamp - timeLimit);

        (
            string memory parsedUsername,
            uint256 parsedRequestId,
            uint256 parsedTimestamp
        ) = parseMessage(message);

        require(
            keccak256(abi.encodePacked(parsedUsername)) ==
                keccak256(abi.encodePacked(username)) &&
                parsedRequestId == requestId &&
                parsedTimestamp == timestamp,
            "Invalid message"
        );

        bytes32 hash = hashMessage(message);
        require(
            ecrecover(hash, v, r, s) == externalSigner,
            "Invalid signature"
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

    // Helper function to parse the concatenated message
    function parseMessage(string memory message)
        public
        pure
        returns (
            string memory,
            uint256,
            uint256
        )
    {
        bytes memory messageBytes = bytes(message);
        uint256 dashIndex1 = findDashIndex(messageBytes, 0);
        uint256 dashIndex2 = findDashIndex(messageBytes, dashIndex1 + 1);

        require(
            dashIndex1 > 0 && dashIndex2 > dashIndex1,
            "Invalid message format"
        );

        string memory username = substring(message, 0, dashIndex1);
        uint256 requestId = stringToUint(
            substring(message, dashIndex1 + 1, dashIndex2)
        );
        uint256 timestamp = stringToUint(
            substring(message, dashIndex2 + 1, messageBytes.length)
        );

        return (username, requestId, timestamp);
    }

    // Helper function to find the index of the next dash ('-') character
    function findDashIndex(bytes memory data, uint256 startIndex)
        internal
        pure
        returns (uint256)
    {
        for (uint256 i = startIndex; i < data.length; i++) {
            if (data[i] == "-") {
                return i;
            }
        }
        return data.length;
    }

    // Helper function to extract a substring from a string
    function substring(
        string memory str,
        uint256 startIndex,
        uint256 endIndex
    ) internal pure returns (string memory) {
        bytes memory strBytes = bytes(str);
        bytes memory result = new bytes(endIndex - startIndex);
        for (uint256 i = startIndex; i < endIndex; i++) {
            result[i - startIndex] = strBytes[i];
        }
        return string(result);
    }

    // Helper function to convert a string to uint256
    function stringToUint(string memory str) internal pure returns (uint256) {
        bytes memory strBytes = bytes(str);
        uint256 result = 0;
        for (uint256 i = 0; i < strBytes.length; i++) {
            uint256 digit = uint256(uint8(strBytes[i])) - 48;
            require(digit >= 0 && digit <= 9, "Invalid character in string");
            result = result * 10 + digit;
        }
        return result;
    }

    function returnTimestamp() public view returns (uint256) {
        return block.timestamp;
    }

    function ecr(
        bytes32 msgh,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) public pure returns (address sender) {
        return ecrecover(msgh, v, r, s);
    }

    function hashMessage(string memory message) public pure returns (bytes32) {
        string memory prefix = "\x19Ethereum Signed Message:\n";
        uint256 length = bytes(message).length;
        string memory messageLength = uintToString(length);
        string memory prefixedMessage = string(
            abi.encodePacked(prefix, messageLength, message)
        );

        return keccak256(abi.encodePacked(prefixedMessage));
    }

    // Helper function to convert uint to string
    function uintToString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }

    function getMFAType() external pure override returns (string memory) {
        return "ExternalSignerMFA";
    }
}
