'use client';

import { usePathname } from "next/navigation";
import "./globals.css";
import Navbar from "@/components/Navbar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isMapPage = pathname === '/map';

  return (
    <html lang="en">
      <body>
        {!isMapPage && <Navbar />}
        <main>{children}</main>
      </body>
    </html>
  );
}
