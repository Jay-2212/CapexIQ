import type { Metadata } from "next";
import "./globals.css";
import "./landing.css";

export const metadata: Metadata = {
  title: "CapexIQ — Know if it pays for itself, before you buy it.",
  description:
    "Decision support for hospital capital equipment purchases: ROI, payback, NPV, IRR, break-even usage, cash-flow timing, and export-ready proposals.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
