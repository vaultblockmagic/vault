"use client";
import { BorderBeam } from "@/components/magicui/border-beam";
import TextShimmer from "@/components/magicui/text-shimmer";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon } from "@radix-ui/react-icons";
import { useInView } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { ShimmerButtonDemo } from "@/components/landing/shimmer";
import { BentoDemo } from "@/components/landing/bento-main";
import Particles from "@/components/magicui/particles";
import BlurIn from "../magicui/blur-in";

const metallicStyle = {
  background: "linear-gradient(90deg, #b8c6db, #f5f7fa, #b8c6db)",
  WebkitBackgroundClip: "text",
  color: "transparent",
  fontWeight: 700, // Make it bold for a better effect
  textShadow: `
    0 1px 1px rgba(255, 255, 255, 0.8), 
    0 1px 3px rgba(0, 0, 0, 0.3),
    0 2px 6px rgba(0, 0, 0, 0.2),
    0 0 4px rgba(255, 255, 255, 0.3)
  `,
};

export default function HeroSection({ goToNext }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  function useScreenSize() {
    const [windowDimension, detectHW] = useState({
      winWidth: typeof window !== "undefined" ? window.innerWidth : 0,
      winHeight: typeof window !== "undefined" ? window.innerHeight : 0,
    });

    useEffect(() => {
      const detectSize = () => {
        detectHW({
          winWidth: window.innerWidth,
          winHeight: window.innerHeight,
        });
      };

      if (typeof window !== "undefined") {
        window.addEventListener("resize", detectSize);
        return () => {
          window.removeEventListener("resize", detectSize);
        };
      }
    }, []);

    return windowDimension;
  }

  const { winWidth, winHeight } = useScreenSize();

  const heroSectionRef = useRef(null);
  const [totalHeight, setTotalHeight] = useState(0);
  const [scale, setScale] = useState(1);
  const [isLoaded, setIsLoaded] = useState(false); // Track if the component is loaded

  useEffect(() => {
    const calculateTotalHeight = () => {
      const heroSectionHeight = heroSectionRef.current
        ? heroSectionRef.current.offsetHeight
        : 0;
      setTotalHeight(heroSectionHeight);
    };

    calculateTotalHeight();
  }, [winWidth, winHeight]);

  useEffect(() => {
    const calculateScale = () => {
      if (winWidth >= 1024) {
        const bottomMargin = 80;
        const availableHeight = winHeight - bottomMargin;
        const newScale = availableHeight / totalHeight;
        setScale(newScale);
      } else {
        setScale(1);
      }
    };

    calculateScale();
    setIsLoaded(true); // Mark the component as loaded after calculations

    if (winWidth > 1024) {
      document.body.style.overflow = "hidden";
      window.scrollTo(0, 0);
    } else {
      document.body.style.overflow = "auto";
    }
  }, [totalHeight, winHeight, winWidth]);

  const isOverflowing = totalHeight > winHeight;

  return (
    <section
      ref={heroSectionRef}
      id="hero"
      className={`relative mx-auto max-w-[80rem] px-6 text-center md:px-8 ${
        isLoaded ? "opacity-100 transition-opacity duration-500" : "opacity-0"
      }`}
      style={{
        transform: winWidth > 1024 ? `scale(${scale})` : "none",
        transformOrigin: "top center",
      }}
    >
      <div>
        <div className="mt-10 backdrop-filter-[8px] inline-flex h-6 items-center justify-between rounded-full border border-white/5 bg-white/10 px-2 text-xs text-white transition-all ease-in hover:bg-white/20 group gap-1 translate-y-[-0.5rem] opacity-100 cursor-pointer select-none">
          <a
            href="https://github.com/vaultblockmagic/vault"
            target="_blank"
            rel="noopener noreferrer"
          >
            <TextShimmer className="inline-flex items-center justify-center">
              <span className="pointer-events-none">✨ Learn more →</span>
            </TextShimmer>
          </a>
        </div>
        <div className="relative">
          <BlurIn
            word={
              <>
                <span>Vault</span>:{" "}
                <span>
                  Uncompromising Asset Security <br /> & Account Abstraction
                </span>
              </>
            }
            className="bg-gradient-to-br from-white from-30% to-white/1 bg-clip-text py-2 mt-4 mb-4 sm:text-3xl md:text-4xl lg:text-5xl leading-none tracking-tighter text-transparent text-balance translate-y-[-0.6rem] pointer-events-none"
            duration={2}
          />
        </div>
      </div>

      <div className="mt-[0px] mb-[1.8rem] relative z-10 opacity-100">
        <ShimmerButtonDemo goToNext={goToNext} />
      </div>
      <div className="relative mt-[2.2rem] opacity-100 [perspective:2000px]">
        <div>
          <div className="relative z-10 mb-8 lg:mb-0">
            <BentoDemo />
          </div>
        </div>
      </div>
    </section>
  );
}
