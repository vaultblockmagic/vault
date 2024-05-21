import os
import time
from web3 import Web3, EthereumTesterProvider
from eth_account.messages import encode_defunct
from eth_account import Account

def to_32byte_hex(val):
    return Web3.to_hex(Web3.to_bytes(val).rjust(32, b'\0'))

w3 = Web3()

def sign_message(private_key, message):
    # Encode the message
    encoded_message = encode_defunct(text=message)
    # Convert private key from string to bytes
    private_key_bytes = bytes.fromhex(private_key)
    # Sign the message
    signed_message = w3.eth.account.sign_message(encoded_message, private_key=private_key_bytes)
    return signed_message

def recover_signature(signed_message):
    # Extract the necessary components
    msg_hash = Web3.to_hex(signed_message.messageHash)
    v = signed_message.v
    r = to_32byte_hex(signed_message.r)
    s = to_32byte_hex(signed_message.s)
    return msg_hash, v, r, s

# Read private key from environment variable
private_key = os.environ.get("PRIVATE_KEY")

# Example username, requestId, and timestamp
username = "exampleuser"
request_id = 123
timestamp = int(time.time())

# Concatenate username, requestId, and timestamp into a single string
message = f"{username}-{request_id}-{timestamp}"

# Sign the message
signed_message = sign_message(private_key, message)

print("Signed message:", signed_message)

# Recover signature components
msg_hash, v, r, s = recover_signature(signed_message)

print()
print("username", username)
print("timestamp", timestamp)
print("request_id", request_id)
print("Message hash:", msg_hash)
print("message", message)
print("v:", v)
print("r:", r)
print("s:", s)