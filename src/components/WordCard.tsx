"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
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
        "bg-red-100 text-red-700",
        "bg-orange-100 text-orange-700",
        "bg-yellow-100 text-yellow-700",
        "bg-lime-100 text-lime-700",
        "bg-green-100 text-green-700",
        "bg-teal-100 text-teal-700",
        "bg-emerald-100 text-emerald-700",
    ];

    const handleDetailSaved = (newDetail: string) => {
        setSavedDetail(newDetail);
        onDetailUpdate?.(id, newDetail);
    };

    return (
        <>
            <Card
                className="relative p-6 cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-gradient-to-br from-white to-peach/20 border-2 border-peach/30 rounded-2xl min-h-[140px] flex flex-col justify-center items-center"
                onClick={() => setIsFlipped(!isFlipped)}
            >
                {/* Stage Badge */}
                <Badge
                    className={`absolute top-3 right-3 ${stageColors[stage]} text-xs font-medium`}
                >
                    L{stage}
                </Badge>

                {/* Delete Button */}
                {onDelete && (
                    <button
                        className="absolute top-3 left-3 w-6 h-6 rounded-full bg-cute-red/10 hover:bg-cute-red/20 text-cute-red flex items-center justify-center text-sm transition-colors"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(id);
                        }}
                    >
                        ×
                    </button>
                )}

                {/* Word Content */}
                <div className="text-center">
                    {!isFlipped ? (
                        <div className="animate-bounce-soft">
                            <span className="text-2xl font-bold text-foreground">{text}</span>
                            <p className="text-xs text-muted-foreground mt-2">点击查看中文 👆</p>
                        </div>
                    ) : (
                        <div>
                            <span className="text-lg text-muted-foreground mb-1 block">{text}</span>
                            <span className="text-xl font-bold text-coral">{translation}</span>
                            <p className="text-xs text-muted-foreground mt-2">再次点击隐藏 🙈</p>
                        </div>
                    )}
                </div>

                {/* Association Button */}
                <button
                    className={`absolute bottom-3 right-3 px-3 py-1 rounded-full text-xs font-medium transition-colors flex items-center gap-1 ${savedDetail
                        ? "bg-green-100 hover:bg-green-200 text-green-700"
                        : "bg-coral/10 hover:bg-coral/20 text-coral"
                        }`}
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowAssociation(true);
                    }}
                >
                    🧠 {savedDetail ? "已存" : "联想"}
                </button>
            </Card>

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
