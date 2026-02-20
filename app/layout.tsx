import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ConvexClientProvider } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Glow Studio Dashboard",
  description: "Admin dashboard for hair salon management",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-background min-h-screen antialiased`}>
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
  );
}
