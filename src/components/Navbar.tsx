"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    // Close sidebar when route changes
    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    const isActive = (path: string) => pathname === path;

    const links = [
        { href: "/", label: "Words", icon: "📚", sub: "单词" },
        { href: "/reading", label: "Reading", icon: "👀", sub: "阅览" },
        { href: "/review", label: "Review", icon: "🧠", sub: "复习" },
        { href: "/import", label: "Import", icon: "✨", sub: "导入" },
    ];

    return (
        <>
            {/* 1. Toggle Button (Fixed Top-Left) */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed top-6 left-6 z-50 p-3 rounded-full glass-card shadow-soft hover:shadow-glow transition-all active:scale-95 group"
                aria-label="Menu"
            >
                <div className="flex flex-col gap-1.5 w-6">
                    <span className="w-6 h-0.5 bg-foreground/80 rounded-full transition-transform group-hover:bg-primary" />
                    <span className="w-4 h-0.5 bg-foreground/80 rounded-full transition-transform group-hover:w-6 group-hover:bg-primary" />
                    <span className="w-5 h-0.5 bg-foreground/80 rounded-full transition-transform group-hover:w-6 group-hover:bg-primary" />
                </div>
            </button>

            {/* 2. Backdrop (Overlay) */}
            <div
                className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-50 transition-opacity duration-300 ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
                onClick={() => setIsOpen(false)}
            />

            {/* 3. Sidebar Drawer */}
            <div
                className={`fixed top-0 left-0 h-full w-[280px] bg-white/95 backdrop-blur-xl border-r border-white/20 shadow-2xl z-[60] transform transition-transform duration-300 ease-out flex flex-col p-8 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
            >
                {/* Sidebar Header */}
                <div className="mb-10 flex items-center justify-between">
                    <h2 className="text-2xl font-serif font-bold text-foreground tracking-tight">AI Vocab</h2>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors"
                    >
                        ✕
                    </button>
                </div>

                {/* Navigation Links */}
                <nav className="flex flex-col gap-3 flex-1">
                    {links.map((link) => {
                        const active = isActive(link.href);
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`group relative flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 overflow-hidden ${active
                                        ? "bg-primary text-white shadow-lg shadow-primary/30"
                                        : "hover:bg-secondary text-foreground hover:pl-6"
                                    }`}
                            >
                                <span className="text-2xl relative z-10">{link.icon}</span>
                                <div className="relative z-10">
                                    <p className={`font-bold text-base leading-none ${active ? "text-white" : "text-foreground"}`}>
                                        {link.label}
                                    </p>
                                    <p className={`text-[10px] uppercase font-bold tracking-wider mt-0.5 opacity-70 ${active ? "text-white/80" : "text-muted-foreground"}`}>
                                        {link.sub}
                                    </p>
                                </div>
                            </Link>
                        )
                    })}
                </nav>

                {/* Footer */}
                <div className="mt-auto pt-8 border-t border-border/50">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-coral to-pink-500 flex items-center justify-center text-white font-bold shadow-md">
                            U
                        </div>
                        <div>
                            <p className="text-sm font-bold text-foreground">User</p>
                            <p className="text-xs text-muted-foreground">Free Plan</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
