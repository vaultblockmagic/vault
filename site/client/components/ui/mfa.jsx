"use client";

import { React, useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { PinContainer } from "./3d-pin";
import { useQRCode } from "next-qrcode";
import { Checkbox } from "./checkbox";
import { GoogleAuthSVG } from "../svg/google-auth";
import { MSAuthSVG } from "../svg/ms-auth";
import { Logo } from "../svg/logo";
import { Button } from "@/components/ui/button";
import { BorderBeam } from "@/components/ui/border-beam";
import { StorageProvider, useStorage } from "@/components/storage";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { toast } from "sonner";

export function MFASetup({ goToNext }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted");
  };

  const [showQR, setShowQR] = useState(false);
  const [qrURL, setQRUrl] = useState("");
  const [authName, setAuthName] = useState("");
  const [registeredMFA, setRegisteredMFA] = useState([]);

  const { getStorage } = useStorage();

  const qr_uri_one = getStorage("qr_uri_one");
  const qr_uri_two = getStorage("qr_uri_two");

  const handleChange = (event) => {
    setUsername(event.target.value);
  };

  const toggleQRDisplay = (url, name) => {
    if (url) {
      if (!showQR) {
        setShowQR(true);
      }
      setAuthName(name);
      setQRUrl(url);
    } else {
      setShowQR(false);
    }
  };

  const handleMFAPinClick = (url, name) => {
    if (!isMFARegistered(name)) {
      toggleQRDisplay(url, name);
      setRegisteredMFA([...registeredMFA, name]);
    }
  };

  const isMFARegistered = (name) => {
    return registeredMFA.includes(name);
  };

  const MFAPin = ({ url, name, svg }) => {
    return (
      <PinContainer
        children={
          <div
            onClick={() => handleMFAPinClick(url, name)}
            disabled={isMFARegistered(name)}
            className={`flex flex-col p-1 tracking-tight text-slate-100/50 w-[8rem] h-[8rem] ${
              isMFARegistered(name) ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <h3 className="max-w-xs !pb-2 !m-0 font-bold  text-sm text-slate-100">
              {name}
            </h3>
            <div className="flex flex-1 w-full rounded-lg mt-2 bg-gradient-to-br from-sky-600 via-indigo-600 to-sky-800 justify-center items-center">
              {svg}
            </div>
          </div>
        }
        title={`Generate ${name} QR Code`}
        href=""
        className="w-full m-0"
        containerClassName=""
      />
    );
  };

  return (
    <div className="relative max-w-md w-full mx-auto rounded-none md:rounded-2xl p-4 md:p-8 md:pt-5 shadow-input bg-black border-2 border-sky-700">
      <div className="flex mb-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>
                <span className="text-slate-400 font-bold">Account</span>
              </BreadcrumbPage>
            </BreadcrumbItem>
            <>
              <BreadcrumbSeparator className="mt-[1.2px] font-slate-400" />
              <BreadcrumbItem>
                <BreadcrumbPage>
                  <span className="text-sky-500 font-bold">Security</span>
                </BreadcrumbPage>
              </BreadcrumbItem>
            </>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <BorderBeam
        borderWidth={2}
        duration={12}
        colorFrom="#0099ff"
        colorTo="#0369a1"
        className="pointer-events-none absolute -inset-[2px] rounded-xl"
      />
      <h2 className="font-bold text-xl text-white">2 Factor Authentication</h2>
      <p className="text-white text-sm max-w-sm mt-2">
        Select the 2FA providers you would like to register to your account and
        unlock your assets with.
      </p>

      <form className="mt-8 w-full" onSubmit={handleSubmit}>
        {!showQR && (
          <div>
            <div className="items-center justify-center text-center grid grid-cols-2 gap-x-6 data-[state=checked]:text-sky-500">
              <div className="text-black">
                <MFAPin
                  url={qr_uri_one}
                  className="bg-black"
                  name="Google Authenticator"
                  svg={<GoogleAuthSVG className="w-10 h-10" />}
                />
              </div>
              <div className="text-black">
                <MFAPin
                  url={qr_uri_two}
                  name="Microsoft Authenticator"
                  svg={<MSAuthSVG className="w-10 h-10" />}
                />
              </div>
              <div className="flex items-center justify-center text-sky-500">
                <div className="flex bg-sky-900 items-center justify-center rounded-lg w-1/3 py-3">
                  <Checkbox
                    checked={isMFARegistered("Google Authenticator")}
                    className="w-[1.5rem] h-[1.5rem] border-2"
                  />
                </div>
              </div>
              <div className="flex items-center justify-center text-sky-500">
                <div className="flex bg-sky-900 items-center justify-center rounded-lg w-1/3 py-3">
                  <Checkbox
                    checked={isMFARegistered("Microsoft Authenticator")}
                    className="w-[1.5rem] h-[1.5rem] border-2"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {showQR && (
          <div className="w-full items-center justify-center">
            <QRCodeHolder url={qrURL} name={authName} />
          </div>
        )}

        <div className="my-8 h-[1px] w-full" />

        <Button
          className="w-full"
          onClick={() => {
            if (showQR) {
              setShowQR(false);
              if (!registeredMFA.includes(authName)) {
                setRegisteredMFA([...registeredMFA, authName]);
              }
            } else {
              toast.success(
                "You have successfully registered and been airdroped 10000 VAULT tokens",
              );
              toast.info(
                "Please allow 2 minutes for arbitrum signup to complete",
              );
              goToNext();
            }
          }}
        >
          {registeredMFA.length === 2 && !showQR ? "Sign Up" : "Next"}
        </Button>
      </form>
    </div>
  );
}

const QRCodeHolder = ({ url, name }) => {
  const { SVG } = useQRCode();
  console.log(`qrURL: ${url}, name:${name}`);
  return (
    <>
      <div className="w-full text-white text-center">{name}</div>
      <div className="flex w-full text-center text-black items-center justify-center text-sm p-4">
        <div className="rounded-xl border-2 border-sky-500 bg-white p-1">
          <SVG
            text={url}
            options={{
              margin: 2,
              width: 200,
              color: {
                dark: "#000000",
                light: "#FFFFFF",
              },
            }}
          />
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
