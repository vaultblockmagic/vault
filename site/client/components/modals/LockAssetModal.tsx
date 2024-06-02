import { Fragment, useEffect, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon, CheckIcon } from "@heroicons/react/24/outline";
import { Input } from "../ui/input";
import { ShieldCheck, Clock, Infinity } from "@phosphor-icons/react";
import { Calendar } from "@/components/ui/calendar";
import { TimePicker, ConfigProvider, Space, theme } from "antd";
import type { Dayjs } from "dayjs";
import { Button } from "@/components/ui/button";
import { authOptionsDefault } from "../constants";
import { AuthSelection } from "../ui/auth-options-select";
import { useStorage } from "../storage";
import ScaleLoader from "react-spinners/ScaleLoader";

const AllocateSection = ({
  handleNext,
  numTokens,
  setNumTokens,
  selectedRow,
  nativeToken,
}: any) => {
  const handleTokensChange = (e: any) => {
    setNumTokens(e.target.value);
  };

  return (
    <>
      <div className="mt-2 items-center justify-center max-h-[40vh] min-w-[16rem] md:min-w-[40vh] lg:min-w-[40vh] overflow-y-auto pb-1 text-sm font-base text-white">
        <div>The number of tokens you will be locking.</div>

        <div className="w-full mt-6 flex items-center justify-center">
          <div className="flex flex-col items-center justify-center rounded-lg p-2">
            <div className=" text-center rounded-lg">
              <div className="disabled w-full border-sky-600 border-2 text-center text-lg bg-neutral-900 rounded-lg px-8 py-2 focus-visible:ring-0 focus-visible:border-2 font-mono">
                {selectedRow.bal}
              </div>
            </div>
            <div className="p-2 flex items-center justify-center w-full h-auto bg-sky-800 border-sky-500 border text-center rounded-md mt-2 text-white font-mono border-2">
              {selectedRow.ticker}
            </div>
          </div>
        </div>
        <div className="my-9"></div>

        <div className="w-full flex items-center justify-center">
          <Button
            // className="bg-gradient-to-b relative group/btn from-sky-900  to-slate-900 block  w-2/3 text-white rounded-md h-10 font-medium"
            className="relative py-2 h-2/3 w-1/3 text-black rounded-md font-medium"
            type="submit"
            onClick={handleNext}
          >
            Confirm
            <BottomGradient />
          </Button>
        </div>
        <div className="text-xs w-full text-center mt-8">
          &#x26A0;{" "}
          {`You will need a sufficient ${nativeToken} balance to complete the vault.`}
        </div>
      </div>
    </>
  );
};

const TimeSection = ({
  lockDate,
  lockTime,
  setLockDate,
  setLockTime,
  handleNext,
  fullDateTime,
  setFullDateTime,
}: any) => {
  const onTimeChange = (time: Dayjs) => {
    setLockTime(time);
  };

  return (
    <>
      <div className="mt-2 items-center justify-center max-h-[70vh] min-w-[16rem] md:min-w-[40vh] lg:min-w-[40vh] overflow-y-auto pb-1 text-sm font-base text-white">
        <div>Enter the date and time you want this token to be unlocked.</div>

        <div className="w-full mt-6 flex items-center justify-center">
          <div className="w-auto h-auto flex flex-col items-center justify-center rounded-lg p-2 px-24">
            <div className="w-full text-center rounded-lg">
              <Calendar
                mode="single"
                selected={lockDate}
                onSelect={setLockDate}
                className="rounded-md border h-full border-neutral-400 bg-neutral-900 border-sky-600"
              />
            </div>
            <div className="pt-2 w-full justify-center text-center rounded-lg">
              <ConfigProvider
                theme={{
                  // 1. Use dark algorithm
                  algorithm: theme.darkAlgorithm,
                  components: {
                    Button: {
                      colorPrimary: "#0ea5e9",
                      defaultActiveBg: "#ffffff",
                    },
                    DatePicker: {
                      colorBorder: "#0369a1",
                      hoverBorderColor: "#0ea5e9",
                      activeBorderColor: "#0369a1",
                    },
                  },

                  // 2. Combine dark algorithm and compact algorithm
                  // algorithm: [theme.darkAlgorithm, theme.compactAlgorithm],
                }}
              >
                <Space className="flex w-full justify-center">
                  <TimePicker
                    className="w-full"
                    value={lockTime}
                    onChange={onTimeChange}
                  />
                </Space>
              </ConfigProvider>
              <div className="p-2">
                <Button
                  className="h-[25px] w-1/4 bg-neutral-900 hover:bg-neutral-800 border-sky-600 border"
                  onClick={() => setFullDateTime("Forever")}
                >
                  <Infinity className="w-5 h-5 text-sky-600" />
                </Button>
              </div>
              <div className="mt-2 w-full py-2 bg-neutral-900 rounded-lg">
                {fullDateTime}
              </div>
            </div>
          </div>
        </div>

        <div className="w-full flex items-center justify-center">
          <Button
            // className="bg-gradient-to-b relative group/btn from-sky-900  to-slate-900 block  w-2/3 text-white rounded-md h-10 font-medium"
            className="relative py-2 h-2/3 w-auto text-black rounded-md font-medium px-12"
            type="submit"
            onClick={handleNext}
          >
            Next
            <BottomGradient />
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
  handleNext,
  authOptions,
  handleAuthOptionClick,
  checkCustomPwd,
}: any) => {
  return (
    <>
      <div className="mt-2 items-center justify-center max-h-[60vh] min-w-[16rem] md:min-w-[50vh] lg:min-w-[50vh] overflow-y-auto px-1 pb-1 text-white">
        <div>
          Select the security layers you want enforced to unlock the tokens.
        </div>

        <div className="w-full mt-6 flex items-center justify-center px-4">
          <div className="w-full h-[40vh] flex flex-col items-center justify-center rounded-lg p-2">
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
            className="relative py-2 h-2/3 w-auto text-black rounded-md font-medium px-12"
            type="submit"
            onClick={handleNext}
          >
            Next
            <BottomGradient />
          </Button>
        </div>
        <div className="text-xs w-full text-center mt-8">
          &#x26A0; {`Each additional MFA method will cost 1 VAULT token.`}
        </div>
      </div>
    </>
  );
};

const SummarySection = ({
  completeLock,
  numTokens,
  selectedRow,
  authOptions,
  isTimeLock,
  fullDateTime,
  buttonText,
}: any) => {
  return (
    <>
      <div className="mt-2 items-center justify-center max-h-[60vh] min-w-[16rem] md:min-w-[50vh] lg:min-w-[50vh] overflow-y-auto px-1 pb-1 text-white">
        <div>Review your lock details below.</div>

        <div className="w-full mt-6 flex items-center justify-center px-4">
          <div className="w-full h-[40vh] flex flex-col items-center justify-center rounded-lg p-2 px-8">
            <div
              className={`h-[8vh] flex items-center bg-sky-900 border-sky-500 border rounded-lg px-4 py-2 my-1 cursor-pointer w-full`}
            >
              {" "}
              <span className="flex-1 pr-2">1. Allocate</span>
              <div className="flex justify-center items-center gap-2">
                {/* numTokens div */}
                <div className="flex items-center justify-center bg-sky-800 rounded-lg px-4 py-2">
                  <span
                    id="numTokens"
                    className="text-white text-center text-sm"
                  >
                    {selectedRow.bal}
                  </span>
                </div>

                {/* logo and ticker div */}
                <div className="flex items-center justify-center bg-sky-800 rounded-2xl px-4 py-2 text-white">
                  <div className="mr-2">{selectedRow.logo}</div>
                  <span>{selectedRow.ticker}</span>
                </div>
              </div>
            </div>
            <div
              className={`h-[8vh] flex items-center bg-sky-900 border-sky-500 border rounded-lg px-4 py-2 my-1 cursor-pointer w-full`}
            >
              <span className="flex-1 pr-2">2. Secure</span>
              <div className="flex w-auto gap-2">
                {" "}
                {/* Add flex and gap classes here */}
                {!isTimeLock ? (
                  authOptions
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
                    })
                ) : (
                  <div className="h-1/2 w-auto flex items-center text-xs justify-center rounded text-wrap transition-all duration-300">
                    {fullDateTime}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="w-full flex items-center justify-center">
          <Button
            className="relative py-2 h-2/3 w-auto text-black rounded-md font-medium px-12"
            type="submit"
            onClick={completeLock}
          >
            <div className={buttonText != "Lock" ? "mr-2" : ""}>
              {buttonText}
            </div>
            <ScaleLoader
              loading={buttonText != "Lock"}
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

const LockModeSection = ({ handleNext, isTimeLock, setIsTimeLock }: any) => {
  const handleTimeClick = () => {
    setIsTimeLock(true);
  };

  const handleMFAClick = () => {
    setIsTimeLock(false);
  };
  return (
    <>
      <div className="mt-2 items-center justify-center max-h-[70vh] min-w-[16rem] md:min-w-[40vh] lg:min-w-[40vh] overflow-y-auto pb-1 text-sm font-base text-white">
        <div>Select a method to use for your token lock below.</div>

        <div className="w-full mt-6 flex items-center justify-center">
          <div className="w-[24rem] h-[45vh] flex flex-col items-center justify-center rounded-lg p-1">
            <div className="flex w-full h-full items-center p-2 gap-4">
              <div
                className={`group w-1/2 h-1/2 rounded-xl p-3 justify-center cursor-pointer border ${
                  isTimeLock
                    ? "bg-sky-900 border-sky-500"
                    : "bg-transparent border-neutral-500"
                }`}
                onClick={handleTimeClick}
              >
                <div className="flex w-full items-center justify-center flex-col">
                  <Clock className="h-14 w-14 text-sky-500" />
                  <div className="mt-2 text-white text-xl font-bold">Time</div>
                  <div className="mt-2 text-white text-sm text-center">
                    Lock your token for a specified time period, or forever.
                  </div>
                </div>
              </div>
              <div
                className={`group w-1/2 h-1/2 rounded-xl p-3 justify-center border-sky-500 border cursor-pointer ${
                  !isTimeLock
                    ? "bg-sky-900 border-sky-500"
                    : "bg-transparent border-neutral-500"
                }`}
                onClick={handleMFAClick}
              >
                <div className="flex w-full items-center justify-center flex-col">
                  <ShieldCheck className="h-14 w-14 text-sky-500" />
                  <div className="mt-2 text-white text-xl font-bold">MFA</div>
                  <div className="mt-2 text-white text-sm text-center">
                    Lock your token using multi-factor authentication.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full flex items-center justify-center">
          <Button
            className="relative py-2 h-2/3 w-1/3 text-black rounded-md font-medium"
            type="submit"
            onClick={handleNext}
          >
            Next
            <BottomGradient />
          </Button>
        </div>
      </div>
    </>
  );
};

export function LockAssetModal({
  open,
  onClose,
  selectedRow,
  fetchAssets,
  setShowError,
  setErrorTitle,
  setErrorMessage,
  nativeToken,
}: any) {
  useEffect(() => {
    console.log("Selected row in LockAssetModal:", selectedRow);
  }, [selectedRow]);

  const handleClose = () => {
    setShowAllocateSection(true);
    setShowLockModeSection(false);
    setShowTimeSection(false);
    setShowSecureSection(false);
    setNumTokens("");
    setAuthOptions(authOptionsDefault);
    setLockDate(new Date());
    setLockTime(null);
    setFullDateTime("");
    setIsTimeLock(true);
    setButtonText("Lock");
    /*
  const [lockDate, setLockDate] = useState<Date | undefined>(new Date());
  const [lockTime, setLockTime] = useState<Dayjs | null>(null);
  const [fullDateTime, setFullDateTime] = useState("")
    */
    onClose();
  };

  const { batchLockAndSetMFA, timelockTokens } = useStorage();

  const dateToUnixTimestamp = (date: Date) => {
    return Math.floor(date.getTime() / 1000);
  };

  const completeLock = async () => {
    try {
      setButtonText("Awaiting transaction..");
      if (isTimeLock) {
        const combinedDateTime =
          fullDateTime === "Forever"
            ? "inf"
            : lockTime
                ?.toDate()
                .setFullYear(
                  lockDate?.getFullYear() as number,
                  lockDate?.getMonth() as number,
                  lockDate?.getDate() as number,
                )
                .toString();
        console.log(combinedDateTime);
        await timelockTokens(
          selectedRow.tokenAddress,
          combinedDateTime as string,
        );
        handleClose();
      } else {
        const customZKPasswordOption = authOptions.find(
          (option) => option.name === "Custom ZK Password",
        );
        const customPassword = customZKPasswordOption
          ? customZKPasswordOption.otp
          : "";

        const checkedAuthOptions = authOptions
          .filter((obj) => obj.checked)
          .map((a) => a.address);

        await batchLockAndSetMFA(
          selectedRow.tokenAddress,
          selectedRow.isERC20,
          customPassword,
          checkedAuthOptions,
        );
        fetchAssets();
        // batchLockAndSetMFA: (
        //   token: string,
        //   isERC20: boolean,
        //   password: string,
        //   mfaProviders: []
        // ) => Promise<void>;
        handleClose();
      }
    } catch (e: any) {
      setShowError(true);
      setErrorTitle("Error with transaction");
      setErrorMessage(
        `There was an error with the transaction: ${e.toString()}`,
      );
      setButtonText("Vault");
    }
  };

  const [showAllocateSection, setShowAllocateSection] = useState(true);
  const [showLockModeSection, setShowLockModeSection] = useState(false);
  const [showTimeSection, setShowTimeSection] = useState(false);
  const [showSecureSection, setShowSecureSection] = useState(false);
  const [customPwdChecked, setCustomPwdChecked] = useState(false);

  const [authOptions, setAuthOptions] = useState(authOptionsDefault);

  const [numTokens, setNumTokens] = useState("");
  const [isTimeLock, setIsTimeLock] = useState(true);
  const [lockDate, setLockDate] = useState<Date | undefined>(new Date());
  const [lockTime, setLockTime] = useState<Dayjs | null>(null);
  const [fullDateTime, setFullDateTime] = useState(" ");
  const [buttonText, setButtonText] = useState("Lock");

  const handleNext = () => {
    if (showAllocateSection) {
      setShowAllocateSection(false);
      setShowLockModeSection(true);
    } else if (showLockModeSection) {
      setShowLockModeSection(false);
      isTimeLock ? setShowTimeSection(true) : setShowSecureSection(true);
    } else if (showTimeSection) {
      setShowTimeSection(false);
    } else if (showSecureSection) {
      setShowSecureSection(false);
    }
  };

  useEffect(() => {
    if (lockDate && lockTime) {
      const unixFullDateTime = lockTime
        ?.toDate()
        .setFullYear(
          lockDate?.getFullYear() as number,
          lockDate?.getMonth() as number,
          lockDate?.getDate() as number,
        );
      console.log(`unixFullDateTime: ${unixFullDateTime}`);
      const dateTime = new Date(unixFullDateTime).toLocaleString();
      setFullDateTime(dateTime);
    }
  }, [lockDate, lockTime]);

  const handleAuthOptionClick = (clickedName: string) => {
    setAuthOptions(
      authOptions.map((option) => {
        if (option.name === clickedName) {
          return { ...option, checked: !option.checked, confirm: false };
        }
        return option;
      }),
    );
  };

  const checkCustomPwd = (
    clickedName: string,
    customPwd: string,
    confirmCustomPwd: string,
  ) => {
    if (customPwd === confirmCustomPwd) {
      setCustomPwdChecked(true);
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
        }),
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
            <div>
              <div className="relative mx-auto mt-6 max-w-screen-2xl rounded-lg border-2 border-sky-700 bg-black px-8 pb-4 pt-5 text-left shadow-xl sm:my-20 sm:w-full sm:max-w-3xl sm:p-6">
                <div className="absolute right-0 top-0 pr-4 pt-4 sm:block">
                  <button
                    type="button"
                    className="rounded-md bg-black text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-sky-500 focus:ring-offset-2 dark:hover:text-gray-400"
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
                    ? "Lock"
                    : showLockModeSection
                      ? "Lock Mode"
                      : showTimeSection
                        ? "Time"
                        : showSecureSection
                          ? "Secure"
                          : "Summary"}
                </Dialog.Title>
                {showAllocateSection ? (
                  <AllocateSection
                    handleNext={handleNext}
                    numTokens={numTokens}
                    setNumTokens={setNumTokens}
                    selectedRow={selectedRow}
                    nativeToken={nativeToken}
                  />
                ) : showLockModeSection ? (
                  <LockModeSection
                    handleNext={handleNext}
                    isTimeLock={isTimeLock}
                    setIsTimeLock={setIsTimeLock}
                  />
                ) : showTimeSection ? (
                  <TimeSection
                    lockDate={lockDate}
                    lockTime={lockTime}
                    setLockDate={setLockDate}
                    setLockTime={setLockTime}
                    handleNext={handleNext}
                    fullDateTime={fullDateTime}
                    setFullDateTime={setFullDateTime}
                  />
                ) : showSecureSection ? (
                  <VaultSection
                    handleNext={handleNext}
                    authOptions={authOptions}
                    handleAuthOptionClick={handleAuthOptionClick}
                    checkCustomPwd={checkCustomPwd}
                  />
                ) : (
                  <SummarySection
                    completeLock={completeLock}
                    numTokens={numTokens}
                    selectedRow={selectedRow}
                    authOptions={authOptions}
                    isTimeLock={isTimeLock}
                    fullDateTime={fullDateTime}
                    buttonText={buttonText}
                  />
                )}
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
