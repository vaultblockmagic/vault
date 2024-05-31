// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "../interfaces/IVRF.sol";
import "../interfaces/IMFAProvider.sol";
import {FunctionsClient} from "@chainlink/contracts@1.1.0/src/v0.8/functions/v1_0_0/FunctionsClient.sol";
import {ConfirmedOwner} from "@chainlink/contracts@1.1.0/src/v0.8/shared/access/ConfirmedOwner.sol";
import {FunctionsRequest} from "@chainlink/contracts@1.1.0/src/v0.8/functions/v1_0_0/libraries/FunctionsRequest.sol";
import "@chainlink/contracts/src/v0.8/automation/AutomationCompatible.sol";

contract ExternalAPIMFA is
    FunctionsClient,
    ConfirmedOwner,
    AutomationCompatibleInterface,
    IMFAProvider
{
    using FunctionsRequest for FunctionsRequest.Request;

    IVRF private vrf;

    mapping(string => mapping(uint256 => uint256)) public mfaRequestIdToSalt;
    mapping(string => mapping(uint256 => uint256)) public mfaRequestIdToWindow;
    mapping(string => mapping(uint256 => bytes32))
        public mfaRequestIdToFunctionRequestId;
    mapping(bytes32 => string) public functionRequestIdToResponse;
    mapping(bytes32 => uint256) public functionRequestIdToTimestamp;

    uint256 public WINDOW_SIZE = 50000;
    mapping(uint256 => bool) public windowVRFRequested;
    mapping(uint256 => uint256) public windowToVRFRequestIds;

    bytes32 public s_lastRequestId;
    bytes public s_lastResponse;
    bytes public s_lastError;

    error UnexpectedRequestID(bytes32 requestId);

    event Response(
        bytes32 indexed requestId,
        string result,
        bytes response,
        bytes err
    );

    address router = 0x234a5fb5Bd614a7AA2FfAB244D603abFA0Ac5C5C;

    string source =
        'const apiResponse = await Functions.makeHttpRequest({"url": \'https://kqysqbam9h.execute-api.ap-southeast-2.amazonaws.com/prod/signPassword\',"method": "POST","data": {"username": args[0],"passwordHash": args[1],"salt": args[2]}});if (apiResponse.error) {throw Error("Request failed: " + args[0] + " " + args[1] + " " + args[2]);} const { data } = apiResponse;return Functions.encodeString(data.username+"-"+data.salt+"-"+data.result);';

    uint32 gasLimit = 300000;

    bytes32 donID =
        0x66756e2d617262697472756d2d7365706f6c69612d3100000000000000000000;

    constructor(address _vrfAddress)
        FunctionsClient(router)
        ConfirmedOwner(msg.sender)
    {
        vrf = IVRF(_vrfAddress);
    }

    function setWindowSize(uint256 _window) public onlyOwner {
        WINDOW_SIZE = _window;
    }

    function checkUpkeep(bytes calldata)
        external
        view
        override
        returns (bool upkeepNeeded, bytes memory)
    {
        uint256 currentWindow = block.number / WINDOW_SIZE;
        uint256 priorWindow = currentWindow - 1;
        upkeepNeeded = ((!windowVRFRequested[currentWindow]) ||
            (!windowVRFRequested[priorWindow]));
    }

    function performUpkeep(bytes calldata) external override {
        uint256 currentWindow = block.number / WINDOW_SIZE;
        uint256 priorWindow = currentWindow - 1;

        if (!windowVRFRequested[priorWindow]) {
            windowToVRFRequestIds[priorWindow] = vrf.requestRandomWords();
            windowVRFRequested[priorWindow] = true;
        }

        if (!windowVRFRequested[currentWindow]) {
            windowToVRFRequestIds[currentWindow] = vrf.requestRandomWords();
            windowVRFRequested[currentWindow] = true;
        }
    }

    function getRandomNumber(uint256 _window) public view returns (uint256) {
        uint256 requestId = windowToVRFRequestIds[_window];
        (bool fulfilled, uint256[] memory randomWords) = vrf.getRequestStatus(
            requestId
        );
        require(fulfilled, "Random words not yet fulfilled");
        require(randomWords.length > 0, "No random words returned");

        return randomWords[0];
    }

    function getCurrentRandomNumber() public view returns (uint256) {
        uint256 currentWindow = block.number / WINDOW_SIZE;
        return getRandomNumber(currentWindow);
    }

    function getPriorRandomNumber() public view returns (uint256) {
        uint256 priorWindow = (block.number / WINDOW_SIZE) - 1;
        return getRandomNumber(priorWindow);
    }

    function sendRequest(
        uint64 subscriptionId,
        string calldata username,
        uint256 mfaRequestId,
        string[] calldata args
    ) external returns (bytes32 requestId) {
        uint256 currentWindow = block.number / WINDOW_SIZE;
        uint256 priorWindow = currentWindow - 1;

        require(
            windowVRFRequested[currentWindow] ||
                windowVRFRequested[priorWindow],
            "No VRF available in the current or previous window"
        );

        uint256 expectedSalt = getRandomNumber(
            windowVRFRequested[currentWindow] ? currentWindow : priorWindow
        );
        require(
            stringToUint(args[2]) == expectedSalt,
            "Supplied salt does not match the expected salt"
        );

        mfaRequestIdToSalt[username][mfaRequestId] = expectedSalt;
        mfaRequestIdToWindow[username][mfaRequestId] = currentWindow;

        FunctionsRequest.Request memory req;
        req.initializeRequestForInlineJavaScript(source);
        req.setArgs(args);

        s_lastRequestId = _sendRequest(
            req.encodeCBOR(),
            subscriptionId,
            gasLimit,
            donID
        );

        mfaRequestIdToFunctionRequestId[username][
            mfaRequestId
        ] = s_lastRequestId;

        return s_lastRequestId;
    }

    function fulfillRequest(
        bytes32 requestId,
        bytes memory response,
        bytes memory err
    ) internal override {
        if (s_lastRequestId != requestId) {
            revert UnexpectedRequestID(requestId); // Check if request IDs match
        }

        // Update the contract's state variables with the response and any errors
        s_lastResponse = response;
        s_lastError = err;

        // Emit an event to log the response
        emit Response(requestId, string(response), s_lastResponse, s_lastError);

        functionRequestIdToResponse[requestId] = string(response);
        functionRequestIdToTimestamp[requestId] = block.timestamp;
    }

    function getMFAData(string memory username, uint256 mfaRequestId)
        external
        view
        returns (MFAData memory)
    {
        bytes32 functionRequestId = mfaRequestIdToFunctionRequestId[username][
            mfaRequestId
        ];
        string memory response = functionRequestIdToResponse[functionRequestId];
        uint256 timestamp = functionRequestIdToTimestamp[functionRequestId];

        (
            string memory parsedUsername,
            string memory parsedSalt,
            string memory parsedResult
        ) = parseMessage(response);

        uint256 salt = mfaRequestIdToSalt[username][mfaRequestId];

        if (
            compareStrings(parsedUsername, username) &&
            compareStrings(parsedResult, "True") &&
            stringToUint(parsedSalt) == salt
        ) {
            return MFAData(true, block.timestamp);
        } else {
            return MFAData(false, block.timestamp);
        }
    }

    function parseMessage(string memory message)
        public
        pure
        returns (
            string memory,
            string memory,
            string memory
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
        string memory salt = substring(message, dashIndex1 + 1, dashIndex2);
        string memory result = substring(
            message,
            dashIndex2 + 1,
            messageBytes.length
        );

        return (username, salt, result);
    }

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

    function stringToUint(string memory str) public pure returns (uint256) {
        bytes memory strBytes = bytes(str);
        uint256 result = 0;
        for (uint256 i = 0; i < strBytes.length; i++) {
            uint256 digit = uint256(uint8(strBytes[i])) - 48;
            require(digit >= 0 && digit <= 9, "Invalid character in string");
            result = result * 10 + digit;
        }
        return result;
    }

    function uintToString(uint256 value) public pure returns (string memory) {
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

    function compareStrings(string memory a, string memory b)
        public
        pure
        returns (bool)
    {
        return (keccak256(abi.encodePacked((a))) ==
            keccak256(abi.encodePacked((b))));
    }

    function _bytes32ToUint(bytes32 _bytes32) internal pure returns (uint256) {
        return uint256(_bytes32);
    }

    function getMFAType() external pure override returns (string memory) {
        return "ExternalAPIMFA";
    }
}
