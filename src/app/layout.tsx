import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { AuthSync } from "@/components/auth-sync";
import { ThemeProvider } from "@/components/theme-provider";
import { NavigationLoader } from "@/components/navigation-loader";
import { InitialLoader } from "@/components/initial-loader";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Kuberns - Cloud Deployment Platform",
  description: "Deploy and manage your applications with ease",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", type: "image/x-icon" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider defaultTheme="dark" storageKey="kubern-ui-theme">
          <Providers>
            <InitialLoader />
            <AuthSync />
            <NavigationLoader />
            {children}
            <Toaster />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}

