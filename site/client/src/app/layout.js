import { Inter } from "next/font/google";
import { DotPattern } from "./components/ui/dot-pattern";
import { HeroHighlight } from "./components/ui/hero-highlight";
import { cn } from "./utils/cn"
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "zkVault",
  description: "The Next Generation of Asset Security & Account Abstraction",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={cn(inter.className)}>
        <HeroHighlight>
          <div className="relative z-10">{children}</div>
        </HeroHighlight>
      </body>
    </html>
  );
}