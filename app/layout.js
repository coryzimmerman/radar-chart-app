import localFont from "next/font/local";
import "./globals.css";
import Link from "next/link"; // Added import

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <header className="flex justify-center w-full p-4 space-x-4 bg-gray-700 shadow">
          <Link href="/">Static Chart</Link>
          <Link href="/animated">Animated Chart</Link>
        </header>
        {children}
      </body>
    </html>
  );
}
