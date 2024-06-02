"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import Web3, { Contract, TransactionBlockTimeoutError } from "web3";
import coreContractABI from "../public/ABIs/VaultCore.json";
import { AbiItem } from "web3-utils";
import ERC20ABI from "../public/ABIs/ERC20.json";
import ERC721ABI from "../public/ABIs/ERC721.json";
import MirroredERC20ABI from "../public/ABIs/MirroredERC20.json";
import MirroredERC721ABI from "../public/ABIs/MirroredERC721.json";
import TokenDataRetrieverABI from "../public/ABIs/TokenDataRetriever.json";
import MFAManagerABI from "../public/ABIs/MFAManager.json";
import ExternalAPIMFAABI from "../public/ABIs/ExternalAPIMFA.json";
import { CovalentClient } from "@covalenthq/client-sdk";
import { poseidon } from "@/components/poseidon-hash";
import { toast } from "sonner";

export interface MFAProviderData {
  providerAddress: string;
  message: string;
  v: number;
  r: string;
  s: string;
  subscriptionId: string;
  username: string;
  mfaRequestId: string;
  args: string[];
}

export interface ProofParameters {
  pA0: string;
  pA1: string;
  pB00: string;
  pB01: string;
  pB10: string;
  pB11: string;
  pC0: string;
  pC1: string;
  pubSignals0: string;
  pubSignals1: string;
}

interface StorageContextProps {
  storage: { [key: string]: string };
  setStorage: (key: string, value: string) => void;
  getStorage: (key: string) => string | null | undefined;
  web3: Web3 | null;
  connectToWeb3: () => Promise<boolean>;
  switchChain: () => Promise<boolean>;
  initializeCoreContract: () => any | undefined | null;
  setUsername: (username: string, passwordHash: string) => Promise<void>;
  checkUsernameExists: (username: string) => Promise<boolean>;
  checkUsernameAndPassword: (
    username: string,
    passwordHash: string
  ) => Promise<string>;
  generateCoreProof: (inputs: any) => Promise<any>;
  setProofParameters: (proof: any) => any;
  batchVaultAndSetMFA: (
    token: string,
    amount: string,
    tokenId: string,
    isERC20: boolean,
    password: string,
    mfaProviders: string[]
  ) => Promise<void>;
  batchLockAndSetMFA: (
    token: string,
    isERC20: boolean,
    password: string,
    mfaProviders: string[]
  ) => Promise<void>;
  batchUnlockAndVerifyMFA: (
    token: string,
    isERC20: boolean,
    password: string,
    otpOne: string,
    otpTwo: string,
    mfaProviders: string[]
  ) => Promise<void>;
  batchUnvaultAndVerifyMFA: (
    token: string,
    amount: string,
    isERC20: boolean,
    password: string,
    otpOne: string,
    otpTwo: string,
    mfaProviders: string[]
  ) => Promise<void>;
  timelockTokens: (token: string, time: string) => Promise<void>;
  retrieveUnlockTimestamp: (
    token: string
  ) => Promise<{ unlockTimestamp: string; transfersDisabled: boolean } | void>;
  fetchTokenBalances: (address: string) => Promise<any[] | undefined>;
  stringToBigInt: (str: string) => bigint;
  bigIntToString: (bigInt: bigint) => string;
  splitTo24: (str: string) => string[];
  registerMFA: (username: string) => Promise<any>;
  signMFA: (
    username: string,
    requestId: string,
    otpSecretOne: string,
    otpSecretTwo: string
  ) => Promise<any>;
  registerPassword: (username: string, password: string) => Promise<any>;
  registerENS: (username: string, passwordHash: string) => Promise<void>;
  recoverENS: (username: string, password: string) => Promise<void>;
}

const StorageContext = createContext<StorageContextProps>({
  storage: {},
  setStorage: () => {},
  getStorage: () => undefined,
  web3: null,
  connectToWeb3: async () => true || false,
  switchChain: async () => true || false,
  initializeCoreContract: async () => {},
  setUsername: async () => {},
  checkUsernameExists: async () => true || false,
  checkUsernameAndPassword: async () =>
    "NO_WEB3" ||
    "INVALID_CREDENTIALS" ||
    "SKIP_MFA" ||
    "PROCEED_MFA" ||
    "INVALID_STATE",
  generateCoreProof: async () => ({}),
  setProofParameters: () => [],
  batchVaultAndSetMFA: async () => {},
  batchLockAndSetMFA: async () => {},
  batchUnlockAndVerifyMFA: async () => {},
  batchUnvaultAndVerifyMFA: async () => {},
  timelockTokens: async () => {},
  retrieveUnlockTimestamp: async () => {},
  fetchTokenBalances: async () => [],
  stringToBigInt: () => BigInt(0),
  bigIntToString: () => "",
  splitTo24: () => ["", ""],
  registerMFA: async () => undefined,
  signMFA: async () => undefined,
  registerPassword: async () => undefined,
  registerENS: async () => {},
  recoverENS: async () => {},
});

export const StorageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [storage, setStorage] = useState<{ [key: string]: string }>({});
  const [web3, setWeb3] = useState<Web3 | null>(null);

  const setStorageValue = (key: string, value: string) => {
    setStorage((prevStorage) => ({ ...prevStorage, [key]: value }));
    localStorage.setItem(key, value);
  };

  const getStorageValue = (key: string) => {
    return storage[key] || localStorage.getItem(key);
  };

  const connectToWeb3 = async () => {
    if ((window as any).ethereum) {
      try {
        // Request account access
        await (window as any).ethereum.request({
          method: "eth_requestAccounts",
        });
        // Create Web3 instance
        const web3Instance = new Web3((window as any).ethereum);
        setWeb3(web3Instance);
        console.log("Connected to Web3");
        // Check if the desired network is already added
        const chainId = await (window as any).ethereum.request({
          method: "eth_chainId",
        });
        if (chainId !== "0xa869" && chainId !== "0x66eee") {
          try {
            // Attempt to switch to the desired network
            await (window as any).ethereum.request({
              method: "wallet_switchEthereumChain",
              params: [{ chainId: "0xa869" }],
            });
          } catch (switchError) {
            // If the network doesn't exist, add it
            if ((switchError as any).code === 4902) {
              try {
                await (window as any).ethereum.request({
                  method: "wallet_addEthereumChain",
                  params: [
                    {
                      chainId: "0xa869",
                      chainName: "Avalanche Fuji",
                      rpcUrls: ["https://api.avax-test.network/ext/bc/C/rpc"],
                      nativeCurrency: {
                        name: "AVAX",
                        symbol: "AVAX",
                        decimals: 18,
                      },
                      blockExplorerUrls: ["https://testnet.snowtrace.io/"],
                    },
                  ],
                });
              } catch (addError) {
                console.error("Failed to add network:", addError);
                return false;
              }
            } else {
              console.error("Failed to switch network:", switchError);
              return false;
            }
          }
        }
        return true;
      } catch (error) {
        console.error("Failed to connect to Web3:", error);
        return false;
      }
    } else {
      console.error("MetaMask not detected");
      return false;
    }
  };

  const switchChain = async () => {
    if ((window as any).ethereum) {
      try {
        // Get the current chain ID
        const currentChainId = await (window as any).ethereum.request({
          method: "eth_chainId",
        });

        let targetChainId;
        if (currentChainId === "0x66eee") {
          targetChainId = "0xa869"; // Swap to Avalanche Fuji
        } else if (currentChainId === "0xa869") {
          targetChainId = "0x66eee"; // Swap to Arbitrum Sepolia
        } else {
          console.error("Current chain is not supported for swapping");
          return false;
        }

        try {
          // Attempt to switch to the target network
          await (window as any).ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: targetChainId }],
          });
        } catch (switchError) {
          // If the target network doesn't exist, add it
          if ((switchError as any).code === 4902) {
            try {
              let chainParams;
              if (targetChainId === "0x66eee") {
                chainParams = {
                  chainId: "0x66eee",
                  chainName: "Arbitrum Sepolia",
                  rpcUrls: [
                    "https://arbitrum-sepolia.blockpi.network/v1/rpc/public",
                  ],
                  nativeCurrency: {
                    name: "ETH",
                    symbol: "ETH",
                    decimals: 18,
                  },
                  blockExplorerUrls: ["https://sepolia.arbiscan.io/"],
                };
              } else if (targetChainId === "0xa869") {
                chainParams = {
                  chainId: "0xa869",
                  chainName: "Avalanche Fuji",
                  rpcUrls: ["https://api.avax-test.network/ext/bc/C/rpc"],
                  nativeCurrency: {
                    name: "AVAX",
                    symbol: "AVAX",
                    decimals: 18,
                  },
                  blockExplorerUrls: ["https://testnet.snowtrace.io/"],
                };
              }
              await (window as any).ethereum.request({
                method: "wallet_addEthereumChain",
                params: [chainParams],
              });
            } catch (addError) {
              console.error("Failed to add network:", addError);
              return false;
            }
          } else {
            console.error("Failed to switch network:", switchError);
            return false;
          }
        }
        let newChain =
          targetChainId === "0xa869" ? "Avalanche Fuji" : "Arbitrum Sepolia";
        toast.info("Swapped chain successfully to " + newChain);
        if (newChain === "Arbitrum Sepolia")
          setTimeout(function () {
            toast.warning(
              "Please confirm transactions on Arbitrum Sepolia quickly, otherwise they may fail during heavy network/RPC load."
            );
          }, 5000);
        return true;
      } catch (error) {
        console.error("Failed to swap chain:", error);
        return false;
      }
    } else {
      console.error("MetaMask not detected");
      return false;
    }
  };

  const initializeCoreContract = async () => {
    if (web3) {
      const coreContractAddress = "0xA2673321CC16643103212C52A3118d52D69866A1";
      const contract = new web3.eth.Contract(
        coreContractABI as AbiItem[],
        coreContractAddress
      );
      return contract;
    }
  };

  const initializeMirroredERC20Contract = async (contractAddress: string) => {
    if (web3) {
      const contract = new web3.eth.Contract(
        MirroredERC20ABI as AbiItem[],
        contractAddress
      );
      return contract;
    }
  };

  const initializeMirroredERC721Contract = async (contractAddress: string) => {
    if (web3) {
      const contract = new web3.eth.Contract(
        MirroredERC721ABI as AbiItem[],
        contractAddress
      );
      return contract;
    }
  };

  const initializeERC20Contract = async (contractAddress: string) => {
    if (web3) {
      const contract = new web3.eth.Contract(
        ERC20ABI as AbiItem[],
        contractAddress
      );
      return contract;
    }
  };

  const initializeERC721Contract = async (contractAddress: string) => {
    if (web3) {
      const contract = new web3.eth.Contract(
        ERC721ABI as AbiItem[],
        contractAddress
      );
      return contract;
    }
  };

  const initializeMFAManagerContract = async () => {
    if (web3) {
      const contractAddress = "0xf38DA3627847D5eECB37B0C5573F7f327bba8cE0";
      const contract = new web3.eth.Contract(
        MFAManagerABI as AbiItem[],
        contractAddress
      );
      return contract;
    }
  };

  const initializeExternalAPIMFAContract = async () => {
    if (web3) {
      const contractAddress = "0x661B556d4756C835D3A72779aCB32612E4243B56";
      const contract = new web3.eth.Contract(
        ExternalAPIMFAABI as AbiItem[],
        contractAddress
      );
      return contract;
    }
  };

  const setUsername = async (username: string, passwordHash: string) => {
    if (!web3) {
      return;
    }
    let coreContract = await initializeCoreContract();
    const accounts = await web3.eth.getAccounts();
    await (coreContract as any).methods
      .setUsername(username, String(accounts[0]), passwordHash)
      .send({
        from: accounts[0],
        gas: "3000000",
        gasPrice: web3.utils.toWei("25", "gwei"),
      });
  };

  const checkUsernameExists = async (username: string) => {
    if (!web3) {
      return false;
    }
    let coreContract = await initializeCoreContract();
    const mappedAddress = await (coreContract as any).methods
      .usernameAddress(username)
      .call();
    return mappedAddress !== "0x0000000000000000000000000000000000000000";
  };

  const checkUsernameAndPassword = async (
    username: string,
    passwordHash: string
  ) => {
    if (!web3) {
      return "NO_WEB3";
    }

    let coreContract = await initializeCoreContract();
    const accounts = await web3.eth.getAccounts();
    const address = accounts[0];

    // Check if the address is already present in the usernames mapping
    const mappedUsername = await (coreContract as any).methods
      .usernames(address)
      .call();
    const mappedAddress = await (coreContract as any).methods
      .usernameAddress(mappedUsername)
      .call();
    const storedHash = await (coreContract as any).methods
      .passwordHashes(mappedAddress)
      .call();

    // console.log(username);
    // console.log(passwordHash);
    // console.log(mappedUsername);
    // console.log(mappedAddress);
    // console.log(storedHash);
    // console.log(String(storedHash)===passwordHash);

    if (
      mappedUsername !== "" &&
      mappedAddress !== "0x0000000000000000000000000000000000000000" &&
      storedHash !== "0"
    ) {
      // If the user is registered, check if all conditions match
      if (
        mappedUsername !== username ||
        mappedAddress !== address ||
        String(storedHash) !== passwordHash
      ) {
        return "INVALID_CREDENTIALS";
      }

      // If all conditions match, the user is already registered and can skip MFA setup
      return "SKIP_MFA";
    } else if (
      mappedUsername === "" &&
      mappedAddress === "0x0000000000000000000000000000000000000000" &&
      String(storedHash) === "0"
    ) {
      // If all mappings are empty, the user is not registered and should proceed with MFA setup
      return "PROCEED_MFA";
    } else {
      // If the mappings are in an inconsistent state, return an error
      return "INVALID_STATE";
    }
  };

  const setProofParameters = (proof: any): any => {
    return [
      proof.pi_a[0],
      proof.pi_a[1],
      proof.pi_b[0][0],
      proof.pi_b[0][1],
      proof.pi_b[1][0],
      proof.pi_b[1][1],
      proof.pi_c[0],
      proof.pi_c[1],
      proof.pubSignals[0],
      proof.pubSignals[1],
    ];
  };

  const batchVaultAndSetMFA = async (
    token: string,
    amount: string,
    tokenId: string,
    isERC20: boolean,
    password: string,
    mfaProviders: string[]
  ) => {
    if (!web3) {
      return;
    }

    console.log(`
      token: ${token},
      amount: ${amount},
      tokenId: ${tokenId},
      isERC20: ${isERC20},
      password: ${password},
      mfaProviders: ${mfaProviders}
  `);

    let coreContract = await initializeCoreContract();
    const accounts = await web3.eth.getAccounts();

    const currentChainId = await (window as any).ethereum.request({
      method: "eth_chainId",
    });

    console.log("CHAIN ID IN BATCH VAULT:");
    console.log(currentChainId.toString());

    let mfaProviderData: any[] = [];

    for (let i = 0; i < mfaProviders.length; i++) {
      //ExternalSignerMFA1
      if (mfaProviders[i] == "0xA755E55b2a177d626B6e5db8C400aEc9C7Bc0Eb5") {
        mfaProviderData.push([
          mfaProviders[i],
          "",
          0,
          "0x0000000000000000000000000000000000000000000000000000000000000000",
          "0x0000000000000000000000000000000000000000000000000000000000000000",
          "0",
          "",
          "0",
          [],
        ]);
      }

      //ExternalSignerMFA2
      if (mfaProviders[i] == "0x329e4D3Cb8Fe41cfbB6D58DE9CDcef59E0eb8201") {
        mfaProviderData.push([
          mfaProviders[i],
          "",
          0,
          "0x0000000000000000000000000000000000000000000000000000000000000000",
          "0x0000000000000000000000000000000000000000000000000000000000000000",
          "0",
          "",
          "0",
          [],
        ]);
      }

      //VaultMFA
      if (mfaProviders[i] == "0xB9506dC2B7294842072E11b6BAED550DA3d8F455") {
        mfaProviderData.push([
          mfaProviders[i],
          "",
          0,
          "0x0000000000000000000000000000000000000000000000000000000000000000",
          "0x0000000000000000000000000000000000000000000000000000000000000000",
          "0",
          "",
          "0",
          [],
        ]);
      }

      //ExternalAPIMFA
      if (mfaProviders[i] == "0x661B556d4756C835D3A72779aCB32612E4243B56") {
        const externalAPIMFAContract = await initializeExternalAPIMFAContract();
        const accountPassword = getStorageValue("password");
        const currentRandomNumber = await (
          externalAPIMFAContract as any
        ).methods
          .getCurrentRandomNumber()
          .call();

        // Salt the account password with the random number
        const combinedPassword = accountPassword + currentRandomNumber;

        // Calculate SHA256 of password with random number
        const hashedPassword = await hashSHA256(combinedPassword);
        const lowercaseHashedPassword = hashedPassword.toString().toLowerCase();

        // Get current chain ID and associated subscription ID
        const currentChainId = await (window as any).ethereum.request({
          method: "eth_chainId",
        });
        const subscription_id = currentChainId === "0xa869" ? "8928" : "83";
        mfaProviderData.push([
          mfaProviders[i],
          "",
          0,
          "0x0000000000000000000000000000000000000000000000000000000000000000",
          "0x0000000000000000000000000000000000000000000000000000000000000000",
          subscription_id,
          getStorageValue("username") as string,
          "0",
          [
            getStorageValue("username") as string,
            lowercaseHashedPassword,
            currentRandomNumber.toString(),
          ],
        ]);
      }
    }

    let hash;

    if (password === "") hash = 0;
    else {
      let [first, second] = splitTo24(password);
      let [first_int, second_int] = [
        stringToBigInt(first),
        stringToBigInt(second),
      ];
      hash = await poseidon([first_int, second_int]);
    }

    if (isERC20) {
      const tokenContract = await initializeERC20Contract(token);
      const allowance = await (tokenContract as Contract<AbiItem[]>).methods
        .allowance(accounts[0], "0xA2673321CC16643103212C52A3118d52D69866A1")
        .call();

      console.log(
        `Allowance for ${"0xA2673321CC16643103212C52A3118d52D69866A1"} to ${
          accounts[0]
        }: ${allowance}`
      );

      if (parseFloat(amount) > parseFloat(allowance as any)) {
        console.log(`${parseFloat(amount)} > ${parseFloat(allowance as any)}`);
        console.log("Increasing allowance...");
        await (tokenContract as Contract<AbiItem[]>).methods
          .approve("0xA2673321CC16643103212C52A3118d52D69866A1", amount)
          .send({
            from: accounts[0],
            gas: "3000000",
            gasPrice: web3.utils.toWei("25", "gwei"),
          });
      }

      console.log(token, amount, tokenId, isERC20, hash, mfaProviderData);
      console.log(accounts[0]);
      await (coreContract as any).methods
        .batchVaultAndSetMFA(
          token,
          amount,
          tokenId,
          isERC20,
          hash,
          mfaProviderData
        )
        .send({
          from: accounts[0],
          gas: 3000000,
          gasPrice: web3.utils.toWei("25", "gwei"),
        });
    } else {
      const tokenContract = await initializeERC721Contract(token);
      const isApproved = await (tokenContract as Contract<AbiItem[]>).methods
        .isApprovedForAll(
          accounts[0],
          "0xA2673321CC16643103212C52A3118d52D69866A1"
        )
        .call();

      console.log(
        `Approval for ${"0xA2673321CC16643103212C52A3118d52D69866A1"} to ${
          accounts[0]
        }: ${isApproved}`
      );

      if (!isApproved) {
        console.log("Setting approval...");
        await (tokenContract as Contract<AbiItem[]>).methods
          .setApprovalForAll("0xA2673321CC16643103212C52A3118d52D69866A1", true)
          .send({
            from: accounts[0],
            gas: "3000000",
            gasPrice: web3.utils.toWei("25", "gwei"),
          });
      }

      await (coreContract as any).methods
        .batchVaultAndSetMFA(
          token,
          "0",
          tokenId,
          isERC20,
          hash,
          mfaProviderData
        )
        .send({
          from: accounts[0],
          gas: 3000000,
          gasPrice: web3.utils.toWei("25", "gwei"),
        });
    }
  };

  const batchLockAndSetMFA = async (
    token: string,
    isERC20: boolean,
    password: string,
    mfaProviders: string[]
  ) => {
    if (!web3) {
      return;
    }

    console.log(`
      token: ${token},
      isERC20: ${isERC20},
      password: ${password},
      isERC20: ${isERC20},
      mfaProviders: ${mfaProviders}
    `);

    let coreContract = await initializeCoreContract();
    const accounts = await web3.eth.getAccounts();

    let mfaProviderData: any[] = [];

    for (let i = 0; i < mfaProviders.length; i++) {
      //ExternalSignerMFA1
      if (mfaProviders[i] == "0xA755E55b2a177d626B6e5db8C400aEc9C7Bc0Eb5") {
        mfaProviderData.push([
          mfaProviders[i],
          "",
          0,
          "0x0000000000000000000000000000000000000000000000000000000000000000",
          "0x0000000000000000000000000000000000000000000000000000000000000000",
          "0",
          "",
          "0",
          [],
        ]);
      }

      //ExternalSignerMFA2
      if (mfaProviders[i] == "0x329e4D3Cb8Fe41cfbB6D58DE9CDcef59E0eb8201") {
        mfaProviderData.push([
          mfaProviders[i],
          "",
          0,
          "0x0000000000000000000000000000000000000000000000000000000000000000",
          "0x0000000000000000000000000000000000000000000000000000000000000000",
          "0",
          "",
          "0",
          [],
        ]);
      }

      //VaultMFA
      if (mfaProviders[i] == "0xB9506dC2B7294842072E11b6BAED550DA3d8F455") {
        mfaProviderData.push([
          mfaProviders[i],
          "",
          0,
          "0x0000000000000000000000000000000000000000000000000000000000000000",
          "0x0000000000000000000000000000000000000000000000000000000000000000",
          "0",
          "",
          "0",
          [],
        ]);
      }

      //ExternalAPIMFA
      if (mfaProviders[i] == "0x661B556d4756C835D3A72779aCB32612E4243B56") {
        const externalAPIMFAContract = await initializeExternalAPIMFAContract();
        const accountPassword = getStorageValue("password");
        const currentRandomNumber = await (
          externalAPIMFAContract as any
        ).methods
          .getCurrentRandomNumber()
          .call();

        // Salt the account password with the random number
        const combinedPassword = accountPassword + currentRandomNumber;

        // Calculate SHA256 of password with random number
        const hashedPassword = await hashSHA256(combinedPassword);
        const lowercaseHashedPassword = hashedPassword.toString().toLowerCase();

        // Get current chain ID and associated subscription ID
        const currentChainId = await (window as any).ethereum.request({
          method: "eth_chainId",
        });
        const subscription_id = currentChainId === "0xa869" ? "8928" : "83";

        mfaProviderData.push([
          mfaProviders[i],
          "",
          0,
          "0x0000000000000000000000000000000000000000000000000000000000000000",
          "0x0000000000000000000000000000000000000000000000000000000000000000",
          subscription_id,
          getStorageValue("username") as string,
          "0",
          [
            getStorageValue("username") as string,
            lowercaseHashedPassword,
            currentRandomNumber.toString(),
          ],
        ]);
      }
    }

    let hash;

    if (password === "") hash = 0;
    else {
      let [first, second] = splitTo24(password);
      let [first_int, second_int] = [
        stringToBigInt(first),
        stringToBigInt(second),
      ];
      hash = await poseidon([first_int, second_int]);
    }

    await (coreContract as any).methods
      .batchLockAndSetMFA(token, isERC20, mfaProviderData, hash)
      .send({
        from: accounts[0],
        gas: "3000000",
        gasPrice: web3.utils.toWei("25", "gwei"),
      });
  };

  const batchUnlockAndVerifyMFA = async (
    token: string,
    isERC20: boolean,
    password: string,
    otpOne: string,
    otpTwo: string,
    mfaProviders: string[]
  ) => {
    if (!web3) {
      return;
    }

    console.log(`
      token: ${token},
      isERC20: ${isERC20},
      password: ${password},
      otpOne: ${otpOne},
      otpTwo: ${otpTwo},
      mfaProviders: ${mfaProviders}
    `);

    let coreContract = await initializeCoreContract();
    const accounts = await web3.eth.getAccounts();

    let mfaProviderData: any[] = [];

    const tokenContract = await initializeMirroredERC20Contract(token);
    const requestId = (await (tokenContract as Contract<AbiItem[]>).methods
      .lockId()
      .call()) as string;

    const signMFAResponse =
      otpOne !== "" || otpTwo !== ""
        ? await signMFA(
            getStorageValue("username") as string,
            requestId.toString(),
            otpOne,
            otpTwo
          )
        : "";

    const timestamp =
      otpOne !== "" || otpTwo !== ""
        ? otpOne !== ""
          ? signMFAResponse["signed_message_one"]["message"].split("-")[2]
          : signMFAResponse["signed_message_two"]["message"].split("-")[2]
        : Math.floor(Date.now() / 1000).toString();

    let proofParams = ["0", "0", "0", "0", "0", "0", "0", "0", "0", "0"];

    for (let i = 0; i < mfaProviders.length; i++) {
      //ExternalSignerMFA1
      if (mfaProviders[i] == "0xA755E55b2a177d626B6e5db8C400aEc9C7Bc0Eb5") {
        const response_otp_one = signMFAResponse["signed_message_one"];
        mfaProviderData.push([
          mfaProviders[i],
          response_otp_one["message"],
          response_otp_one["v"],
          response_otp_one["r"],
          response_otp_one["s"],
          "0",
          "",
          "0",
          [],
        ]);
      }

      //ExternalSignerMFA2
      if (mfaProviders[i] == "0x329e4D3Cb8Fe41cfbB6D58DE9CDcef59E0eb8201") {
        const response_otp_two = signMFAResponse["signed_message_two"];
        mfaProviderData.push([
          mfaProviders[i],
          response_otp_two["message"],
          response_otp_two["v"],
          response_otp_two["r"],
          response_otp_two["s"],
          "0",
          "",
          "0",
          [],
        ]);
      }

      //VaultMFA
      if (mfaProviders[i] == "0xB9506dC2B7294842072E11b6BAED550DA3d8F455") {
        mfaProviderData.push([
          mfaProviders[i],
          "",
          "0",
          "0x0000000000000000000000000000000000000000000000000000000000000000",
          "0x0000000000000000000000000000000000000000000000000000000000000000",
          "0",
          "",
          "0",
          [],
        ]);

        let [first, second] = splitTo24(password);
        let [first_int, second_int] = [
          stringToBigInt(first),
          stringToBigInt(second),
        ];
        let hash = await poseidon([first_int, second_int]);

        console.log(first_int, second_int, hash, timestamp);

        let proof = await generateCoreProof({
          password_0: String(first_int),
          password_1: String(second_int),
          provided_password_hash: String(hash),
          timestamp: String(timestamp),
        });

        console.log(proof);

        if ((proof as any)["result"] !== "Verification OK")
          throw Error("password is incorrect");

        proofParams = setProofParameters((proof as any)["proof"]);

        console.log(proofParams);
      }

      // Get current chain ID and associated subscription ID
      const currentChainId = await (window as any).ethereum.request({
        method: "eth_chainId",
      });
      const subscription_id = currentChainId === "0xa869" ? "8928" : "83";

      //ExternalAPIMFA
      if (mfaProviders[i] == "0x661B556d4756C835D3A72779aCB32612E4243B56") {
        mfaProviderData.push([
          mfaProviders[i],
          "",
          "0",
          "0x0000000000000000000000000000000000000000000000000000000000000000",
          "0x0000000000000000000000000000000000000000000000000000000000000000",
          subscription_id,
          "",
          "0",
          [],
        ]);
      }
    }

    console.log(mfaProviderData);
    console.log(requestId, isERC20, timestamp, proofParams, mfaProviderData);

    await (coreContract as any).methods
      .batchUnlockAndVerifyMFA(
        requestId,
        isERC20,
        timestamp,
        proofParams,
        mfaProviderData
      )
      .send({
        from: accounts[0],
        gas: "3000000",
        gasPrice: web3.utils.toWei("25", "gwei"),
      });
  };

  const batchUnvaultAndVerifyMFA = async (
    token: string,
    amount: string,
    isERC20: boolean,
    password: string,
    otpOne: string,
    otpTwo: string,
    mfaProviders: string[]
  ) => {
    if (!web3) {
      return;
    }

    console.log(`
      token: ${token},
      amount: ${amount},
      isERC20: ${isERC20},
      password: ${password},
      otpOne: ${otpOne},
      otpTwo: ${otpTwo},
      mfaProviders: ${mfaProviders},
  `);

    let coreContract = await initializeCoreContract();
    const accounts = await web3.eth.getAccounts();

    let mfaProviderData: any[] = [];

    const tokenContract = isERC20
      ? await initializeMirroredERC20Contract(token)
      : await initializeMirroredERC721Contract(token);
    const mfaRequestId = (await (tokenContract as Contract<AbiItem[]>).methods
      .requestId()
      .call()) as string;

    const signMFAResponse =
      otpOne !== "" || otpTwo !== ""
        ? await signMFA(
            getStorageValue("username") as string,
            mfaRequestId.toString(),
            otpOne,
            otpTwo
          )
        : "";

    const underlyingAsset = (await (
      tokenContract as Contract<AbiItem[]>
    ).methods
      .underlyingAsset()
      .call()) as string;

    const timestamp =
      otpOne !== "" || otpTwo !== ""
        ? otpOne !== ""
          ? signMFAResponse["signed_message_one"]["message"].split("-")[2]
          : signMFAResponse["signed_message_two"]["message"].split("-")[2]
        : Math.floor(Date.now() / 1000).toString();

    let proofParams = ["0", "0", "0", "0", "0", "0", "0", "0", "0", "0"];

    for (let i = 0; i < mfaProviders.length; i++) {
      //ExternalSignerMFA1
      if (mfaProviders[i] == "0xA755E55b2a177d626B6e5db8C400aEc9C7Bc0Eb5") {
        const response_otp_one = signMFAResponse["signed_message_one"];
        mfaProviderData.push([
          mfaProviders[i],
          response_otp_one["message"],
          response_otp_one["v"],
          response_otp_one["r"],
          response_otp_one["s"],
          "0",
          "",
          "0",
          [],
        ]);
      }

      //ExternalSignerMFA2
      if (mfaProviders[i] == "0x329e4D3Cb8Fe41cfbB6D58DE9CDcef59E0eb8201") {
        const response_otp_two = signMFAResponse["signed_message_two"];
        mfaProviderData.push([
          mfaProviders[i],
          response_otp_two["message"],
          response_otp_two["v"],
          response_otp_two["r"],
          response_otp_two["s"],
          "0",
          "",
          "0",
          [],
        ]);
      }

      //VaultMFA
      if (mfaProviders[i] == "0xB9506dC2B7294842072E11b6BAED550DA3d8F455") {
        mfaProviderData.push([
          mfaProviders[i],
          "",
          "0",
          "0x0000000000000000000000000000000000000000000000000000000000000000",
          "0x0000000000000000000000000000000000000000000000000000000000000000",
          "0",
          "",
          "0",
          [],
        ]);

        let [first, second] = splitTo24(password);
        let [first_int, second_int] = [
          stringToBigInt(first),
          stringToBigInt(second),
        ];
        let hash = await poseidon([first_int, second_int]);

        console.log(first_int, second_int, hash, timestamp);

        let proof = await generateCoreProof({
          password_0: String(first_int),
          password_1: String(second_int),
          provided_password_hash: String(hash),
          timestamp: String(timestamp),
        });

        console.log(proof);

        if ((proof as any)["result"] !== "Verification OK")
          throw Error("password is incorrect");

        proofParams = setProofParameters((proof as any)["proof"]);

        console.log(proofParams);
      }

      // Get current chain ID and associated subscription ID
      const currentChainId = await (window as any).ethereum.request({
        method: "eth_chainId",
      });
      const subscription_id = currentChainId === "0xa869" ? "8928" : "83";

      //ExternalAPIMFA
      if (mfaProviders[i] == "0x661B556d4756C835D3A72779aCB32612E4243B56") {
        mfaProviderData.push([
          mfaProviders[i],
          "",
          "0",
          "0x0000000000000000000000000000000000000000000000000000000000000000",
          "0x0000000000000000000000000000000000000000000000000000000000000000",
          subscription_id,
          "",
          "0",
          [],
        ]);
      }
    }

    console.log(mfaProviderData);
    console.log(
      underlyingAsset,
      amount,
      mfaRequestId,
      isERC20,
      timestamp,
      proofParams,
      mfaProviderData
    );

    await (coreContract as any).methods
      .batchUnvaultAndVerifyMFA(
        underlyingAsset,
        amount,
        mfaRequestId,
        isERC20,
        timestamp,
        proofParams,
        mfaProviderData
      )
      .send({
        from: accounts[0],
        gas: "3000000",
        gasPrice: web3.utils.toWei("25", "gwei"),
      });
  };

  const timelockTokens = async (token: string, time: string) => {
    if (!web3) {
      return;
    }
    console.log(`
      token: ${token},
      time: ${time}
    `);
    const accounts = await web3.eth.getAccounts();

    const tokenContract = await initializeMirroredERC20Contract(token);

    if (time == "inf")
      await (tokenContract as Contract<AbiItem[]>).methods
        .disableTransfersPermanently()
        .send({ from: accounts[0] });
    else
      await (tokenContract as Contract<AbiItem[]>).methods
        .setTransferUnlockTimestamp(time)
        .send({
          from: accounts[0],
          gas: "3000000",
          gasPrice: web3.utils.toWei("25", "gwei"),
        });
  };

  const retrieveUnlockTimestamp = async (token: string) => {
    if (!web3) {
      return;
    }
    const tokenContract = await initializeMirroredERC20Contract(token);

    const unlockTimestamp = (await (
      tokenContract as Contract<AbiItem[]>
    ).methods
      .transferUnlocktimestamp()
      .call()) as string;

    const transfersDisabled = (await (
      tokenContract as Contract<AbiItem[]>
    ).methods
      .transfersDisabled()
      .call()) as boolean;

    return { unlockTimestamp, transfersDisabled };
  };

  const fetchTokenBalances = async (address: string) => {
    if (!web3) {
      return;
    }
    const client = new CovalentClient("cqt_rQQHffYVtdvgpdc7Q6ctxvxPHKjV");

    try {
      const accounts = await (web3 as any).eth.getAccounts();
      const currentChainId = await (window as any).ethereum.request({
        method: "eth_chainId",
      });
      console.log("CURRENT CHAIN ID:");
      console.log(currentChainId);
      console.log(
        currentChainId === "0xa869" ? "avalanche-testnet" : "arbitrum-sepolia"
      );
      const response =
        await client.BalanceService.getTokenBalancesForWalletAddress(
          currentChainId === "0xa869"
            ? "avalanche-testnet"
            : "arbitrum-sepolia",
          accounts[0],
          { nft: true, noNftAssetMetadata: true, noNftFetch: false }
        );

      console.log(response.data);

      const updatedAssets: any[] = [];

      const erc20Addresses = [];
      const erc721Addresses = [];
      const erc721TokenIds = [];

      for (const item of response.data.items) {
        const contractAddress = item.contract_address;
        if (contractAddress !== "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee") {
          if (item.nft_data === null) {
            erc20Addresses.push(contractAddress);
          } else {
            erc721Addresses.push(contractAddress);
            erc721TokenIds.push(item.nft_data[0].token_id);
          }
        }
      }

      const tokenDataRetrieverContract = new web3.eth.Contract(
        TokenDataRetrieverABI,
        "0xF528968d8dF0C638e0aF5a3f3a62a33BE9D18F95"
      );

      const erc20TokenData = await tokenDataRetrieverContract.methods
        .getERC20TokenData(erc20Addresses, accounts[0])
        .call();

      const erc721TokenData = await tokenDataRetrieverContract.methods
        .getERC721TokenData(erc721Addresses, erc721TokenIds, accounts[0])
        .call();

      const mirroredERC20Addresses = [];
      const mirroredERC721Addresses = [];

      for (const tokenData of erc20TokenData as any) {
        if (tokenData.name.toLowerCase().startsWith("mirrored ")) {
          mirroredERC20Addresses.push(tokenData.tokenAddress);
        } else {
          console.log(tokenData);
          console.log(tokenData.balance);
          console.log(tokenData.decimals);
          updatedAssets.push({
            token: tokenData.name,
            tokenAddress: tokenData.tokenAddress,
            tokenId: "0",
            ticker: tokenData.symbol,
            bal: (
              parseFloat(tokenData.balance.toString()) /
              Math.pow(10, parseInt(tokenData.decimals.toString()))
            ).toFixed(3),
            vaulted: tokenData.vaulted,
            locked: tokenData.locked,
            authOptions: [],
            vaultAuthOptions: tokenData.vaultAuthOptions,
            lockAuthOptions: tokenData.lockAuthOptions,
            isERC20: true,
          });
        }
      }

      for (const tokenData of erc721TokenData as any) {
        if (tokenData.name.toLowerCase().startsWith("mirrored ")) {
          mirroredERC721Addresses.push(tokenData.tokenAddress);
        } else {
          updatedAssets.push({
            token: tokenData.name,
            tokenAddress: tokenData.tokenAddress,
            tokenId: tokenData.tokenId.toString(),
            ticker: tokenData.symbol,
            bal: tokenData.balance.toString(),
            vaulted: tokenData.vaulted,
            locked: tokenData.locked,
            authOptions: [],
            vaultAuthOptions: tokenData.vaultAuthOptions,
            lockAuthOptions: tokenData.lockAuthOptions,
            isERC20: false,
          });
        }
      }

      const mirroredERC20TokenData = await tokenDataRetrieverContract.methods
        .getMirroredERC20TokenData(mirroredERC20Addresses, accounts[0])
        .call();

      const mirroredERC721TokenData = await tokenDataRetrieverContract.methods
        .getMirroredERC721TokenData(mirroredERC721Addresses, accounts[0])
        .call();

      for (const tokenData of mirroredERC20TokenData as any) {
        console.log(tokenData.balance);
        console.log(tokenData.decimals);
        updatedAssets.push({
          token: tokenData.name,
          tokenAddress: tokenData.tokenAddress,
          tokenId: "0",
          ticker: tokenData.symbol,
          bal: (
            parseFloat(tokenData.balance.toString()) /
            Math.pow(10, parseInt(tokenData.decimals.toString()))
          ).toFixed(3),
          vaulted: tokenData.vaulted,
          locked: tokenData.locked,
          authOptions: [],
          vaultAuthOptions: tokenData.vaultAuthOptions,
          lockAuthOptions: tokenData.lockAuthOptions,
          isERC20: true,
        });
      }

      for (const tokenData of mirroredERC721TokenData as any) {
        updatedAssets.push({
          token: tokenData.name,
          tokenAddress: tokenData.tokenAddress,
          tokenId: tokenData.tokenId.toString(),
          ticker: tokenData.symbol,
          bal: tokenData.balance.toString(),
          vaulted: tokenData.vaulted,
          locked: tokenData.locked,
          authOptions: [],
          vaultAuthOptions: tokenData.vaultAuthOptions,
          lockAuthOptions: tokenData.lockAuthOptions,
          isERC20: false,
        });
      }

      updatedAssets.sort((a, b) => (a.token as any).localeCompare(b.token));
      let filteredAssets = [];
      for (let i = 0; i < updatedAssets.length; i++) {
        if (
          updatedAssets[i]["bal"] !== "0.000" &&
          updatedAssets[i]["bal"] !== "0"
        ) {
          filteredAssets.push(updatedAssets[i]);
        }
      }
      console.log(filteredAssets);
      return filteredAssets;
    } catch (error) {
      console.error("Error fetching token balances:", error);
      return [];
    }
  };

  const hashSHA256 = async (message: string) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const hash = await window.crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hash))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  };

  const generateCoreProof = async (inputs: any) => {
    const snarkjs = (window as any).snarkjs;
    const input = {
      password_0: inputs.password_0,
      password_1: inputs.password_1,
      provided_password_hash: inputs.provided_password_hash,
      timestamp: inputs.timestamp,
    };
    const circuitWasm =
      "/circuit_wasms_and_keys/vaultCorePassword/build/vaultCorePassword_js/vaultCorePassword.wasm";
    const circuitZkey =
      "/circuit_wasms_and_keys/vaultCorePassword/circuit.zkey";
    let vKey;
    const response = await fetch(
      "/circuit_wasms_and_keys/vaultCorePassword/verification_key.json"
    );
    if (response.ok) {
      vKey = await response.json();
    } else {
      console.error("Failed to fetch verification key.");
    }
    try {
      const { proof, publicSignals } = await snarkjs.groth16.fullProve(
        input,
        circuitWasm,
        circuitZkey
      );
      const isValid = await snarkjs.groth16.verify(vKey, publicSignals, proof);
      if (isValid) {
        const _pA = [proof.pi_a[0], proof.pi_a[1]];
        const _pB = [
          [proof.pi_b[0][1], proof.pi_b[0][0]],
          [proof.pi_b[1][1], proof.pi_b[1][0]],
        ];
        const _pC = [proof.pi_c[0], proof.pi_c[1]];
        const _pubSignals = publicSignals;
        const res = {
          result: "Verification OK",
          proof: {
            pi_a: _pA,
            pi_b: _pB,
            pi_c: _pC,
            pubSignals: _pubSignals,
          },
        };
        return res;
      } else {
        return { result: "Invalid proof" };
      }
    } catch (error: any) {
      console.error(error);
      return { result: "Error occurred: " + error.toString() };
    }
  };

  const stringToBigInt = (str = "") => {
    if (str.length > 25) {
      throw new Error("String length must be 25 characters or less.");
    }
    let numStr = "";
    for (let i = 0; i < str.length; i++) {
      let ascii = str.charCodeAt(i);
      numStr += ascii.toString().padStart(3, "0");
    }
    return BigInt(numStr);
  };

  const bigIntToString = (bigInt = BigInt(0)) => {
    let str = bigInt.toString();
    while (str.length % 3 !== 0) {
      str = "0" + str;
    }
    let result = "";
    for (let i = 0; i < str.length; i += 3) {
      let ascii = parseInt(str.substr(i, 3), 10);
      result += String.fromCharCode(ascii);
    }
    return result;
  };

  const splitTo24 = (str = "") => {
    const firstElement = str.substring(0, 24);
    const secondElement = str.length > 24 ? str.substring(24, 48) : "";
    return [firstElement, secondElement];
  };

  const baseURL =
    "https://kqysqbam9h.execute-api.ap-southeast-2.amazonaws.com/prod";

  const registerMFA = async (username: string) => {
    try {
      const response = await fetch(`${baseURL}/registerMFA`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username }),
      });
      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        throw new Error("Failed to register MFA");
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const signMFA = async (
    username: string,
    requestId: string,
    otpSecretOne: string,
    otpSecretTwo: string
  ) => {
    try {
      const response = await fetch(`${baseURL}/signMFA`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          requestId,
          otpSecretOne,
          otpSecretTwo,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        throw new Error("Failed to sign MFA");
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const registerPassword = async (username: string, password: string) => {
    try {
      const response = await fetch(`${baseURL}/registerPassword`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });
      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        throw new Error("Failed to register password");
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const registerENS = async (name: string, passwordHash: string) => {
    try {
      if (!web3) {
        return;
      }
      const accounts = await web3.eth.getAccounts();
      const userAddress = accounts[0];
      const response = await fetch(`${baseURL}/registerENS`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, userAddress, passwordHash }),
      });
      if (response.ok) {
        const data = await response.json();
        console.log(data);
        return data;
      } else {
        throw new Error("Failed to register ENS");
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const recoverENS = async (username: string, password: string) => {
    try {
      if (!web3) {
        return;
      }

      console.log(`
      recoverENS(
        username: ${username}
        password: ${password}
      )
      `);

      const accounts = await web3.eth.getAccounts();
      const newUserAddress = accounts[0];
      const timestamp = String(Math.floor(Date.now() / 1000));

      let [first, second] = splitTo24(password);
      let [first_int, second_int] = [
        stringToBigInt(first),
        stringToBigInt(second),
      ];
      let hash = await poseidon([first_int, second_int]);

      console.log(first_int, second_int, hash, timestamp);

      let proof = await generateCoreProof({
        password_0: String(first_int),
        password_1: String(second_int),
        provided_password_hash: String(hash),
        timestamp: String(timestamp),
      });

      console.log(proof);

      if ((proof as any)["result"] !== "Verification OK")
        throw Error("password is incorrect");

      const proofParams = setProofParameters((proof as any)["proof"]);

      const params = {
        pA0: proofParams[0],
        pA1: proofParams[1],
        pB00: proofParams[2],
        pB01: proofParams[3],
        pB10: proofParams[4],
        pB11: proofParams[5],
        pC0: proofParams[6],
        pC1: proofParams[7],
        pubSignals0: proofParams[8],
        pubSignals1: proofParams[9],
      };

      console.log(params);

      console.log(`recoverENS POST call body: {
        username: ${username},
        newUserAddress: ${newUserAddress},
        hash: ${hash},
        timestamp: ${timestamp},
        params: ${params},
      }`);

      console.log("params");
      console.log(params);

      const response = await fetch(`${baseURL}/recoverENS`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username,
          newUserAddress: newUserAddress,
          passwordHash: hash,
          timestamp: timestamp,
          params: params,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        toast.success(
          "Recovery successfully completed for " +
            username +
            ". You have been airdroped an additional 10000 VAULT tokens."
        );
        setTimeout(function () {
          toast.info(
            "All mirrored assets have been recovered. Please allow 2 minutes for recovery to complete on arbitrum."
          );
        }, 5000);
        return data;
      } else {
        toast.error(
          "Error during recovery, please initiate recovery again from an unregistered wallet address."
        );
        throw new Error("Failed to recover ENS");
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  return (
    <StorageContext.Provider
      value={{
        storage,
        setStorage: setStorageValue,
        getStorage: getStorageValue,
        web3,
        connectToWeb3,
        switchChain,
        initializeCoreContract,
        setUsername,
        checkUsernameExists,
        checkUsernameAndPassword,
        generateCoreProof,
        setProofParameters,
        batchVaultAndSetMFA,
        batchLockAndSetMFA,
        batchUnlockAndVerifyMFA,
        batchUnvaultAndVerifyMFA,
        timelockTokens,
        retrieveUnlockTimestamp,
        fetchTokenBalances,
        stringToBigInt,
        bigIntToString,
        splitTo24,
        registerMFA,
        signMFA,
        registerPassword,
        registerENS,
        recoverENS,
      }}
    >
      {children}
    </StorageContext.Provider>
  );
};

export const useStorage = () => useContext(StorageContext);
