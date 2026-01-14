import { NextResponse } from "next/server";
import { extractWordsFromText } from "@/services/gemini";

// 从文章中提取单词
export async function POST(request: Request) {
    try {
        const { text } = await request.json();

        if (!text || text.trim().length === 0) {
            return NextResponse.json({ error: "Text is required" }, { status: 400 });
        }

        const words = await extractWordsFromText(text);
        return NextResponse.json(words);
    } catch (error) {
        console.error("Error extracting words:", error);
        return NextResponse.json({ error: "Failed to extract words" }, { status: 500 });
    }
}
