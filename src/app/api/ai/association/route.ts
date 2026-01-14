import { NextResponse } from "next/server";
import { getWordAssociations } from "@/services/gemini";

// 获取单词联想（结构化）
export async function POST(request: Request) {
    try {
        const { word } = await request.json();

        if (!word || word.trim().length === 0) {
            return NextResponse.json({ error: "Word is required" }, { status: 400 });
        }

        const associations = await getWordAssociations(word);
        return NextResponse.json(associations);
    } catch (error) {
        console.error("Error getting associations:", error);
        return NextResponse.json({ error: "Failed to get associations" }, { status: 500 });
    }
}
