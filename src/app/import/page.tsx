"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
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
                alert("提取失败: " + data.error);
                return;
            }

            if (!Array.isArray(data)) {
                console.error("Invalid response:", data);
                alert("AI 返回格式错误，请重试");
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
            alert("网络错误，请重试");
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
            alert("请输入单词和中文释义");
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
            alert("添加失败，请重试");
        } finally {
            setIsSaving(false);
        }
    };

    const selectedCount = extractedWords.filter((w) => w.selected).length;

    return (
        <div className="container mx-auto px-4 py-6 max-w-4xl">
            {/* Header */}
            <div className="text-center mb-6">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-coral to-cute-red bg-clip-text text-transparent">
                    ✨ 添加单词
                </h1>
                <p className="text-muted-foreground mt-2">AI 提取或手动输入</p>
            </div>

            {/* Tab Switcher */}
            <div className="flex justify-center gap-2 mb-6">
                <Button
                    variant={activeTab === "ai" ? "default" : "outline"}
                    className={`rounded-full px-6 ${activeTab === "ai" ? "bg-gradient-to-r from-coral to-cute-red" : "border-peach"}`}
                    onClick={() => setActiveTab("ai")}
                >
                    🤖 AI 提取
                </Button>
                <Button
                    variant={activeTab === "manual" ? "default" : "outline"}
                    className={`rounded-full px-6 ${activeTab === "manual" ? "bg-gradient-to-r from-coral to-cute-red" : "border-peach"}`}
                    onClick={() => setActiveTab("manual")}
                >
                    ✏️ 手动输入
                </Button>
            </div>

            {/* Success Message */}
            {savedCount > 0 && (
                <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-2xl text-center animate-bounce-soft">
                    🎉 成功添加 {savedCount} 个单词！
                </div>
            )}

            {activeTab === "manual" ? (
                /* Manual Input */
                <Card className="p-6 bg-gradient-to-br from-white to-peach/10 border-2 border-peach/30 rounded-2xl max-w-md mx-auto">
                    <h3 className="text-lg font-medium text-foreground mb-4 text-center">
                        ✏️ 手动添加单词
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm text-muted-foreground mb-1 block">英文单词</label>
                            <Input
                                placeholder="例如: serendipity"
                                value={manualWord}
                                onChange={(e) => setManualWord(e.target.value)}
                                className="border-peach/30 focus:border-coral rounded-xl"
                            />
                        </div>
                        <div>
                            <label className="text-sm text-muted-foreground mb-1 block">中文释义</label>
                            <Input
                                placeholder="例如: 意外发现美好事物的运气"
                                value={manualTranslation}
                                onChange={(e) => setManualTranslation(e.target.value)}
                                className="border-peach/30 focus:border-coral rounded-xl"
                            />
                        </div>
                        <Button
                            className="w-full rounded-full bg-gradient-to-r from-coral to-cute-red hover:opacity-90"
                            onClick={handleManualAdd}
                            disabled={isSaving || !manualWord.trim() || !manualTranslation.trim()}
                        >
                            {isSaving ? "💾 保存中..." : "💾 添加单词"}
                        </Button>
                    </div>
                </Card>
            ) : (
                /* AI Extract */
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Input Area */}
                    <Card className="p-4 bg-gradient-to-br from-white to-peach/10 border-2 border-peach/30 rounded-2xl">
                        <h3 className="text-sm font-medium text-muted-foreground mb-3">
                            📄 粘贴文章
                        </h3>
                        <Textarea
                            placeholder="在这里粘贴英文文章..."
                            className="min-h-[300px] resize-none border-peach/30 focus:border-coral rounded-xl"
                            value={articleText}
                            onChange={(e) => setArticleText(e.target.value)}
                        />
                        <Button
                            className="w-full mt-4 rounded-full bg-gradient-to-r from-coral to-cute-red hover:opacity-90"
                            onClick={handleExtract}
                            disabled={isExtracting || !articleText.trim()}
                        >
                            {isExtracting ? "🔍 提取中..." : "🔍 AI 提取单词"}
                        </Button>
                    </Card>

                    {/* Extracted Words */}
                    <Card className="p-4 bg-gradient-to-br from-white to-peach/10 border-2 border-peach/30 rounded-2xl">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-medium text-muted-foreground">
                                📚 提取结果
                            </h3>
                            {extractedWords.length > 0 && (
                                <Badge className="bg-coral/10 text-coral">
                                    已选 {selectedCount}/{extractedWords.length}
                                </Badge>
                            )}
                        </div>

                        <ScrollArea className="h-[300px]">
                            {extractedWords.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                                    <span className="text-4xl mb-4">🌟</span>
                                    <p>提取的单词会显示在这里</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {extractedWords.map((word, index) => (
                                        <div
                                            key={index}
                                            className={`p-3 rounded-xl cursor-pointer transition-all duration-200 ${word.selected
                                                    ? "bg-coral/10 border-2 border-coral/30"
                                                    : "bg-gray-50 border-2 border-transparent opacity-50"
                                                }`}
                                            onClick={() => toggleWord(index)}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="font-medium text-foreground">
                                                    {word.text}
                                                </span>
                                                <span
                                                    className={`text-lg ${word.selected ? "opacity-100" : "opacity-30"
                                                        }`}
                                                >
                                                    {word.selected ? "✅" : "⭕"}
                                                </span>
                                            </div>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {word.translation}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </ScrollArea>

                        {extractedWords.length > 0 && (
                            <Button
                                className="w-full mt-4 rounded-full bg-gradient-to-r from-coral to-cute-red hover:opacity-90"
                                onClick={handleSave}
                                disabled={isSaving || selectedCount === 0}
                            >
                                {isSaving ? "💾 保存中..." : `💾 保存 ${selectedCount} 个单词`}
                            </Button>
                        )}
                    </Card>
                </div>
            )}
        </div>
    );
}
