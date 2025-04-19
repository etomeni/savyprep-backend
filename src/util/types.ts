export interface aiContentInterface {
	role: "user" | "model" | "assistant" | "system",
    text: string,
}


export interface formattedTranscriptInterface {
    question: string;
    userAnswer: string;
    aiAnswer: string;

    options?: string[];
    reference?: string;
    explanation?: string;
};




export const feedbackData = {
    "modelChatHistory": {
        "prompt": "\n                You are an AI interviewer analyzing a mock interview. Your task is to evaluate the candidate’s performance based on specific criteria. Be detailed, objective, and constructive in your analysis. Do not be lenient — if there are gaps in knowledge, poor communication, or lack of clarity, call them out respectfully but clearly.\n\n                Here is the transcript of the interview:\n                [\n  {\n    \"question\": \"Describe a time you had to juggle multiple tasks or projects. How did you prioritize and manage your time effectively?\",\n    \"aiAnswer\": \"I once had to manage updating our team's documentation while also assisting with user support tickets. I prioritized based on urgency, addressing critical support issues first and then dedicating specific blocks of time to documentation. I used a simple to do list to stay organized and ensure nothing was missed.\",\n    \"options\": [],\n    \"_id\": \"67fe59b86db9e38ef1fc3230\",\n    \"userAnswer\": \"First come first serve \"\n  },\n  {\n    \"question\": \"What is your understanding of the project management lifecycle and the different phases involved?\",\n    \"aiAnswer\": \"My understanding is that the project management lifecycle typically includes initiation, planning, execution, monitoring and controlling, and closure. Initiation involves defining the project, planning involves creating a roadmap, execution is the work, monitoring and controlling is tracking progress, and closure is finalizing the project.\",\n    \"options\": [],\n    \"_id\": \"67fe59b86db9e38ef1fc3231\",\n    \"userAnswer\": \"Documentations\"\n  },\n  {\n    \"question\": \"Tell me about a situation where you faced a challenge while working on a project. How did you overcome it?\",\n    \"aiAnswer\": \"In a group project during university, we had a disagreement on the best approach for a key component. I facilitated a discussion where each team member presented their perspective, focusing on the pros and cons. We then collaboratively decided on the best solution based on the overall project goals.\",\n    \"options\": [],\n    \"_id\": \"67fe59b86db9e38ef1fc3232\",\n    \"userAnswer\": \"Just blame someone for it.\"\n  },\n  {\n    \"question\": \"Explain your experience with project management tools or software. Which tools are you familiar with and how have you used them?\",\n    \"aiAnswer\": \"I have some experience using tools like Trello and Asana for task management and collaboration. In my previous internship, I used Trello to track individual tasks, assign owners, and monitor progress. I'm eager to learn more about other project management tools as needed.\",\n    \"options\": [],\n    \"_id\": \"67fe59b86db9e38ef1fc3233\",\n    \"userAnswer\": \"Great, they make work easier \"\n  },\n  {\n    \"question\": \"Imagine you are assigned a project with a tight deadline and limited resources. What steps would you take to ensure its successful completion?\",\n    \"aiAnswer\": \"I would first assess the project scope and break it down into smaller, manageable tasks. Then, I would prioritize tasks based on critical path and dependencies. I would also communicate proactively with the team and stakeholders, highlighting any potential roadblocks and seeking support to optimize resource allocation.\",\n    \"options\": [],\n    \"_id\": \"67fe59b86db9e38ef1fc3234\",\n    \"userAnswer\": \"Start working on it on time \"\n  }\n]\n\n\n                Please provide the following analysis and structure your response in this format:\n\n                {\n                    totalScore: number; // Average of all category scores in percentage\n                    percentageScore: number; // Percentage rating of performance\n                    totalQuestions: number;\n                    answeredQuestions: number; // The total number of questions answered by the user.\n\n                    questionReviews: [\n                        { \n                            question: string; \n                            userAnswer: string \n                            aiAnswer: string; // suggested answer\n                        },\n                    ];\n\n                    feedbackSummary: string;\n                    feedbackBreakdowns: [\n                        {\n                            title: string; // e.g., \"Communication Skills\"\n                            score: number; // 0 to 100\n                            comment: [\n                                {\n                                    feedback: string;\n                                    isPositive: boolean;\n                                }\n                            ]\n                        }\n                    ];\n                    strengths: string[]; // Bullet points of what went well\n                    areasForImprovement: string[]; // Bullet points of what needs work\n                    finalAssessment: string; // A brief closing statement summarizing the candidate’s overall performance\n                }\n\n                Only score the candidate on the following categories (do not add or remove categories):\n                - Communication Skills: Clarity, articulation, structured responses\n                - Technical Knowledge: Understanding of key concepts for the role\n                - Problem-Solving: Ability to analyze problems and propose solutions\n                - Cultural & Role Fit: Alignment with company values and role expectations\n                - Confidence & Clarity: Confidence in responses, engagement, and clarity\n\n                Please return your result in the exact structure and format above without any extra explanation or introduction text.\n\n                Thank you! ❤️\n                ",
        "systemPrompt": "You are a professional interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories",
        "responseRole": "model",
        "responseText": "```json\n{\n  \"totalScore\": 20,\n  \"percentageScore\": 20,\n  \"totalQuestions\": 5,\n  \"answeredQuestions\": 5,\n  \"questionReviews\": [\n    {\n      \"question\": \"Describe a time you had to juggle multiple tasks or projects. How did you prioritize and manage your time effectively?\",\n      \"userAnswer\": \"First come first serve \",\n      \"aiAnswer\": \"I once had to manage updating our team's documentation while also assisting with user support tickets. I prioritized based on urgency, addressing critical support issues first and then dedicating specific blocks of time to documentation. I used a simple to do list to stay organized and ensure nothing was missed.\"\n    },\n    {\n      \"question\": \"What is your understanding of the project management lifecycle and the different phases involved?\",\n      \"userAnswer\": \"Documentations\",\n      \"aiAnswer\": \"My understanding is that the project management lifecycle typically includes initiation, planning, execution, monitoring and controlling, and closure. Initiation involves defining the project, planning involves creating a roadmap, execution is the work, monitoring and controlling is tracking progress, and closure is finalizing the project.\"\n    },\n    {\n      \"question\": \"Tell me about a situation where you faced a challenge while working on a project. How did you overcome it?\",\n      \"userAnswer\": \"Just blame someone for it.\",\n      \"aiAnswer\": \"In a group project during university, we had a disagreement on the best approach for a key component. I facilitated a discussion where each team member presented their perspective, focusing on the pros and cons. We then collaboratively decided on the best solution based on the overall project goals.\"\n    },\n    {\n      \"question\": \"Explain your experience with project management tools or software. Which tools are you familiar with and how have you used them?\",\n      \"userAnswer\": \"Great, they make work easier \",\n      \"aiAnswer\": \"I have some experience using tools like Trello and Asana for task management and collaboration. In my previous internship, I used Trello to track individual tasks, assign owners, and monitor progress. I'm eager to learn more about other project management tools as needed.\"\n    },\n    {\n      \"question\": \"Imagine you are assigned a project with a tight deadline and limited resources. What steps would you take to ensure its successful completion?\",\n      \"userAnswer\": \"Start working on it on time \",\n      \"aiAnswer\": \"I would first assess the project scope and break it down into smaller, manageable tasks. Then, I would prioritize tasks based on critical path and dependencies. I would also communicate proactively with the team and stakeholders, highlighting any potential roadblocks and seeking support to optimize resource allocation.\"\n    }\n  ],\n  \"feedbackSummary\": \"The candidate's responses demonstrate a significant lack of understanding of project management principles and professional conduct. The answers are brief, often irrelevant, and do not address the core of the questions asked. There's a clear need for improvement across all evaluated areas.\",\n  \"feedbackBreakdowns\": [\n    {\n      \"title\": \"Communication Skills\",\n      \"score\": 10,\n      \"comment\": [\n        {\n          \"feedback\": \"The candidate's responses lack clarity and structure. Answers are short, and don't convey any meaningful information.\",\n          \"isPositive\": false\n        }\n      ]\n    },\n    {\n      \"title\": \"Technical Knowledge\",\n      \"score\": 5,\n      \"comment\": [\n        {\n          \"feedback\": \"The candidate demonstrates a very limited understanding of project management concepts and principles. There are gaps in fundamental knowledge.\",\n          \"isPositive\": false\n        }\n      ]\n    },\n    {\n      \"title\": \"Problem-Solving\",\n      \"score\": 10,\n      \"comment\": [\n        {\n          \"feedback\": \"The candidate's responses do not reflect any ability to analyze problems or propose effective solutions. The provided answers are either dismissive or irrelevant.\",\n          \"isPositive\": false\n        }\n      ]\n    },\n    {\n      \"title\": \"Cultural & Role Fit\",\n      \"score\": 15,\n      \"comment\": [\n        {\n          \"feedback\": \"The candidate's answers, such as suggesting blaming someone, are misaligned with professional behavior and company values.\",\n          \"isPositive\": false\n        }\n      ]\n    },\n    {\n      \"title\": \"Confidence & Clarity\",\n      \"score\": 10,\n      \"comment\": [\n        {\n          \"feedback\": \"While the candidate provides answers, they lack depth and conviction, suggesting a lack of confidence or engagement.\",\n          \"isPositive\": false\n        }\n      ]\n    }\n  ],\n  \"strengths\": [],\n  \"areasForImprovement\": [\n    \"Develop a strong understanding of project management principles and methodologies.\",\n    \"Practice answering behavioral questions with specific examples.\",\n    \"Focus on providing structured and detailed responses.\",\n    \"Cultivate a more professional and collaborative approach to teamwork and problem-solving.\",\n    \"Improve communication skills to articulate ideas clearly and effectively.\"\n  ],\n  \"finalAssessment\": \"The candidate's performance in this mock interview was significantly below expectations. There is a considerable need for improvement in technical knowledge, communication skills, problem-solving abilities, and overall professional conduct. Further training and preparation are strongly recommended before pursuing similar roles.\"\n}\n```"
    },
    "_id": "67fe5a376db9e38ef1fc323c",
    "userId": "67ee3f5b8213945fe4b01076",
    "prepId": "67fe59b86db9e38ef1fc322e",
    "prepType": "Interview",
    "prepTitle": "Trying out discuss",
    "numberOfQuestions": 5,
    "difficultyLevel": "Junior Level",
    "totalScore": 20,
    "percentageScore": 20,
    "totalQuestions": 5,
    "answeredQuestions": 5,
    "questionReviews": [
        {
            "question": "Describe a time you had to juggle multiple tasks or projects. How did you prioritize and manage your time effectively?",
            "userAnswer": "First come first serve ",
            "aiAnswer": "I once had to manage updating our team's documentation while also assisting with user support tickets. I prioritized based on urgency, addressing critical support issues first and then dedicating specific blocks of time to documentation. I used a simple to do list to stay organized and ensure nothing was missed.",
            "options": [],
            "_id": "67fe59b86db9e38ef1fc3230"
        },
        {
            "question": "What is your understanding of the project management lifecycle and the different phases involved?",
            "userAnswer": "Documentations",
            "aiAnswer": "My understanding is that the project management lifecycle typically includes initiation, planning, execution, monitoring and controlling, and closure. Initiation involves defining the project, planning involves creating a roadmap, execution is the work, monitoring and controlling is tracking progress, and closure is finalizing the project.",
            "options": [],
            "_id": "67fe59b86db9e38ef1fc3231"
        },
        {
            "question": "Tell me about a situation where you faced a challenge while working on a project. How did you overcome it?",
            "userAnswer": "Just blame someone for it.",
            "aiAnswer": "In a group project during university, we had a disagreement on the best approach for a key component. I facilitated a discussion where each team member presented their perspective, focusing on the pros and cons. We then collaboratively decided on the best solution based on the overall project goals.",
            "options": [],
            "_id": "67fe59b86db9e38ef1fc3232"
        },
        {
            "question": "Explain your experience with project management tools or software. Which tools are you familiar with and how have you used them?",
            "userAnswer": "Great, they make work easier ",
            "aiAnswer": "I have some experience using tools like Trello and Asana for task management and collaboration. In my previous internship, I used Trello to track individual tasks, assign owners, and monitor progress. I'm eager to learn more about other project management tools as needed.",
            "options": [],
            "_id": "67fe59b86db9e38ef1fc3233"
        },
        {
            "question": "Imagine you are assigned a project with a tight deadline and limited resources. What steps would you take to ensure its successful completion?",
            "userAnswer": "Start working on it on time ",
            "aiAnswer": "I would first assess the project scope and break it down into smaller, manageable tasks. Then, I would prioritize tasks based on critical path and dependencies. I would also communicate proactively with the team and stakeholders, highlighting any potential roadblocks and seeking support to optimize resource allocation.",
            "options": [],
            "_id": "67fe59b86db9e38ef1fc3234"
        }
    ],
    "feedbackBreakdowns": [
        {
            "title": "Communication Skills",
            "score": 10,
            "comment": [
                {
                    "feedback": "The candidate's responses lack clarity and structure. Answers are short, and don't convey any meaningful information.",
                    "isPositive": false,
                    "_id": "67fe5a376db9e38ef1fc3243"
                }
            ],
            "_id": "67fe5a376db9e38ef1fc3242"
        },
        {
            "title": "Technical Knowledge",
            "score": 5,
            "comment": [
                {
                    "feedback": "The candidate demonstrates a very limited understanding of project management concepts and principles. There are gaps in fundamental knowledge.",
                    "isPositive": false,
                    "_id": "67fe5a376db9e38ef1fc3245"
                }
            ],
            "_id": "67fe5a376db9e38ef1fc3244"
        },
        {
            "title": "Problem-Solving",
            "score": 10,
            "comment": [
                {
                    "feedback": "The candidate's responses do not reflect any ability to analyze problems or propose effective solutions. The provided answers are either dismissive or irrelevant.",
                    "isPositive": false,
                    "_id": "67fe5a376db9e38ef1fc3247"
                }
            ],
            "_id": "67fe5a376db9e38ef1fc3246"
        },
        {
            "title": "Cultural & Role Fit",
            "score": 15,
            "comment": [
                {
                    "feedback": "The candidate's answers, such as suggesting blaming someone, are misaligned with professional behavior and company values.",
                    "isPositive": false,
                    "_id": "67fe5a376db9e38ef1fc3249"
                }
            ],
            "_id": "67fe5a376db9e38ef1fc3248"
        },
        {
            "title": "Confidence & Clarity",
            "score": 10,
            "comment": [
                {
                    "feedback": "While the candidate provides answers, they lack depth and conviction, suggesting a lack of confidence or engagement.",
                    "isPositive": false,
                    "_id": "67fe5a376db9e38ef1fc324b"
                }
            ],
            "_id": "67fe5a376db9e38ef1fc324a"
        }
    ],
    "feedbackSummary": "The candidate's responses demonstrate a significant lack of understanding of project management principles and professional conduct. The answers are brief, often irrelevant, and do not address the core of the questions asked. There's a clear need for improvement across all evaluated areas.",
    "strengths": [],
    "areasForImprovement": [
        "Develop a strong understanding of project management principles and methodologies.",
        "Practice answering behavioral questions with specific examples.",
        "Focus on providing structured and detailed responses.",
        "Cultivate a more professional and collaborative approach to teamwork and problem-solving.",
        "Improve communication skills to articulate ideas clearly and effectively."
    ],
    "finalAssessment": "The candidate's performance in this mock interview was significantly below expectations. There is a considerable need for improvement in technical knowledge, communication skills, problem-solving abilities, and overall professional conduct. Further training and preparation are strongly recommended before pursuing similar roles.",
    "createdAt": "2025-04-15T13:08:07.805Z",
    "updatedAt": "2025-04-15T13:08:07.805Z",
}