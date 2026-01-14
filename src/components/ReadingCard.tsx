"use client";

import { useState, useEffect, TouchEvent, useCallback } from "react";
import { Card } from "@/components/ui/card";
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

        // 停止之前的朗读
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
        // 朗读单词
        if (currentWord) {
            speakWord(currentWord.text);
        }
        // 翻转卡片
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
                <Card className="p-12 text-center bg-gradient-to-br from-white to-peach/20 border-2 border-peach/30 rounded-3xl">
                    <span className="text-6xl mb-4 block">📭</span>
                    <p className="text-xl text-muted-foreground">暂无单词</p>
                    <p className="text-sm text-muted-foreground mt-2">去导入一些单词吧～</p>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center gap-6">
            {/* Progress */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{currentIndex + 1}</span>
                <div className="w-32 h-2 bg-peach/30 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-coral to-cute-red transition-all duration-300"
                        style={{ width: `${((currentIndex + 1) / words.length) * 100}%` }}
                    />
                </div>
                <span>{words.length}</span>
            </div>

            {/* Card */}
            <Card
                className="w-full max-w-md h-[50vh] cursor-pointer transition-all duration-300 hover:shadow-2xl bg-gradient-to-br from-white to-peach/20 border-2 border-peach/30 rounded-3xl flex flex-col justify-center items-center p-8 relative"
                onClick={handleCardClick}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
            >
                {/* Speaker Icon */}
                <button
                    className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all ${isSpeaking
                            ? "bg-coral text-white animate-pulse"
                            : "bg-peach/30 text-coral hover:bg-peach/50"
                        }`}
                    onClick={(e) => {
                        e.stopPropagation();
                        if (currentWord) speakWord(currentWord.text);
                    }}
                >
                    🔊
                </button>

                <div className="text-center">
                    {!isFlipped ? (
                        <div className="animate-bounce-soft">
                            <span className="text-4xl md:text-5xl font-bold text-foreground">
                                {currentWord.text}
                            </span>
                            <p className="text-sm text-muted-foreground mt-6">点击卡片查看中文 🔊</p>
                        </div>
                    ) : (
                        <div>
                            <span className="text-2xl text-muted-foreground mb-4 block">
                                {currentWord.text}
                            </span>
                            <span className="text-3xl md:text-4xl font-bold text-coral">
                                {currentWord.translation}
                            </span>
                            <p className="text-sm text-muted-foreground mt-6">再次点击隐藏 🙈</p>
                        </div>
                    )}
                </div>
            </Card>

            {/* Navigation Buttons */}
            <div className="flex items-center gap-4">
                <Button
                    variant="outline"
                    size="lg"
                    onClick={goPrev}
                    disabled={currentIndex === 0}
                    className="rounded-full px-8 border-2 border-peach hover:bg-peach/30"
                >
                    ← 上一个
                </Button>
                <Button
                    size="lg"
                    onClick={goNext}
                    disabled={currentIndex === words.length - 1}
                    className="rounded-full px-8 bg-gradient-to-r from-coral to-cute-red hover:opacity-90"
                >
                    下一个 →
                </Button>
            </div>

            {/* Swipe Hint */}
            <p className="text-xs text-muted-foreground text-center">
                💡 左右滑动切换 · 点击卡片朗读并翻转
            </p>
        </div>
    );
}
