import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "RBXSOUL — Roblox Gaming", description: "Case battles, games and rewards on RBXSOUL.", icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" } };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
