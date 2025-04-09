import mongoose, { Schema, Document } from "mongoose";

export interface prepInterface {
	userId: string;

	prepType: "Exam" | "Interview", 
	prepTitle: string,
	numberOfQuestions: number,
	difficultyLevel: string,

	interview: {
		jobRole: string, 
		techstack: string[], 
		interviewType: string,
		jobDescription?: string, 
		// cvFile?: string
	},

	exam: {
		studyType: "multipleChoices" | "flash card" | "theory" | "subjective" | "booleanObjective",
		documents: string[],
		// followUp: boolean = false,
		tags?: string[], // Focus Topics
		language?: string // "English"
	},

	transcript: { 
		question: string; 
		userAnswer: string 
		aiAnswer: string; 
		options?: string[];
		reference: string;
		explanation: string;
	}[],

	modelChatHistory: {
		// responseId: string,
        role: "user" | "model",
        parts: { text: string }[],
	}[];

	status: "Not completed" | "Pre-Saved" | "Processing" | "Completed";
}

const PreparationSchema = new Schema<prepInterface>(
	{
		userId: { type: String, required: true },

		prepType: { type: String, enum: ['Exam', 'Interview'], required: true },
		prepTitle: { type: String, required: true },
		numberOfQuestions: { type: Number, required: true },
		difficultyLevel: { type: String, required: true },

		interview: {
			type: {
				jobRole: { type: String }, 
				techstack: [{ type: String }],
				interviewType: { type: String },
				jobDescription: { type: String, required: false }, 
				// cvFile: { type: String, required: false },
			},
			required: false
		},
	
		exam: {
			type: {
				studyType: { 
					type: String, 
					enum: ['multipleChoices', 'flash card', 'theory', 'subjective', 'booleanObjective'], 
					required: true 
				}, 
				documents: [{ type: String, required: true }],
				// followUp: boolean = false,
				tags: [{ type: String, required: false }], // Focus Topics
				language: { type: String, required: false, default: "English" },
			},
			required: false
		},

		transcript: { 
			type: [{
				question: { type: String },
				userAnswer: { type: String },
				aiAnswer: { type: String },
				options: { type: [String] },
				reference: { type: String },
				explanation: { type: String },
			}]
		},

		modelChatHistory: {
			type: [{
				role: { type: String, enum: ['user', 'model'] }, // "user" | "model", 
				parts: { text: { type: String } }
			}]
		},

		status: { type: String, enum: ["Not completed", "Pre-Saved", "Processing", "Completed"], default: "Not completed" }
	},
	{ timestamps: true }
);


export default mongoose.model<prepInterface>("Preparation", PreparationSchema);
