import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppSidebar } from "@/components/AppSidebar";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PowerGym - Sistema de Administración",
  description: "Sistema profesional de gestión de gimnasio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} dark`}>
      <body className="min-h-screen bg-background text-foreground font-sans antialiased">
        <TooltipProvider>
          <div className="flex min-h-screen">
            <AppSidebar />
            <main className="flex-1 ml-[260px]">
              <div className="p-8 max-w-[1400px] mx-auto">{children}</div>
            </main>
          </div>
          <Toaster
            toastOptions={{
              style: {
                background: "#1d2430",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "#ffffff",
                borderRadius: "12px",
              },
            }}
          />
        </TooltipProvider>
      </body>
    </html>
  );
}
