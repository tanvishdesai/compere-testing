import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ConvexProvider } from "@/components/ConvexProvider";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Compere - Film Screening Community",
  description: "Join our film screening community in Ahmedabad. Watch amazing movies with fellow cinephiles.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ConvexProvider>
          {children}
          <Toaster />
        </ConvexProvider>
      </body>
    </html>
  );
}
