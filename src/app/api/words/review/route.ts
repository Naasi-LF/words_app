import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Word from "@/models/Word";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
dayjs.extend(timezone);

// 获取今日待复习的单词
export async function GET() {
    try {
        await connectToDatabase();

        // 获取上海时区的今天结束时间
        const todayEnd = dayjs().tz("Asia/Shanghai").endOf("day").toDate();

        // 查找 nextReviewDate <= 今天的单词
        const words = await Word.find({
            nextReviewDate: { $lte: todayEnd }
        }).sort({ nextReviewDate: 1 });

        return NextResponse.json(words);
    } catch (error) {
        console.error("Error fetching review words:", error);
        return NextResponse.json({ error: "Failed to fetch review words" }, { status: 500 });
    }
}
