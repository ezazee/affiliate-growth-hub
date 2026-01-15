import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/index.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap', // Improve loading performance
  preload: true,
  variable: '--font-inter',
  weight: ['400', '500', '600', '700'] // Preload only needed weights
});

export const metadata: Metadata = {
  title: "PE Skinpro Affiliate - Dapatkan Komisi 15% dari Produk Skincare Terbaik",
  description: "Bergabung dengan program affiliate PE Skinpro dan dapatkan komisi 15% dari setiap penjualan. Promosikan produk skincare berkualitas dengan bahan alami dan teknologi Jerman.",
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
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
