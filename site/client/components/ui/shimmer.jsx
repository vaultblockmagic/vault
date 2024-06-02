import ShimmerButton from "./shimmer-button";

export function ShimmerButtonDemo() {
  return (
    <div className="z-20 flex items-center justify-center">
      <div className="group">
        <ShimmerButton
          className="h-14 shadow-2xl"
          shimmerColor="rgb(14 165 233)"
          shimmerSize="0.12em"
          shimmerDuration="2.5s"
        >
          <span className="whitespace-pre-wrap px-1 text-center text-base font-semibold leading-none tracking-tight text-sky-400">
            Secure My Assets
          </span>
        </ShimmerButton>
      </div>
    </div>
  );
}
