import { cn } from "@/lib/utils";
import { BentoCard, BentoGrid } from "@/components/magicui/bento-grid";
import Globe from "@/components/magicui/globe";
import Marquee from "@/components/magicui/marquee";
import {
  Vault,
  LockSimple,
  PuzzlePiece,
  Fingerprint,
  ArrowClockwise,
  Info,
} from "@phosphor-icons/react";
import { useEffect, useId, useRef, useState } from "react";
import { motion, useAnimation, useInView } from "framer-motion";
import { AssetBeam } from "@/components/ui/asset-beam";
import Image from "next/image";
import { useStorage } from "@/components/storage";
import { WalletBeam } from "@/components/ui/wallet-beam";
import IconCloud from "@/components/magicui/icon-cloud";
import { OrbitingCirclesDemo } from "@/components/ui/orbiting-circles";

const slugs = [
  "lastpass",
  "windows",
  "chainlink",
  "google",
  "github",
  "cloudflare",
  "apple",
  "ethereum",
  "gitlab",
  "okta",
];

const tiles = [
  {
    icon: <img src="/apple.svg" alt="Apple Icon" className="size-full" />,
    bg: (
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-1/2 w-1/2 -translate-x-1/2 -translate-y-1/2 overflow-visible rounded-full bg-gradient-to-r from-sky-100 via-sky-200 to-slate-200 opacity-100 blur-[70px] filter"></div>
    ),
  },
  {
    icon: (
      <img src="/chainlink.svg" alt="Chainlink Icon" className="size-full" />
    ),
    bg: (
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-1/2 w-1/2 -translate-x-1/2 -translate-y-1/2 overflow-visible rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 opacity-70 blur-[20px] filter"></div>
    ),
  },
  {
    icon: <img src="/zero_skyblue.svg" alt="zkp Icon" className="size-full" />,
    bg: (
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-1/2 w-1/2 -translate-x-1/2 -translate-y-1/2 overflow-visible rounded-full bg-gradient-to-r from-sky-500 via-sky-500 to-sky-600 opacity-70 blur-[20px] filter"></div>
    ),
  },
  {
    icon: <img src="/windows.svg" alt="Windows Icon" className="size-full" />,
    bg: (
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-1/2 w-1/2 -translate-x-1/2 -translate-y-1/2 overflow-visible rounded-full bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-600 opacity-70 blur-[20px] filter"></div>
    ),
  },
  {
    icon: <img src="/google.svg" alt="Google Icon" className="size-full" />,
    bg: (
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-1/2 w-1/2 -translate-x-1/2 -translate-y-1/2 overflow-visible rounded-full bg-gradient-to-r from-orange-600 via-rose-600 to-violet-600 opacity-70 blur-[20px] filter"></div>
    ),
  },
  {
    icon: (
      <img
        src="/github-mark-white.svg"
        alt="Ethereum Icon"
        className="size-full"
      />
    ),
    bg: (
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-1/2 w-1/2 -translate-x-1/2 -translate-y-1/2 overflow-visible rounded-full bg-gradient-to-r from-indigo-400 via-violet-500 to-purple-600 opacity-70 blur-[20px] filter"></div>
    ),
  },
];

const shuffleArray = (array: any[]) => {
  let currentIndex = array.length,
    randomIndex;
  // While there remain elements to shuffle.
  while (currentIndex !== 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }
  return array;
};

const randomTiles1 = shuffleArray([...tiles]);
const randomTiles2 = shuffleArray([...tiles]);
const randomTiles3 = shuffleArray([...tiles]);
const randomTiles4 = shuffleArray([...tiles]);

const Card = (card: { icon: JSX.Element; bg: JSX.Element }) => {
  const id = useId();
  const controls = useAnimation();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (inView) {
      controls.start({
        opacity: 1,
        transition: { delay: Math.random() * 2, ease: "easeOut", duration: 1 },
      });
    }
  }, [controls, inView]);

  return (
    <motion.div
      key={id}
      ref={ref}
      initial={{ opacity: 0 }}
      animate={controls}
      className={cn(
        "relative size-12 cursor-pointer overflow-hidden rounded-lg border p-2.5",
        // light styles
        "bg-white",
        // dark styles
        "transform-gpu dark:bg-transparent dark:[border:1px_solid_rgba(255,255,255,.1)] dark:[box-shadow:0_-20px_80px_-20px_#ffffff1f_inset]"
      )}
    >
      {card.icon}
      {card.bg}
    </motion.div>
  );
};

const featureBackgrounds: Record<string, JSX.Element> = {
  Vault: (
    <div className="absolute inset-0 overflow-hidden lg:ml-[50px] lg:mr-[60px] lg:mt-[-10px] md:ml-[60px] md:mr-[40px] md:mt-[-10px] transition-all duration-200 ease-out lg:[mask-image:linear-gradient(to_top,transparent_28%,#000_0%)] md:scale-[0.9] lg:scale-[0.92] md:[mask-image:linear-gradient(to_top,transparent_28%,#000_50%)] sm:[mask-image:linear-gradient(to_top,transparent_28%,#000_50%)] group-hover:scale-[1.05]">
      <AssetBeam />
    </div>
  ),
  Lock: (
    // <div className="absolute overflow-hidden ml-[0px] mr-[0px] mt-[-180px] scale-[0.8] transition-all duration-200 ease-out [mask-image:linear-gradient(to_top,transparent_0%,#000_70%)] group-hover:scale-[1]">
    <div className="absolute inset-0 overflow-hidden transition-all duration-200 ease-out [mask-image:linear-gradient(to_top,transparent_20%,#000_40%)] group-hover:scale-110">
      <OrbitingCirclesDemo />
    </div>
  ),
  Integrate: (
    <div className="absolute inset-0 overflow-hidden ml-[30px] mr-[90px] mt-[-70px] transition-all duration-200 ease-out [mask-image:linear-gradient(to_top,transparent_0%,#000_40%)] group-hover:scale-[0.9] lg:scale-[0.8] md:scale-[1]">
      <Image src="/hexagon.png" alt="" layout="fill" objectFit="contain" />
    </div>
  ),
  "Custom MFA": (
    <div className="absolute overflow-hidden ml-[0px] mr-[0px] mt-[-180px] scale-[0.8] transition-all duration-200 ease-out [mask-image:linear-gradient(to_top,transparent_0%,#000_70%)] group-hover:scale-[1]">
      <IconCloud iconSlugs={slugs} />
    </div>
  ),
  "Recover Assets": (
    <div className="absolute inset-0 overflow-hidden ml-[50px] mr-[60px] mt-[50px] transition-all duration-200 ease-out [mask-image:linear-gradient(to_top,transparent_30%,#000_50%)] group-hover:scale-105">
      <WalletBeam />
    </div>
  ),
  Information: (
    <div className="absolute inset-0 overflow-hidden ml-[50px] mr-[60px] mt-[50px] transition-all duration-200 ease-out [mask-image:linear-gradient(to_top,transparent_30%,#000_50%)] group-hover:scale-100"></div>
  ),
};

const InformationBackground = ({
  activeBackground,
}: {
  activeBackground: string;
}) => {
  return (
    <>
      {activeBackground === "Vault" && (
        <div className="absolute inset-0 overflow-hidden lg:ml-[50px] lg:mr-[60px] lg:mt-[-10px] md:ml-[60px] md:mr-[40px] md:mt-[-10px] transition-all duration-200 ease-out lg:[mask-image:linear-gradient(to_top,transparent_28%,#000_0%)] md:scale-[0.9] lg:scale-[0.92] md:[mask-image:linear-gradient(to_top,transparent_28%,#000_50%)] sm:[mask-image:linear-gradient(to_top,transparent_28%,#000_50%)] group-hover:scale-[0.95]">
          <AssetBeam />
        </div>
      )}
      {activeBackground === "Lock" && (
        <div className="absolute inset-0 overflow-hidden transition-all duration-200 ease-out [mask-image:linear-gradient(to_top,transparent_20%,#000_40%)] group-hover:scale-110">
          <OrbitingCirclesDemo />
        </div>
      )}
      {activeBackground === "Integrate" && (
        <div className="absolute inset-0 overflow-hidden ml-[30px] mr-[90px] mt-[-70px] transition-all duration-200 ease-out [mask-image:linear-gradient(to_top,transparent_0%,#000_40%)] group-hover:scale-[0.9] lg:scale-[0.8] md:scale-[1]">
          <Image src="/hexagon.png" alt="" layout="fill" objectFit="contain" />
        </div>
      )}
      {activeBackground === "Custom MFA" && (
        <div className="absolute overflow-hidden ml-[0px] mr-[0px] mt-[-180px] scale-[0.8] transition-all duration-200 ease-out [mask-image:linear-gradient(to_top,transparent_0%,#000_70%)] group-hover:scale-[1]">
          <IconCloud iconSlugs={slugs} />
        </div>
      )}
      {activeBackground === "Recover Assets" && (
        <div className="absolute inset-0 overflow-hidden ml-[50px] mr-[60px] mt-[50px] transition-all duration-200 ease-out [mask-image:linear-gradient(to_top,transparent_30%,#000_50%)] group-hover:scale-105">
          <WalletBeam />
        </div>
      )}
    </>
  );
};

export function BentoDemo() {
  const [activeBackground, setActiveBackground] = useState("Integrate");
  const [informationCard, setInformationCard] = useState({
    name: "Leverage Our Protocol",
    description:
      "All the functionalities of Vault can be integrated in as little as two lines of code.",
  });

  const handleHover = (name: string) => {
    if (name !== "Information") {
      setActiveBackground(name);
      switch (name) {
        case "Vault":
          setInformationCard({
            name: "Vault Your Assets",
            description:
              "Vaulting allows users to exchange tokens for equivalent mirrored assets. Unvaulting retrieves the secured underlying assets.",
          });
          break;
        case "Lock":
          setInformationCard({
            name: "Lock Your Assets",
            description:
              "Users can time-lock outgoing transfers on vaulted assets and/or require custom MFA sequences.",
          });
          break;
        case "Integrate":
          setInformationCard({
            name: "Leverage Our Protocol",
            description:
              "All the functionalities of Vault can be integrated in as little as two lines of code.",
          });
          break;
        case "Custom MFA":
          setInformationCard({
            name: "Customizable Security",
            description:
              "Users can configure a required MFA sequence to unvault/unlock a vaulted token.",
          });
          break;
        case "Recover Assets":
          setInformationCard({
            name: "Asset Recovery",
            description:
              "If a wallet is compromised or lost, a user can recover all mirrored assets into a new secure wallet seemlessly.",
          });
          break;
        default:
          break;
      }
    }
  };

  const features = [
    {
      Icon: Vault,
      name: "Vault",
      description:
        "Store assets in Vault with bank-grade security. Mint mirrored assets for staking, DeFi, and trading.",
      href: "/",
      className: "col-span-8 md:col-span-4 lg:col-span-3",
      background: (
        <div className="absolute inset-0 overflow-hidden transition-transform duration-200 ease-out group-hover:scale-105 [mask-image:linear-gradient(to_top,transparent_10%,rgba(0,0,0,1)_70%)]">
          <div className="absolute top-1/2 left-1/2 w-[600%] h-[600%] transform -translate-x-1/2 -translate-y-1/2 scale-50 lg:-translate-x-[47%] lg:-translate-y-[51.3%] md:-translate-x-[47.5%] sm:-translate-x-[48%] sm:-translate-y-[51.5%] sm:scale-[0.1] md:scale-[0.11] lg:scale-[0.1]">
            <Image
              src="/vault.png"
              alt="Vault Image"
              layout="fill"
              objectFit="contain"
            />
          </div>
        </div>
      ),
    },
    {
      Icon: LockSimple,
      name: "Lock",
      description:
        "Disable or lock outgoing transfers of mirrored assets for added security.",
      href: "/",
      className: "col-span-8 md:col-span-4 lg:col-span-3",
      background: (
        <div className="absolute inset-0 overflow-hidden transition-all duration-200 ease-out [mask-image:linear-gradient(to_top,transparent_10%,rgba(0,0,0,1)_70%)] group-hover:scale-105">
          <div className="absolute top-1/2 left-1/2 w-[600%] h-[600%] transform -translate-x-1/2 -translate-y-1/2 scale-50 lg:-translate-x-[46.5%] lg:-translate-y-[51%] md:-translate-x-[46.5%] sm:scale-50 sm:-translate-x-[47.6%] sm:-translate-y-[51%] sm:scale-[0.12] md:scale-[0.11]  lg:scale-[0.12]">
            <Image src="/lock.png" alt="" layout="fill" objectFit="contain" />
          </div>
        </div>
      ),
    },
    {
      Icon: PuzzlePiece,
      name: "Integrate",
      description: "Integrate Vault into any new protocol for custom security.",
      href: "/",
      className: "col-span-8 md:col-span-4 lg:col-span-2",
      background: (
        <div className="absolute inset-0 overflow-hidden transition-all duration-200 ease-out [mask-image:linear-gradient(to_top,transparent_10%,rgba(0,0,0,1)_70%)] group-hover:scale-105">
          <Globe className="top-15 left-16 md:left-24 lg:left-10 h-[400px] w-[400px] -translate-y-[-10%]" />
        </div>
      ),
    },
    {
      Icon: Fingerprint,
      name: "Custom MFA",
      description: "Require custom Web2/Web3 MFA for unvaulting & unlocking.",
      className: "col-span-8 md:col-span-4 lg:col-span-2",
      href: "/",
      background: (
        <div className="absolute inset-0 overflow-hidden mt-[3px] transition-all duration-200 ease-out [mask-image:linear-gradient(to_top,transparent_10%,#000_100%)] group-hover:scale-105">
          <Marquee
            reverse
            className="-delay-[200ms] [--duration:20s]"
            repeat={4}
          >
            {randomTiles1.map((review, idx) => (
              <Card key={idx} {...review} />
            ))}
          </Marquee>
          <Marquee className="[--duration:25s]" repeat={4}>
            {randomTiles2.map((review, idx) => (
              <Card key={idx} {...review} />
            ))}
          </Marquee>
          <Marquee
            reverse
            className="-delay-[200ms] [--duration:25s]"
            repeat={4}
          >
            {randomTiles3.map((review, idx) => (
              <Card key={idx} {...review} />
            ))}
          </Marquee>
          <Marquee className="[--duration:20s]" repeat={4}>
            {randomTiles4.map((review, idx) => (
              <Card key={idx} {...review} />
            ))}
          </Marquee>
        </div>
      ),
    },
    {
      Icon: ArrowClockwise,
      name: "Recover Assets",
      description: "Recover mirrored assets from compromised or lost wallets.",
      href: "/",
      className: "col-span-8 md:col-span-4 lg:col-span-2",
      background: (
        <div className="absolute inset-0 transition-all duration-200 ease-out group-hover:scale-105 lg:[mask-image:linear-gradient(to_top,transparent_10%,rgba(0,0,0,1)_60%)] md:[mask-image:linear-gradient(to_top,transparent_10%,rgba(0,0,0,1)_60%)]  sm:[mask-image:linear-gradient(to_top,transparent_20%,rgba(0,0,0,1)_60%)]">
          <div className="absolute top-1/2 left-1/2 w-[600%] h-[600%] sm:-translate-x-[50%] sm:-translate-y-[51%] sm:scale-[0.3] md:-translate-x-[50%] md:-translate-y-[51%] md:scale-[0.3] lg:-translate-x-[52%] lg:-translate-y-[51%] lg:scale-[0.4]">
            <Image
              src="/recover.png"
              alt=""
              layout="fill"
              objectFit="contain"
            />
          </div>
        </div>
      ),
    },
    {
      Icon: Info,
      Information: "Information",
      name: informationCard.name,
      description: informationCard.description,
      href: "/",
      className: "col-span-8 md:col-span-4 lg:col-span-4 sm:hidden",
      background: <InformationBackground activeBackground={activeBackground} />,
    },
  ];

  return (
    <BentoGrid>
      {features.map((feature, idx) => (
        <BentoCard
          key={idx}
          {...feature}
          onMouseEnter={() =>
            feature.Information !== "Information"
              ? handleHover(feature.name)
              : null
          }
          background={
            feature.name === "Information" ? (
              <InformationBackground activeBackground={activeBackground} />
            ) : (
              feature.background
            )
          }
        />
      ))}
    </BentoGrid>
  );
}
