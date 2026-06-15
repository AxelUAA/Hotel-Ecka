import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";

/* ─── Google Fonts via next/font ─── */

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

/* ─── Metadata ─── */

export const metadata: Metadata = {
  title: "Hotel Ecka | Sistema de Administración",
  description:
    "Sistema integral de administración hotelera para Hotel Ecka. Gestión de habitaciones, huéspedes, reservaciones, servicios, facturación y más.",
  icons: { icon: "/favicon.ico" },
};

/* ─── Root Layout ─── */

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${playfair.variable} ${inter.variable}`}>
      <body className="min-h-screen bg-midnight-950 font-sans text-ink antialiased">
        {children}
      </body>
    </html>
  );
}
