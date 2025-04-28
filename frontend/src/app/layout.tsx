import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/AuthContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Stock Index Values Tracker",
  description: "Track stock index values and set price alerts",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className} data-new-gr-c-s-check-loaded="14.1233.0" data-gr-ext-installed="">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
