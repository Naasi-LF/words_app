import { generateSentencesStream } from "@/services/gemini";

// 流式生成例句
export async function POST(request: Request) {
    try {
        const { words } = await request.json();

        if (!words || !Array.isArray(words) || words.length === 0) {
            return new Response(JSON.stringify({ error: "Words array is required" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        // 创建 SSE 流
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            async start(controller) {
                try {
                    for await (const chunk of generateSentencesStream(words)) {
                        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: chunk })}\n\n`));
                    }
                    controller.enqueue(encoder.encode("data: [DONE]\n\n"));
                    controller.close();
                } catch (error) {
                    console.error("Stream error:", error);
                    controller.error(error);
                }
            },
        });

        return new Response(stream, {
            headers: {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
            },
        });
    } catch (error) {
        console.error("Error generating sentences:", error);
        return new Response(JSON.stringify({ error: "Failed to generate sentences" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
