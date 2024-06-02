"use client";

import { Icons } from "./icons";
import { Logo } from "../svg/logo";
import { cn } from "@/lib/utils";
import { AnimatedBeam } from "./animated-beam";
import React, { forwardRef, useRef } from "react";
import Image from "next/image";

const Circle = forwardRef(({ className, children }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "z-10 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-900 p-1.5 shadow-[0_0_20px_-5px_rgba(14,165,233,0.8)]",
        className,
      )}
    >
      {children}
    </div>
  );
});

export function WalletBeam() {
  const containerRef = useRef(null);
  const div2Ref = useRef(null);
  const div4Ref = useRef(null);
  const div5Ref = useRef(null);
  const div6Ref = useRef(null);

  return (
    <div
      className="relative flex w-full max-w-[500px] items-center justify-center overflow-hidden rounded-lg md:shadow-2xl p-2"
      ref={containerRef}
    >
      <div className="flex h-full w-full items-center justify-between gap-6">
        <Circle ref={div2Ref}>
          <Image src="/user.svg" alt="User" width={30} height={30} />
        </Circle>
        <Circle ref={div4Ref}>
          <Logo className="h-10 w-10" />
        </Circle>
        <div className="flex flex-col items-center justify-between gap-6">
          <Circle ref={div5Ref}>
            <Image
              src="/metamask_logo.svg"
              alt="metamask"
              width={30}
              height={30}
            />
          </Circle>
          <Circle ref={div6Ref}>
            <Image
              src="/metamask_logo.svg"
              alt="metamask"
              width={30}
              height={30}
            />
          </Circle>
        </div>
      </div>

      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div2Ref}
        toRef={div4Ref}
        curvature={-40}
        endYOffset={-5}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div2Ref}
        toRef={div4Ref}
        reverse
        curvature={40}
        endYOffset={5}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div5Ref}
        toRef={div4Ref}
        curvature={-40}
        startYOffset={0}
        endYOffset={-12}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div5Ref}
        toRef={div4Ref}
        reverse
        curvature={40}
        startYOffset={0}
        endYOffset={-10}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div6Ref}
        toRef={div4Ref}
        curvature={-40}
        startYOffset={0}
        endYOffset={8}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={div6Ref}
        toRef={div4Ref}
        reverse
        curvature={40}
        endYOffset={10}
      />
    </div>
  );
}
