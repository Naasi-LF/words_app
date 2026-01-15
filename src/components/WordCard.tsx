"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import AssociationModal from "./AssociationModal";

interface WordCardProps {
    id: string;
    text: string;
    translation: string;
    stage: number;
    detail?: string;
    onDelete?: (id: string) => void;
    onDetailUpdate?: (id: string, detail: string) => void;
}

export default function WordCard({
    id,
    text,
    translation,
    stage,
    detail,
    onDelete,
    onDetailUpdate
}: WordCardProps) {
    const [isFlipped, setIsFlipped] = useState(false);
    const [showAssociation, setShowAssociation] = useState(false);
    const [savedDetail, setSavedDetail] = useState(detail || "");
    const [showMenu, setShowMenu] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(text);
    const [editTranslation, setEditTranslation] = useState(translation);
    const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);

    // Sync detail prop
    useEffect(() => {
        setSavedDetail(detail || "");
    }, [detail]);

    // Update edit state when props change
    useEffect(() => {
        setEditText(text);
        setEditTranslation(translation);
    }, [text, translation]);

    const stageColors = [
        "bg-red-100 text-red-700 border-red-200",
        "bg-orange-100 text-orange-700 border-orange-200",
        "bg-yellow-100 text-yellow-700 border-yellow-200",
        "bg-lime-100 text-lime-700 border-lime-200",
        "bg-green-100 text-green-700 border-green-200",
        "bg-teal-100 text-teal-700 border-teal-200",
        "bg-emerald-100 text-emerald-700 border-emerald-200",
    ];

    const handleDetailSaved = (newDetail: string) => {
        setSavedDetail(newDetail);
        onDetailUpdate?.(id, newDetail);
    };

    // Long Press Logic
    const handleTouchStart = () => {
        const timer = setTimeout(() => {
            setShowMenu(true);
        }, 600);
        setLongPressTimer(timer);
    };

    const handleTouchEnd = () => {
        if (longPressTimer) {
            clearTimeout(longPressTimer);
            setLongPressTimer(null);
        }
    };

    const handleSaveEdit = async () => {
        // Here you would typically call an API to update the word
        // For now we'll just update the local UI via parent callback if available, 
        // or just close since we might need an onUpdate prop for the text/translation specifically.
        // Assuming user just wants the UI for now or we repurpose onDetailUpdate? 
        // Actually, we likely need a new onUpdate prop, but I'll leave a TODO or try to use an API call directly if possible.
        // Since I can't easily change the parent interface in this single file edit, I will implement the API call here.

        try {
            const res = await fetch(`/api/words/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: editText, translation: editTranslation }),
            });
            if (res.ok) {
                // Force refresh or notify parent? 
                // For now, we update the local state which might drift from parent, but a page refresh fixes it.
                // Ideally parent re-fetches.
                window.location.reload(); // Simple brute force for now to ensure consistency
            }
        } catch (error) {
            console.error("Failed to update word", error);
        }
        setIsEditing(false);
        setShowMenu(false);
    };

    const handleDelete = () => {
        if (confirm("Are you sure you want to delete this word?")) {
            onDelete?.(id);
            setShowMenu(false);
        }
    };

    return (
        <>
            <div
                className="card-flip-container h-[180px] w-full cursor-pointer group select-none relative"
                onClick={() => !showMenu && setIsFlipped(!isFlipped)}
                onMouseDown={handleTouchStart}
                onMouseUp={handleTouchEnd}
                onMouseLeave={handleTouchEnd}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
            >
                <div className={`card-flip-inner relative w-full h-full duration-500 ${isFlipped ? "flipped" : ""}`}>

                    {/* Front Face */}
                    <div className="card-face absolute inset-0 bg-white/95 border border-white/40 shadow-soft rounded-3xl p-6 flex flex-col items-center justify-center hover:shadow-glow transition-all duration-300">
                        {/* Stage Badge */}
                        <div className={`absolute top-4 right-4 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${stageColors[stage] || stageColors[0]}`}>
                            L{stage}
                        </div>

                        {/* REMOVED Delete Button from here */}

                        <div className="text-center">
                            <span className="text-3xl font-bold bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                                {text}
                            </span>
                            <div className="mt-4 w-8 h-1 bg-coral/20 rounded-full mx-auto" />
                        </div>

                        <p className="absolute bottom-4 text-[10px] text-muted-foreground uppercase tracking-widest opacity-60">
                            Tap to Flip • Long Press to Edit
                        </p>
                    </div>

                    {/* Back Face */}
                    <div className="card-face card-back absolute inset-0 bg-white border-2 border-primary/10 rounded-3xl p-6 flex flex-col items-center justify-center shadow-soft">
                        <div className="text-center">
                            <span className="text-sm text-muted-foreground mb-2 block font-medium tracking-wide text-primary/60">{text}</span>
                            <span className="text-2xl font-bold text-foreground">
                                {translation}
                            </span>
                        </div>

                        {/* Association Button */}
                        <button
                            className={`absolute bottom-4 right-4 px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wide transition-all flex items-center gap-1.5 ${savedDetail
                                ? "bg-green-50 text-green-600 border border-green-200"
                                : "bg-coral/10 text-coral border border-coral/20 hover:bg-coral/20"
                                }`}
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowAssociation(true);
                            }}
                        >
                            <span>{savedDetail ? "✨" : "💡"}</span>
                            {savedDetail ? "SAVED" : "AI NOTE"}
                        </button>
                    </div>
                </div>
            </div>

            {/* Association Modal */}
            <AssociationModal
                wordId={id}
                word={text}
                savedDetail={savedDetail}
                isOpen={showAssociation}
                onClose={() => setShowAssociation(false)}
                onDetailSaved={handleDetailSaved}
            />

            {/* Long Press Menu Overlay */}
            {showMenu && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowMenu(false)}>
                    <div className="bg-white rounded-3xl p-6 w-[85%] max-w-sm shadow-2xl animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>

                        {!isEditing ? (
                            // Menu Options
                            <div className="flex flex-col gap-3">
                                <h3 className="text-lg font-bold text-center mb-2">Options</h3>
                                <button
                                    className="w-full py-3 rounded-xl bg-secondary/50 font-medium text-foreground hover:bg-secondary transition-colors flex items-center justify-center gap-2"
                                    onClick={() => setIsEditing(true)}
                                >
                                    ✏️ Edit Content
                                </button>
                                <button
                                    className="w-full py-3 rounded-xl bg-red-50 text-red-600 font-medium hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                                    onClick={handleDelete}
                                >
                                    🗑️ Delete Word
                                </button>
                                <button
                                    className="w-full py-3 rounded-xl border border-border text-muted-foreground hover:bg-muted transition-colors mt-2"
                                    onClick={() => setShowMenu(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        ) : (
                            // Edit Form
                            <div className="flex flex-col gap-4">
                                <h3 className="text-lg font-bold text-center">Edit Word</h3>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-muted-foreground uppercase">Word</label>
                                    <input
                                        className="w-full p-3 rounded-xl bg-secondary/30 border border-transparent focus:border-primary/50 focus:bg-white transition-all outline-none font-bold text-lg"
                                        value={editText}
                                        onChange={e => setEditText(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-muted-foreground uppercase">Meaning</label>
                                    <input
                                        className="w-full p-3 rounded-xl bg-secondary/30 border border-transparent focus:border-primary/50 focus:bg-white transition-all outline-none"
                                        value={editTranslation}
                                        onChange={e => setEditTranslation(e.target.value)}
                                    />
                                </div>
                                <div className="flex gap-3 mt-2">
                                    <button
                                        className="flex-1 py-3 rounded-xl border border-border text-muted-foreground hover:bg-muted font-medium"
                                        onClick={() => setIsEditing(false)}
                                    >
                                        Back
                                    </button>
                                    <button
                                        className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:scale-[1.02] transition-all font-bold"
                                        onClick={handleSaveEdit}
                                    >
                                        Save
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
