import { Fragment, useEffect, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon, CheckIcon } from "@heroicons/react/24/outline";
import { Input } from "../ui/input";
import { GoogleAuthSVG } from "../svg/google-auth";
import { MSAuthSVG } from "../svg/ms-auth";
import { Logo } from "../svg/logo";
import { Password } from "../svg/password";
import { Chainlink } from "../svg/chainlink-logo";
import { Button } from "@/components/ui/button";
import { useStorage } from "../storage";
import { AuthSelection } from "@/components/ui/auth-options-select";
import { authOptionsDefault } from "../constants";
import ScaleLoader from "react-spinners/ScaleLoader";

const AllocateSection = ({
  numTokens,
  setNumTokens,
  selectedRow,
  handleNext,
  nativeToken
}: any) => {
  const handleTokensChange = (e: any) => {
    setNumTokens(e.target.value);
  };

  return (
    <>
      <div className="mt-2 items-center justify-center max-h-[40vh] min-w-[16rem] md:min-w-[40vh] lg:min-w-[40vh] overflow-y-auto pb-1 text-sm font-base text-white">
        <div>Enter the number of tokens to vault.</div>
        <div className="w-full mt-6 flex items-center justify-center">
          <div className="flex flex-col items-center justify-center rounded-lg p-2">
            <div className=" text-center rounded-lg">
              <Input
                id="numTokens"
                value={numTokens}
                onChange={handleTokensChange}
                placeholder="0.00"
                type="number"
                className="w-full border-sky-600 border-2 text-center text-lg bg-neutral-900 rounded-lg pr-0 py-5 focus-visible:ring-0 focus-visible:border-2 font-mono"
              />
            </div>
            <div className="p-2 flex items-center justify-center w-full h-auto bg-sky-800 border-sky-500 border text-center rounded-md mt-2 text-white font-mono border-2">
              {selectedRow.ticker}
            </div>
          </div>
        </div>
         <div className="my-9"></div>

        <div className="w-full flex items-center justify-center">
          <Button
            className="relative py-2 h-2/3 w-auto text-black rounded-md font-medium px-12"
            // className="w-1/2"
            type="submit"
            onClick={handleNext}
          >
            Confirm
            <BottomGradient />
          </Button>
        </div>
        <div className="text-xs w-full text-center mt-8">&#x26A0; {`You will need a sufficient ${nativeToken} balance to complete the vault.`}</div>
      </div>
    </>
  );
};

const SummarySection = ({
  numTokens,
  selectedRow,
  authOptions,
  completeVault,
  buttonText,
}: any) => {
  return (
    <>
      <div className="mt-2 items-center justify-center max-h-[60vh] min-w-[16rem] md:min-w-[50vh] lg:min-w-[50vh] overflow-y-auto px-1 pb-1 text-white px-0">
        <div>Review your vault details below.</div>

        <div className="w-full mt-6 flex items-center justify-center px-4">
          <div className="w-full flex flex-col items-center justify-center rounded-lg p-2 px-8">
            <div
              className={`h-[8vh] flex items-center bg-sky-900 border-sky-500 border-2 rounded-lg px-4 py-2 my-1 cursor-pointer w-full`}
            >
              {" "}
              <span className="flex-1 pr-2">1. Allocate</span>
              <div className="flex justify-center items-center gap-2">
                {/* numTokens div */}
                <div className="flex items-center justify-center bg-sky-700 rounded-lg px-4 pb-1 pt-2">
                  <span
                    id="numTokens"
                    className="text-white text-center text-sm font-mono"
                  >
                    {numTokens} {selectedRow.ticker}
                  </span>
                </div>
              </div>
            </div>
            <div
              className={`h-[8vh] flex items-center bg-sky-900 border-sky-500 border-2 rounded-lg px-4 py-2 my-1 cursor-pointer w-full`}
            >
              <span className="flex-1 pr-2">2. Secure</span>
              <div className="flex w-auto gap-2">
                {" "}
                {/* Add flex and gap classes here */}
                {authOptions
                  .filter((authOption: any) => authOption.checked)
                  .map((authOption: any) => {
                    return (
                      <div
                        className="h-1/2 w-[1.5rem] flex items-center text-xs justify-center rounded transition-all duration-300"
                        key={authOption.name} // Add a key for each element
                      >
                        {authOption.icon}
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>

        <div className="my-8"></div>

        <div className="w-full flex items-center justify-center">
          <Button
            // className="bg-gradient-to-b relative group/btn from-sky-900  to-slate-900 block  w-2/3 text-white rounded-md h-10 font-medium"
            className="relative py-2 h-2/3 w-auto text-black rounded-md font-medium px-12"
            type="submit"
            onClick={completeVault}
          >
            <div className={buttonText != "Vault" ? "mr-2" : ""}>
              {buttonText}
            </div>
            <ScaleLoader
              loading={buttonText != "Vault"}
              color="#0ea5e9"
              height={20}
              margin={1}
              radius={7}
              width={2}
            />
          </Button>
        </div>
      </div>
    </>
  );
};

const BottomGradient = () => {
  return (
    <>
      <span className="group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
      <span className="group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
    </>
  );
};

const VaultSection = ({
  handleAuthOptionClick,
  handleNext,
  checkCustomPwd,
  authOptions,
}: any) => {
  return (
    <>
      <div className="mt-2 items-center justify-center max-h-[60vh] min-w-[16rem] md:min-w-[50vh] lg:min-w-[50vh] overflow-y-auto px-2 pb-1 text-white px-0">
        <div>
          Select the security layers you want enforced to unvault the tokens.
        </div>

        <div className="w-full mt-6 flex items-center justify-center px-4">
          <div className="w-full flex flex-col items-center justify-center rounded-lg p-2">
            {authOptions.map((authOption: any) => (
              <AuthSelection
                key={authOption.name}
                authOption={authOption}
                handleAuthOptionClick={handleAuthOptionClick}
                checkCustomPwd={checkCustomPwd}
              />
            ))}
          </div>
        </div>

        <div className="w-full flex items-center justify-center">
          <Button
            // className="bg-gradient-to-b relative group/btn from-sky-900  to-slate-900 block  w-2/3 text-white rounded-md h-10 font-medium"
            className="relative py-2 h-2/3 w-auto text-black rounded-md font-medium px-12 mt-8"
            type="submit"
            onClick={handleNext}
          >
            Next
          </Button>
        </div>
        <div className="text-xs w-full text-center mt-8">&#x26A0; {`Each additional MFA method will cost 1 VAULT token.`}</div>
      </div>
    </>
  );
};

export function VaultAssetModal({
  open,
  onClose,
  selectedRow,
  fetchAssets,
  setShowError,
  setErrorTitle,
  setErrorMessage,
  nativeToken
}: any) {
  useEffect(() => {
    console.log("Selected row in VaultAssetModal:", selectedRow);
  }, [selectedRow]);

  const { web3, getStorage, batchVaultAndSetMFA } = useStorage();

  // TODO: fix closing to now allow that split-second view of allocate again
  const handleClose = () => {
    onClose();
    setShowAllocateSection(true);
    setShowSecureSection(false);
    setNumTokens("");
    setAuthOptions(authOptionsDefault);
    setButtonText("Vault");
  };

  const completeVault = async () => {
    setButtonText("Checking allowance..");
    try {
      const checkedAuthOptions = authOptions
        .filter((obj) => obj.checked)
        .map((a) => a.address);

      const readableBalanceNumber = parseFloat(numTokens);
      const rawBalanceNumber = BigInt(readableBalanceNumber * Math.pow(10, 18));

      console.log(
        `${selectedRow.tokenAddress}, ${rawBalanceNumber.toString()}, ${
          selectedRow?.tokenId ?? ""
        }, ${selectedRow.isERC20}, ${customPwdChecked}, ${checkedAuthOptions}`
      );

      await batchVaultAndSetMFA(
        selectedRow.tokenAddress,
        rawBalanceNumber.toString(),
        selectedRow?.tokenId ?? "0",
        selectedRow.isERC20,
        customPwdChecked,
        checkedAuthOptions
      );
      setButtonText("Awaiting transaction..");
      fetchAssets();

      handleClose();
    } catch (e: any) {
      setShowError(true);
      setErrorTitle("Error with transaction");
      setErrorMessage(
        `There was an error with the transaction: ${e.toString()}`
      );
      setButtonText("Vault");
    }
  };

  const [showAllocateSection, setShowAllocateSection] = useState(true);
  const [showSecureSection, setShowSecureSection] = useState(false);

  const [authOptions, setAuthOptions] = useState(authOptionsDefault);

  const [numTokens, setNumTokens] = useState("");
  const [customPwdChecked, setCustomPwdChecked] = useState("");
  const [buttonText, setButtonText] = useState("Vault");

  const handleNext = () => {
    if (showAllocateSection) {
      setShowAllocateSection(false);
      setShowSecureSection(true);
    } else if (showSecureSection) {
      setShowSecureSection(false);
    }
  };

  const handleAuthOptionClick = (clickedName: string) => {
    setAuthOptions(
      authOptions.map((option: any) => {
        if (option.name === clickedName) {
          return { ...option, checked: !option.checked, confirm: false };
        }
        return option;
      })
    );
  };

  const checkCustomPwd = (
    clickedName: string,
    customPwd: string,
    confirmCustomPwd: string
  ) => {
    if (customPwd === confirmCustomPwd) {
      setCustomPwdChecked(customPwd);
      setAuthOptions(
        authOptions.map((option) => {
          if (option.name === clickedName) {
            if (option.custom && option)
              return {
                ...option,
                confirm: true,
                checked: true,
                otp: customPwd,
              };
          }
          console.log(option);
          return option;
        })
      );
    }
  };

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-50 overflow-y-auto dark:bg-opacity-75"
        onClose={onClose}
      >
        <div className="flex min-h-screen items-center justify-center">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-500"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-600 dark:bg-gray-900 bg-opacity-50 dark:bg-opacity-50 backdrop-filter backdrop-blur-sm" />
          </Transition.Child>

          <Transition.Child
            as={Fragment}
            enter="ease-out duration-500"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-300"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
              <div className="relative mx-auto mt-6 max-w-screen-2xl rounded-lg border-2 border-sky-700 bg-black px-4 pb-4 pt-5 text-left shadow-xl sm:my-20 sm:w-full sm:max-w-3xl sm:p-6 px-6">
              <div className="absolute right-0 top-0 pr-4 pt-4 sm:block">
                  <button
                    type="button"
                    className="rounded-md bg-neutral-950 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-sky-500 focus:ring-offset-2 dark:hover:text-gray-400"
                    onClick={handleClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon
                      className="h-6 w-6 text-sky-500 hover:text-sky-600 dark:text-sky-600 dark:hover:text-sky-500 bg-neutral-900 rounded"
                      aria-hidden="true"
                    />
                  </button>
                </div>
                <Dialog.Title as="h3" className="text-xl font-bold text-white">
                  {showAllocateSection
                    ? "Allocate"
                    : showSecureSection
                    ? "Secure"
                    : "Summary"}
                </Dialog.Title>
                {showAllocateSection ? (
                  <AllocateSection
                    numTokens={numTokens}
                    setNumTokens={setNumTokens}
                    selectedRow={selectedRow}
                    handleNext={handleNext}
                    nativeToken={nativeToken}
                  />
                ) : showSecureSection ? (
                  <VaultSection
                    handleAuthOptionClick={handleAuthOptionClick}
                    handleNext={handleNext}
                    checkCustomPwd={checkCustomPwd}
                    authOptions={authOptions}
                  />
                ) : (
                  <SummarySection
                    numTokens={numTokens}
                    selectedRow={selectedRow}
                    authOptions={authOptions}
                    completeVault={completeVault}
                    buttonText={buttonText}
                  />
                )}
              </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
