import type { Metadata } from "next";
import "./globals.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export const metadata: Metadata = {
  title: "Anamnesis-AI — Alternate Reality Lab",
  description: "A collaborative multi-agent simulation research environment exploring parallel timelines."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="flex min-h-screen flex-col bg-black text-slate-100 selection:bg-cyan-500/20">
        <Navbar />
        {/* Padding top to offset the fixed header */}
        <div className="flex-grow pt-16">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}
