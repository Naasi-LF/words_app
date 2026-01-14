import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Word from "@/models/Word";

interface RouteContext {
    params: Promise<{ id: string }>;
}

// 更新单词详情（联想记忆）
export async function PATCH(request: Request, context: RouteContext) {
    try {
        await connectToDatabase();
        const { id } = await context.params;
        const { detail } = await request.json();

        const word = await Word.findByIdAndUpdate(
            id,
            { detail },
            { new: true }
        );

        if (!word) {
            return NextResponse.json({ error: "Word not found" }, { status: 404 });
        }

        return NextResponse.json(word);
    } catch (error) {
        console.error("Error updating word detail:", error);
        return NextResponse.json({ error: "Failed to update word" }, { status: 500 });
    }
}

// 获取单个单词
export async function GET(request: Request, context: RouteContext) {
    try {
        await connectToDatabase();
        const { id } = await context.params;

        const word = await Word.findById(id);

        if (!word) {
            return NextResponse.json({ error: "Word not found" }, { status: 404 });
        }

        return NextResponse.json(word);
    } catch (error) {
        console.error("Error fetching word:", error);
        return NextResponse.json({ error: "Failed to fetch word" }, { status: 500 });
    }
}
