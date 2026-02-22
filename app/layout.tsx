import type { Metadata } from "next";
import "./globals.css";
import { ConvexClientProvider } from "./providers";

export const metadata: Metadata = {
  title: "Cadence",
  description: "Salon management dashboard by Cadence",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-background min-h-screen antialiased">
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
  );
}
