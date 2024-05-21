import sys
import hashlib


def compute_password_hash(password, salt):
    combined_password = password + salt
    hashed_password = hashlib.sha256(combined_password.encode()).hexdigest()
    return hashed_password


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python script.py <password> <salt>")
        sys.exit(1)

    password = sys.argv[1]
    salt = sys.argv[2]

    password_hash = compute_password_hash(password, salt)
    print("Password Hash:", password_hash)
