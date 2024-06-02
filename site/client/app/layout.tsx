import Script from "next/script";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { Manrope as FontSans } from "next/font/google";
import { StorageProvider } from "@/components/storage";
import "./globals.css";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Vault",
  description: "The Next Generation of Asset Security & Account Abstraction",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script src="/snarkjs.min.js" strategy="beforeInteractive" />
        <Script src="/poseidon/wasm_exec.js" strategy="beforeInteractive" />
      </head>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable,
        )}
      >
        <StorageProvider>
          <ThemeProvider attribute="class" defaultTheme="dark">
            {children}
            <Toaster
              richColors
              theme="dark"
              toastOptions={{
                duration: 5000,
              }}
            />
          </ThemeProvider>
        </StorageProvider>
      </body>
    </html>
  );
}
