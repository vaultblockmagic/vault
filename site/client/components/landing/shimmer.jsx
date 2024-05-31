import ShimmerButton from "@/components/magicui/shimmer-button";
import { StorageProvider, useStorage } from "@/components/storage";
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
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { useState } from "react";

export function ShimmerButtonDemo({ goToNext }) {
  const {
    connectToWeb3
  } = useStorage();

  const [showDialog, setShowDialog] = useState(false);

  const handleClick = async () => {
    const isConnected = await connectToWeb3();
    if (isConnected) {
      goToNext();
    } else {
      setShowDialog(true);
    }
  };

  return (
    <>
      <div className="z-20 flex items-center justify-center">
        <div className="group">
          <ShimmerButton
            className="h-12 shadow-2xl"
            shimmerColor="rgb(14 165 233)"
            shimmerSize="0.12em"
            shimmerDuration="2.5s"
            background="black"
            onClick={handleClick}
          >
            <span className="whitespace-pre-wrap px-1 text-center text-base font-semibold leading-none tracking-tight text-sky-400 bg-black">
              Secure My Assets
            </span>
          </ShimmerButton>
        </div>
      </div>

      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Connection Failed</AlertDialogTitle>
            <AlertDialogDescription>
              <div className="font-bold">
              Failed to connect to Web3. Please check your wallet connection and try again. Please also add arbitrum sepolia to your wallet.
              <br />
              <br />
              <a href="https://chainlist.org/chain/421614" className="underline text-sky-500">https://chainlist.org/chain/421614</a>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowDialog(false)}>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}