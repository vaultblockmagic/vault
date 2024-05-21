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
   - Deploy TestERC20.
   - Deploy TestERC721.
   - Deploy VRFv2SubscriptionManager.sol and obtain the subscription ID.
   - Deploy VRF.sol with subscription ID.
   - Add the VRF contract as a consumer in VRFv2SubscriptionManager.
   - Fund the subscription on vrf.chain.link.
   - Deploy ExternalAPIMFA.sol passing the address of the deployed VRF contract.
   - Authorize the ExternalAPIMFA contract in the VRF contract.
   - Register ExternalAPIMFA contract for a custom-logic automation trigger and fund on automation.chain.link.
   - Register ExternalAPIMFA contract as a chainlink function and fund on functions.chain.link.

## ExternalSignerMFA Addresses:

- ExternalSignerMFA 1:
  - Address: 0x1111697F4dA79a8e7969183d8aBd838572E50FF3
  - Key: 819843e94a6e40bb59127970c282468328cdeff87ef58299daa9ff1b98400f67

- ExternalSignerMFA 2:
  - Address: 0x2222E49A58e8238c864b7512e6C87886Aa0B6318
  - Key: a76c92f6a95175ca91b6f8def794793ad5e28517e5bbdf870ca3eeb9da1816bb

## Arbitrum Sepolia VRF values:

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

5. **End-to-End Tests:**
   - Perform a complete flow of locking an asset, setting MFA data, and unlocking the asset using the vaultCore contract.
   - Verify that the MFA verification process works correctly and the assets are transferred as expected.
