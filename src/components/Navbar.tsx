"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
    { href: "/", label: "📚 单词库", emoji: "📚" },
    { href: "/reading", label: "👀 阅览", emoji: "👀" },
    { href: "/review", label: "🧠 复习", emoji: "🧠" },
    { href: "/import", label: "✨ 导入", emoji: "✨" },
];

export default function Navbar() {
    const pathname = usePathname();

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t-2 border-peach/30 px-4 py-2 z-50 md:top-0 md:bottom-auto md:border-t-0 md:border-b-2">
            <div className="max-w-4xl mx-auto flex justify-around items-center">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex flex-col items-center px-4 py-2 rounded-2xl transition-all duration-300 ${isActive
                                    ? "bg-gradient-to-r from-coral to-cute-red text-white shadow-lg scale-105"
                                    : "text-muted-foreground hover:bg-peach/30 hover:text-foreground"
                                }`}
                        >
                            <span className="text-xl">{item.emoji}</span>
                            <span className="text-xs font-medium mt-1 hidden md:block">
                                {item.label.replace(/^[^\s]+\s/, "")}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
