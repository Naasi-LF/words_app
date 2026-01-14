import mongoose, { Schema, Document, Model } from "mongoose";

export interface IWord {
    text: string;
    translation: string;
    stage: number;
    nextReviewDate: Date;
    detail?: string;  // 联想记忆详情
    createdAt: Date;
}

export interface IWordDocument extends IWord, Document { }

const WordSchema = new Schema<IWordDocument>(
    {
        text: {
            type: String,
            required: true,
            trim: true,
        },
        translation: {
            type: String,
            required: true,
            trim: true,
        },
        stage: {
            type: Number,
            default: 0,
            min: 0,
            max: 6,
        },
        nextReviewDate: {
            type: Date,
            default: () => new Date(),
        },
        detail: {
            type: String,
            default: "",
        },
    },
    {
        timestamps: { createdAt: true, updatedAt: false },
    }
);

// 防止重复编译模型
const Word: Model<IWordDocument> =
    mongoose.models.Word || mongoose.model<IWordDocument>("Word", WordSchema);

export default Word;
