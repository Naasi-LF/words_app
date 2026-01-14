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
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground animate-pulse">Loading reading mode...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-32 pt-8">
            {/* Background Elements */}
            <div className="fixed top-0 left-0 w-full h-64 bg-gradient-to-b from-primary/5 to-transparent -z-10" />

            <div className="container mx-auto px-4 max-w-4xl">
                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-serif font-bold text-foreground">
                        Reading Mode
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Focus flow · Swipe to navigate
                    </p>
                </div>

                {/* Reading Card */}
                <ReadingCard
                    words={words}
                    currentIndex={currentIndex}
                    onIndexChange={setCurrentIndex}
                />
            </div>
        </div>
    );
}
