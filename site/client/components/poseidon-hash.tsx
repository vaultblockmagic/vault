import { useEffect, useState } from "react";

let hashFunction: any;

const loadWasm = async () => {
  try {
    // @ts-ignore
    const go = new Go();
    const wasmModule = await WebAssembly.instantiate(
      await (await fetch("/poseidon/main.wasm")).arrayBuffer(),
      go.importObject,
    );
    go.run(wasmModule.instance);
    hashFunction = (globalThis as any).hash;
  } catch (error) {
    console.error("Error initializing WASM:", error);
  }
};

export async function poseidon(inputs: any): Promise<any> {
  if (!hashFunction) {
    await loadWasm();
  }

  const filteredInputs = inputs
    .map((input: any) => String(input).trim())
    .filter((input: any) => input !== "");

  if (filteredInputs.length === 0) {
    throw new Error("No valid inputs provided.");
  }

  return hashFunction.apply(null, filteredInputs);
}

export function usePoseidon() {
  const [poseidonReady, setPoseidonReady] = useState(false);

  useEffect(() => {
    const initializePoseidon = async () => {
      await loadWasm();
      setPoseidonReady(true);
    };

    initializePoseidon();
  }, []);

  const poseidonWrapper = async (...args: any[]) => {
    if (!poseidonReady) {
      await new Promise((resolve) => {
        const checkInitialization = () => {
          if (hashFunction) {
            resolve(true);
          } else {
            setTimeout(checkInitialization, 100);
          }
        };
        checkInitialization();
      });
    }

    return poseidon(args);
  };

  return poseidonWrapper;
}
