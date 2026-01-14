import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Word from "@/models/Word";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
dayjs.extend(timezone);

// 艾宾浩斯复习间隔（天数）
const REVIEW_INTERVALS = [0, 1, 2, 4, 7, 15, 30];

interface RouteContext {
    params: Promise<{ id: string }>;
}

// 更新单词复习状态
export async function PATCH(request: Request, context: RouteContext) {
    try {
        await connectToDatabase();
        const { id } = await context.params;
        const { known } = await request.json();

        const word = await Word.findById(id);
        if (!word) {
            return NextResponse.json({ error: "Word not found" }, { status: 404 });
        }

        // 获取上海时区的今天
        const today = dayjs().tz("Asia/Shanghai").startOf("day");

        if (known) {
            // 认识：stage + 1
            word.stage = Math.min(word.stage + 1, REVIEW_INTERVALS.length - 1);
        } else {
            // 不认识：stage 重置为 0
            word.stage = 0;
        }

        // 计算下次复习日期
        const daysToAdd = REVIEW_INTERVALS[word.stage];
        word.nextReviewDate = today.add(daysToAdd, "day").toDate();

        await word.save();

        return NextResponse.json(word);
    } catch (error) {
        console.error("Error updating word review:", error);
        return NextResponse.json({ error: "Failed to update word" }, { status: 500 });
    }
}
