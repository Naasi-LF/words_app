"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path;

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4">
            <nav className="glass-card rounded-2xl p-2 flex justify-around items-center shadow-soft">
                <Link
                    href="/"
                    className={`relative px-4 py-3 rounded-xl transition-all duration-300 group flex flex-col items-center gap-1 ${isActive("/") ? "text-primary bg-primary/10" : "text-muted-foreground hover:bg-muted"
                        }`}
                >
                    <span className="text-xl">📚</span>
                    <span className="text-[10px] font-medium tracking-wide">单词</span>
                    {isActive("/") && (
                        <span className="absolute -bottom-1 w-1 h-1 rounded-full bg-primary" />
                    )}
                </Link>

                <Link
                    href="/reading"
                    className={`relative px-4 py-3 rounded-xl transition-all duration-300 group flex flex-col items-center gap-1 ${isActive("/reading") ? "text-primary bg-primary/10" : "text-muted-foreground hover:bg-muted"
                        }`}
                >
                    <span className="text-xl">👀</span>
                    <span className="text-[10px] font-medium tracking-wide">阅览</span>
                    {isActive("/reading") && (
                        <span className="absolute -bottom-1 w-1 h-1 rounded-full bg-primary" />
                    )}
                </Link>

                <Link
                    href="/review"
                    className={`relative px-4 py-3 rounded-xl transition-all duration-300 group flex flex-col items-center gap-1 ${isActive("/review") ? "text-primary bg-primary/10" : "text-muted-foreground hover:bg-muted"
                        }`}
                >
                    <span className="text-xl">🧠</span>
                    <span className="text-[10px] font-medium tracking-wide">复习</span>
                    {isActive("/review") && (
                        <span className="absolute -bottom-1 w-1 h-1 rounded-full bg-primary" />
                    )}
                </Link>

                <Link
                    href="/import"
                    className={`relative px-4 py-3 rounded-xl transition-all duration-300 group flex flex-col items-center gap-1 ${isActive("/import") ? "text-primary bg-primary/10" : "text-muted-foreground hover:bg-muted"
                        }`}
                >
                    <span className="text-xl">✨</span>
                    <span className="text-[10px] font-medium tracking-wide">导入</span>
                    {isActive("/import") && (
                        <span className="absolute -bottom-1 w-1 h-1 rounded-full bg-primary" />
                    )}
                </Link>
            </nav>
        </div>
    );
}
