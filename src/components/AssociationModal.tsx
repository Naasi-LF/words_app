"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
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

            // 自动保存到数据库
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

    const WordCard = ({ item, type }: { item: WordItem; type: string }) => {
        const imported = importingWords.has(item.text);
        const typeColors: Record<string, string> = {
            synonym: "bg-blue-100 text-blue-700",
            derivative: "bg-purple-100 text-purple-700",
            similar: "bg-orange-100 text-orange-700",
        };

        return (
            <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-peach/30 hover:shadow-md transition-all">
                <div className="flex-1">
                    <span className="font-medium text-foreground">{item.text}</span>
                    <p className="text-sm text-muted-foreground">{item.translation}</p>
                </div>
                <Button
                    size="sm"
                    variant={imported ? "outline" : "default"}
                    className={`ml-2 rounded-full text-xs ${imported ? "bg-green-100 text-green-700 border-green-200" : "bg-gradient-to-r from-coral to-cute-red text-white"}`}
                    onClick={() => handleImportWord(item)}
                    disabled={imported}
                >
                    {imported ? "✓ 已加" : "+ 加入"}
                </Button>
            </div>
        );
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <Card
                className="w-full max-w-lg max-h-[85vh] bg-white rounded-3xl overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-4 bg-gradient-to-r from-coral to-cute-red text-white shrink-0">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold">🧠 联想记忆</h2>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    fetchAssociation();
                                }}
                                disabled={isLoading}
                                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center disabled:opacity-50"
                                title="重新生成"
                            >
                                🔄
                            </button>
                            <button
                                onClick={onClose}
                                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center"
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                    <p className="text-2xl font-bold mt-1">{word}</p>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4" style={{ maxHeight: "calc(85vh - 180px)" }}>
                    {isLoading ? (
                        <div className="flex items-center justify-center h-[200px]">
                            <div className="text-center">
                                <span className="text-4xl animate-bounce-soft inline-block">🔍</span>
                                <p className="text-muted-foreground mt-2">AI 正在分析...</p>
                            </div>
                        </div>
                    ) : data ? (
                        <div className="space-y-4">
                            {/* Etymology & Tip */}
                            <div className="p-3 bg-peach/10 rounded-xl">
                                <p className="text-sm"><strong>📚 词源:</strong> {data.etymology}</p>
                                <p className="text-sm mt-1"><strong>💡 记忆:</strong> {data.tip}</p>
                            </div>

                            {/* Synonyms */}
                            {data.synonyms && data.synonyms.length > 0 && (
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Badge className="bg-blue-100 text-blue-700">🔄 近义词</Badge>
                                    </div>
                                    <div className="space-y-2">
                                        {data.synonyms.map((item, i) => (
                                            <WordCard key={i} item={item} type="synonym" />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Derivatives */}
                            {data.derivatives && data.derivatives.length > 0 && (
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Badge className="bg-purple-100 text-purple-700">🔗 同源词</Badge>
                                    </div>
                                    <div className="space-y-2">
                                        {data.derivatives.map((item, i) => (
                                            <WordCard key={i} item={item} type="derivative" />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Similar */}
                            {data.similar && data.similar.length > 0 && (
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Badge className="bg-orange-100 text-orange-700">⚠️ 形近词</Badge>
                                    </div>
                                    <div className="space-y-2">
                                        {data.similar.map((item, i) => (
                                            <WordCard key={i} item={item} type="similar" />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-[200px]">
                            <p className="text-muted-foreground">加载失败，请重试</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-peach/30 flex gap-2 shrink-0">
                    {!savedDetail && data && (
                        <Button
                            variant="outline"
                            className="flex-1 rounded-full border-coral text-coral hover:bg-coral/10"
                            onClick={fetchAssociation}
                        >
                            🔄 重新生成
                        </Button>
                    )}
                    <Button
                        className="flex-1 rounded-full bg-gradient-to-r from-coral to-cute-red hover:opacity-90"
                        onClick={onClose}
                    >
                        完成 ✓
                    </Button>
                </div>
            </Card>
        </div>
    );
}
