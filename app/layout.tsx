import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Birdwatching Moscow",
  description: "Бердвотчинг в Москве, экспедиции по России и за границей",
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.png', type: 'image/png', sizes: '32x32' },
    ],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="ru" data-scroll-behavior="smooth">
      <body>
        <Providers session={session}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
