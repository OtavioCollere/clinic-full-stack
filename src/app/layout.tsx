import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { ToasterProvider } from "@/components/toaster";
import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Cliniker",
  description: "Gestão de clínicas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${plusJakarta.variable} antialiased`}
      >
        <AuthProvider>
        {children}
          <ToasterProvider />
        </AuthProvider>
      </body>
    </html>
  );
}
