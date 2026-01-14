"use client";

import { useState, useEffect } from "react";
import WordCard from "@/components/WordCard";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import dayjs from "dayjs";

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
  const [greeting, setGreeting] = useState("");

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
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning ☀️");
    else if (hour < 18) setGreeting("Good Afternoon 🌤️");
    else setGreeting("Good Evening 🌙");
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
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground animate-pulse">Loading your vocabulary...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-32">
      {/* Decorative Background Elements */}
      <div className="fixed top-0 left-0 w-full h-64 bg-gradient-to-b from-primary/10 to-transparent -z-10" />
      <div className="fixed top-[-10%] right-[-10%] w-[300px] h-[300px] bg-coral/20 rounded-full blur-3xl -z-10" />
      <div className="fixed bottom-[10%] left-[-10%] w-[200px] h-[200px] bg-secondary/20 rounded-full blur-3xl -z-10" />

      <div className="container mx-auto px-4 pt-12 max-w-4xl">
        {/* Header Section */}
        <header className="mb-10">
          <h1 className="text-4xl font-serif font-bold text-foreground mb-2">
            {greeting}
          </h1>
          <p className="text-lg text-muted-foreground font-medium">
            You have <span className="text-primary font-bold">{words.length}</span> words to explore.
          </p>
        </header>

        {/* Word Grid */}
        {words.length === 0 ? (
          <div className="glass-card rounded-3xl p-12 text-center mt-8">
            <span className="text-8xl mb-6 block transform hover:scale-110 transition-transform cursor-pointer">🌱</span>
            <h3 className="text-2xl font-bold text-foreground mb-2">Start your journey</h3>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Your vocabulary garden is empty. Add your first word to see it grow.
            </p>
            <Button
              className="rounded-full px-8 py-6 text-lg shadow-glow hover:shadow-lg transition-all bg-primary hover:bg-primary/90"
              onClick={() => (window.location.href = "/import")}
            >
              ✨ Add New Words
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {words.map((word, index) => (
              <div
                key={word._id}
                className="animate-in fade-in slide-in-from-bottom-4 duration-500"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <WordCard
                  id={word._id}
                  text={word.text}
                  translation={word.translation}
                  stage={word.stage}
                  detail={word.detail}
                  onDelete={handleDelete}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
