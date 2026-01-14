"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface WordItem {
    text: string;
    translation: string;
}

interface AssociationData {
    etymology: string;
    tip: string;
    synonyms: WordItem[];
    derivatives: WordItem[];
    similar: WordItem[];
}

interface AssociationModalProps {
    wordId: string;
    word: string;
    savedDetail?: string;
    isOpen: boolean;
    onClose: () => void;
    onDetailSaved?: (detail: string) => void;
}

export default function AssociationModal({
    wordId,
    word,
    savedDetail,
    isOpen,
    onClose,
    onDetailSaved
}: AssociationModalProps) {
    const [data, setData] = useState<AssociationData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [importingWords, setImportingWords] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (isOpen && word) {
            if (savedDetail) {
                try {
                    setData(JSON.parse(savedDetail));
                } catch {
                    fetchAssociation();
                }
            } else {
                fetchAssociation();
            }
        }
        return () => {
            if (!isOpen) {
                setData(null);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, word, savedDetail]);

    const fetchAssociation = async () => {
        setIsLoading(true);
        setData(null);

        try {
            const res = await fetch("/api/ai/association", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ word }),
            });

            const result = await res.json();

            if (result.error) {
                console.error("API Error:", result.error);
                return;
            }

            setData(result);

            if (wordId) {
                await saveDetail(JSON.stringify(result));
            }
        } catch (error) {
            console.error("Failed to fetch association:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const saveDetail = async (detail: string) => {
        try {
            await fetch(`/api/words/${wordId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ detail }),
            });
            onDetailSaved?.(detail);
        } catch (error) {
            console.error("Failed to save detail:", error);
        }
    };

    const handleImportWord = async (wordItem: WordItem) => {
        if (importingWords.has(wordItem.text)) return;

        setImportingWords(prev => new Set(prev).add(wordItem.text));

        try {
            await fetch("/api/words", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify([wordItem]),
            });
        } catch (error) {
            console.error("Failed to import word:", error);
            setImportingWords(prev => {
                const next = new Set(prev);
                next.delete(wordItem.text);
                return next;
            });
        }
    };

    const AssociatedWordRow = ({ item, type }: { item: WordItem; type: string }) => {
        const imported = importingWords.has(item.text);

        return (
            <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl border border-border/50 hover:bg-white hover:shadow-sm transition-all duration-200">
                <div className="flex-1">
                    <span className="font-bold text-foreground">{item.text}</span>
                    <p className="text-xs text-muted-foreground">{item.translation}</p>
                </div>
                <Button
                    size="sm"
                    variant={imported ? "outline" : "default"}
                    className={`ml-2 h-7 px-3 rounded-full text-[10px] font-medium tracking-wide transition-all ${imported
                            ? "bg-green-100 text-green-700 border-green-200"
                            : "bg-primary text-primary-foreground shadow-glow hover:shadow-lg hover:scale-105"
                        }`}
                    onClick={() => handleImportWord(item)}
                    disabled={imported}
                >
                    {imported ? "ADDED" : "ADD"}
                </Button>
            </div>
        );
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div
                className="glass-card w-full max-w-lg max-h-[85vh] rounded-[2rem] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-6 bg-gradient-to-br from-primary to-coral text-white shrink-0 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-10 -translate-y-10" />

                    <div className="flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-2 text-white/90">
                            <span className="text-lg">🧠</span>
                            <span className="text-xs font-bold uppercase tracking-widest">AI Insights</span>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
                        >
                            ✕
                        </button>
                    </div>
                    <h2 className="text-3xl font-bold mt-2 relative z-10">{word}</h2>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-[300px] text-center">
                            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                            <h3 className="text-lg font-bold text-foreground">Analyzing...</h3>
                            <p className="text-sm text-muted-foreground mt-1">Connecting concepts & finding patterns</p>
                        </div>
                    ) : data ? (
                        <div className="space-y-6">
                            {/* Etymology & Tip */}
                            <div className="p-4 bg-gradient-to-br from-cream to-sand rounded-2xl border border-orange-100/50">
                                <div className="mb-3">
                                    <h4 className="flex items-center gap-2 text-xs font-bold uppercase text-muted-foreground mb-1">
                                        📚 Etymology
                                    </h4>
                                    <p className="text-sm text-foreground/90 leading-relaxed">{data.etymology}</p>
                                </div>
                                <div className="w-full h-px bg-foreground/5 my-3" />
                                <div>
                                    <h4 className="flex items-center gap-2 text-xs font-bold uppercase text-muted-foreground mb-1">
                                        💡 Memory Tip
                                    </h4>
                                    <p className="text-sm text-foreground/90 leading-relaxed text-cocoa font-medium">{data.tip}</p>
                                </div>
                            </div>

                            {/* Word Groups */}
                            {data.synonyms?.length > 0 && (
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200 px-2 py-0.5 rounded-md">Synonyms</Badge>
                                    </div>
                                    <div className="grid gap-2">
                                        {data.synonyms.map((item, i) => (
                                            <AssociatedWordRow key={i} item={item} type="synonym" />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {data.derivatives?.length > 0 && (
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <Badge variant="outline" className="bg-purple-50 text-purple-600 border-purple-200 px-2 py-0.5 rounded-md">Derivatives</Badge>
                                    </div>
                                    <div className="grid gap-2">
                                        {data.derivatives.map((item, i) => (
                                            <AssociatedWordRow key={i} item={item} type="derivative" />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {data.similar?.length > 0 && (
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-200 px-2 py-0.5 rounded-md">Look-alikes</Badge>
                                    </div>
                                    <div className="grid gap-2">
                                        {data.similar.map((item, i) => (
                                            <AssociatedWordRow key={i} item={item} type="similar" />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-[200px] text-center">
                            <span className="text-4xl mb-4 grayscale opacity-50">🌩️</span>
                            <p className="text-muted-foreground">Failed to load insights.</p>
                            <Button
                                variant="outline"
                                className="mt-4 rounded-full"
                                onClick={fetchAssociation}
                            >
                                Try Again
                            </Button>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {data && (
                    <div className="p-4 border-t border-border/50 bg-white/50 backdrop-blur-sm flex gap-3 shrink-0">
                        {!savedDetail && (
                            <Button
                                variant="ghost"
                                className="flex-1 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/5"
                                onClick={fetchAssociation}
                            >
                                🔄 Regenerate
                            </Button>
                        )}
                        <Button
                            className="flex-[2] rounded-xl bg-gradient-to-r from-primary to-coral shadow-lg shadow-primary/25 hover:shadow-xl hover:scale-[1.02] transition-all"
                            onClick={onClose}
                        >
                            Done
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
