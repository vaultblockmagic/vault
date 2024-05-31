"use client";
import { GoogleAuthSVG } from "./svg/google-auth";
import { MSAuthSVG } from "./svg/ms-auth";
import { Logo } from "./svg/logo";
import { Password } from "./svg/password";

export const authOptionsDefault = [
    {
      name: "Google Authenticator",
      icon: <GoogleAuthSVG width="20" height="20" />,
      checked: false,
      address: "0xA755E55b2a177d626B6e5db8C400aEc9C7Bc0Eb5",
      confirm: false,
      custom: false,
      otp: ""
    },
    {
      name: "Microsoft Authenticator",
      icon: <MSAuthSVG width="20" height="20" />,
      checked: false,
      address: "0x329e4D3Cb8Fe41cfbB6D58DE9CDcef59E0eb8201",
      confirm: false,
      custom: false,
      otp: ""
    },
    {
      name: "Chainlink MFA",
      icon: <Logo className="w-5 h-5" />,
      checked: false,
      address: "0x661B556d4756C835D3A72779aCB32612E4243B56",
      confirm: false,
      custom: false,
      otp: ""
    },
    {
      name: "Custom ZK Password",
      icon: <Password className="w-5 h-5 fill-sky-500" />,
      checked: false,
      address: "0xB9506dC2B7294842072E11b6BAED550DA3d8F455",
      confirm: false,
      custom: true,
      otp: ""
    },
  ]

export const chains = [
  {
    networkName: "Arbitrum Sepolia",
    switchName: "Avalanche Fuji",
    url: "https://arbitrum-sepolia.blockpi.network/v1/rpc/public",
    name: "Arbitrum Sepolia",
    id: "421614",
    symbol: "ETH",
    blockExplorerUrl: "https://sepolia.arbiscan.io/",
    className: "bg-slate-900 bg-opacity-80 hover:bg-slate-800",
    iconClass: "text-sky-500"
  },
  {
    networkName: "Avalanche Fuji Testnet",
    name: "Avalanche Fuji",
    switchName: "Arbitrum Sepolia",
    url: "https://api.avax-test.network/ext/bc/C/rpc",
    id: "43113",
    symbol: "AVAX",
    blockExplorerUrl: "https://testnet.snowtrace.io",
    className: "bg-red-900 bg-opacity-30 hover:bg-red-800 hover:bg-opacity-40",
    iconClass: "text-red-400"
  }
]