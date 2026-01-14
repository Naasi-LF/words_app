import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.GEMINI_API_KEY || "";
const MODEL_NAME = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite-preview-09-2025";

const genAI = new GoogleGenerativeAI(API_KEY);

export const geminiModel = genAI.getGenerativeModel({ model: MODEL_NAME });

/**
 * 从文章中提取高频词汇
 */
export async function extractWordsFromText(text: string): Promise<{ text: string; translation: string }[]> {
    const prompt = `你是一个英语词汇专家。请从以下文章中提取所有的高频、实用的英语单词。

要求：
1. 只提取单个单词，不要词组或短语
2. 选择对英语学习者有价值的词汇
3. 避免过于简单的词（如 the, is, a, an, of）
4. 只返回纯JSON数组，不要包含任何其他文字或markdown代码块

文章内容：
${text}

请严格按照以下JSON格式返回：
[{"text": "英文单词", "translation": "中文释义"}]`;

    try {
        const result = await geminiModel.generateContent(prompt);
        const response = result.response.text();

        console.log("Gemini raw response:", response);

        let jsonStr = response;

        const codeBlockMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (codeBlockMatch) {
            jsonStr = codeBlockMatch[1].trim();
        } else {
            const jsonMatch = response.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                jsonStr = jsonMatch[0];
            }
        }

        const parsed = JSON.parse(jsonStr);

        if (!Array.isArray(parsed)) {
            throw new Error("Response is not an array");
        }

        return parsed;
    } catch (error) {
        console.error("Gemini extract error:", error);
        throw new Error(`Failed to extract words: ${error}`);
    }
}

/**
 * 获取单词的联想词（结构化JSON）
 */
export async function getWordAssociations(word: string): Promise<{
    synonyms: { text: string; translation: string }[];
    derivatives: { text: string; translation: string }[];
    similar: { text: string; translation: string }[];
    etymology: string;
    tip: string;
}> {
    const prompt = `你是一个词源学和英语词汇专家。请为单词 "${word}" 提供联想记忆帮助。

请严格按照以下JSON格式返回，不要包含任何其他文字或markdown：
{
  "etymology": "词根词源简要说明（一句话）",
  "tip": "记忆技巧（一句话）",
  "synonyms": [
    {"text": "近义词1", "translation": "中文释义"},
    {"text": "近义词2", "translation": "中文释义"}
  ],
  "derivatives": [
    {"text": "同源派生词1", "translation": "中文释义"},
    {"text": "同源派生词2", "translation": "中文释义"}
  ],
  "similar": [
    {"text": "形近词1", "translation": "中文释义（注意区分）"},
    {"text": "形近词2", "translation": "中文释义（注意区分）"}
  ]
}

每个类别提供2-4个词即可。`;

    try {
        const result = await geminiModel.generateContent(prompt);
        const response = result.response.text();

        console.log("Association raw response:", response);

        let jsonStr = response;

        const codeBlockMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (codeBlockMatch) {
            jsonStr = codeBlockMatch[1].trim();
        } else {
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                jsonStr = jsonMatch[0];
            }
        }

        return JSON.parse(jsonStr);
    } catch (error) {
        console.error("Association error:", error);
        throw new Error(`Failed to get associations: ${error}`);
    }
}

/**
 * 为单词生成例句 - 流式输出
 */
export async function* generateSentencesStream(words: string[], type: string = "sentences"): AsyncGenerator<string> {
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
