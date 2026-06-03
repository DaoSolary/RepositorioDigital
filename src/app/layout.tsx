import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ToastProvider } from "@/components/ui/ToastProvider";

export const metadata: Metadata = {
  title: "Repositorio",
  description: "Sistema de acervo digital de TCCs (busca, visualização e gestão).",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="app-shell min-h-full flex flex-col bg-zinc-100 font-sans text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
        <ToastProvider>
          <Header />
          <div className="flex-1">{children}</div>
          <Footer />
        </ToastProvider>
      </body>
    </html>
  );
}
