import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
<<<<<<< HEAD
import { AuthProvider } from "../lib/AuthContext"; // adjust path
=======
>>>>>>> 04283011a3b48726eca886364dda426bcea2bffe

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Football League Manager",
  description: "Created by Kachy",
  icons: {
    icon: "/ea.png",
  },
  
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
<<<<<<< HEAD
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
=======
        {children}
      </body>
    </html>
  );
}
>>>>>>> 04283011a3b48726eca886364dda426bcea2bffe
