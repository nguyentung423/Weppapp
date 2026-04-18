import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";

const displayFont = Be_Vietnam_Pro({
  variable: "--font-display",
  subsets: ["latin-ext"],
  weight: ["600", "700", "800"],
  display: "swap",
});

const bodyFont = Be_Vietnam_Pro({
  variable: "--font-body",
  subsets: ["latin-ext"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Tro ly Nha kinh thuy canh",
  description:
    "Bang dieu khien giam sat nha kinh thuy canh voi mo phong du lieu va tro ly canh bao",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      suppressHydrationWarning
      className={`${displayFont.variable} ${bodyFont.variable} h-full antialiased`}
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}
