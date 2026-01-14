"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ExtractedWord {
    text: string;
    translation: string;
    selected: boolean;
}

export default function ImportPage() {
    const [articleText, setArticleText] = useState("");
    const [extractedWords, setExtractedWords] = useState<ExtractedWord[]>([]);
    const [isExtracting, setIsExtracting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [savedCount, setSavedCount] = useState(0);

    // 手动输入
    const [manualWord, setManualWord] = useState("");
    const [manualTranslation, setManualTranslation] = useState("");
    const [activeTab, setActiveTab] = useState<"ai" | "manual">("ai");

    const handleExtract = async () => {
        if (!articleText.trim()) return;

        setIsExtracting(true);
        setExtractedWords([]);

        try {
            const res = await fetch("/api/ai/extract", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: articleText }),
            });

            const data = await res.json();

            if (data.error) {
                console.error("API Error:", data.error);
                alert("Extraction failed: " + data.error);
                return;
            }

            if (!Array.isArray(data)) {
                console.error("Invalid response:", data);
                alert("AI format error, please try again");
                return;
            }

            setExtractedWords(
                data.map((w: { text: string; translation: string }) => ({
                    ...w,
                    selected: true,
                }))
            );
        } catch (error) {
            console.error("Failed to extract words:", error);
            alert("Network error, please try again");
        } finally {
            setIsExtracting(false);
        }
    };

    const toggleWord = (index: number) => {
        setExtractedWords((prev) =>
            prev.map((w, i) => (i === index ? { ...w, selected: !w.selected } : w))
        );
    };

    const handleSave = async () => {
        const selectedWords = extractedWords.filter((w) => w.selected);
        if (selectedWords.length === 0) return;

        setIsSaving(true);

        try {
            const wordsToSave = selectedWords.map((w) => ({
                text: w.text,
                translation: w.translation,
            }));

            await fetch("/api/words", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(wordsToSave),
            });

            setSavedCount(selectedWords.length);
            setExtractedWords([]);
            setArticleText("");

            setTimeout(() => setSavedCount(0), 3000);
        } catch (error) {
            console.error("Failed to save words:", error);
        } finally {
            setIsSaving(false);
        }
    };

    // 手动添加单词
    const handleManualAdd = async () => {
        if (!manualWord.trim() || !manualTranslation.trim()) {
            alert("Please enter both word and translation");
            return;
        }

        setIsSaving(true);

        try {
            await fetch("/api/words", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify([{ text: manualWord.trim(), translation: manualTranslation.trim() }]),
            });

            setSavedCount(1);
            setManualWord("");
            setManualTranslation("");

            setTimeout(() => setSavedCount(0), 3000);
        } catch (error) {
            console.error("Failed to add word:", error);
            alert("Failed to add word, please try again");
        } finally {
            setIsSaving(false);
        }
    };

    const selectedCount = extractedWords.filter((w) => w.selected).length;

    return (
        <div className="min-h-screen pb-32 pt-8">
            {/* Background Elements */}
            <div className="fixed top-0 left-0 w-full h-64 bg-gradient-to-b from-primary/5 to-transparent -z-10" />

            <div className="container mx-auto px-4 max-w-4xl">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-serif font-bold text-foreground">
                        Add New Words
                    </h1>
                    <p className="text-muted-foreground mt-2">Grow your vocabulary garden</p>
                </div>

                {/* Tab Switcher */}
                <div className="flex justify-center gap-4 mb-8">
                    <button
                        onClick={() => setActiveTab("ai")}
                        className={`px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 ${activeTab === "ai"
                                ? "bg-primary text-white shadow-glow transform scale-105"
                                : "bg-white text-muted-foreground border border-border/50 hover:bg-secondary/20"
                            }`}
                    >
                        🤖 AI Extract
                    </button>
                    <button
                        onClick={() => setActiveTab("manual")}
                        className={`px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 ${activeTab === "manual"
                                ? "bg-primary text-white shadow-glow transform scale-105"
                                : "bg-white text-muted-foreground border border-border/50 hover:bg-secondary/20"
                            }`}
                    >
                        ✏️ Manual Input
                    </button>
                </div>

                {/* Success Message */}
                {savedCount > 0 && (
                    <div className="mb-6 p-4 bg-green-50 text-green-700 border border-green-200 rounded-2xl text-center animate-bounce-soft shadow-sm max-w-md mx-auto">
                        🎉 Successfully added <span className="font-bold">{savedCount}</span> words!
                    </div>
                )}

                {activeTab === "manual" ? (
                    /* Manual Input */
                    <div className="glass-card p-8 rounded-3xl max-w-md mx-auto animate-in slide-in-from-bottom-4 duration-500">
                        <h3 className="text-lg font-bold text-foreground mb-6 text-center flex items-center justify-center gap-2">
                            <span>✏️</span> Quick Add
                        </h3>
                        <div className="space-y-5">
                            <div>
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">English Word</label>
                                <Input
                                    placeholder="e.g. serendipity"
                                    value={manualWord}
                                    onChange={(e) => setManualWord(e.target.value)}
                                    className="h-12 rounded-xl border-border/50 focus:border-primary focus:ring-primary/20 bg-secondary/10"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Translation</label>
                                <Input
                                    placeholder="e.g. 意外发现美好事物的运气"
                                    value={manualTranslation}
                                    onChange={(e) => setManualTranslation(e.target.value)}
                                    className="h-12 rounded-xl border-border/50 focus:border-primary focus:ring-primary/20 bg-secondary/10"
                                />
                            </div>
                            <Button
                                className="w-full h-12 rounded-full bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 text-lg font-bold transition-all hover:scale-[1.02]"
                                onClick={handleManualAdd}
                                disabled={isSaving || !manualWord.trim() || !manualTranslation.trim()}
                            >
                                {isSaving ? "Saving..." : "Save Word"}
                            </Button>
                        </div>
                    </div>
                ) : (
                    /* AI Extract */
                    <div className="grid md:grid-cols-2 gap-6 animate-in slide-in-from-bottom-4 duration-500">
                        {/* Input Area */}
                        <div className="glass-card p-6 rounded-3xl flex flex-col h-[500px]">
                            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                                <span>📄</span> Paste Article
                            </h3>
                            <Textarea
                                placeholder="Paste an English article or text here..."
                                className="flex-1 resize-none border-border/50 focus:border-primary focus:ring-primary/20 bg-secondary/10 rounded-xl p-4 leading-relaxed"
                                value={articleText}
                                onChange={(e) => setArticleText(e.target.value)}
                            />
                            <Button
                                className="w-full mt-4 h-12 rounded-full bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 font-bold transition-all hover:scale-[1.02]"
                                onClick={handleExtract}
                                disabled={isExtracting || !articleText.trim()}
                            >
                                {isExtracting ? (
                                    <span className="flex items-center gap-2">
                                        <span className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                                        Extracting...
                                    </span>
                                ) : (
                                    "✨ Extract Words with AI"
                                )}
                            </Button>
                        </div>

                        {/* Extracted Words */}
                        <div className="glass-card p-6 rounded-3xl flex flex-col h-[500px]">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                    <span>📚</span> Results
                                </h3>
                                {extractedWords.length > 0 && (
                                    <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                                        Selected {selectedCount}/{extractedWords.length}
                                    </Badge>
                                )}
                            </div>

                            <ScrollArea className="flex-1 pr-4 -mr-4">
                                {extractedWords.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-[350px] text-muted-foreground text-center p-8 border-2 border-dashed border-border/50 rounded-2xl">
                                        <span className="text-5xl mb-4 grayscale opacity-30">✨</span>
                                        <p className="font-medium">AI Suggestions will appear here</p>
                                        <p className="text-sm mt-2 opacity-60">Paste text on the left to start</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {extractedWords.map((word, index) => (
                                            <div
                                                key={index}
                                                className={`p-4 rounded-xl cursor-pointer transition-all duration-200 border group ${word.selected
                                                        ? "bg-white border-primary/30 shadow-sm"
                                                        : "bg-secondary/20 border-transparent opacity-60 hover:opacity-100"
                                                    }`}
                                                onClick={() => toggleWord(index)}
                                            >
                                                <div className="flex items-center justify-between pointer-events-none">
                                                    <div>
                                                        <span className={`font-bold text-lg ${word.selected ? "text-foreground" : "text-muted-foreground"}`}>
                                                            {word.text}
                                                        </span>
                                                        <p className="text-sm text-muted-foreground mt-0.5">
                                                            {word.translation}
                                                        </p>
                                                    </div>
                                                    <div
                                                        className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all ${word.selected
                                                                ? "bg-primary border-primary text-white"
                                                                : "bg-transparent border-border text-transparent group-hover:border-primary/50"
                                                            }`}
                                                    >
                                                        ✓
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </ScrollArea>

                            {extractedWords.length > 0 && (
                                <Button
                                    className="w-full mt-4 h-12 rounded-full bg-gradient-to-r from-primary to-coral shadow-lg shadow-primary/20 font-bold transition-all hover:scale-[1.02]"
                                    onClick={handleSave}
                                    disabled={isSaving || selectedCount === 0}
                                >
                                    {isSaving ? "Saving..." : `Save ${selectedCount} Words`}
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
