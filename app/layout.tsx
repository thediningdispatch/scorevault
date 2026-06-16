import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ScoreVault — On-chain Prediction League",
  description: "A crypto research prototype for private football prediction leagues. Lock funds, commit predictions, settle on-chain.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
