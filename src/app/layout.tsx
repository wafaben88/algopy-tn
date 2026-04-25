import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar, MobileNav } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { ToastHost } from "@/components/gamification/ToastHost";
import { AuthProvider } from "@/lib/auth/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AlgoPy TN — Apprends l'algorithme & Python en t'amusant 🇹🇳",
  description:
    "Plateforme gamifiée pour apprendre l'algorithmique et Python selon le programme officiel tunisien. Cours, exercices, défis, badges, XP.",
  keywords: [
    "algorithmique",
    "python",
    "lycée",
    "tunisie",
    "programme officiel",
    "bac info",
    "2ème info",
    "3ème info",
  ],
};

export const viewport: Viewport = {
  themeColor: "#0b0f1a",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var p=location.pathname;if(p==='/'||p==='/index.html')return;if(p.endsWith('/index.html')){history.replaceState(null,'',p.slice(0,-10));return;}var t=p.endsWith('/')?p+'index.html':p+'/index.html';location.replace(t+location.search+location.hash);})();`,
          }}
        />
      </head>
      <body className="min-h-screen text-[var(--foreground)]">
        <AuthProvider>
          <Sidebar />
          <div className="md:pl-64">
            <Header />
            <main className="px-4 pb-24 pt-6 md:px-8 md:pb-10">{children}</main>
          </div>
          <MobileNav />
          <ToastHost />
        </AuthProvider>
      </body>
    </html>
  );
}
