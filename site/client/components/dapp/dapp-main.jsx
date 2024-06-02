"use client";

import { Logo } from "@/components/svg/logo";
import { MetamaskLogo } from "@/components/svg/metamask";
import { MFASetup } from "@/components/ui/mfa";
import { BorderBeam } from "@/components/ui/border-beam";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { useState } from "react";
import { useRouter } from "next/router";
import Particles from "@/components/magicui/particles";
import { Input } from "@/components/ui/input";
import { VaultAssetModal } from "@/components/modals/VaultAssetModal";
import { UnvaultAssetModal } from "@/components/modals/UnvaultAssetModal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TableDemo,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table-demo";
import { Button } from "../ui/button";
import {
  Vault,
  Wallet,
  Lock,
  LockOpen,
  Link,
  ArrowClockwise,
} from "@phosphor-icons/react";
import { LockAssetModal } from "@/components/modals/LockAssetModal";
import { UnlockAssetModal } from "@/components/modals/UnlockAssetModal";
import { StorageProvider, useStorage } from "@/components/storage";
import { useEffect } from "react";
import FadeLoader from "react-spinners/FadeLoader";
import { chains } from "../constants";
import { toast } from "sonner";

const Rows = ({ vaulted, assets, handleRowClick }) => {
  const result = assets
    .filter((asset) => asset.vaulted === vaulted)
    .map((asset, index) => {
      return (
        <TableRow
          id={assets.indexOf(asset)}
          key={assets.indexOf(asset)}
          className="border-sky-900 text-left font-mono"
        >
          <TableCell className="font-base text-left">{asset.token}</TableCell>
          <TableCell className="text-left pl-8">{asset.ticker}</TableCell>
          <TableCell className="text-left pl-8">{asset.bal}</TableCell>
          <TableCell className="justify-center items-center">
            <div className="flex py-1 justify-center items-center">
              <Button
                className="w-[55px] h-[35px] hover:bg-sky-600 bg-opacity-50 hover:bg-opacity-75 border-sky-400 hover:border-sky-200 border bg-opacity-50 bg-sky-900 p-2"
                onClick={() =>
                  handleRowClick(index, vaulted, false, asset.locked)
                }
              >
                <Vault className="fill-sky-200 w-6 h-6 p-0 m-0" />
              </Button>
            </div>
          </TableCell>
          {asset.vaulted && (
            <TableCell className="justify-center items-center">
              <div className="flex py-1 justify-center items-center">
                <Button
                  className="w-[55px] h-[35px] hover:bg-sky-600 bg-opacity-50 hover:bg-opacity-75 border-sky-400 hover:border-sky-200 border bg-opacity-50 bg-sky-900 p-2"
                  onClick={() =>
                    handleRowClick(index, vaulted, true, asset.locked)
                  }
                >
                  {asset.locked ? (
                    <LockOpen className="w-5 h-5 fill-sky-200 p-0" />
                  ) : (
                    <Lock className="w-5 h-5 fill-sky-200 p-0" />
                  )}
                </Button>
              </div>
            </TableCell>
          )}
          <TableCell className="text-left pl-8"></TableCell>
        </TableRow>
      );
    });
  return result;
};

const AssetsTable = ({
  vaulted,
  loaded,
  assets,
  handleRowClick,
  fetchAssets,
  refreshWarning,
}) => {
  const result = (
    <TabsContent className="w-full" value={vaulted ? "vaulted" : "unvaulted"}>
      <div className="flex flex-row w-full justify-center"></div>
      {/* <TableDemo className="w-full bg-gradient-to-br from-neutral-950 to-sky-900 text-white"> */}
      <div className="rounded-md border-2 border-sky-700">
        <TableDemo className="w-full bg-black text-white rounded-md">
          {/* <TableCaption></TableCaption> */}
          <TableHeader className="border-sky-700 font-mono font-bold border-b">
            <TableHead className="font-bold text-white">Token</TableHead>
            <TableHead className="font-bold text-white">Ticker</TableHead>
            <TableHead className="font-bold text-white">Amount</TableHead>
            <TableHead className="text-center font-bold text-white">
              {vaulted ? "Unvault" : "Vault"}
            </TableHead>
            {vaulted && (
              <TableHead className="font-bold text-white text-center">
                Lock/Unlock
              </TableHead>
            )}
            <TableHead className="w-2 items-center justify-center h-full font-bold text-white m-0 p-auto">
              <div
                className="flex items-center justify-center hover:bg-sky-600 bg-opacity-50 hover:bg-opacity-75 border-sky-400 hover:border-sky-200 border-[0.5px] cursor-pointer bg-opacity-50 bg-sky-900 p-1 rounded-lg"
                onClick={() => {
                  refreshWarning();
                  fetchAssets();
                }}
              >
                <ArrowClockwise className="w-5 h-5 text-sky-200" />
              </div>
            </TableHead>
          </TableHeader>
          <TableBody className="text-l">
            <Rows
              vaulted={vaulted}
              assets={assets}
              handleRowClick={handleRowClick}
            />
          </TableBody>
        </TableDemo>
        {!loaded && (
          <div className="flex w-full bg-black p-2 pt-4 rounded-lg items-center justify-center">
            <div className="transform scale-75">
              <FadeLoader
                color={"#06b6d4"}
                className="ml-4"
                loading={!loaded}
                height={10}
                margin={-4}
                radius={8}
                width={3}
              />
            </div>
          </div>
        )}
      </div>
    </TabsContent>
  );
  return result;
};

export default function DappMain({
  goToNext,
  setShowError,
  setErrorTitle,
  setErrorMessage,
}) {
  const [showVaultAssetModal, setShowVaultAssetModal] = useState(false);
  const [showUnvaultAssetModal, setShowUnvaultAssetModal] = useState(false);
  const [showLockAssetModal, setShowLockAssetModal] = useState(false);
  const [showUnlockAssetModal, setShowUnlockAssetModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState({});
  const [currentChain, setCurrentChain] = useState({});

  const closeVaultAssetModal = () => {
    setShowVaultAssetModal(false);
  };

  const closeUnvaultAssetModal = () => {
    setShowUnvaultAssetModal(false);
  };

  const closeLockAssetModal = () => {
    setShowLockAssetModal(false);
  };

  const closeUnlockAssetModal = () => {
    setShowUnlockAssetModal(false);
  };

  const handleRowClick = (index, vaulted, lock, isLocked) => {
    console.log(`vaulted: ${vaulted}, lock: ${lock}, isLocked: ${isLocked}`);
    if (lock) {
      if (isLocked) {
        setShowUnlockAssetModal(true);
      } else {
        toast.info("Each applied MFA factor will deduct 1 VAULT token.");
        setShowLockAssetModal(true);
      }
    } else {
      if (vaulted) {
        setShowUnvaultAssetModal(true);
      } else {
        toast.info("Each applied MFA factor will deduct 1 VAULT token.");
        setShowVaultAssetModal(true);
      }
    }

    // Filter assets based on vaulted status and index
    const currentRow = assets.filter((asset) => asset.vaulted === vaulted)[
      index
    ];

    // Log the filtered row data to check if it's correct
    console.log("Selected row data:", currentRow);

    // Update the selectedRow state
    setSelectedRow(currentRow);
  };
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [assets, setAssets] = useState([]);
  const [address, setAddress] = useState("");
  const [chainId, setChainId] = useState("");
  const { web3, fetchTokenBalances, getStorage, setStorage, switchChain } =
    useStorage();

  const fetchAssets = async () => {
    try {
      setAssetsLoaded(false);
      let accs = await web3.eth.getAccounts();
      let userAddress = accs[0];
      setAddress(userAddress);

      const chain = (await web3.eth.getChainId()).toString();
      console.log("fetched chainid in dapp-main:");
      console.log(chain);
      setChainId(chain);

      if (!userAddress) {
        return;
      }
      const updatedAssets = await fetchTokenBalances(userAddress);
      setAssets(updatedAssets);
    } catch (e) {
      setShowError(true);
      setErrorTitle("Error with loading assets");
      setErrorMessage(`There was an loading your assets: ${e.toString()}`);
      setButtonText("Vault");
    }
  };

  const refreshWarning = async () => {
    toast.warning(
      "Fetching asset balances may be delayed or out of date due to network/RPC load."
    );
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  useEffect(() => {
    if (assets.length > 0) {
      setAssetsLoaded(true);
    } else {
      setAssetsLoaded(false);
    }
  }, [assets]);

  useEffect(() => {
    setCurrentChain(chains.find((c) => c.id === chainId));
    console.log("current chain:");
    console.log(chains.find((c) => c.id === chainId));
  }, [chainId]);

  return (
    <section
      id="hero"
      className="relative mx-auto max-w-[80rem] px-6 text-center md:px-8"
    >
      <div className="flex flex-col items-center justify-center min-h-screen z-10">
        <div className="fixed top-0 left-0 w-full z-50 flex justify-between px-2 py-2">
          <VaultAssetModal
            open={showVaultAssetModal}
            onClose={closeVaultAssetModal}
            selectedRow={selectedRow}
            fetchAssets={fetchAssets}
            setShowError={setShowError}
            setErrorTitle={setErrorTitle}
            setErrorMessage={setErrorMessage}
            nativeToken={currentChain?.symbol}
          />
          <UnvaultAssetModal
            open={showUnvaultAssetModal}
            onClose={closeUnvaultAssetModal}
            selectedRow={selectedRow}
            fetchAssets={fetchAssets}
            setShowError={setShowError}
            setErrorTitle={setErrorTitle}
            setErrorMessage={setErrorMessage}
          />
          <LockAssetModal
            open={showLockAssetModal}
            onClose={closeLockAssetModal}
            selectedRow={selectedRow}
            fetchAssets={fetchAssets}
            setShowError={setShowError}
            setErrorTitle={setErrorTitle}
            setErrorMessage={setErrorMessage}
            nativeToken={currentChain?.symbol}
          />
          <UnlockAssetModal
            open={showUnlockAssetModal}
            onClose={closeUnlockAssetModal}
            selectedRow={selectedRow}
            fetchAssets={fetchAssets}
            setShowError={setShowError}
            setErrorTitle={setErrorTitle}
            setErrorMessage={setErrorMessage}
          />
          <div className="h-full">
            {/* <div className="flex items-center h-full" href="/signup">
              <div className="flex items-center">
                <Logo className="h-10" />
                <div className="ml-2 font-base text-2xl">Vault</div>
              </div>
            </div> */}
          </div>
          <div className="flex flex-col">
            <Button className="bg-slate-900 bg-opacity-80 hover:bg-slate-800 no-underline group cursor-pointer relative rounded-lg p-px leading-5 font-bold text-white text-md inline-block mr-2 mb-2">
              <AlertDialog>
                <AlertDialogTrigger className="w-full">
                  <div className="flex items-center space-x-2 z-10 rounded-lg py-1 px-5">
                    <Logo className="w-5 h-5 text-sky-500" />
                    <span className="font-mono font-light">
                      {getStorage("username").replace(".vault", "")}
                      <span className="text-sky-500">.vault</span>
                    </span>
                  </div>
                </AlertDialogTrigger>
                <AlertDialogContent className="border-sky-700 border-2 rounded-lg">
                  <AlertDialogHeader className="flex">
                    <AlertDialogTitle className="flex">
                      Do you want to logout?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="flex">
                      You will be returned to the Vault landing page.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="flex justify-end mt-8">
                    <div className="flex justify-end space-x-4">
                      <AlertDialogCancel className="w-20">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        className="w-20 lg:mt-[0.5rem] md:mt-[0.5rem]"
                        onClick={() => {
                          console.log("logging out...");
                          setStorage("username", "");
                          setStorage("password", "");
                          setStorage("qr_uri_one", "");
                          setStorage("qr_uri_two", "");
                          goToNext();
                          setCurrentChain("");
                          setChainId("");
                          setAddress("");
                        }}
                      >
                        Logout
                      </AlertDialogAction>
                    </div>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </Button>

            <Button className="bg-orange-900 bg-opacity-50 hover:bg-orange-950 no-underline group cursor-default relative rounded-lg p-px leading-5 font-bold text-white text-md inline-block mr-2 mb-2">
              <div className="relative flex items-center space-x-2 z-10 rounded-lg py-1 px-5">
                <MetamaskLogo className="w-5 h-5 text-sky-500 bg-transparent fill-transparent stroke-orange-500" />
                <span className="font-mono font-light">
                  {address.substring(0, 6)}...{address.substring(38)}
                </span>
              </div>
            </Button>

            <Button
              className={`${currentChain?.className} no-underline group cursor-pointer relative rounded-lg p-px leading-5 font-bold text-white text-md inline-block mr-2 mb-2`}
            >
              <AlertDialog>
                <AlertDialogTrigger className="w-full">
                  <div className="relative flex items-center space-x-2 z-10 rounded-lg py-1 px-5">
                    <Link className={`w-5 h-5 ${currentChain?.iconClass}`} />
                    <span className="font-mono font-light">
                      {currentChain?.name}
                    </span>
                  </div>
                </AlertDialogTrigger>
                <AlertDialogContent className="border-sky-700 border-2 rounded-lg">
                  <AlertDialogHeader className="flex">
                    <AlertDialogTitle className="flex">
                      Do you want to swap chain to {currentChain?.switchName}?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="flex">
                      Your assets will reload accordingly.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="flex justify-end mt-8">
                    <div className="flex justify-end space-x-4">
                      <AlertDialogCancel className="w-20">Cancel</AlertDialogCancel>
                      <AlertDialogAction
                      className="w-20 lg:mt-[0.5rem] md:mt-[0.5rem]"
                        onClick={async () => {
                          console.log("Switching chains...");
                          await switchChain();
                          setAssets([]);
                          setAssetsLoaded(false);
                          fetchAssets();
                        }}
                      >
                        Swap
                      </AlertDialogAction>
                    </div>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </Button>
          </div>
        </div>

        <Tabs defaultValue="unvaulted" className="bg-transparent w-3/4">
          <TabsList className="h-[7.5rem] items-center justify-center text-left bg-transparent w-full border-none">
            <TabsTrigger
              className="group mx-3 w-1/2 h-[7.5rem] data-[state=active]:bg-sky-900 data-[state=active]:bg-opacity-80 data-[state=inactive]:bg-black data-[state=inactive]:bg-opacity-30 data-[state=inactive]:text-slate-400 rounded-xl p-8"
              value="unvaulted"
            >
              <div className="flex w-full items-center">
                <div className="flex items-center justify-center w-[70px] h-[70px] bg-sky-900 group-data-[state=inactive]:bg-slate-800 rounded-lg border group-data-[state=active]:border-2 border-sky-500 group-data-[state=inactive]:border-slate-500">
                  <Wallet className="h-14 w-14 group-data-[state=active]:text-sky-500 group-data-[state=inactive]:text-slate-400" />
                </div>
                <div className="ml-3 w-2/3 flex flex-col items-center justify-center text-left">
                  <span className="w-full font-bold text-left text-lg px-2 group-data-[state=active]:text-slate-50">
                    Wallet
                  </span>
                  <span className="w-full font-normal text-wrap text-left px-2 group-data-[state=active]:text-slate-50">
                    Tokens inside your wallet that have not been vaulted.
                  </span>
                </div>
              </div>
            </TabsTrigger>
            <TabsTrigger
              className="group mx-3 w-1/2 h-[7.5rem] data-[state=active]:bg-sky-900 data-[state=active]:bg-opacity-80 data-[state=inactive]:bg-black data-[state=inactive]:bg-opacity-30 data-[state=inactive]:text-slate-400 rounded-xl p-8"
              value="vaulted"
            >
              <div className="flex w-full items-center">
                <div className="flex items-center justify-center w-[70px] h-[70px] bg-sky-900 group-data-[state=inactive]:bg-slate-800 rounded-lg border group-data-[state=active]:border-2 border-sky-500 group-data-[state=inactive]:border-slate-500">
                  <Vault className="h-14 w-14 group-data-[state=active]:text-sky-500 group-data-[state=inactive]:text-slate-400" />
                </div>
                <div className="ml-3 w-2/3 flex flex-col items-center justify-center text-left">
                  <span className="w-full font-bold text-left text-lg px-2 group-data-[state=active]:text-slate-50">
                    Vault
                  </span>
                  <span className="w-full font-normal text-wrap text-left px-2 group-data-[state=active]:text-slate-50">
                    Tokens you have vaulted with us.
                  </span>
                </div>
              </div>
            </TabsTrigger>
          </TabsList>
          <div className="mt-8">
            <AssetsTable
              vaulted={false}
              loaded={assetsLoaded}
              assets={assets}
              handleRowClick={handleRowClick}
              fetchAssets={fetchAssets}
              refreshWarning={refreshWarning}
            />
            <AssetsTable
              vaulted={true}
              loaded={assetsLoaded}
              assets={assets}
              handleRowClick={handleRowClick}
              fetchAssets={fetchAssets}
              refreshWarning={refreshWarning}
            />
          </div>
        </Tabs>
        {/* <div className="h-full w-3/4 py-4">
          <Button
            className="bg-black hover:bg-neutral-900 text-white border-neutral-500 border"
            onClick={fetchAssets}
          >
            Refresh
          </Button>
        </div> */}
      </div>
    </section>
  );
}
