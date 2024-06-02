## Deployment Sequence:

1. **Set Compiler:**
   - Set compiler to latest version, EVM version Paris, with 200 optimizations.

2. **Deploy Contracts:**
   - Deploy the Password Verifier contract.
   - Deploy the MFAManager contract.
   - Deploy the vaultCore contract, passing the address of the MFAManager contract and the password verifier contract.
   - Deploy the vaultMFA contract, passing the address of the Verifier contract and the address of the vaultCore contract.
   - Set the vaultMFA, vaultCore Address in the MFAManager contract by calling the appropriate set functions.
   - Deploy the ExternalSignerMFA contracts (for 0x1111 and 0x2222), passing the address of the external signer.
   - Deploy VRFv2SubscriptionManager.sol and obtain the subscription ID.
   - Deploy VRF.sol with subscription ID.
   - Add the VRF contract as a consumer in VRFv2SubscriptionManager.
   - Fund the subscription on vrf.chain.link.
   - Deploy ExternalAPIMFA(ArbitrumSepolia|AvalancheFuji).sol passing the address of the deployed VRF contract.
   - Authorize the ExternalAPIMFA contract in the VRF contract.
   - Register ExternalAPIMFA contract for a custom-logic automation trigger and fund on automation.chain.link.
   - Register ExternalAPIMFA contract as a chainlink function and fund on functions.chain.link.
   - Deploy CrossChainNameService.sol with vaultCore contract address and appropriate parameters.
   - Fund CrossChainNameService contract with native asset (ETH/AVAX, etc.).
   - Call `setCrossChainNameService` in vaultCore contract.
   - Call `enableChain` and `enableSource` in CrossChainNameService to enable valid destination and source policies. 
   - Fund the registrar in native asset
   - Deploy TestERC20 (if needed/wanted for test tokens).
   - Deploy TestERC721 (if needed/wanted for test tokens).

## ExternalSignerMFA Addresses:

- ExternalSignerMFA 1:
  - Address: 0x1111697F4dA79a8e7969183d8aBd838572E50FF3
  - Key: 819843e94a6e40bb59127970c282468328cdeff87ef58299daa9ff1b98400f67

- ExternalSignerMFA 2:
  - Address: 0x2222E49A58e8238c864b7512e6C87886Aa0B6318
  - Key: a76c92f6a95175ca91b6f8def794793ad5e28517e5bbdf870ca3eeb9da1816bb

## Avalanche Fuji chainlink variables:

- CCIP Router address: 0xF694E193200268f9a4868e4Aa017A0118C9a8177
- Chain selector: 14767482510784806043
- LINK address: 0x0b9d5D9136855f6FEc3c0993feE6E9CE8a297846
- Functions router: 0xA9d587a00A31A52Ed70D6026794a8FC5E2F5dCb0
- DON ID: 0x66756e2d6176616c616e6368652d66756a692d31000000000000000000000000
- Key hash: 0x354d2f95da55398f44b7cff77da56283d9c6c829a4bdf1bbcaf2ad6a4d081f61
- VRF coordinator: 0x2eD832Ba664535e5886b75D64C46EB9a228C2610
- Minimum Confirmations: 1 

## Arbitrum Sepolia chainlink variables:

- CCIP Router address: 0x2a9C5afB0d0e4BAb2BCdaE109EC4b0c4Be15a165
- Chain selector: 3478487238524512106
- LINK address: 0xb1D4538B4571d411F07960EF2838Ce337FE1E80E
- Functions router: 0x234a5fb5Bd614a7AA2FfAB244D603abFA0Ac5C5C
- DON ID: 0x66756e2d617262697472756d2d7365706f6c69612d3100000000000000000000
- Key hash: 0x027f94ff1465b3525f9fc03e9ff7d6d2c0953482246dd6ae07570c45d6631414
- VRF coordinator: 0x50d47e4142598E3411aA864e08a44284e471AC6f
- Minimum Confirmations: 1 

## Test Sequence:

1. **Test ExternalSignerMFA Contract:**
   - Call the `setValue` function with valid and invalid parameters to ensure proper behavior.
   - Verify that the `MFARequestData` is correctly updated after calling `setValue`.
   - Test the `getMFAData` function to retrieve the stored MFA data.

2. **Test ExternalAPIMFA Contract:**
   - Register username and password with API with 
      ```
      curl --request POST --url https://kqysqbam9h.execute-api.ap-southeast-2.amazonaws.com/prod/registerPassword --header 'Content-Type: application/json' --data '{
         "username": "tester.vault",
         "password": "password"                                                            
      }'
      ```
   - Obtain the current random number `r` with getCurrentRandomNumber.
   - Calculate it the SHA256 `s` of the (`password` + `string(r)`).
   - Call `sendRequest` with the chainlink functions subscription ID, username (`tester.zkp`), MFA request ID (any number will do), and `[username, r, s]`
   - Check that calling `getMFAData(username, mfaRequestID)` returns true. 

3. **Test vaultMFA Contract:**
   - Register a username first with the setUsername function in vaultCore
   - Call the `setRequestPasswordHash` function from the vaultCore/vaultMFA contract and verify that the password hash is correctly set.
   - Call the `setMFAData` function with valid and invalid proof parameters and verify the expected behavior.
   - Test the `getMFAData` function to retrieve the stored MFA data.

4. **Test MFAManager Contract:**
   - Call the `setMFAProviders` function and verify that the MFA providers are correctly set for a given username and request ID.
   - Verify that the `getVaultRequestMFAProviderCount` and `getVaultRequestMFAProviders` functions return the correct values.
   - Test the `verifyMFA` function with valid and invalid MFA provider data and proof parameters. Complete first step of 4 if necessary.
   - Repeat procedure for both vault and lock functions.

5. **Test vaultCore Contract:**
   - Set a username and password hash using the `setUsername` function.
   - Retrieve some vault VAULT tokens via vaultTokensFaucet.
   - Approve ERC20, ERC721 assets that mirroring will be tested with.
   - Lock an asset (ERC20 or ERC721) using the `lockAsset` function and verify that the mirrored tokens are minted correctly.
   - Verify that the `MirroredERC20Minted` and `MirroredERC721Minted` events are emitted with the correct data.
   - Test the `unlockAsset` function by providing valid MFA data and verifying that the original tokens are transferred back to the user and the mirrored tokens are burned.
   - Test that unlocking ERC20s in different quantities (that are not the full amount mirrored) works.
   - Test that unlocking more than should be possible for both ERC20s and ERC721s fails.
   - Test the `batchLockAndSetMFA` and `batchUnlockAndVerifyMFA` functions with various combinations of MFA providers and verify the expected behavior.
   - Deploy some mirrored ERC721 and ERC20 at address and approve the vaultCore contract as prerequisite for next test.
   - Test the `resetUsernameAddress` function recovers mirrored assets successfully and that mirrored assets can be unlocked for underlying assets afterwards. 
   - Ensure that mirrored assets can be locked permanently and temporarily (moreso a `MirroredERC20/721` test).
   - Ensure that mirrored assets can be locked, batch locked, unlocked, batch unlocked.

6. **Test the CrossChainNameService Contract:**
   - Ensure `register` succeeds via registrar and works multichain.
   - Ensure `recover` succeeds via registrar and works multichain.

7. **End-to-End Tests:**
   - Perform a complete flow of locking an asset, setting MFA data, and unlocking the asset using the vaultCore contract.
   - Verify that the MFA verification process works correctly and the assets are transferred as expected.

---

## Block Explorers:

- https://testnet.snowtrace.io
- https://sepolia.arbiscan.io

## Addresses (on Avalanche Fuji & Arbitrum Sepolia):

-  Groth16Verifier:           0xab9fb9F3eC81292b518bfd466B354f24A2018a74
-  MFAManager:                0xf38DA3627847D5eECB37B0C5573F7f327bba8cE0
-  vaultCore:                 0xA2673321CC16643103212C52A3118d52D69866A1
-  vaultMFA:                  0xB9506dC2B7294842072E11b6BAED550DA3d8F455
-  ExternalSignerMFA:         0xA755E55b2a177d626B6e5db8C400aEc9C7Bc0Eb5
-  ExternalSignerMFA:         0x329e4D3Cb8Fe41cfbB6D58DE9CDcef59E0eb8201
-  VRF:                       0xE03ad403EA33131CcB41E28f59B7AEA380561934
-  VRFV2SubscriptionManager:  0x801B1EEA2B48c0c7c88eCB8faD676523EDC3Cc78
-  ExternalAPIMFA:            0x661B556d4756C835D3A72779aCB32612E4243B56 (Chainlink Automation, VRF, Functions)
-  CCNS:                      0x8C3e8e3AC6d64382f8AEE1148bFb8fF7Ab374654 (Chainlink CCIP)
-  TokenDataRetriever:        0xF528968d8dF0C638e0aF5a3f3a62a33BE9D18F95

---

## Chainlink Links - Avalanche Fuji:

- https://ccip.chain.link/address/0x8c3e8e3ac6d64382f8aee1148bfb8ff7ab374654 (CCIP CCNS)
- https://vrf.chain.link/fuji/2807 (consumer 0xE03ad403EA33131CcB41E28f59B7AEA380561934 used in ExternalAPIMFA)
- https://automation.chain.link/fuji/90525461017520113338357357821487944620473985164473663587279624792819107389409
- https://functions.chain.link/fuji/8928

## Chainlink Links - Arbitrum Sepolia:

- https://ccip.chain.link/address/0x8c3e8e3ac6d64382f8aee1148bfb8ff7ab374654 (CCIP ENS)
- https://vrf.chain.link/arbitrum-sepolia/393 (consumer 0xE03ad403EA33131CcB41E28f59B7AEA380561934 used in ExternalAPIMFA)
- https://automation.chain.link/arbitrum-sepolia/42159563703683229980886531494566954465680530119000057758684849594520480333437
- https://functions.chain.link/arbitrum-sepolia/83

### note: The automation for Fuji link doesn't seem to reflect the true spending/transactions - 

https://testnet.snowtrace.io/address/0x661B556d4756C835D3A72779aCB32612E4243B56 - Address of ExternalAPIMFA
https://testnet.snowtrace.io/tx/0xf394d6d240cdcb4f248411ebae69c93bc57d980dae057b95ce0a033b6efe2411/eventlog?chainId=43113 - Internal Tx with Upkeep performed
