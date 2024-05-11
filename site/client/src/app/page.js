"use client";

import React from "react";
import { EvervaultCard } from "./components/ui/evervault-card";
import { AssetBeam } from "./components/asset-beam";
import { WalletBeam } from "./components/wallet-beam";
import { ShimmerButtonDemo } from "./components/shimmer";

function App() {
  return (
    <div className="flex flex-col items-center justify-between min-h-screen pb-24 md:pb-10 sm:pb-0">
      <div className="w-full px-4 pt-4 md:pt-2 sm:pt-0">
        <div className="hidden md:flex justify-end">
          <a
            href="https://github.com/machin3boy/zkvault"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 underline hover:text-sky-500 transition duration-200 font-semibold"
          >
            learn more
          </a>
        </div>
        <h1 className="text-xl sm:text-2xl md:text-2xl lg:text-3xl font-semibold text-center mb-6 sm:mb-0 mt-6 sm:mt-16">
          <span className="bg-gradient-to-tr from-sky-500 to-cyan-400 bg-clip-text text-transparent">
            zkVault:
          </span>{" "}
          The <span className="italic">Next Generation</span> of Asset Security
          & Account Abstraction.
        </h1>
        <div className="md:hidden">
          <div className="flex justify-center mb-8">
            <ShimmerButtonDemo />
          </div>
          <div className="text-center mb-8">
            <h2 className="text-white text-lg font-semibold">
              Store Assets in{" "}
              <span className="bg-gradient-to-tr from-cyan-400 to-sky-500 bg-clip-text text-transparent font-semibold">
                zkVault
              </span>{" "}
              With Bank-Grade Security Using Custom MFA.{" "}
              <span className="hidden sm:inline">
                Mint Mirrored Assets for Staking, DeFi, and Trading.
              </span>
            </h2>
          </div>
          <div className="flex justify-center mb-8 px-1">
            <AssetBeam />
          </div>
          <div className="text-center mb-8">
            <h2 className="text-white text-lg font-semibold">
              Recover Mirrored Assets From Compromised/Lost Wallets Through the
              Magic of ZKPs & Account Abstraction.
            </h2>
          </div>
          <div className="flex justify-center mb-8 px-1">
            <WalletBeam />
          </div>
          <div className="text-center">
            <h2 className="text-white text-lg font-semibold">
              Leverage Custom Security Logic in Your Smart Contracts Seamlessly
              by Plugging in a Simple Interface.
            </h2>
          </div>
        </div>
        <div className="hidden md:flex md:flex-col md:items-center md:justify-between md:min-h-[800px]">
          <div className="flex-grow flex flex-col items-center justify-center">
            <div className="flex space-x-8 mb-2">
              <EvervaultCard text="ETH" className="h-32 w-32" />
              <EvervaultCard text="BTC" className="h-32 w-32" />
              <EvervaultCard text="SOL" className="h-32 w-32" />
            </div>
          </div>
          <div className="flex justify-center">
            <ShimmerButtonDemo />
          </div>
          <div className="flex-grow flex items-center justify-center w-full px-8 space-x-16">
            <div className="w-2/5 flex flex-col justify-center">
              <div className="flex justify-center mb-6 px-1">
                <AssetBeam />
              </div>
              <div className="flex justify-center px-1">
                <WalletBeam />
              </div>
            </div>
            <div className="md:w-3/5 lg:w-2/5 flex flex-col justify-center">
              <ul className="text-left space-y-2 text-white text-base font-medium list-none">
                <li>
                  🔒 Securely store assets in{" "}
                  <span className="bg-gradient-to-tr from-cyan-400 to-sky-500 bg-clip-text text-transparent font-semibold">
                    zkVault
                  </span>{" "}
                  with bank-grade security using custom MFA sequences from
                  providers like Google and Microsoft.
                </li>
                <li>
                  🏭 Mint mirrored assets for staking, DeFi, and trading while
                  your underlying assets remain secure.
                </li>
                <li>
                  🔄 Convert mirrored assets back to underlying assets only
                  after completing the required MFA sequence.
                </li>
                <li>
                  🛑 Permanently disable, time-lock, or lock outgoing transfers
                  of mirrored assets behind custom MFA sequences for added
                  security.
                </li>
                <li>
                  🔐 Recover mirrored assets from compromised or lost wallets
                  using Zero-Knowledge Proofs (ZKPs) and account abstraction.
                </li>
                <li>
                  🔌 Easily integrate custom security logic into your smart
                  contracts using{" "}
                  <span className="bg-gradient-to-tr from-cyan-400 to-sky-500 bg-clip-text text-transparent font-semibold">
                    zkVault's
                  </span>{" "}
                  simple interface.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
