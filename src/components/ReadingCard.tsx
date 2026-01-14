"use client";

import { useState, useEffect, TouchEvent, useCallback } from "react";
import { Button } from "@/components/ui/button";

interface Word {
    _id: string;
    text: string;
    translation: string;
    stage: number;
}

interface ReadingCardProps {
    words: Word[];
    currentIndex: number;
    onIndexChange: (index: number) => void;
}

export default function ReadingCard({ words, currentIndex, onIndexChange }: ReadingCardProps) {
    const [isFlipped, setIsFlipped] = useState(false);
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);
    const [isSpeaking, setIsSpeaking] = useState(false);

    const currentWord = words[currentIndex];
    const minSwipeDistance = 50;

    useEffect(() => {
        setIsFlipped(false);
    }, [currentIndex]);

    // 语音朗读单词
    const speakWord = useCallback((text: string) => {
        if (typeof window === "undefined" || !window.speechSynthesis) return;

        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "en-US";
        utterance.rate = 0.9;
        utterance.pitch = 1;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
    }, []);

    const handleCardClick = () => {
        if (currentWord) {
            speakWord(currentWord.text);
        }
        setIsFlipped(!isFlipped);
    };

    const onTouchStart = (e: TouchEvent) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e: TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;

        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe && currentIndex < words.length - 1) {
            onIndexChange(currentIndex + 1);
        }
        if (isRightSwipe && currentIndex > 0) {
            onIndexChange(currentIndex - 1);
        }
    };

    const goNext = () => {
        if (currentIndex < words.length - 1) {
            onIndexChange(currentIndex + 1);
        }
    };

    const goPrev = () => {
        if (currentIndex > 0) {
            onIndexChange(currentIndex - 1);
        }
    };

    if (!currentWord) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="glass-card rounded-3xl p-12 text-center">
                    <span className="text-6xl mb-4 block">📭</span>
                    <p className="text-xl text-muted-foreground">暂无单词</p>
                    <p className="text-sm text-muted-foreground mt-2">去导入一些单词吧～</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center gap-6 w-full max-w-sm mx-auto">
            {/* Progress */}
            <div className="w-full flex items-center justify-between px-4 text-xs font-medium text-muted-foreground">
                <span>{currentIndex + 1} / {words.length}</span>
                <div className="flex-1 mx-4 h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div
                        className="h-full bg-primary transition-all duration-300 ease-out"
                        style={{ width: `${((currentIndex + 1) / words.length) * 100}%` }}
                    />
                </div>
                <span>{Math.round(((currentIndex + 1) / words.length) * 100)}%</span>
            </div>

            {/* Card Container */}
            <div
                className="card-flip-container w-full aspect-[3/4] cursor-pointer group"
                onClick={handleCardClick}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
            >
                <div className={`card-flip-inner relative w-full h-full duration-500 ${isFlipped ? "flipped" : ""}`}>

                    {/* Front Face */}
                    <div className="card-face absolute inset-0 bg-white/95 border border-white/40 shadow-soft rounded-3xl p-8 flex flex-col items-center justify-center hover:shadow-glow transition-all duration-300">
                        {isSpeaking && (
                            <div className="absolute top-6 right-6 w-3 h-3 bg-primary rounded-full animate-ping" />
                        )}

                        <div className="text-center transform transition-transform group-hover:scale-105">
                            <span className="text-5xl font-bold bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                                {currentWord.text}
                            </span>
                            <div className="mt-8 w-12 h-1.5 bg-primary/20 rounded-full mx-auto" />
                        </div>

                        <div className="absolute bottom-8 flex flex-col items-center gap-2 opacity-50">
                            <span className="text-2xl animate-bounce-soft">👆</span>
                            <p className="text-[10px] uppercase tracking-widest">Tap to reveal</p>
                        </div>
                    </div>

                    {/* Back Face */}
                    <div className="card-face card-back absolute inset-0 bg-white border border-primary/10 rounded-3xl p-8 flex flex-col items-center justify-center shadow-soft">
                        <div className="text-center">
                            <span className="text-lg text-muted-foreground mb-4 block font-medium font-serif italic opacity-60">
                                {currentWord.text}
                            </span>
                            <span className="text-4xl font-bold text-foreground">
                                {currentWord.translation}
                            </span>
                        </div>

                        <p className="absolute bottom-8 text-[10px] text-muted-foreground uppercase tracking-widest opacity-50">
                            Tap to flip back
                        </p>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-6 w-full justify-center mt-2">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={(e) => { e.stopPropagation(); goPrev(); }}
                    disabled={currentIndex === 0}
                    className="w-12 h-12 rounded-full border-2 hover:bg-muted"
                >
                    ←
                </Button>
                <Button
                    size="lg"
                    className="h-14 px-8 rounded-full shadow-lg shadow-primary/20 text-lg hover:scale-105 transition-transform"
                    onClick={(e) => {
                        e.stopPropagation();
                        if (currentWord) speakWord(currentWord.text);
                    }}
                >
                    🔊 Listen
                </Button>
                <Button
                    variant="outline"
                    size="icon"
                    onClick={(e) => { e.stopPropagation(); goNext(); }}
                    disabled={currentIndex === words.length - 1}
                    className="w-12 h-12 rounded-full border-2 hover:bg-muted"
                >
                    →
                </Button>
            </div>

        </div>
    );
}
