import os
import time
import json
import boto3
from web3 import Web3
from eth_account.messages import encode_defunct
from eth_account import Account
import pyotp
import hashlib


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

    return {
        "statusCode": 404,
        "headers": {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "**",
            "Access-Control-Allow-Methods": "ANY,OPTIONS,POST,GET",
        },
        "body": json.dumps({"error": "Invalid endpoint"}),
    }
