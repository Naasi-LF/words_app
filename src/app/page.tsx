"use client";

import { useState, useEffect } from "react";
import WordCard from "@/components/WordCard";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Word {
  _id: string;
  text: string;
  translation: string;
  stage: number;
  detail?: string;
  nextReviewDate: string;
}

export default function HomePage() {
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetchWords();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/words?id=${id}`, { method: "DELETE" });
      setWords(words.filter((w) => w._id !== id));
    } catch (error) {
      console.error("Failed to delete word:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="text-center">
          <span className="text-6xl animate-bounce-soft inline-block">📚</span>
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
          📚 AI Vocab
        </h1>
        <p className="text-muted-foreground mt-2">
          共 {words.length} 个单词 · 点击卡片查看中文
        </p>
      </div>

      {/* Word Grid */}
      {words.length === 0 ? (
        <div className="text-center py-20">
          <span className="text-8xl mb-4 block">🌱</span>
          <p className="text-xl text-muted-foreground">还没有单词哦～</p>
          <p className="text-sm text-muted-foreground mt-2">去"导入"页面添加一些吧！</p>
          <Button
            className="mt-6 rounded-full px-8 bg-gradient-to-r from-coral to-cute-red hover:opacity-90"
            onClick={() => (window.location.href = "/import")}
          >
            ✨ 开始导入
          </Button>
        </div>
      ) : (
        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {words.map((word) => (
              <WordCard
                key={word._id}
                id={word._id}
                text={word.text}
                translation={word.translation}
                stage={word.stage}
                detail={word.detail}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
