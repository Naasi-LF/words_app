"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import AssociationModal from "@/components/AssociationModal"; // Import AssociationModal

interface Word {
    _id: string;
    text: string;
    translation: string;
    stage: number;
    detail?: string; // Add detail for memory tip
}

export default function ReviewPage() {
    const [words, setWords] = useState<Word[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [loading, setLoading] = useState(true);
    const [sentences, setSentences] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [showAssociation, setShowAssociation] = useState(false); // State for modal

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
        setSentences(""); // Clear sentences on new word
    }, [currentIndex]);

    // 自动滚动到底部
    useEffect(() => {
        if (sentencesRef.current && sentencesRef.current.firstElementChild) {
            const scrollContainer = sentencesRef.current.firstElementChild;
            scrollContainer.scrollTop = scrollContainer.scrollHeight;
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
            // Generate sentence for CURRENT word only to be more relevant
            const res = await fetch("/api/ai/sentences", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ words: [currentWord.text] }),
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

    const handleDetailUpdate = (detail: string) => {
        // Update local state to reflect saved detail
        const updatedWords = [...words];
        updatedWords[currentIndex] = { ...updatedWords[currentIndex], detail };
        setWords(updatedWords);
    };


    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[80vh]">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground animate-pulse">Loading daily review...</p>
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
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-serif font-bold text-foreground">
                        Daily Review
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        {words.length > 0
                            ? `${words.length} words needing attention today`
                            : "All caught up! Great job! 🎉"}
                    </p>
                </div>

                {words.length === 0 ? (
                    <div className="glass-card rounded-3xl p-12 text-center mt-8">
                        <span className="text-8xl mb-6 block animate-bounce-soft">🎉</span>
                        <h3 className="text-2xl font-bold text-foreground mb-2">You're all set!</h3>
                        <p className="text-muted-foreground mb-8">
                            No words to review right now. Add new words or come back tomorrow.
                        </p>
                        <Button
                            className="rounded-full px-8 py-6 text-lg shadow-glow hover:shadow-lg transition-all bg-primary hover:bg-primary/90"
                            onClick={() => (window.location.href = "/import")}
                        >
                            ✨ Add New Words
                        </Button>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 gap-8 items-start">
                        {/* Review Card Column */}
                        <div className="flex flex-col items-center gap-6 w-full">
                            {/* Progress */}
                            <div className="w-full flex items-center justify-between px-4 text-xs font-medium text-muted-foreground">
                                <span>Word {currentIndex + 1} of {words.length}</span>
                                <div className="flex-1 mx-4 h-1.5 bg-secondary rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary transition-all duration-300 ease-out"
                                        style={{ width: `${((currentIndex + 1) / words.length) * 100}%` }}
                                    />
                                </div>
                            </div>

                            {/* Card */}
                            <div
                                className="card-flip-container w-full aspect-[4/3] cursor-pointer group"
                                onClick={() => setIsFlipped(!isFlipped)}
                            >
                                <div className={`card-flip-inner relative w-full h-full duration-500 ${isFlipped ? "flipped" : ""}`}>
                                    {/* Front */}
                                    <div className="card-face absolute inset-0 bg-white/90 border border-white/40 shadow-soft rounded-3xl p-8 flex flex-col items-center justify-center hover:shadow-glow transition-all">
                                        <div className="absolute top-4 right-4">
                                            <Badge variant="outline" className="border-primary/20 text-primary bg-primary/5">Level {currentWord.stage}</Badge>
                                        </div>

                                        <div className="text-center">
                                            <span className="text-4xl font-bold bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                                                {currentWord.text}
                                            </span>
                                            <div className="mt-6 w-8 h-1 bg-primary/20 rounded-full mx-auto" />
                                        </div>
                                        <p className="absolute bottom-6 text-[10px] uppercase tracking-widest text-muted-foreground opacity-60">Tap to reveal</p>
                                    </div>

                                    {/* Back */}
                                    <div className="card-face card-back absolute inset-0 bg-white border border-primary/10 rounded-3xl p-8 flex flex-col items-center justify-center shadow-soft">
                                        <div className="text-center">
                                            <span className="text-sm text-muted-foreground mb-2 block font-medium font-serif italic opacity-60">
                                                {currentWord.text}
                                            </span>
                                            <span className="text-3xl font-bold text-foreground">
                                                {currentWord.translation}
                                            </span>
                                        </div>

                                        {/* Association Button on Card Back */}
                                        <button
                                            className={`absolute bottom-4 right-4 px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wide transition-all flex items-center gap-1.5 ${currentWord.detail
                                                ? "bg-green-50 text-green-600 border border-green-200"
                                                : "bg-coral/10 text-coral border border-coral/20 hover:bg-coral/20"
                                                }`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setShowAssociation(true);
                                            }}
                                        >
                                            <span>{currentWord.detail ? "✨" : "💡"}</span>
                                            {currentWord.detail ? "MEMORY" : "AI HINT"}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons - ANKI STYLE FLOW */}
                            <div className="w-full h-16">
                                {!isFlipped ? (
                                    <Button
                                        className="w-full h-full rounded-2xl bg-secondary text-foreground text-lg font-bold shadow-sm hover:bg-secondary/80"
                                        onClick={() => setIsFlipped(true)}
                                    >
                                        Show Answer
                                    </Button>
                                ) : (
                                    <div className="grid grid-cols-2 gap-4 w-full h-full animate-in fade-in slide-in-from-bottom-2 duration-300">
                                        <Button
                                            className="h-full rounded-2xl bg-orange-100 hover:bg-orange-200 text-orange-800 font-bold text-lg transition-all"
                                            onClick={() => handleReview(false)}
                                        >
                                            🤔 Forgot
                                        </Button>
                                        <Button
                                            className="h-full rounded-2xl bg-green-100 hover:bg-green-200 text-green-800 shadow-glow font-bold text-lg transition-all"
                                            onClick={() => handleReview(true)}
                                        >
                                            😎 Got it
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* AI Sentences / Memory Context */}
                        <div className="flex flex-col gap-4 w-full h-full">
                            <div className="glass-card rounded-3xl p-6 flex flex-col h-full min-h-[400px] border border-white/40 shadow-soft bg-white/60 relative overflow-hidden">
                                {/* Decorative elements */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -z-10" />
                                <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent/10 rounded-full blur-2xl -z-10" />

                                <div className="flex items-center justify-between mb-6 z-10">
                                    <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                        <span className="text-lg">📝</span> AI Context
                                    </h3>
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => setShowAssociation(true)}
                                            className="h-8 rounded-full text-xs font-bold bg-white/50 hover:bg-white/80 border-primary/20 text-primary"
                                        >
                                            💡 Hint
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={generateSentences}
                                            disabled={isGenerating}
                                            className="h-8 rounded-full text-xs font-bold bg-secondary hover:bg-secondary/80 text-foreground shadow-sm"
                                        >
                                            {isGenerating ? "..." : (sentences ? "🔄 Regenerate" : "✨ Example")}
                                        </Button>
                                    </div>
                                </div>

                                <ScrollArea className="flex-1 -mr-3 pr-3" ref={sentencesRef}>
                                    {sentences ? (
                                        <div className="space-y-4">
                                            {sentences.split('\n').filter(line => line.trim()).map((line, i) => {
                                                // Function to highlight the current word case-insensitively
                                                const parts = line.split(new RegExp(`(${currentWord.text})`, 'gi'));
                                                return (
                                                    <div key={i} className="p-4 rounded-2xl bg-white/50 border border-white/20 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-backwards" style={{ animationDelay: `${i * 100}ms` }}>
                                                        <p className="text-foreground/90 leading-relaxed font-serif text-lg">
                                                            {parts.map((part, index) =>
                                                                part.toLowerCase() === currentWord.text.toLowerCase() ? (
                                                                    <span key={index} className="text-primary font-bold bg-primary/10 px-1 rounded mx-0.5 box-decoration-clone">
                                                                        {part}
                                                                    </span>
                                                                ) : (
                                                                    <span key={index}>{part}</span>
                                                                )
                                                            )}
                                                        </p>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground text-center opacity-60">
                                            <span className="text-5xl mb-4 grayscale opacity-50">💭</span>
                                            <p className="text-sm font-medium">Tap "Example" for sentences or "Hint" for memory aids.</p>
                                        </div>
                                    )}
                                    {isGenerating && (
                                        <div className="flex items-center gap-2 mt-4 text-xs text-primary font-medium bg-primary/5 p-3 rounded-xl w-fit mx-auto">
                                            <div className="flex gap-1">
                                                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
                                                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce delay-100" />
                                                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce delay-200" />
                                            </div>
                                            <span>AI is thinking...</span>
                                        </div>
                                    )}
                                </ScrollArea>
                            </div>
                        </div>
                    </div>
                )}

                {/* Association Modal */}
                {currentWord && (
                    <AssociationModal
                        wordId={currentWord._id}
                        word={currentWord.text}
                        savedDetail={currentWord.detail}
                        isOpen={showAssociation}
                        onClose={() => setShowAssociation(false)}
                        onDetailSaved={handleDetailUpdate}
                    />
                )}
            </div>
        </div>
    );
}
