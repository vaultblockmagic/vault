response=$(curl --request POST --url https://kqysqbam9h.execute-api.ap-southeast-2.amazonaws.com/prod/sign --header 'Content-Type: application/json' --data '{"username": "test.zkp", "otp_secret_one": "479337", "request_id": "1"}')

mfa_provider_data=$(echo "$response" | jq -c '
  [
    [
      "0x519d867B7C97D0C10f6EeECC2ff4318EfeB1461A",
      .signed_message_one.message,
      0,
      "0x0000000000000000000000000000000000000000000000000000000000000000",
      "0x0000000000000000000000000000000000000000000000000000000000000000"
    ],
    [
      "0xbd2858a16d66FAa2C4dBED1c82F1FD7EE742a851",
      .signed_message_one.message,
      .signed_message_one.v,
      .signed_message_one.r,
      .signed_message_one.s
    ]
  ]
')

echo "$mfa_provider_data"