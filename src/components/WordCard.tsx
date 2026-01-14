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

    // 同步 detail prop 变化
    useEffect(() => {
        setSavedDetail(detail || "");
    }, [detail]);

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

    return (
        <>
            <div
                className="card-flip-container h-[180px] w-full cursor-pointer group"
                onClick={() => setIsFlipped(!isFlipped)}
            >
                <div className={`card-flip-inner relative w-full h-full duration-500 ${isFlipped ? "flipped" : ""}`}>

                    {/* Front Face */}
                    <div className="card-face absolute inset-0 bg-white/95 border border-white/40 shadow-soft rounded-3xl p-6 flex flex-col items-center justify-center hover:shadow-glow transition-all duration-300">
                        {/* Stage Badge */}
                        <div className={`absolute top-4 right-4 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${stageColors[stage] || stageColors[0]}`}>
                            L{stage}
                        </div>

                        {/* Delete Button */}
                        {onDelete && (
                            <button
                                className="absolute top-4 left-4 w-6 h-6 rounded-full bg-slate-100 text-slate-400 hover:bg-red-100 hover:text-red-500 flex items-center justify-center text-sm transition-all opacity-0 group-hover:opacity-100"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(id);
                                }}
                            >
                                ×
                            </button>
                        )}

                        <div className="text-center">
                            <span className="text-3xl font-bold bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                                {text}
                            </span>
                            <div className="mt-4 w-8 h-1 bg-coral/20 rounded-full mx-auto" />
                        </div>

                        <p className="absolute bottom-4 text-[10px] text-muted-foreground uppercase tracking-widest opacity-60">
                            Tap to Flip
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
        </>
    );
}
