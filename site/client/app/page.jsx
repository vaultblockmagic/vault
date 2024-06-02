"use client";

import { useState } from "react";
import { StorageProvider, useStorage } from "@/components/storage";
import HeroSection from "@/components/landing/hero-section";
import Particles from "@/components/magicui/particles";
import { SphereMask } from "@/components/magicui/sphere-mask";
import Signup from "@/components/dapp/signup";
import DappMain from "@/components/dapp/dapp-main";
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

export default function Page() {
  const [currentPage, setCurrentPage] = useState("heroSection");
  const [showError, setShowError] = useState(false);
  const [errorTitle, setErrorTitle] = useState("Error");
  const [errorMessage, setErrorMessage] = useState("An error has occurred.");

  const handlePageTransition = (page) => {
    setCurrentPage(page);
  };

  return (
    <>
      <Particles
        className="absolute inset-0 -z-10"
        quantity={50}
        ease={70}
        size={0.03}
        staticity={40}
        color={"#7DD3FC"}
      />
      <AlertDialog open={showError} onOpenChange={setShowError}>
        <AlertDialogContent className="border-sky-700 border-2 rounded-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>{errorTitle}</AlertDialogTitle>
            <AlertDialogDescription>{errorMessage}</AlertDialogDescription>
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

      {/* <div className="fixed top-0 left-0 z-50 pointer-events-none">
        <iframe
          width="235"
          height="54"
          src="https://w2.countingdownto.com/5585501"
        ></iframe>
      </div> */}

      <div className="relative">
        <div
          className={`mt-36 absolute inset-x-10 sm:inset-x-20 md:inset-x-32 lg:inset-x-48 top-20 bottom-10 sm:bottom-20 md:bottom-32 lg:bottom-48 rounded-xl before:absolute before:inset-0 before:opacity-0 before:[filter:blur(180px)] before:[background-image:linear-gradient(to_bottom,var(--color-one),var(--color-one),transparent_80%)] before:animate-image-glow sm:before:animate-image-glow-sm -z-1`}
        />
        {currentPage === "heroSection" && (
          <HeroSection goToNext={() => handlePageTransition("signupPage")} />
        )}
        {currentPage === "signupPage" && (
          <Signup
            goToNext={() => handlePageTransition("dappMain")}
            setShowError={setShowError}
            setErrorTitle={setErrorTitle}
            setErrorMessage={setErrorMessage}
          />
        )}
        {currentPage === "dappMain" && (
          <DappMain
            goToNext={() => handlePageTransition("heroSection")}
            setShowError={setShowError}
            setErrorTitle={setErrorTitle}
            setErrorMessage={setErrorMessage}
          />
        )}
      </div>
    </>
  );
}
