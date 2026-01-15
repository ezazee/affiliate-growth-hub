import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/index.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PE Skinpro Affiliate - Dapatkan Komisi 15% dari Produk Skincare Terbaik",
  description: "Bergabung dengan program affiliate PE Skinpro dan dapatkan komisi 15% dari setiap penjualan. Promosikan produk skincare berkualitas dengan bahan alami dan teknologi Jerman.",
  icons: {
    icon: '/favicon/favicon.ico',
    apple: '/favicon/apple-touch-icon.png',
  },
  manifest: '/favicon/site.webmanifest',
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
