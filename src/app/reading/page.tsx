"use client";

import { useState, useEffect } from "react";
import ReadingCard from "@/components/ReadingCard";

interface Word {
    _id: string;
    text: string;
    translation: string;
    stage: number;
}

export default function ReadingPage() {
    const [words, setWords] = useState<Word[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWords = async () => {
            try {
                const res = await fetch("/api/words");
                const data = await res.json();
                setWords(data);
            } catch (error) {
                console.error("Failed to fetch words:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchWords();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[80vh]">
                <div className="text-center">
                    <span className="text-6xl animate-bounce-soft inline-block">👀</span>
                    <p className="text-muted-foreground mt-4">加载中...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-6 max-w-4xl">
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-coral to-cute-red bg-clip-text text-transparent">
                    👀 阅览模式
                </h1>
                <p className="text-muted-foreground mt-2">
                    左右滑动切换单词
                </p>
            </div>

            {/* Reading Card */}
            <ReadingCard
                words={words}
                currentIndex={currentIndex}
                onIndexChange={setCurrentIndex}
            />
        </div>
    );
}
