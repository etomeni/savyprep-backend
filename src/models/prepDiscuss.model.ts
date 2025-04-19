import mongoose, { Schema } from "mongoose";

export interface prepDiscussInterface {
	userId: string;
	userEmail: string;

	prepId: string,
	prepFeedbackId: string,

	role: "user" | "model" | "assistant" | "system",
	text: string
	
	createdAt: string;
	updatedAt: string;
}

const PrepDiscussSchema = new Schema<prepDiscussInterface>(
	{
		userId: { type: String, required: true },
		userEmail: { type: String, required: true },

		prepId: { type: String, required: true },
		prepFeedbackId: { type: String, required: true },
	
		role: { type: String, enum: ['user', 'model', "assistant", "system"], required: true },
		text: { type: String, required: true },
	},
	{ timestamps: true }
);

export default mongoose.model<prepDiscussInterface>("PrepDiscuss", PrepDiscussSchema);