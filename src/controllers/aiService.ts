import { aiContentInterface } from "@/util/types";
import {
    GoogleGenAI,
    createUserContent,
    createPartFromUri,
    ContentListUnion,
} from "@google/genai";


const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GEN_AI_KEY });
// Initialize the GoogleGenAI client with your API key
// Make sure to set the GOOGLE_API_KEY environment variable
// or replace process.env.GOOGLE_API_KEY with your actual API key
// in a secure way.
// For example, you can use dotenv to load environment variables from a .env file

export interface formattedTranscriptInterface {
    question: string;
    userAnswer: string;
    aiAnswer: string;
};


// GENERATE INTERVIEW QUESTIONS
export const getInterviewQuestionsPrompt = (
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
    generateQuestionsPrompt += `[{question: "Question 1", aiAnswer: "Suggested answer 1",}, {question: "Question 2", aiAnswer: "Suggested answer 2",}, {question: "Question 3", aiAnswer: "Suggested answer 3",}]`;
    generateQuestionsPrompt += `Thank you! ❤️`;

    return generateQuestionsPrompt;
}

// GENERATE INTERVIEW FEEDBACK
export const getInterviewFeedbackPrompt = (
    formattedTranscript: formattedTranscriptInterface[],
) => {
    const feedbackPrompt = {
        prompt: `
                You are an AI interviewer analyzing a mock interview. Your task is to evaluate the candidate’s performance based on specific criteria. Be detailed, objective, and constructive in your analysis. Do not be lenient — if there are gaps in knowledge, poor communication, or lack of clarity, call them out respectfully but clearly.

                Here is the transcript of the interview:
                ${JSON.stringify(formattedTranscript, null, 2)}


                Please provide the following analysis and structure your response in this format:

                {
                    totalScore: number; // Average of all category scores in percentage
                    percentageScore: number; // Percentage rating of performance
                    totalQuestions: number;
                    answeredQuestions: number; // The total number of questions answered by the user.

                    questionReviews: [
                        { 
                            question: string; 
                            userAnswer: string 
                            aiAnswer: string; // suggested answer
                        },
                    ];

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


// GENERATE EXAMS QUESTIONS
export const getExamsQuestionsPrompt_v0 = (
    studyType: "multipleChoices" | "flash card" | "theory" | "subjective" | "booleanObjective",
    level: string, amount: number,
    documents: string[]
) => {
    let generateQuestionsPrompt = "Prepare exam questions for a student.";
    generateQuestionsPrompt += `The difficulty level required is: ${level}.`;

    if (studyType == "subjective") {
        generateQuestionsPrompt += `The questions should be of type 'Fill-in-the-blank'.`;
        generateQuestionsPrompt += `Fill-in-the-blank questions present a partial sentence or question with a blank space where students are required to write the missing word or words to complete the statement or question.`;
    } else if (studyType == "booleanObjective") {
        generateQuestionsPrompt += `The questions should be of type 'Objective(True/False)'.`;
        generateQuestionsPrompt += `True or False exam questions are a form of assessment whereby participants are presented with statements and their task is to determine whether each statement is true or false.`;
    } else if (studyType == "flash card") {
        generateQuestionsPrompt += `The questions should be of type 'Flashcards'.`;
        // generateQuestionsPrompt += ``;
    } else if (studyType == "theory") {
        generateQuestionsPrompt += `The questions should be of type 'Short Answer/Essay'.`;
        generateQuestionsPrompt += `Short answer and essay questions are types of assessment that are commonly used to evaluate a student's understanding and knowledge.`;
    } else if (studyType == "multipleChoices") {
        generateQuestionsPrompt += `The questions should be of type 'Multiple Choice.'.`;
        generateQuestionsPrompt += `A multiple-choice exam presents questions with several options, where the test-taker selects the best or correct answer from the choices provided.`;
    } else {
        generateQuestionsPrompt += `The questions should be of type 'Multiple Choice.'.`;
        generateQuestionsPrompt += `A multiple-choice exam presents questions with several options, where the test-taker selects the best or correct answer from the choices provided.`;
    }

    generateQuestionsPrompt += `The amount of questions required is: ${amount}.`;

    generateQuestionsPrompt += `Use the documents provided to generate the questions: ${documents.toString()}`;

    generateQuestionsPrompt += `The questions may be read by a voice assistant, so avoid using any special characters like "/", "*", or any punctuation that might interfere with the voice output.`;
    generateQuestionsPrompt += `Please return only the questions, without any additional text or explanations.`;
    generateQuestionsPrompt += `Return your response formatted exactly like this: `;

    generateQuestionsPrompt += `
        [
            {
                "question": "Question text here",
                "answer": "Answer text here",
                "reference": "Reference text here (e.g. page number, chapter title)",
                "explanation": "Explanation text here (e.g. why the answer is correct)"
            },
            {
                "question": "Question text here",
                "answer": "Answer text here",
                "reference": "Reference text here (e.g. page number, chapter title)",
                "explanation": "Explanation text here (e.g. why the answer is correct)"
            },
            ...
        ]
    `;

    generateQuestionsPrompt += `The questions should be relevant to the study document and study type.`;
    generateQuestionsPrompt += `The answers should be accurate and based on the study document.`;
    generateQuestionsPrompt += `The references should be specific and point to the relevant section of the study document.`;
    generateQuestionsPrompt += `The explanations should provide a clear understanding of why the answer is correct.`;

    generateQuestionsPrompt += `Use a formal tone and avoid using jargon that may be unfamiliar to the user.`;
    generateQuestionsPrompt += `Ensure that the questions and answers are concise and easy to understand.`
    generateQuestionsPrompt += `Use proper grammar and spelling throughout the response.`;

    generateQuestionsPrompt += `Thank you! ❤️`;

    return generateQuestionsPrompt;
}

export const getExamsQuestionsPrompt = (
    studyType: "multipleChoices" | "flash card" | "theory" | "subjective" | "booleanObjective",
    level: string,
    amount: number,
    documents: string[]
) => {
    let prompt = `You are an AI examiner. Your task is to generate exam questions for a student based on provided study materials.\n\n`;

    prompt += `**Exam Parameters:**\n`;
    prompt += `- Difficulty Level: ${level}\n`;
    prompt += `- Number of Questions: ${amount}\n`;
    prompt += `- Question Type: `;

    switch (studyType) {
        case "subjective":
            prompt += `Fill-in-the-Blank\n`;
            prompt += `Fill-in-the-blank questions require students to complete a sentence or statement by providing the missing word or phrase.\n`;
            break;
        case "booleanObjective":
            prompt += `True/False\n`;
            prompt += `These are objective questions where the student decides whether a statement is true or false.\n`;
            break;
        case "flash card":
            prompt += `Flashcards\n`;
            prompt += `Each flashcard should include a prompt or question on one side and the correct answer on the other.\n`;
            break;
        case "theory":
            prompt += `Short Answer/Essay\n`;
            prompt += `These questions should allow students to elaborate on their understanding through written responses.\n`;
            break;
        case "multipleChoices":
        default:
            prompt += `Multiple Choice\n`;
            prompt += `Each question should include one correct answer and 3–4 plausible distractors.\n`;
            break;
    }

    prompt += `\n**Source Materials:**\n`;
    prompt += `Use only the following documents to generate the questions:\n`;
    prompt += `${documents.join("\n")}\n\n`;

    prompt += `**Formatting Instructions:**\n`;
    prompt += `- Return exactly ${amount} questions.\n`;
    prompt += `- Do not include any extra commentary or text—only the formatted JSON array.\n`;
    prompt += `- Avoid using special characters such as "/", "*", or other punctuation that may hinder voice assistant output.\n`;
    prompt += `- Ensure proper grammar, correct spelling, and a formal tone.\n`;
    prompt += `- Keep questions and answers concise and easy to understand.\n`;

    prompt += `\n**Response Format:**\n`;
    prompt += `Return the questions in the exact structure below:\n\n`;
    prompt += `[\n`;
    prompt += `  {\n`;
    prompt += `    "question": "Enter question text here",\n`;
    prompt += `    "aiAnswer": "Enter correct answer here",\n`;
    prompt += `    "reference": "Enter source reference (e.g., page number, chapter title)",\n`;

    if (studyType == "multipleChoices") {
        prompt += `    "options": [\n 'Enter answer option here\n', ...(repeat for all options \n) ]\n`;
    }
    
    prompt += `    "explanation": "Enter a brief explanation of why this is the correct answer"\n`;
    prompt += `  },\n`;
    prompt += `  ... (repeat for all ${amount} questions)\n`;
    prompt += `]\n`;

    prompt += `\n**Note:**\n`;
    prompt += `All questions must be strictly relevant to the content of the provided documents. Ensure accuracy in answers and clarity in references.`;

    return prompt;
};

export const getExamsQuestionsPrompt_2 = (
    studyType: "multipleChoices" | "flash card" | "theory" | "subjective" | "booleanObjective",
    level: string,
    amount: number,
    documents: string[],
    followUp: boolean = false,
    tags?: string[],
    language: string = "English"
) => {
    let prompt = `You are an AI examiner. Your task is to generate exam questions for a student based on provided study materials.\n\n`;

    prompt += `**Exam Parameters:**\n`;
    prompt += `- Difficulty Level: ${level}\n`;
    prompt += `- Number of Questions: ${amount}\n`;
    prompt += `- Language: ${language}\n`;
    prompt += `- Question Type: `;

    switch (studyType) {
        case "subjective":
            prompt += `Fill-in-the-Blank\n`;
            prompt += `Fill-in-the-blank questions require students to complete a sentence or statement by providing the missing word or phrase.\n`;
            break;
        case "booleanObjective":
            prompt += `True/False\n`;
            prompt += `These are objective questions where the student decides whether a statement is true or false.\n`;
            break;
        case "flash card":
            prompt += `Flashcards\n`;
            prompt += `Each flashcard should include a prompt or question on one side and the correct answer on the other.\n`;
            break;
        case "theory":
            prompt += `Short Answer/Essay\n`;
            prompt += `These questions should allow students to elaborate on their understanding through written responses.\n`;
            break;
        case "multipleChoices":
        default:
            prompt += `Multiple Choice\n`;
            prompt += `Each question should include one correct answer and 3–4 plausible distractors.\n`;
            break;
    }

    if (tags && tags.length > 0) {
        prompt += `\n**Focus Topics:**\n`;
        prompt += `- The questions should primarily focus on the following topics: ${tags.join(", ")}.\n`;
    }

    prompt += `\n**Source Materials:**\n`;
    prompt += `Use only the following documents to generate the questions:\n`;
    prompt += `${documents.join("\n")}\n\n`;

    prompt += `**Formatting Instructions:**\n`;
    prompt += `- Return exactly ${amount} questions.\n`;
    prompt += `- Do not include any extra commentary or text—only the formatted JSON array.\n`;
    prompt += `- Avoid using special characters such as "/", "*", or any punctuation that may hinder voice assistant output.\n`;
    prompt += `- Ensure proper grammar, correct spelling, and a formal tone.\n`;
    prompt += `- Keep questions and answers concise and easy to understand.\n`;

    prompt += `\n**Response Format:**\n`;
    prompt += `Return the questions in the exact structure below:\n\n`;
    prompt += `[\n`;
    prompt += `  {\n`;
    prompt += `    "question": "Enter question text here",\n`;
    prompt += `    "answer": "Enter correct answer here",\n`;
    prompt += `    "reference": "Enter source reference (e.g., page number, chapter title)",\n`;
    prompt += `    "explanation": "Enter a brief explanation of why this is the correct answer"`;

    if (followUp) {
        prompt += `,\n    "followUp": "Enter a follow-up question to encourage deeper thinking or application"`;
    }

    prompt += `\n  },\n`;
    prompt += `  ... (repeat for all ${amount} questions)\n`;
    prompt += `]\n`;

    prompt += `\n**Note:**\n`;
    prompt += `- All questions must be strictly relevant to the content of the provided documents.\n`;
    prompt += `- Ensure accuracy in answers and clarity in references.\n`;

    if (followUp) {
        prompt += `- Each question should be followed by one thoughtful follow-up question that builds on the original idea.\n`;
    }

    return prompt;
};


// GENERATE EXAMS FEEDBACK
export const getExamFeedbackPrompt = (
    // studentAnswers: { question: string; correctAnswer: string; studentAnswer: string }[],
    studentAnswers: { question: string; aiAnswer: string; userAnswer: string }[],
    totalQuestions: number
) => {
    const prompt = `
        You are an AI examiner. Your task is to evaluate a student's performance based on their submitted exam answers.
        
        Please compare each student answer against the correct answer and calculate the student's score.
        
        Then, analyze the answers to identify:
        - What the student did well
        - What topics or areas the student needs to improve on
        
        Use this analysis to generate a helpful summary and constructive feedback.
        
        **Guidelines:**
        - Be objective and informative.
        - Highlight specific strengths and weaknesses where possible.
        - Avoid overly harsh language; keep the tone professional and encouraging.
        - Assume each question carries equal weight.
        
        **Response Format (strictly return JSON in this format):**
        
        {
            "totalScore": number, // The number of correct answers in percentage
            "percentageScore": number, // Between 0 and 100
            "totalQuestions": ${totalQuestions},
            "answeredQuestions": number // The number of questions answered by the user.,
        
            "feedbackSummary": "Brief paragraph summarizing performance and effort",
            "strengths": [
                "Point-form list of things the student did well"
            ],
            "areasForImprovement": [
                "Point-form list of what the student needs to work on"
            ],
            "finalAssessment": "Short closing statement summarizing overall performance and potential"
        }
        
        **Student's Answers and Correct Answers:**
        
        ${JSON.stringify(studentAnswers, null, 2)}
        
        Return only the JSON object as instructed above. No extra commentary or formatting.
    `;

    return {
        prompt,
        system: `You are an AI examiner. Your task is to evaluate a student's performance based on their submitted exam answers.`
    }
};

export const getExamFeedbackPrompt_v2 = (
    studentAnswers: {
        question: string;
        correctAnswer: string;
        studentAnswer: string;
        topic: string;
    }[],
    totalQuestions: number
) => {
    return `
  You are an AI examiner. Your task is to evaluate a student's exam performance based on their submitted answers.
  
  Each object contains:
  - The question
  - The correct answer
  - The student's answer
  - The topic the question belongs to
  
  **Instructions:**
  
  1. Compare the student's answer to the correct answer and calculate:
     - totalScore (number of correct answers)
     - percentageScore (score in percentage out of 100%)
     - totalQuestions
     - answeredQuestions (non-empty student answers)
  
  2. Identify:
     - Strengths (what the student did well, by pattern or topic)
     - Areas for improvement (common mistakes or weak topics)
     - Provide an encouraging feedbackSummary
     - Provide a concise finalAssessment statement
  
  3. Include a **topic-level breakdown** of performance:
     - 'scorePerTopic' should list each topic with number of questions, number correct, and percentage for that topic.
  
  Return **only** a JSON object strictly in this format:
  
  \`\`\`json
  {
    "totalScore": number,
    "percentageScore": number, // Between 0 and 100
    "totalQuestions": ${totalQuestions},
    "answeredQuestions": ${studentAnswers.length},
  
    "scorePerTopic": [
      {
        "topic": "Topic name here",
        "questionsInTopic": number,
        "correctInTopic": number,
        "topicPercentage": number
      }
    ],
  
    "feedbackSummary": "Brief paragraph summarizing the student's performance.",
    "strengths": [
      "List of what the student did well"
    ],
    "areasForImprovement": [
      "List of areas the student should improve on"
    ],
    "finalAssessment": "One-line summary of the student's overall performance."
  }
  \`\`\`
  
  **Student’s Answers and Correct Answers:**
  
  ${JSON.stringify(studentAnswers, null, 2)}
  
  Be objective and constructive. Do not return anything outside the JSON format shown above.
    `;
};


// GENERATE DISCUSS
export const getDiscussPrompt = (
    prepType: "examiner" | "interviewer",
    userPrompt: string,
) => {
    let systemPrompt = `You are an AI ${prepType}. `;
    systemPrompt += `Your task is to discuss and assist the ${prepType == "examiner" ? "student" : "candidate"} `;
    systemPrompt += `with their ${prepType == "examiner" ? "exam" : "interview"} preparation. `;
    systemPrompt += `You can help discuss and analyze preparation practice questions and answers, suggest study strategies, or simulate interview scenarios. `;
    systemPrompt += `Your responds should be friendly, short, precis, well detailed and easy to understand. `;


    return {
        userPrompt,
        system: systemPrompt
    }
};



export async function generateByTextInput(promptContent: string) {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: promptContent, // "Explain how AI works in a few words",

            config: {
                // temperature: 0.7,
                // maxOutputTokens: 100,
                // topP: 0.9,
                // topK: 40,
                // stopSequences: ["\n"],
                // returnPartialResponses: false,
                // stream: false,
            },

        });
        // console.log(generateByTextInput);
        // console.dir(response, { depth: null }) // `depth: null` ensures unlimited recursion

        return {
            status: true,
            message: "Success.",
            result: response.text,
            // id: response.responseId,
            response,
        }

    } catch (error: any) {
        console.log(error);

        return {
            status: false,
            message: "Something went wrong"
        }
    }
}

export async function generateByFileInput(promptContent: string, filePath: string | Blob) {
    try {
        const fileData = await ai.files.upload({
            file: filePath, // "/path/to/organ.png",
        });

        if (!fileData.uri || !fileData.mimeType) {
            return {
                status: false,
                message: "Failed to upload file."
            }
        }

        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: [
                createUserContent([
                    promptContent, // "Tell me about this instrument",
                    createPartFromUri(fileData.uri, fileData.mimeType),
                ]),
            ],
        });
        // console.log("generateByFileInput");
        // console.dir(response, { depth: null }) // `depth: null` ensures unlimited recursion

        return {
            status: true,
            message: "Success.",
            result: response.text,
            id: response.responseId,
            response,
        }

    } catch (error) {
        console.log(error);

        return {
            status: false,
            message: "Something went wrong"
        }
    }
}

export async function generateBySystemInstructions(promptContent: string, systemPrompt: string,) {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: promptContent, // "Hello there",
            config: {
                systemInstruction: systemPrompt, // "You are a cat. Your name is Neko.",
            },
        });
        // console.log(response);
        // console.dir(response, { depth: null }) // `depth: null` ensures unlimited recursion

        return {
            status: true,
            message: "Success.",
            result: response.text,
            id: response.responseId,
            response,
        }

    } catch (error) {
        console.log(error);

        return {
            status: false,
            message: "Something went wrong"
        }
    }
}


export async function generateBySystemInstructionsWithHistory(
    promptContent: string, systemPrompt: string,
    initialPrepGeneration: aiContentInterface[],
    historyContent: aiContentInterface[]
) {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: [
                ...initialPrepGeneration,
                ...historyContent,
                {
                    role: "user",
                    text: promptContent,
                }
            ],
            config: {
                systemInstruction: systemPrompt,
            },
        });
        // console.log(response);
        // console.dir(response, { depth: null }) // `depth: null` ensures unlimited recursion

        return {
            status: true,
            message: "Success.",
            result: response.text,
            id: response.responseId,
            response,
        }

    } catch (error) {
        console.log(error);

        return {
            status: false,
            message: "Something went wrong"
        }
    }
}


async function uploadRemotePDF(url: string, displayName: string) {
    const pdfBuffer = await fetch(url).then((response) => response.arrayBuffer());

    const fileBlob = new Blob([pdfBuffer], { type: 'application/pdf' });

    const file = await ai.files.upload({
        file: fileBlob,
        config: {
            displayName: displayName,
        },
    });

    if (!file.name) {
        throw new Error('url file upload processing failed.');
    }

    // Wait for the file to be processed.
    let getFile = await ai.files.get({ name: file.name });
    while (getFile.state === 'PROCESSING') {
        getFile = await ai.files.get({ name: file.name });
        // console.log(`current file status: ${getFile.state}`);
        // console.log('File is still processing, retrying in 5 seconds');

        await new Promise((resolve) => {
            setTimeout(resolve, 5000);
        });
    }
    if (file.state === 'FAILED') {
        throw new Error('File processing failed.');
    }

    return file;
}

export async function generateByMultipleFileInput (prompt: string, files: {url: string, name: string}[]) {
    try {
        const content: ContentListUnion = [ prompt ];
    
        const uploadedFile = await Promise.all(
            files.map(async (item) => {
                let _file = await uploadRemotePDF(item.url, item.name);
                if (_file.uri && _file.mimeType) {
                    const fileContent = createPartFromUri(_file.uri, _file.mimeType);
                    content.push(fileContent);
                };
    
                return _file;
            }
        ));
    
        const response = await ai.models.generateContent({
            // model: 'gemini-1.5-flash',
            model: 'gemini-2.0-flash',
            contents: content,
        });
    
    
        return {
            status: true,
            message: "Success",
            result: response.text,
            id: response.responseId,
            response,
        };
        
    } catch (error) {
        return {
            status: false,
            message: "Something went wrong"
        }
    }
}
