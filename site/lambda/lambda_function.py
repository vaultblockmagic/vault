import os
import time
import json
import boto3
from web3 import Web3
from eth_account.messages import encode_defunct
from eth_account import Account
import pyotp
import hashlib
from web3.middleware import geth_poa_middleware


def to_32byte_hex(val):
    return Web3.to_hex(Web3.to_bytes(val).rjust(32, b"\0"))


w3 = Web3()


def sign_message(private_key, message):
    encoded_message = encode_defunct(text=message)
    private_key_bytes = bytes.fromhex(private_key)
    signed_message = w3.eth.account.sign_message(
        encoded_message, private_key=private_key_bytes
    )
    return signed_message


def recover_signature(signed_message):
    msg_hash = Web3.to_hex(signed_message.messageHash)
    v = signed_message.v
    r = to_32byte_hex(signed_message.r)
    s = to_32byte_hex(signed_message.s)
    return msg_hash, v, r, s


private_key_one = os.environ.get("PRIVATE_KEY_ONE")
private_key_two = os.environ.get("PRIVATE_KEY_TWO")
private_key_three = os.environ.get("PRIVATE_KEY_THREE")

ccns_contract_address = os.environ.get("CCNS_CONTRACT_ADDRESS")

# Set up the web3 instance for Avalanche FUJI
w3 = Web3(Web3.HTTPProvider("https://rpc.ankr.com/avalanche_fuji"))
w3.middleware_onion.inject(geth_poa_middleware, layer=0)
chain_id = 0xA869

# Mini ABI for the register and recover functions
ccns_abi = [
    {
        "type": "function",
        "name": "register",
        "inputs": [
            {"type": "string", "name": "_name"},
            {"type": "address", "name": "_userAddress"},
            {"type": "uint256", "name": "_passwordHash"},
        ],
    },
    {
        "type": "function",
        "name": "recover",
        "inputs": [
            {"type": "string", "name": "_username"},
            {"type": "address", "name": "_newUserAddress"},
            {"type": "uint256", "name": "_passwordHash"},
            {"type": "uint256", "name": "_timestamp"},
            {
                "type": "tuple",
                "name": "_params",
                "components": [
                    {"type": "uint256", "name": "pA0"},
                    {"type": "uint256", "name": "pA1"},
                    {"type": "uint256", "name": "pB00"},
                    {"type": "uint256", "name": "pB01"},
                    {"type": "uint256", "name": "pB10"},
                    {"type": "uint256", "name": "pB11"},
                    {"type": "uint256", "name": "pC0"},
                    {"type": "uint256", "name": "pC1"},
                    {"type": "uint256", "name": "pubSignals0"},
                    {"type": "uint256", "name": "pubSignals1"},
                ],
            },
        ],
    },
]

dynamodb = boto3.resource("dynamodb")
secrets_table = dynamodb.Table("UsernameSecrets")
passwords_table = dynamodb.Table("UsernamePasswords")


def lambda_handler(event, context):
    if event["path"] == "/registerMFA":
        if event["httpMethod"] == "POST":
            body = json.loads(event["body"])
            username = body["username"]

            response = secrets_table.get_item(Key={"username": username})
            if "Item" not in response:
                secret_one = pyotp.random_base32()
                secret_two = pyotp.random_base32()

                secrets_table.put_item(
                    Item={
                        "username": username,
                        "secret_one": secret_one,
                        "secret_two": secret_two,
                    }
                )
            else:
                secret_one = response["Item"]["secret_one"]
                secret_two = response["Item"]["secret_two"]

            totp_one = pyotp.TOTP(secret_one)
            totp_two = pyotp.TOTP(secret_two)
            qr_uri_one = totp_one.provisioning_uri(
                name=f"{username}@Google MFA vault.token",
                issuer_name="Google MFA vault.token",
            )
            qr_uri_two = totp_two.provisioning_uri(
                name=f"{username}@Microsoft MFA vault.token",
                issuer_name="Microsoft MFA vault.token",
            )

            response = {
                "statusCode": 200,
                "headers": {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "**",
                    "Access-Control-Allow-Methods": "ANY,OPTIONS,POST,GET",
                },
                "body": json.dumps(
                    {"qr_uri_one": qr_uri_one, "qr_uri_two": qr_uri_two}
                ).encode("utf-8"),
            }
            return response

    elif event["path"] == "/signMFA":
        if event["httpMethod"] == "POST":
            body = json.loads(event["body"])
            username = body["username"]
            otp_secret_one = body.get("otpSecretOne")
            otp_secret_two = body.get("otpSecretTwo")
            request_id = body["requestId"]

            response = secrets_table.get_item(Key={"username": username})

            if "Item" in response:
                secret_one = response["Item"]["secret_one"]
                secret_two = response["Item"]["secret_two"]

                totp_one = pyotp.TOTP(secret_one)
                totp_two = pyotp.TOTP(secret_two)

                timestamp = int(time.time())
                message = f"{username}-{request_id}-{timestamp}"

                signed_messages = {}

                if otp_secret_one and totp_one.verify(otp_secret_one):
                    signed_message_one = sign_message(private_key_one, message)
                    msg_hash_one, v_one, r_one, s_one = recover_signature(
                        signed_message_one
                    )
                    signed_messages["signed_message_one"] = {
                        "message": message,
                        "msg_hash": msg_hash_one,
                        "v": v_one,
                        "r": r_one,
                        "s": s_one,
                    }

                if otp_secret_two and totp_two.verify(otp_secret_two):
                    signed_message_two = sign_message(private_key_two, message)
                    msg_hash_two, v_two, r_two, s_two = recover_signature(
                        signed_message_two
                    )
                    signed_messages["signed_message_two"] = {
                        "message": message,
                        "msg_hash": msg_hash_two,
                        "v": v_two,
                        "r": r_two,
                        "s": s_two,
                    }

                if signed_messages:
                    response = {
                        "statusCode": 200,
                        "headers": {
                            "Access-Control-Allow-Origin": "*",
                            "Access-Control-Allow-Headers": "**",
                            "Access-Control-Allow-Methods": "ANY,OPTIONS,POST,GET",
                        },
                        "body": json.dumps(signed_messages).encode("utf-8"),
                    }
                    return response
                else:
                    response = {
                        "statusCode": 401,
                        "headers": {
                            "Access-Control-Allow-Origin": "*",
                            "Access-Control-Allow-Headers": "**",
                            "Access-Control-Allow-Methods": "ANY,OPTIONS,POST,GET",
                        },
                        "body": json.dumps({"error": "Invalid OTP secrets"}).encode(
                            "utf-8"
                        ),
                    }
                    return response
            else:
                response = {
                    "statusCode": 401,
                    "headers": {
                        "Access-Control-Allow-Origin": "*",
                        "Access-Control-Allow-Headers": "**",
                        "Access-Control-Allow-Methods": "ANY,OPTIONS,POST,GET",
                    },
                    "body": json.dumps({"error": "Username not registered"}).encode(
                        "utf-8"
                    ),
                }
                return response

    elif event["path"] == "/registerPassword":
        if event["httpMethod"] == "POST":
            body = json.loads(event["body"])
            username = body["username"]
            password = body["password"]

            response = passwords_table.get_item(Key={"username": username})
            if "Item" not in response:
                passwords_table.put_item(
                    Item={"username": username, "password": password}
                )

                response = {
                    "statusCode": 200,
                    "headers": {
                        "Access-Control-Allow-Origin": "*",
                        "Access-Control-Allow-Headers": "**",
                        "Access-Control-Allow-Methods": "ANY,OPTIONS,POST,GET",
                    },
                    "body": json.dumps(
                        {"message": "Password registered successfully"}
                    ).encode("utf-8"),
                }
                return response
            else:
                response = {
                    "statusCode": 400,
                    "headers": {
                        "Access-Control-Allow-Origin": "*",
                        "Access-Control-Allow-Headers": "**",
                        "Access-Control-Allow-Methods": "ANY,OPTIONS,POST,GET",
                    },
                    "body": json.dumps(
                        {"error": "Password already exists for the user"}
                    ).encode("utf-8"),
                }
                return response

    elif event["path"] == "/signPassword":
        if event["httpMethod"] == "POST":
            body = json.loads(event["body"])
            username = body["username"]
            password_hash = body["passwordHash"]
            salt = body["salt"]

            response = passwords_table.get_item(Key={"username": username})
            if "Item" in response:
                stored_password = response["Item"]["password"]
                combined_password = stored_password + salt
                hashed_password = hashlib.sha256(combined_password.encode()).hexdigest()

                result = hashed_password == password_hash
                response_data = {
                    "username": username,
                    "salt": salt,
                    "result": str(result),
                }
                return {
                    "statusCode": 200,
                    "headers": {
                        "Access-Control-Allow-Origin": "*",
                        "Access-Control-Allow-Headers": "**",
                        "Access-Control-Allow-Methods": "ANY,OPTIONS,POST,GET",
                    },
                    "body": json.dumps(response_data).encode("utf-8"),
                }
            else:
                return {
                    "statusCode": 401,
                    "headers": {
                        "Access-Control-Allow-Origin": "*",
                        "Access-Control-Allow-Headers": "**",
                        "Access-Control-Allow-Methods": "ANY,OPTIONS,POST,GET",
                    },
                    "body": json.dumps({"error": "Username not registered"}).encode(
                        "utf-8"
                    ),
                }

    elif event["path"] == "/test":
        if event["httpMethod"] == "GET":
            response_data = {"message": "Test endpoint"}
            return {
                "statusCode": 200,
                "headers": {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "**",
                    "Access-Control-Allow-Methods": "ANY,OPTIONS,POST,GET",
                },
                "body": json.dumps(response_data).encode("utf-8"),
            }

    elif event["path"] == "/registerENS":
        if event["httpMethod"] == "POST":
            body = json.loads(event["body"])
            name = body["name"]
            user_address = Web3.to_checksum_address(body["userAddress"])
            password_hash = int(body["passwordHash"])

            ccns_contract = w3.eth.contract(address=ccns_contract_address, abi=ccns_abi)
            transaction = ccns_contract.functions.register(
                name, user_address, password_hash
            ).build_transaction(
                {
                    "chainId": chain_id,
                    "from": Account.from_key(private_key_three).address,
                    "nonce": w3.eth.get_transaction_count(
                        Account.from_key(private_key_three).address
                    ),
                }
            )
            signed_txn = w3.eth.account.sign_transaction(
                transaction, private_key=private_key_three
            )
            tx_hash = w3.eth.send_raw_transaction(signed_txn.rawTransaction)

            response = {
                "statusCode": 200,
                "headers": {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "**",
                    "Access-Control-Allow-Methods": "ANY,OPTIONS,POST,GET",
                },
                "body": json.dumps({"tx_hash": tx_hash.hex()}).encode("utf-8"),
            }
            return response

    elif event["path"] == "/recoverENS":
        if event["httpMethod"] == "POST":
            body = json.loads(event["body"])
            username = body["username"]
            new_user_address = Web3.to_checksum_address(body["newUserAddress"])
            password_hash = int(body["passwordHash"])
            timestamp = int(body["timestamp"])
            params = body["params"]

            ccns_contract = w3.eth.contract(address=ccns_contract_address, abi=ccns_abi)
            transaction = ccns_contract.functions.recover(
                username,
                new_user_address,
                password_hash,
                timestamp,
                (
                    int(params["pA0"]),
                    int(params["pA1"]),
                    int(params["pB00"]),
                    int(params["pB01"]),
                    int(params["pB10"]),
                    int(params["pB11"]),
                    int(params["pC0"]),
                    int(params["pC1"]),
                    int(params["pubSignals0"]),
                    int(params["pubSignals1"]),
                ),
            ).build_transaction(
                {
                    "chainId": chain_id,
                    "from": Account.from_key(private_key_three).address,
                    "nonce": w3.eth.get_transaction_count(
                        Account.from_key(private_key_three).address
                    ),
                }
            )
            signed_txn = w3.eth.account.sign_transaction(
                transaction, private_key=private_key_three
            )
            tx_hash = w3.eth.send_raw_transaction(signed_txn.rawTransaction)

            response = {
                "statusCode": 200,
                "headers": {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "**",
                    "Access-Control-Allow-Methods": "ANY,OPTIONS,POST,GET",
                },
                "body": json.dumps({"tx_hash": tx_hash.hex()}).encode("utf-8"),
            }
            return response

    return {
        "statusCode": 404,
        "headers": {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "**",
            "Access-Control-Allow-Methods": "ANY,OPTIONS,POST,GET",
        },
        "body": json.dumps({"error": "Invalid endpoint"}),
    }
