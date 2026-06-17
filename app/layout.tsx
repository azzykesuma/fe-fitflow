import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { RegisterServiceWorker } from "@/components/pwa/register-service-worker";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: {
    default: "FitFlow",
    template: "%s | FitFlow",
  },
  description: "Meal, workout, and progress tracking for consistent fitness progress.",
  applicationName: "FitFlow",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "FitFlow",
  },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#07110d",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
          <Toaster />
          <RegisterServiceWorker />
        </Providers>
      </body>
    </html>
  );
}
