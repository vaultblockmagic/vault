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
        const bottomMargin = 30;
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
      <div className="mt-8 backdrop-filter-[12px] inline-flex h-6 items-center justify-between rounded-full border border-white/5 bg-white/10 px-2 text-xs text-white transition-all ease-in hover:cursor-pointer hover:bg-white/20 group gap-1 translate-y-[-0.5rem] animate-fade-in opacity-0 [--animation-delay:500ms]">
        <TextShimmer className="inline-flex items-center justify-center ">
          <span>✨ Learn more →</span>
        </TextShimmer>
      </div>
      <div>
      <BlurIn
        word={
          <>
            <span style={{ ...metallicStyle, fontSize: "1.1em" }}>Vault</span>
            :{" "}
            <span style={{ fontSize: "1.1em", fontWeight: 520 }}>
              Uncompromising asset security & account abstraction
            </span>
          </>
        }
        className="bg-gradient-to-br from-white from-10% to-white/30 bg-clip-text py-2 mt-2 mb-4 text-3xl sm:text-3xl md:text-4xl lg:text-6xl leading-none tracking-tighter text-transparent text-balance translate-y-[-1rem]"
        style={{ fontFamily: "Inter, sans-serif" }}
        duration={1.5}
      />
    </div>

      <div className="mt-6 mb-2 relative z-10 animate-fade-in opacity-0 [--animation-delay:500ms]">
        <ShimmerButtonDemo goToNext={goToNext} />
      </div>
      <div className="relative mt-[2rem] animate-fade-up opacity-0 [--animation-delay:1000ms] [perspective:2000px]">
        <div>
          <div className="relative z-10 mb-8 lg:mb-0">
            <BentoDemo />
          </div>
        </div>
      </div>
    </section>
  );
}