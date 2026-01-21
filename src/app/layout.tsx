import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "@/index.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "@/components/ui/sonner";
import { ForceNotificationPopup } from "@/components/ui/force-notification-popup";
import { ServiceWorkerRegister } from "@/components/ui/service-worker-register";

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap', // Improve loading performance
  preload: true,
  variable: '--font-inter',
  weight: ['400', '500', '600', '700'], // Preload only needed weights
  fallback: ['system-ui', 'sans-serif'] // Fallback fonts if Google Fonts fails
});

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Often used for "app-like" feel, though has accessibility implications. Maybe just width/initialScale is enough. I'll stick to safe defaults.
};

export const metadata: Metadata = {
  title: "PE Skinpro Affiliate",
  description: "Dapatkan komisi dari penjualan produk skincare berkualitas dengan bergabung dalam program affiliate PE Skinpro.",
  icons: {
    icon: '/favicon/favicon.ico',
    apple: '/favicon/apple-touch-icon.png',
  },
  manifest: '/favicon/site.webmanifest',
  // Preconnect to external domains
  other: {
    'dns-prefetch': 'https://fonts.googleapis.com',
    'preconnect': 'https://fonts.gstatic.com',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={inter.className}>
        <AuthProvider>
          <ServiceWorkerRegister />
          {children}
          <Toaster />
          <ForceNotificationPopup />
        </AuthProvider>
      </body>
    </html>
  );
}
