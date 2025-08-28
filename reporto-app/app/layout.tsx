// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import LayoutProvider from "./components/LayoutProvider";
import { AppProvider } from "./components/AppContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Reporto - AI Medical Assistant",
  description: "Get instant answers from your medical documents.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#202123] text-white`}>
        {/* The Provider now wraps everything */}
        <AppProvider>
          <LayoutProvider>{children}</LayoutProvider>
        </AppProvider>
      </body>
    </html>
  );
}