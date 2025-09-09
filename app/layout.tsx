import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Spectral, Inter } from "next/font/google";
import Header from "@/components/Header";

const serif = Spectral({ 
  subsets: ["latin"], 
  weight: ["600","700"], 
  variable: "--font-serif" 
});

const sans = Inter({ 
  subsets: ["latin"], 
  variable: "--font-sans" 
});

export const metadata: Metadata = {
  title: "Aqua Studio — Donde el diseño fluye y la estrategia convierte",
  description: "Estudio boutique premium: diseño web, estrategia digital y automatización. Creamos experiencias digitales que combinan belleza, estrategia y resultados.",
  metadataBase: new URL("https://aqua.studio"),
  openGraph: {
    title: "Aqua Studio — Diseño que fluye y convierte",
    description: "Diseño premium, funnels y estrategia inteligente que transforman clics en clientes.",
    url: "https://aqua.studio",
    siteName: "Aqua Studio",
    type: "website",
    locale: "es_CL",
  },
  twitter: { 
    card: "summary_large_image", 
    title: "Aqua Studio", 
    description: "Premium web + automation" 
  },
  alternates: { 
    canonical: "https://aqua.studio" 
  },
  robots: { 
    index: true, 
    follow: true 
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#000000",
};

export default function RootLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return (
    <html lang="es" className={`${serif.variable} ${sans.variable}`}>
      <body className="antialiased"> {/* Las clases de fondo y texto se aplican desde globals.css */}
        <Header />
        {children}
      </body>
    </html>
  );
}
