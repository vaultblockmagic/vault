## Deployment Sequence:

1. **Set Compiler:**
   - Set compiler to version 0.8.24, EVM version Paris, with 200 optimizations.

2. **Deploy Contracts:**
   - Deploy the Password Verifier contract.
   - Deploy the MFAManager contract.
   - Deploy the zkVaultCore contract, passing the address of the MFAManager contract and the password verifier contract.
   - Deploy the zkVaultMFA contract, passing the address of the Verifier contract and the address of the zkVaultCore contract.
   - Set the zkVaultMFA, zkVaultCore Address in the MFAManager contract by calling the appropriate set functions.
   - Deploy the ExternalSignerMFA contracts (for 0x1111 and 0x2222), passing the address of the external signer.
   - Deploy TestERC20.
   - Deploy TestERC721.

## ExternalSignerMFA Addresses:

- ExternalSignerMFA 1:
  - Address: 0x1111697F4dA79a8e7969183d8aBd838572E50FF3
  - Key: 819843e94a6e40bb59127970c282468328cdeff87ef58299daa9ff1b98400f67

- ExternalSignerMFA 2:
  - Address: 0x2222E49A58e8238c864b7512e6C87886Aa0B6318
  - Key: a76c92f6a95175ca91b6f8def794793ad5e28517e5bbdf870ca3eeb9da1816bb

## Test Sequence:

1. **Test ExternalSignerMFA Contract:**
   - Call the `setValue` function with valid and invalid parameters to ensure proper behavior.
   - Verify that the `MFARequestData` is correctly updated after calling `setValue`.
   - Test the `getMFAData` function to retrieve the stored MFA data.

2. **Test zkVaultMFA Contract:**
   - Register a username first with the setUsername function in zkVaultCore
   - Call the `setRequestPasswordHash` function from the zkVaultCore/zkVaultMFA contract and verify that the password hash is correctly set.
   - Call the `setMFAData` function with valid and invalid proof parameters and verify the expected behavior.
   - Test the `getMFAData` function to retrieve the stored MFA data.

3. **Test MFAManager Contract:**
   - Call the `setMFAProviders` function and verify that the MFA providers are correctly set for a given username and request ID.
   - Verify that the `getVaultRequestMFAProviderCount` and `getVaultRequestMFAProviders` functions return the correct values.
   - Test the `verifyMFA` function with valid and invalid MFA provider data and proof parameters. Complete first step of 4 if necessary.

4. **Test zkVaultCore Contract:**
   - Set a username and password hash using the `setUsername` function.
   - Retrieve some zkVault VAULT tokens via vaultTokensFaucet.
   - Approve ERC20, ERC721 assets that mirroring will be tested with.
   - Lock an asset (ERC20 or ERC721) using the `lockAsset` function and verify that the mirrored tokens are minted correctly.
   - Verify that the `MirroredERC20Minted` and `MirroredERC721Minted` events are emitted with the correct data.
   - Test the `unlockAsset` function by providing valid MFA data and verifying that the original tokens are transferred back to the user and the mirrored tokens are burned.
   - Test that unlocking ERC20s in different quantities (that are not the full amount mirrored) works.
   - Test that unlocking more than should be possible for both ERC20s and ERC721s fails.
   - Test the `batchLockAndSetMFA` and `batchUnlockAndVerifyMFA` functions with various combinations of MFA providers and verify the expected behavior.
   - Deploy some mirrored ERC721 and ERC20 at address and approve the zkVaultCore contract as prerequisite for next test.
   - Test the `resetUsernameAddress` function recovers mirrored assets successfully and that mirrored assets can be unlocked for underlying assets afterwards. 
   - Ensure that mirrored assets can be locked permanently and temporarily (moreso a `MirroredERC20/721` test).
   - Ensure that mirrored assets can be locked, batch locked, unlocked, batch unlocked.

5. **End-to-End Tests:**
   - Perform a complete flow of locking an asset, setting MFA data, and unlocking the asset using the zkVaultCore contract.
   - Verify that the MFA verification process works correctly and the assets are transferred as expected.

---

## Addresses:

-  Groth16Verifier:     0x022698D010202f08d2705c3aB6434e8839001Bf4
-  MFAManager:          0x0F17d49eF377BBA509f2833603756a258dADb029
-  zkVaultCore:         0x9b8795101056aE15eACE9eA051921704c7EcBafD
-  zkVaultMFA:          0x60Fc7a801d6983EDbFcDf6794f6b9632F3283014
-  ExternalSignerMFA:   0xcCfd2609103B525cB60e93649f45Cedd383f66AE
-  ExternalSignerMFA:   0x3cf02e5b196c228E6D1Cf150a7E3D8CA2AF76fc3
-  TestERC20:           0x7A94dA1f3d45D3410f735419473491a5c5b85F8D
-  TestERC721:          0x0E0A3Ac9dE81a05A546475E2b0a84eab48BD3AD3