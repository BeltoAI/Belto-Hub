import type { Metadata } from "next";
import "./globals.css";
import { Plus_Jakarta_Sans } from "next/font/google";
const font = Plus_Jakarta_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Belto EdStore",
  description: "A curated app store for educators and students by Belto.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`min-h-screen ${font.className}`}>
        {/* Top nav */}
        <div className="sticky top-0 z-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3">
            <div className="rounded-2xl border border-white/10 bg-[rgba(0,0,0,0.35)] backdrop-blur-xl px-4 py-2 flex items-center justify-between">
              <div className="text-sm font-semibold tracking-tight">
                <span className="gradient-text">Belto</span> Apps Hub
              </div>
              <div className="text-xs text-white/60">Built for educators & students</div>
            </div>
          </div>
        </div>

        {/* Page container */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>

        <footer className="mt-20 py-10 text-center text-sm text-white/60">
          © Belto. Click metrics are anonymous, aggregate-only.
        </footer>
      </body>
    </html>
  );
}
