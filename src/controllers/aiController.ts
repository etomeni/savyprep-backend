import {
    GoogleGenAI,
    createUserContent,
    createPartFromUri,
  } from "@google/genai";


const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });
// Initialize the GoogleGenAI client with your API key
// Make sure to set the GOOGLE_API_KEY environment variable
// or replace process.env.GOOGLE_API_KEY with your actual API key
// in a secure way.
// For example, you can use dotenv to load environment variables from a .env file

interface formattedTranscriptInterface {
    question: string;
    userAnswer: string;
    suggestedAnswer: string;
};
  

const getInterviewQuestionsPrompt = (
    role: string, level: string, techstack: string[], type: string, amount: number,
    jobDescription?: string, cvFile?: string
) => {
    let generateQuestionsPrompt = "Prepare interview questions for a job candidate.";
    generateQuestionsPrompt += `The job role is: ${role}.`;
    generateQuestionsPrompt += `The experience level required is: ${level}.`;
    generateQuestionsPrompt += `The tech stack relevant to the job ${techstack.length > 1 ? 'are' : 'is'}: ${techstack.toString()}.`;
    generateQuestionsPrompt += `The focus between behavioural and technical questions should lean towards: ${type}.`;
    generateQuestionsPrompt += `The amount of questions required is: ${amount}.`;

    generateQuestionsPrompt += jobDescription ? `Use the following job description to tailor the questions: ${jobDescription}` : '';
    generateQuestionsPrompt += cvFile ? `Use the candidate's CV/resume to personalize the questions based on their background: ${cvFile}` : '';
    
    generateQuestionsPrompt += `Please return only the questions, without any additional text or explanations.`;
    // generateQuestionsPrompt += `The questions are going to be read by a voice assistant so do not use "/" or "*" or any other special characters which might break the voice assistant.`;
    generateQuestionsPrompt += `The questions will be read by a voice assistant, so do not use any special characters like "/", "*", or any punctuation that might interfere with the voice output.`;
    generateQuestionsPrompt += `Return the questions formatted exactly like this: `;
    // generateQuestionsPrompt += `["Question 1", "Question 2", "Question 3"]`;
    generateQuestionsPrompt += `[{question: "Question 1", suggestedAnswer: "Answer 1",}, {question: "Question 2", suggestedAnswer: "Answer 2",}, {question: "Question 3", suggestedAnswer: "Answer 3",}]`;
    generateQuestionsPrompt += `Thank you! ❤️`;

    return generateQuestionsPrompt;
}

const getInterviewFeedbackPrompt = (
    formattedTranscript: formattedTranscriptInterface[],
    // role: string, level: string, techstack: string[], type: string, amount: number,
    // jobDescription?: string, cvFile?: string
) => {
    // const feedbackPrompt= {
    //     prompt: `
    //             You are an AI interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories. Be thorough and detailed in your analysis. Don't be lenient with the candidate. If there are mistakes or areas for improvement, point them out.
    //             Transcript:
    //             ${formattedTranscript}
        
    //             Please score the candidate from 0 to 100 in the following areas. Do not add categories other than the ones provided:
    //             - **Communication Skills**: Clarity, articulation, structured responses.
    //             - **Technical Knowledge**: Understanding of key concepts for the role.
    //             - **Problem-Solving**: Ability to analyze problems and propose solutions.
    //             - **Cultural & Role Fit**: Alignment with company values and job role.
    //             - **Confidence & Clarity**: Confidence in responses, engagement, and clarity.
    //             `,
    //     system: "You are a professional interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories",
    // }

    const feedbackPrompt= {
        prompt: `
                You are an AI interviewer analyzing a mock interview. Your task is to evaluate the candidate’s performance based on specific criteria. Be detailed, objective, and constructive in your analysis. Do not be lenient — if there are gaps in knowledge, poor communication, or lack of clarity, call them out respectfully but clearly.

                Here is the transcript of the interview:
                ${formattedTranscript}

                Please provide the following analysis and structure your response in this format:

                {
                    totalScore: number; // Average of all category scores
                    completion: number; // Percentage of questions answered
                    totalQuestions: number;
                    answeredQuestions: number;

                    question: string;
                    userAnswer: string;
                    suggestedAnswer: string;

                    feedbackSummary: string;
                    feedbackBreakdowns: [
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
                    strengths: string[]; // Bullet points of what went well
                    areasForImprovement: string[]; // Bullet points of what needs work
                    finalAssessment: string; // A brief closing statement summarizing the candidate’s overall performance
                }

                Only score the candidate on the following categories (do not add or remove categories):
                - Communication Skills: Clarity, articulation, structured responses
                - Technical Knowledge: Understanding of key concepts for the role
                - Problem-Solving: Ability to analyze problems and propose solutions
                - Cultural & Role Fit: Alignment with company values and role expectations
                - Confidence & Clarity: Confidence in responses, engagement, and clarity

                Please return your result in the exact structure and format above without any extra explanation or introduction text.

                Thank you! ❤️
                `,
        system: "You are a professional interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories",
    }

    return feedbackPrompt;
}


export async function main() {
    const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: "Explain how AI works in a few words",
        
        config: {
            temperature: 0.7,
            maxOutputTokens: 100,
            topP: 0.9,
            topK: 40,
            stopSequences: ["\n"],
            // returnPartialResponses: false,
            // stream: false,
        }
    });
    console.log(response.text);
}
