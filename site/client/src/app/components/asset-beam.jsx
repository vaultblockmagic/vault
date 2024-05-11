"use client";

import { Icons } from "./icons";
import { Logo } from "./logo";
import { cn } from "../utils/cn";
import { AnimatedBeam } from "./ui/animated-beam";
import React, { forwardRef, useRef } from "react";

const Circle = forwardRef(({ className, children }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "z-10 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-900 p-1.5 shadow-[0_0_20px_-5px_rgba(14,165,233,0.8)]",
        className
      )}
    >
      {children}
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
      className="relative flex w-full max-w-[500px] items-center justify-center overflow-hidden rounded-lg md:shadow-2xl p-2"
      ref={containerRef}
    >
      <div className="flex h-full w-full flex-col items-stretch justify-between gap-6">
        <div className="flex flex-row items-center justify-between">
          <Circle ref={div1Ref}>
            <Logo className="h-10 w-10" />
          </Circle>
          <Circle ref={div5Ref}>
            <Logo className="h-10 w-10" />
          </Circle>
        </div>
        <div className="flex flex-row items-center justify-between">
          <Circle ref={div2Ref}>
            <Logo className="h-10 w-10" />
          </Circle>
          <Circle ref={div4Ref} >
            <Logo className="h-10 w-10" />
          </Circle>
          <Circle ref={div6Ref}>
            <Logo className="h-10 w-10" />
          </Circle>
        </div>
        <div className="flex flex-row items-center justify-between">
          <Circle ref={div3Ref}>
            <Logo className="h-10 w-10" />
          </Circle>
          <Circle ref={div7Ref}>
            <Logo className="h-10 w-10" />
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
