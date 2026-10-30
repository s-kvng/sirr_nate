import type { Metadata, Viewport } from "next";
import { Cinzel, Rajdhani } from "next/font/google";
import { STORAGE_KEY } from "@/lib/system/keys";
import "./globals.css";

const rajdhani = Rajdhani({
  variable: "--font-rajdhani",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

// Only the ARISE banner uses Cinzel, long after first paint, so it isn't preloaded.
const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: "700",
  preload: false,
});

export const metadata: Metadata = {
  title: "Nathaniel Adama · Player Profile",
  description:
    "Nathaniel Adama, full-stack developer. Accept the System's notification to open his status window, clear his project gates and complete the daily quest.",
};

export const viewport: Viewport = {
  themeColor: "#02040a",
  colorScheme: "dark",
  viewportFit: "cover",
};

// Runs while the HTML parses, before first paint: returning visitors get the
// HUD straight away instead of a flash of the intro.
const markReturning = `try{var s=JSON.parse(localStorage.getItem(${JSON.stringify(STORAGE_KEY)})||"null");if(s&&s.state&&s.state.introSeen)document.documentElement.setAttribute("data-returning","")}catch(e){}`;

const noScript = `.sys-hud{visibility:visible!important}.notif-layer,.intro-controls{display:none!important}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${rajdhani.variable} ${cinzel.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: markReturning }} />
        <noscript>
          <style dangerouslySetInnerHTML={{ __html: noScript }} />
        </noscript>
      </head>
      <body>{children}</body>
    </html>
  );
}
