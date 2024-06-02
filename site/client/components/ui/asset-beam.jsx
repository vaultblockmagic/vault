"use client";

import { Icons } from "./icons";
import { Logo } from "../svg/logo";
import { cn } from "@/lib/utils"
import { AnimatedBeam } from "./animated-beam";
import React, { forwardRef, useRef } from "react";
import Image from 'next/image';

const Circle = forwardRef(({ className, children }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "relative z-20 flex h-15 w-15 items-center justify-center rounded-full bg-neutral-900 p-1.5 shadow-[0_0_20px_-5px_rgba(14,165,233,0.8)]",
        className
      )}
    >
      <div className="relative flex items-center justify-center h-10 w-10">
        {children}
      </div>
    </div>
  );
});

export function AssetBeam() {
  const containerRef = useRef(null);
  const div1Ref = useRef(null);
  const div2Ref = useRef(null);
  const div3Ref = useRef(null);
  const div4Ref = useRef(null);
  const div5Ref = useRef(null);
  const div6Ref = useRef(null);
  const div7Ref = useRef(null);

  return (
    <div
      className="relative flex w-full items-center overflow-hidden md:shadow-2xl p-2"
      ref={containerRef}
    >
      <div className="flex h-full w-full flex-col items-stretch justify-between gap-8">
        <div className="flex flex-row items-center justify-between">
          <Circle ref={div1Ref}>
            <Image src="/ethereum.svg" alt="Ethereum" layout="fill" objectFit="contain" objectPosition="center" />
          </Circle>
          <Circle ref={div5Ref}>
            <Image src="/vault_ethereum.svg" alt="Vault Ethereum" layout="fill" objectFit="contain" objectPosition="center" />
          </Circle>
        </div>
        <div className="flex flex-row items-center justify-between">
          <Circle ref={div2Ref}>
            <Image src="/fantom_round.svg" alt="Fantom" layout="fill" objectFit="contain" objectPosition="center" />
          </Circle>
          <Circle ref={div4Ref}>
            <Logo className="h-8 w-8" />
          </Circle>
          <Circle ref={div6Ref}>
            <Image src="/vault_fantom_round.svg" alt="Vault Fantom" layout="fill" objectFit="contain" objectPosition="center" />
          </Circle>
        </div>
        <div className="flex flex-row items-center justify-between">
          <Circle ref={div3Ref}>
            <Image src="/mfer_nft.svg" alt="MFER NFT" layout="fill" objectFit="contain" objectPosition="center" />
          </Circle>
          <Circle ref={div7Ref}>
            <Image src="/vault_mfer_nft.svg" alt="Vault MFER NFT" layout="fill" objectFit="contain" objectPosition="center" />
          </Circle>
        </div>
      </div>

      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div1Ref}
        toRef={div4Ref}
        curvature={-75}
        endYOffset={-10}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div2Ref}
        toRef={div4Ref}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div3Ref}
        toRef={div4Ref}
        curvature={75}
        endYOffset={10}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div5Ref}
        toRef={div4Ref}
        curvature={-75}
        reverse
        endYOffset={-10}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div6Ref}
        toRef={div4Ref}
        reverse
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div7Ref}
        toRef={div4Ref}
        curvature={75}
        reverse
        endYOffset={10}
      />
    </div>
  );
}
