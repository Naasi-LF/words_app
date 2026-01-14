"use client";

import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface Word {
    _id: string;
    text: string;
    translation: string;
    stage: number;
}

export default function ReviewPage() {
    const [words, setWords] = useState<Word[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [loading, setLoading] = useState(true);
    const [sentences, setSentences] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const sentencesRef = useRef<HTMLDivElement>(null);

    const currentWord = words[currentIndex];

    useEffect(() => {
        const fetchReviewWords = async () => {
            try {
                const res = await fetch("/api/words/review");
                const data = await res.json();
                setWords(data);
            } catch (error) {
                console.error("Failed to fetch review words:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchReviewWords();
    }, []);

    useEffect(() => {
        setIsFlipped(false);
    }, [currentIndex]);

    // 自动滚动到底部
    useEffect(() => {
        if (sentencesRef.current) {
            sentencesRef.current.scrollTop = sentencesRef.current.scrollHeight;
        }
    }, [sentences]);

    const handleReview = async (known: boolean) => {
        if (!currentWord) return;

        try {
            await fetch(`/api/words/${currentWord._id}/review`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ known }),
            });

            // 移动到下一个单词
            if (currentIndex < words.length - 1) {
                setCurrentIndex(currentIndex + 1);
            } else {
                // 复习完成，重新获取
                const res = await fetch("/api/words/review");
                const data = await res.json();
                setWords(data);
                setCurrentIndex(0);
            }
        } catch (error) {
            console.error("Failed to update review:", error);
        }
    };

    const generateSentences = async () => {
        if (words.length === 0) return;

        setIsGenerating(true);
        setSentences("");

        try {
            const wordTexts = words.slice(0, 10).map((w) => w.text);
            const res = await fetch("/api/ai/sentences", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ words: wordTexts }),
            });

            const reader = res.body?.getReader();
            const decoder = new TextDecoder();

            if (reader) {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value);
                    const lines = chunk.split("\n");

                    for (const line of lines) {
                        if (line.startsWith("data: ")) {
                            const data = line.slice(6);
                            if (data === "[DONE]") break;
                            try {
                                const parsed = JSON.parse(data);
                                setSentences((prev) => prev + parsed.text);
                            } catch {
                                // 忽略解析错误
                            }
                        }
                    }
                }
            }
        } catch (error) {
            console.error("Failed to generate sentences:", error);
        } finally {
            setIsGenerating(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[80vh]">
                <div className="text-center">
                    <span className="text-6xl animate-bounce-soft inline-block">🧠</span>
                    <p className="text-muted-foreground mt-4">加载中...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-6 max-w-4xl">
            {/* Header */}
            <div className="text-center mb-6">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-coral to-cute-red bg-clip-text text-transparent">
                    🧠 今日复习
                </h1>
                <p className="text-muted-foreground mt-2">
                    {words.length > 0
                        ? `还有 ${words.length} 个单词需要复习`
                        : "今天没有需要复习的单词啦 🎉"}
                </p>
            </div>

            {words.length === 0 ? (
                <div className="text-center py-20">
                    <span className="text-8xl mb-4 block">🎉</span>
                    <p className="text-xl text-muted-foreground">今日复习完成！</p>
                    <p className="text-sm text-muted-foreground mt-2">明天继续加油哦～</p>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Review Card */}
                    <div className="flex flex-col items-center gap-4">
                        {/* Progress */}
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{currentIndex + 1}</span>
                            <div className="w-24 h-2 bg-peach/30 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-coral to-cute-red transition-all duration-300"
                                    style={{ width: `${((currentIndex + 1) / words.length) * 100}%` }}
                                />
                            </div>
                            <span>{words.length}</span>
                        </div>

                        {/* Card */}
                        <Card
                            className="w-full h-[280px] cursor-pointer transition-all duration-300 hover:shadow-2xl bg-gradient-to-br from-white to-peach/20 border-2 border-peach/30 rounded-3xl flex flex-col justify-center items-center p-8"
                            onClick={() => setIsFlipped(!isFlipped)}
                        >
                            <Badge className="mb-4 bg-coral/10 text-coral">
                                Level {currentWord?.stage}
                            </Badge>
                            <div className="text-center">
                                {!isFlipped ? (
                                    <div className="animate-bounce-soft">
                                        <span className="text-3xl font-bold text-foreground">
                                            {currentWord?.text}
                                        </span>
                                        <p className="text-sm text-muted-foreground mt-4">点击查看中文</p>
                                    </div>
                                ) : (
                                    <div>
                                        <span className="text-xl text-muted-foreground mb-2 block">
                                            {currentWord?.text}
                                        </span>
                                        <span className="text-2xl font-bold text-coral">
                                            {currentWord?.translation}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </Card>

                        {/* Buttons */}
                        <div className="flex gap-4 w-full">
                            <Button
                                className="flex-1 rounded-full py-6 bg-gray-100 hover:bg-gray-200 text-gray-700"
                                onClick={() => handleReview(false)}
                            >
                                😅 不认识
                            </Button>
                            <Button
                                className="flex-1 rounded-full py-6 bg-gradient-to-r from-coral to-cute-red hover:opacity-90"
                                onClick={() => handleReview(true)}
                            >
                                😊 认识
                            </Button>
                        </div>
                    </div>

                    {/* AI Sentences */}
                    <div className="flex flex-col gap-4">
                        <Button
                            onClick={generateSentences}
                            disabled={isGenerating}
                            className="rounded-full bg-gradient-to-r from-coral to-cute-red hover:opacity-90"
                        >
                            {isGenerating ? "✨ 生成中..." : "✨ AI 生成例句"}
                        </Button>

                        <Card className="flex-1 p-4 bg-gradient-to-br from-white to-peach/10 border-2 border-peach/30 rounded-2xl min-h-[300px]">
                            <h3 className="text-sm font-medium text-muted-foreground mb-3">
                                📝 AI 例句
                            </h3>
                            <ScrollArea className="h-[260px]" ref={sentencesRef}>
                                {sentences ? (
                                    <pre className="whitespace-pre-wrap text-sm text-foreground font-sans leading-relaxed">
                                        {sentences}
                                    </pre>
                                ) : (
                                    <p className="text-sm text-muted-foreground text-center py-10">
                                        点击上方按钮生成例句 ✨
                                    </p>
                                )}
                                {isGenerating && (
                                    <span className="inline-block w-2 h-4 bg-coral animate-pulse ml-1" />
                                )}
                            </ScrollArea>
                        </Card>
                    </div>
                </div>
            )}
        </div>
    );
}
