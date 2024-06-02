"use client";

import { Logo } from "@/components/svg/logo";
import { MFASetup } from "@/components/ui/mfa";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { BorderBeam } from "@/components/ui/border-beam";
import { useEffect, useRef, useState } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StorageProvider, useStorage } from "@/components/storage";
import { poseidon } from "@/components/poseidon-hash";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export default function Signup({
  goToNext,
  setShowError,
  setErrorTitle,
  setErrorMessage,
}) {
  const ref = useRef(null);
  const [activeTab, setActiveTab] = useState("account");
  const [recover, setRecover] = useState(false);
  const { getStorage } = useStorage();

  useEffect(() => {
    const username = getStorage("username");
    const password = getStorage("password");

    if (username && password) {
      goToNext();
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="w-[400px] relative z-10">
        {activeTab === "account" && recover && (
          <RecoveryForm
            goToNext={goToNext}
            setActiveTab={setActiveTab}
            activeTab={activeTab}
            setRecover={setRecover}
            setShowError={setShowError}
            setErrorTitle={setErrorTitle}
            setErrorMessage={setErrorMessage}
          />
        )}
        {activeTab === "account" && !recover && (
          <SignupForm
            goToNext={goToNext}
            setActiveTab={setActiveTab}
            activeTab={activeTab}
            setRecover={setRecover}
            setShowError={setShowError}
            setErrorTitle={setErrorTitle}
            setErrorMessage={setErrorMessage}
          />
        )}
        {activeTab === "security" && <MFASetup goToNext={goToNext} />}
      </div>
    </div>
  );
}

function SignupForm({
  goToNext,
  setActiveTab,
  activeTab,
  setRecover,
  setShowError,
  setErrorTitle,
  setErrorMessage,
}) {
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted");
  };

  const [username, setUsernameText] = useState("");
  const [password, setPasswordText] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [usernameAvailability, setUsernameAvailability] = useState(null);

  const handleChangeusername = (event) => {
    setUsernameText(event.target.value);
    if (event.target.value.trim() !== "") {
      const delayDebounceFn = setTimeout(async () => {
        const exists = await checkUsernameExists(event.target.value + ".vault");
        setUsernameAvailability(exists ? "existing" : "available");
      }, 500);
      return () => clearTimeout(delayDebounceFn);
    } else {
      setUsernameAvailability(null);
    }
  };

  const handleChangepassword = (event) => {
    setPasswordText(event.target.value);
  };

  const {
    web3,
    setUsername,
    splitTo24,
    stringToBigInt,
    setStorage,
    getStorage,
    registerMFA,
    registerPassword,
    checkUsernameAndPassword,
    checkUsernameExists,
    registerENS,
  } = useStorage();

  const handleClick = async () => {
    try {
      let suffixedUsername = username + ".vault";
      console.log(suffixedUsername, password);

      let [first, second] = splitTo24(password);
      [first, second] = [stringToBigInt(first), stringToBigInt(second)];
      let hash = await poseidon([first, second]);

      const result = await checkUsernameAndPassword(
        suffixedUsername,
        String(hash),
      );

      if (result === "PROCEED_MFA") {
        // await setUsername(suffixedUsername, String(hash));
        await registerENS(suffixedUsername, String(hash));
        setStorage("username", suffixedUsername);
        let registerMFAResponse = await registerMFA(suffixedUsername);
        setStorage("qr_uri_one", registerMFAResponse["qr_uri_one"]);
        setStorage("qr_uri_two", registerMFAResponse["qr_uri_two"]);
        let accs = await web3.eth.getAccounts();
        console.log(accs[0]);
        let registerPasswordResponse = await registerPassword(
          suffixedUsername,
          password,
        );
        setStorage("password", password);
        setActiveTab("security");
      } else if (result === "SKIP_MFA") {
        setStorage("username", suffixedUsername);
        setStorage("password", password);
        let accs = await web3.eth.getAccounts();
        console.log(accs[0]);
        toast.success("Login successful as " + suffixedUsername);
        goToNext();
      } else {
        console.log(result);
        toast.error("Please initiate sign up again.");
        setShowDialog(true);
      }
    } catch (e) {
      setShowError(true);
      setErrorTitle("Error with transaction");
      setErrorMessage(
        `There was an error with the transaction: ${e.toString()}`,
      );
      setButtonText("Vault");
    }
  };

  return (
    <>
      <Card className="relative border-2 border-sky-700">
        <div className="flex mb-2 mt-4 ml-[24px]">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>
                  <span
                    className={`cursor-default ${
                      activeTab === "account"
                        ? "text-sky-500 font-bold"
                        : "text-slate-400 font-bold"
                    }`}
                  >
                    Account
                  </span>
                </BreadcrumbPage>
              </BreadcrumbItem>
              {usernameAvailability !== "existing" && (
                <>
                  <BreadcrumbSeparator className="mt-[1.2px] font-slate-400" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>
                      <span
                        className={`cursor-default ${
                          activeTab === "security"
                            ? "text-sky-500 font-bold"
                            : "text-slate-400 font-bold"
                        }`}
                      >
                        Security
                      </span>
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </>
              )}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <CardHeader className="pt-4">
          <CardTitle>Welcome to Vault</CardTitle>
          <CardDescription>
            Enter your details below to get started or log in to your existing
            account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <form onSubmit={handleSubmit}>
            <div className="space-y-1">
              <Label htmlFor="username" className="ml-1">
                Username
                {username.trim() !== "" &&
                  usernameAvailability === "available" && (
                    <span className="text-sky-500 font-bold ml-2">
                      (username available)
                    </span>
                  )}
                {username.trim() !== "" &&
                  usernameAvailability === "existing" && (
                    <span className="text-amber-500 font-bold ml-2">
                      (existing user)
                    </span>
                  )}
              </Label>
              <div className="relative">
                <Input
                  id="username"
                  type="text"
                  placeholder="satoshi"
                  value={username}
                  onChange={handleChangeusername}
                  className="border-2 focus-visible:border-sky-700 focus-visible:ring-0 pr-16 font-mono"
                />
                <span className="absolute right-2.5 top-1/2 transform -translate-y-[14px] text-sky-500 font-mono">
                  .vault
                </span>
              </div>
            </div>
            <div className="space-y-1 mt-2">
              <Label htmlFor="password" className="ml-1">
                Password
              </Label>
              <Input
                id="password"
                placeholder="••••••••"
                type="password"
                value={password}
                onChange={handleChangepassword}
                className="border-2 focus-visible:border-sky-700 focus-visible:ring-0"
              />
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <Button onClick={handleClick}>
            {username.trim() !== "" && usernameAvailability === "existing"
              ? "Login"
              : "Next"}
          </Button>
        </CardFooter>
        <div className="mb-4 text-sm text-center text-gray-500">
          existing account compromised?{" "}
          <Button
            className="underline text-sm text-center text-gray-500 bg-transparent p-0 hover:bg-transparent"
            onClick={() => setRecover(true)}
          >
            recover assets here.
          </Button>
        </div>
        <BorderBeam
          borderWidth={2}
          duration={12}
          colorFrom="#0099ff"
          colorTo="#0369a1"
          className="pointer-events-none absolute -inset-[2px] rounded-xl"
        />
      </Card>
      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent className="border-sky-700 border-2 rounded-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Login Error</AlertDialogTitle>
            <AlertDialogDescription>
              Your login details are incorrect or the wallet address does not
              match the registered wallet for the username.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex justify-center items-center">
            <AlertDialogAction
              onClick={() => setShowError(false)}
              className="w-1/6 h-3/4"
            >
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function RecoveryForm({
  goToNext,
  setActiveTab,
  activeTab,
  setRecover,
  setShowError,
  setErrorTitle,
  setErrorMessage,
}) {
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted");
  };

  const [username, setUsernameText] = useState("");
  const [password, setPasswordText] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [usernameAvailability, setUsernameAvailability] = useState(null);

  const handleChangeusername = (event) => {
    setUsernameText(event.target.value);
    if (event.target.value.trim() !== "") {
      const delayDebounceFn = setTimeout(async () => {
        const exists = await checkUsernameExists(event.target.value + ".vault");
        setUsernameAvailability(exists ? "existing" : "available");
      }, 500);
      return () => clearTimeout(delayDebounceFn);
    } else {
      setUsernameAvailability(null);
    }
  };

  const handleChangepassword = (event) => {
    setPasswordText(event.target.value);
  };

  const { checkUsernameExists, recoverENS, setStorage } = useStorage();

  const handleClick = async () => {
    let suffixedUsername = username + ".vault";
    await recoverENS(suffixedUsername, password);
    setStorage("username", suffixedUsername);
    setStorage("password", password);
    goToNext();
  };

  return (
    <>
      <Card className="relative border-2 border-sky-700">
        <div className="flex mb-2 mt-4 ml-[24px]">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>
                  <div
                    className={"cursor-pointer text-slate-400 font-bold"}
                    onClick={() => setRecover(false)}
                  >
                    Account
                  </div>
                </BreadcrumbPage>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="mt-[1.2px] font-slate-400" />
              <BreadcrumbItem>
                <BreadcrumbPage>
                  <span className={"cursor-default text-sky-500 font-bold"}>
                    Recover
                  </span>
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <CardHeader className="pt-4">
          <CardTitle>Recover Compromised Assets</CardTitle>
          <CardDescription>
            Enter the details of your compromised wallet registered with us.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <form onSubmit={handleSubmit}>
            <div className="space-y-1">
              <Label htmlFor="username" className="ml-1">
                Username
                {username.trim() !== "" &&
                  usernameAvailability === "available" && (
                    <span className="text-amber-500 font-bold ml-2">
                      (user not found)
                    </span>
                  )}
                {username.trim() !== "" &&
                  usernameAvailability === "existing" && (
                    <span className="text-sky-500 font-bold ml-2">
                      (user found)
                    </span>
                  )}
              </Label>
              <div className="relative">
                <Input
                  id="username"
                  type="text"
                  placeholder="satoshi"
                  value={username}
                  onChange={handleChangeusername}
                  className="border-2 focus-visible:border-sky-700 focus-visible:ring-0 pr-16 font-mono"
                />
                <span className="absolute right-2.5 top-1/2 transform -translate-y-[14px] text-sky-500 font-mono">
                  .vault
                </span>
              </div>
            </div>
            <div className="space-y-1 mt-2">
              <Label htmlFor="password" className="ml-1">
                Password
              </Label>
              <Input
                id="password"
                placeholder="••••••••"
                type="password"
                value={password}
                onChange={handleChangepassword}
                className="border-2 focus-visible:border-sky-700 focus-visible:ring-0"
              />
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex items-center justify-center">
          <Button onClick={handleClick}>Recover</Button>
        </CardFooter>

        <BorderBeam
          borderWidth={2}
          duration={12}
          colorFrom="#0099ff"
          colorTo="#0369a1"
          className="pointer-events-none absolute -inset-[2px] rounded-xl"
        />
      </Card>
      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent className="border-sky-700 border-2 rounded-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Login Error</AlertDialogTitle>
            <AlertDialogDescription>
              Your login details are incorrect or the wallet address does not
              match the registered wallet for the username.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex justify-center items-center">
            <AlertDialogAction
              onClick={() => setShowError(false)}
              className="w-1/6 h-3/4"
            >
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
