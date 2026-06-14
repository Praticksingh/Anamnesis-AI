import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Anamnesis-AI",
  description: "A multi-agent AI web application for alternate history simulations"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
