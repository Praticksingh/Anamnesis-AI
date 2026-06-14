"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Terminal, Activity, BookOpen, Layers, Milestone, Compass, Users } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();

  const links = [
    { href: "/simulation", label: "Simulation", icon: Activity },
    { href: "/library", label: "Library", icon: Compass },
    { href: "/about", label: "About", icon: Terminal },
    { href: "/methodology", label: "Methodology", icon: BookOpen },
    { href: "/architecture", label: "Architecture", icon: Layers },
    { href: "/docs", label: "Docs", icon: Terminal },
    { href: "/roadmap", label: "Roadmap", icon: Milestone },
    { href: "/contact", label: "Team", icon: Users }
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-black/45 backdrop-blur-md transition-all duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-cyan-500/30 bg-cyan-500/10 shadow-[0_0_15px_rgba(34,211,238,0.1)] group-hover:border-cyan-400 group-hover:shadow-[0_0_20px_rgba(34,211,238,0.2)] transition-all">
                <Terminal className="h-4.5 w-4.5 text-cyan-400 group-hover:scale-105 transition-transform" />
                <span className="absolute -inset-0.5 rounded-lg bg-cyan-400/20 blur opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <span className="bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-lg font-bold tracking-tight text-transparent group-hover:to-cyan-200">
                Anamnesis-AI
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5">
            {links.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium tracking-wide transition-all ${
                    isActive
                      ? "bg-white/5 text-cyan-400 border border-cyan-500/15"
                      : "text-slate-400 hover:text-slate-100 hover:bg-white/5 border border-transparent"
                  }`}
                >
                  <Icon className={`h-3.5 w-3.5 ${isActive ? "text-cyan-400" : "text-slate-500"}`} />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Action Button */}
          <div className="flex items-center gap-2">
            <Link
              href="/simulation"
              className="inline-flex h-9 items-center justify-center rounded-lg bg-gradient-to-r from-cyan-500 to-violet-600 px-4 text-xs font-bold text-slate-950 transition hover:brightness-110 active:scale-[0.98] shadow-lg shadow-cyan-500/10"
            >
              Launch Lab
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
