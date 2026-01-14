import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.GEMINI_API_KEY || "";
const MODEL_NAME = process.env.GEMINI_MODEL || "gemini-3-flash-preview";

const genAI = new GoogleGenerativeAI(API_KEY);

export const geminiModel = genAI.getGenerativeModel({ model: MODEL_NAME });

/**
 * 从文章中提取高频词汇
 */
export async function extractWordsFromText(text: string): Promise<{ text: string; translation: string }[]> {
    const prompt = `你是一个英语词汇专家。请从以下文章中提取10-20个高频、实用的英语单词或短语。

要求：
1. 选择对英语学习者有价值的词汇
2. 避免过于简单的词（如 the, is, a）
3. 返回JSON数组格式

文章内容：
${text}

请严格按照以下JSON格式返回，不要包含其他文字：
[
  {"text": "英文单词", "translation": "中文释义"},
  {"text": "英文单词", "translation": "中文释义"}
]`;

    const result = await geminiModel.generateContent(prompt);
    const response = result.response.text();

    // 提取JSON部分
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
        throw new Error("Failed to parse AI response");
    }

    return JSON.parse(jsonMatch[0]);
}

/**
 * 为单词生成例句 - 流式输出
 */
export async function* generateSentencesStream(words: string[]): AsyncGenerator<string> {
    const wordList = words.join(", ");

    const prompt = `你是一个英语教学专家。请为以下每个单词生成一个地道的英语例句。

单词列表：${wordList}

要求：
1. 每个单词一个例句
2. 例句要地道、自然、实用
3. 不要翻译，只给英文例句
4. 不要填空题形式
5. 格式：单词: 例句

请开始：`;

    const result = await geminiModel.generateContentStream(prompt);

    for await (const chunk of result.stream) {
        const text = chunk.text();
        if (text) {
            yield text;
        }
    }
}
