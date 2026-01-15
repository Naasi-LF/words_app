import OpenAI from "openai";

const API_KEY = process.env.OPENAI_API_KEY || "";
const MODEL_NAME = process.env.OPENAI_MODEL || "gpt-4o-mini";
const BASE_URL = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";

const openai = new OpenAI({
    apiKey: API_KEY,
    baseURL: BASE_URL,
});

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
        const completion = await openai.chat.completions.create({
            model: MODEL_NAME,
            messages: [{ role: "user", content: prompt }],
        });

        const response = completion.choices[0]?.message?.content || "";
        console.log("OpenAI raw response:", response);

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
        console.error("OpenAI extract error:", error);
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
    {"text": "形近词1", "translation": "中文释义（绝对不要包含括号解释形近等信息，只要中文意思）"},
    {"text": "形近词2", "translation": "中文释义（绝对不要包含括号解释形近等信息，只要中文意思）"}
  ]
}

每个类别提供高频关联词若干。
特别强调：任何中文释义中都不要包含括号进行解释（如“形近”、“注意混淆”等），只把这些词展示出来即可，确保界面整洁，有时候中文释义也可以有若干个`;

    try {
        const completion = await openai.chat.completions.create({
            model: MODEL_NAME,
            messages: [{ role: "user", content: prompt }],
        });

        const response = completion.choices[0]?.message?.content || "";
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

    try {
        const stream = await openai.chat.completions.create({
            model: MODEL_NAME,
            messages: [{ role: "user", content: prompt }],
            stream: true,
        });

        for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
                yield content;
            }
        }
    } catch (error) {
        console.error("Stream error:", error);
        throw error;
    }
}
