import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Word from "@/models/Word";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
dayjs.extend(timezone);

// 获取所有单词
export async function GET() {
    try {
        await connectToDatabase();
        const words = await Word.find({}).sort({ createdAt: -1 });
        return NextResponse.json(words);
    } catch (error) {
        console.error("Error fetching words:", error);
        return NextResponse.json({ error: "Failed to fetch words" }, { status: 500 });
    }
}

// 批量添加单词
export async function POST(request: Request) {
    try {
        await connectToDatabase();
        const body = await request.json();

        const words = Array.isArray(body) ? body : [body];

        // 设置初始复习日期为上海时区的今天
        const today = dayjs().tz("Asia/Shanghai").startOf("day").toDate();

        const wordsToInsert = words.map((word: { text: string; translation: string }) => ({
            text: word.text,
            translation: word.translation,
            stage: 0,
            nextReviewDate: today,
        }));

        const insertedWords = await Word.insertMany(wordsToInsert);
        return NextResponse.json(insertedWords, { status: 201 });
    } catch (error) {
        console.error("Error adding words:", error);
        return NextResponse.json({ error: "Failed to add words" }, { status: 500 });
    }
}

// 删除单词
export async function DELETE(request: Request) {
    try {
        await connectToDatabase();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "Word ID is required" }, { status: 400 });
        }

        await Word.findByIdAndDelete(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting word:", error);
        return NextResponse.json({ error: "Failed to delete word" }, { status: 500 });
    }
}
