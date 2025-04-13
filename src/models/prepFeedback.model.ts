import mongoose, { Schema, Document } from "mongoose";

export interface prepFeedbackInterface {
	userId: string;

	prepId: string,
	prepType: "Exam" | "Interview", 
	prepTitle: string,
	numberOfQuestions: number,
	difficultyLevel: string,

	// feedback: {
		totalScore: number; // Average of all category scores
		percentageScore: number; // Percentage of questions answered
		totalQuestions: number;
		answeredQuestions: number;

		questionReviews: { 
			question: string; 
			userAnswer: string 
			aiAnswer: string; 

			options?: string[];
			reference?: string;
			explanation?: string;
		}[],
		
		feedbackBreakdowns?: [
			{
				title: string; // e.g., "Communication Skills"
				score: number; // 0 to 100
				comment: [
					{
						feedback: string;
						isPositive: boolean;
					}
				]
			}
		];

		feedbackSummary: string;
		strengths: string[]; // Bullet points of what went well
		areasForImprovement: string[]; // Bullet points of what needs work
		finalAssessment: string; // A brief closing statement summarizing the candidate’s overall performance
	// },

	createdAt: string;
	updatedAt: string;
}

const PrepFeedbackSchema = new Schema<prepFeedbackInterface>(
	{
		userId: { type: String, required: true },

		prepId: { type: String, required: true },
		prepType: { type: String, enum: ['Exam', 'Interview'], required: true },
		prepTitle: { type: String, required: true },

		numberOfQuestions: { type: Number, required: true },
		difficultyLevel: { type: String, required: true },

		totalScore: { type: Number, required: true },
		percentageScore: { type: Number, required: true },
		totalQuestions: { type: Number, required: true },
		answeredQuestions: { type: Number, required: true },

		questionReviews: [{
			question: { type: String, required: true },
			userAnswer: { type: String, required: false, default: '' },
			aiAnswer: { type: String, required: true },

			options: { type: [String], required: false },
			reference: { type: String, required: false },
			explanation: { type: String, required: false },

			// type: String, required: true
		}],

		feedbackBreakdowns: [{
			title: { type: String },
			score: { type: Number },
			comment: [
				{
					feedback: { type: String },
					isPositive: { type: Boolean },
				}
			]
		}],

		feedbackSummary: { type: String, required: true },
		strengths: [{ type: String, required: true }],
		areasForImprovement: [{ type: String, required: true }],
		finalAssessment: { type: String, required: true },
	},
	{ timestamps: true }
);

export default mongoose.model<prepFeedbackInterface>("PrepFeedback", PrepFeedbackSchema);