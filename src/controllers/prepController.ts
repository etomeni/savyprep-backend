import { Request, Response, NextFunction } from "express-serve-static-core";
import fs from "fs";
import {
    generateBySystemInstructions, generateBySystemInstructionsWithHistory, generateByTextInput, 
    getDiscussPrompt, 
    getExamFeedbackPrompt, getExamsQuestionsPrompt, 
    getInterviewFeedbackPrompt, getInterviewQuestionsPrompt 
} from "./aiService.js";
import preparationsModel, { prepInterface } from "@/models/preparations.model.js";
import prepFeedbackModel from "@/models/prepFeedback.model.js";
// import { uploadFileToFirebase } from "./firebase.js";
import { uploadFileToFirebase_admin } from "./firebaseAdmin.js";
import prepDiscussModel from "@/models/prepDiscuss.model.js";
import { generateFeedbackPDF } from "./pdfService.js";
// import { feedbackData } from "@/util/types.js";

// models
// import { userModel } from '@/models/users.model.js';

// utilities
// import { generateTokens, verifyRefreshToken } from "@/util/JWT_tokens.js";


type QuestionItemInterface = {
    question: string;
    userAnswer: string;
    aiAnswer: string;
};

type examQuestionInterface = {
    question: string;
    userAnswer: string;
    aiAnswer: string;
    
    options?: string[];
    reference: string;
    explanation: string;
};

type aiInterviewerFeedbackResponseInterface = {
    totalScore: number; // Average of all category scores
    percentageScore: number; // Percentage rating of performance
    totalQuestions: number;
    answeredQuestions: number;

    questionReviews: { 
        question: string;
        userAnswer: string;
        aiAnswer: string;
    }[];

    feedbackBreakdowns: {
        title: string; // e.g., "Communication Skills"
        score: number; // 0 to 100
        comment: {
            feedback: string;
            isPositive: boolean;
        }[]
    }[];
    feedbackSummary: string;
    strengths: string[]; // Bullet points of what went well
    areasForImprovement: string[]; // Bullet points of what needs work
    finalAssessment: string; // A brief closing statement summarizing the candidate’s overall performance
}

type aiExaminerFeedbackResponseInterface = {
    totalScore: number;
    percentageScore: number;
    totalQuestions: number;
    answeredQuestions: number;

    feedbackSummary: string;
    strengths: string[];
    areasForImprovement: string[];
    finalAssessment: string;
}

type fileUploadIntercae = {
    fieldname: string,
    originalname: string,
    encoding: string,
    mimetype: string,
    destination: string,
    filename: string,
    path: string,
    size: number
}

function formatAiResponse(questionStr: string) {
    try {
        // Remove the code block syntax like ```json and ```
        const cleaned = questionStr.replace(/^```json\n/, '').replace(/\n```$/, '');

        // Parse the JSON string
        const parsed = JSON.parse(cleaned);

        return parsed;
    } catch (error) {
        console.error('Failed to format questions:', error);
        return [];
    }
}

// INTERVIEWS
// generate interview questions
export const generateInterviewQuestionsController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user_id = req.body.authMiddlewareParam._id;

        // const role = req.body.role;
        const { title, role, level, techstack, type, amount, jobDescription, } = req.body;
        // role: string, level: string, techstack: string[], type: string, amount: number,
        // jobDescription?: string, cvFile?: string


        // TODO:::: check if the user has uploaded their CV, if so add it to the prompt
        const prompt = getInterviewQuestionsPrompt(role, level, techstack, type, amount, jobDescription);

        const response = await generateByTextInput(prompt);
        // console.log(response);
        if (!response.status || !response.result) {
            return res.status(500).json({
                status: false,
                statusCode: 500,
                // result: {},
                message: response.message,
            });
        }
        
        const Questions: QuestionItemInterface[] = formatAiResponse(response.result);

        if (!Questions.length) {
            return res.status(500).json({
                status: false,
                statusCode: 500,
                // result: {},
                message: "unable to generate interview questions at the momemt, please try again."
            });
        }

        const newPrep = await new preparationsModel({
            userId: user_id,
            prepType: "Interview",
            prepTitle: title,
            numberOfQuestions: amount,
            difficultyLevel: level,
            interview: {
                jobRole: role,
                techstack: techstack,
                interviewType: type,
                jobDescription: jobDescription ? jobDescription : ''
            },
            // exam: {
            //     studyType: "multipleChoices",
            //     documents: [],
            //     tags: undefined,
            //     language: undefined
            // },
            transcript: Questions,
            // modelChatHistory: [
            //     {
            //         role: "user",
            //         parts: [{ text: prompt }]
            //     },
            //     {
            //         role: "model",
            //         // parts: [{ text: response.response?.candidates?.[0]?.content?.parts }],
            //         parts: [{ text: response.response?.candidates?.[0]?.content?.parts ?? "" }]
            //     }
            // ],
            modelChatHistory: {
                prompt: prompt,
                systemPrompt: '',
                responseRole: response.response?.candidates?.[0]?.content?.role ?? "model",
                responseText: response.result
            },
            // status: "Not completed",
        }).save()
        // const newReleaseResponds = await newRelease.save();

        if (!newPrep) {
            return res.status(500).json({
                status: false,
                statusCode: 500,
                // result: {},
                message: "unable to save intervew questions.",
            });
        }

        return res.status(200).json({
            status: true,
            statusCode: 200,
            result: {
                questions: Questions,
                prep: newPrep,
                // response
            },
            message: 'Successfully!'
        });

    } catch (error: any) {
        if (!error.statusCode) error.statusCode = 500;
        next(error);
    }
}

// generate interview feedback
export const generateInterviewFeedbackController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user_id = req.body.authMiddlewareParam._id;

        const prepId: string = req.body.prepId;
        const transcript: QuestionItemInterface[] = req.body.transcript;

        const interviewPrep = await preparationsModel.findById(prepId);
        if (!interviewPrep) {
            return res.status(401).json({
                status: false,
                statusCode: 401,
                message: 'Invalid interview id sent.'
            });
        }
        
        // get the prompt to use
        const prompt = getInterviewFeedbackPrompt(transcript);
        // console.log(prompt);

        const response = await generateBySystemInstructions(prompt.prompt, prompt.system);
        // console.log(response);
        if (!response.status || !response.result) {
            return res.status(500).json({
                status: false,
                statusCode: 500,
                // result: {},
                message: response.message,
            });
        }
        
        const feedbackResponse: aiInterviewerFeedbackResponseInterface = formatAiResponse(response.result);
        // console.log(feedbackResponse);
        if (!feedbackResponse.feedbackSummary) {
            return res.status(500).json({
                status: false,
                statusCode: 500,
                // result: {},
                message: "unable to generate interview feedback at the momemt, please try again."
            });
        }
        

        const newPrepFeedback = await new prepFeedbackModel({
            userId: user_id,
            prepType: "Interview",

            prepId: interviewPrep.id || prepId,
            prepTitle: interviewPrep.prepTitle,
            numberOfQuestions: interviewPrep.numberOfQuestions,
            difficultyLevel: interviewPrep.difficultyLevel,
        
            totalScore: feedbackResponse.totalScore,
            percentageScore: feedbackResponse.percentageScore,
            totalQuestions: interviewPrep.numberOfQuestions || feedbackResponse.totalQuestions,
            answeredQuestions: feedbackResponse.answeredQuestions,
    
            questionReviews: transcript || feedbackResponse.questionReviews,
                
            feedbackBreakdowns: feedbackResponse.feedbackBreakdowns, 
    
            feedbackSummary: feedbackResponse.feedbackSummary,
            strengths: feedbackResponse.strengths,
            areasForImprovement: feedbackResponse.areasForImprovement,
            finalAssessment: feedbackResponse.finalAssessment,

            modelChatHistory: {
                prompt: prompt.prompt,
                systemPrompt: prompt.system,
                responseRole: response.response?.candidates?.[0]?.content?.role ?? "model",
                responseText: response.result
            },
        
        }).save()

        if (!newPrepFeedback) {
            return res.status(500).json({
                status: false,
                statusCode: 500,
                // result: {},
                message: "unable to save intervew feedbacks.",
            });
        }

        const updatedInterview = await preparationsModel.findByIdAndUpdate(
            interviewPrep._id,
            {
                transcript: transcript || feedbackResponse.questionReviews,
                status: "Completed"
            },
            {new: true}
        );

        return res.status(200).json({
            status: true,
            statusCode: 200,
            result: {
                feedback: newPrepFeedback,
                // response
            },
            message: 'Successfully!'
        });

    } catch (error: any) {
        if (!error.statusCode) error.statusCode = 500;
        next(error);
    }
}


// EXAMS
// generate exam questions
export const generateExamQuestionsController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user_id = req.body.authMiddlewareParam._id;
        const user_email = req.body.authMiddlewareParam.email;

        const { title, level, studyType, amount, } = req.body;

        const files: any = req.files;
        // console.log(files);
        const documentFiles: fileUploadIntercae[] = files.documents;
        // console.log(documentFiles);

        let uploadedFile: string[] = [];
        if (documentFiles) {
            uploadedFile = await Promise.all(
                documentFiles.map(async element => {
                    const response = await uploadFileToFirebase_admin(
                    // const response = await uploadFileToFirebase(
                        element, element.originalname,
                        user_id, user_email,
                        title, level, studyType, amount,
                    );
                    // console.log(response);

                    // Optionally delete the local files after uploading
                    if (element.path) fs.unlinkSync(element.path);
    
                    if (response.fileUrl) {
                        // uploadedFile.push(response.fileUrl);
                        return response.fileUrl
                    } else {
                        return '';
                    }
                })
            );
        } else {
            return res.status(401).json({
                status: false,
                statusCode: 401,
                message: "Study Documents are required."
            });
        }

        // Using Boolean (removes all falsy values - '', 0, false, null, undefined)
        uploadedFile = uploadedFile.filter(Boolean);

        if (!uploadedFile.length) {
            return res.status(500).json({
                status: false,
                statusCode: 500,
                message: "something went wrong, failed to uplaod document."
            });
        }

        const prompt = getExamsQuestionsPrompt(
            studyType, level, amount, uploadedFile
        );
        // console.log(prompt);
        

        const response = await generateByTextInput(prompt);
        // console.log(response);
        if (!response.status || !response.result) {
            return res.status(500).json({
                status: false,
                statusCode: 500,
                // result: {},
                message: response.message,
            });
        }
        
        const Questions: examQuestionInterface[] = formatAiResponse(response.result);

        if (!Questions.length) {
            return res.status(500).json({
                status: false,
                statusCode: 500,
                // result: {},
                message: "unable to generate exams questions at the momemt, please try again."
            });
        }

        const newPrep = await new preparationsModel({
            userId: user_id,
            prepType: "Exam",
            prepTitle: title,
            numberOfQuestions: amount,
            difficultyLevel: level,
            exam: {
                studyType: studyType,
                documents: uploadedFile,
                tags: undefined,
                language: undefined
            },
            transcript: Questions,
            // modelChatHistory: [
            //     {
            //         role: "user",
            //         parts: [{ text: prompt }]
            //     },
            //     {
            //         role: "model",
            //         // parts: [{ text: response.response?.candidates?.[0]?.content?.parts }],
            //         parts: [{ text: response.response?.candidates?.[0]?.content?.parts ?? "" }]
            //     }
            // ],

            modelChatHistory: {
                prompt: prompt,
                systemPrompt: '',
                responseRole: response.response?.candidates?.[0]?.content?.role ?? "model",
                responseText: response.result
            },

            // status: "Not completed",
        }).save()

        if (!newPrep) {
            return res.status(500).json({
                status: false,
                statusCode: 500,
                // result: {},
                message: "unable to save exams questions.",
            });
        }

        return res.status(200).json({
            status: true,
            statusCode: 200,
            result: {
                questions: Questions,
                prep: newPrep,
                // response
            },
            message: 'Successfully!'
        });

    } catch (error: any) {
        if (!error.statusCode) error.statusCode = 500;
        next(error);
    }
}

// generate exam feedback
export const generateExamFeedbackController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user_id = req.body.authMiddlewareParam._id;

        const prepId: string = req.body.prepId;
        const timeElapsed: number = req.body.timeElapsed; // seconds
        const transcript: examQuestionInterface[] = req.body.transcript;

        const prepDetails = await preparationsModel.findById(prepId);
        if (!prepDetails) {
            return res.status(401).json({
                status: false,
                statusCode: 401,
                message: 'Invalid prep. id'
            });
        }
        
        // get the prompt to use
        const prompt = getExamFeedbackPrompt(transcript, prepDetails.numberOfQuestions);

        const response = await generateBySystemInstructions(prompt.prompt, prompt.system);
        // console.log("feedback response");
        if (!response.status || !response.result) {
            return res.status(500).json({
                status: false,
                statusCode: 500,
                // result: {},
                message: response.message,
            });
        }
        
        const feedbackResponse: aiExaminerFeedbackResponseInterface = formatAiResponse(response.result);
        if (!feedbackResponse.feedbackSummary) {
            return res.status(500).json({
                status: false,
                statusCode: 500,
                // result: {},
                message: "unable to generate exam feedback at the momemt, please try again."
            });
        }

        const newPrepFeedback = await new prepFeedbackModel({
            userId: user_id,
            prepType: "Exam",

            prepId: prepDetails.id || prepId,
            prepTitle: prepDetails.prepTitle,
            numberOfQuestions: prepDetails.numberOfQuestions,
            difficultyLevel: prepDetails.difficultyLevel,
        
            totalScore: feedbackResponse.totalScore,
            percentageScore: feedbackResponse.percentageScore,
            totalQuestions: prepDetails.numberOfQuestions || feedbackResponse.totalQuestions,
            answeredQuestions: feedbackResponse.answeredQuestions,
    
            questionReviews: transcript,
                
            // feedbackBreakdowns: feedbackResponse.feedbackBreakdowns, 
    
            feedbackSummary: feedbackResponse.feedbackSummary,
            strengths: feedbackResponse.strengths,
            areasForImprovement: feedbackResponse.areasForImprovement,
            finalAssessment: feedbackResponse.finalAssessment,

            modelChatHistory: {
                prompt: prompt.prompt,
                systemPrompt: prompt.system,
                responseRole: response.response?.candidates?.[0]?.content?.role ?? "model",
                responseText: response.result
            },
        
        }).save()
        // console.log("newPrepFeedback");
        
        if (!newPrepFeedback) {
            return res.status(500).json({
                status: false,
                statusCode: 500,
                // result: {},
                message: "unable to save exams feedbacks.",
            });
        }

        const updatedInterview = await preparationsModel.findByIdAndUpdate(
            prepDetails._id,
            {
                transcript: transcript,
                status: "Completed"
            },
            {new: true}
        );
        // console.log("updatedInterview");


        return res.status(200).json({
            status: true,
            statusCode: 200,
            result: {
                feedback: newPrepFeedback,
                // response
            },
            message: 'Successfully!'
        });

    } catch (error: any) {
        console.log(error);
        
        if (!error.statusCode) error.statusCode = 500;
        next(error);
    }
}

// generate discuss response
export const generatePrepDiscusController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user_id = req.body.authMiddlewareParam._id;
        const user_email = req.body.authMiddlewareParam.email;

        const prepId: string = req.body.prepId;
        const prepFeedbackId: string = req.body.prepFeedbackId;
        const userPrompt: string = req.body.userPrompt;

        const prepDetails = await preparationsModel.findById(prepId).lean();
        if (!prepDetails) {
            return res.status(401).json({
                status: false,
                statusCode: 401,
                message: 'Invalid prep id'
            });
        }

        const prepFeedback = await prepFeedbackModel.findById(prepFeedbackId).lean();
        if (!prepFeedback) {
            return res.status(401).json({
                status: false,
                statusCode: 401,
                message: 'Invalid prep feedback id'
            });
        }

        const prepDiscussions = await prepDiscussModel.find({
            userId: user_id,
            prepId: prepId, 
            prepFeedbackId: prepFeedbackId,  
        }).lean();
        const discussions = prepDiscussions.map(({ role, text }) => ({ role, text }));


        // get the prompt to use
        const prompt = getDiscussPrompt(
            prepDetails.prepType == "Exam" ? "examiner" : "interviewer",
            userPrompt
        );

        // generate a discuss response
        const response = await generateBySystemInstructionsWithHistory(
            prompt.userPrompt, prompt.system,
            [
                {
                    role: "user",
                    text: prepDetails.modelChatHistory.prompt
                },
                {
                    role: prepDetails.modelChatHistory.responseRole,
                    text: prepDetails.modelChatHistory.responseText
                },
                // feedback
                {
                    role: 'user',
                    text: prepFeedback.modelChatHistory.prompt
                },
                {
                    role: prepFeedback.modelChatHistory.responseRole,
                    text: prepFeedback.modelChatHistory.responseText,
                }
            ],
            discussions
        );
        // console.log("discuss response ", response);
        if (!response.status || !response.result) {
            return res.status(500).json({
                status: false,
                statusCode: 500,
                // result: {},
                message: response.message,
            });
        }
        

        const userDiscussion = await new prepDiscussModel({
            userId: user_id,
            userEmail: user_email,

            prepId: prepDetails._id || prepId,
            prepFeedbackId: prepFeedback._id,

            role: 'user',
            text: userPrompt,
        }).save()

        const aiDiscussReponse = await new prepDiscussModel({
            userId: user_id,
            userEmail: user_email,

            prepId: prepDetails._id || prepId,
            prepFeedbackId: prepFeedback._id,

            role: response.response?.candidates?.[0]?.content?.role ?? "assistant",
            text: response.result,
        }).save()
        // console.log("newPrepFeedback");
        
        if (!userDiscussion || !aiDiscussReponse) {
            return res.status(500).json({
                status: false,
                statusCode: 500,
                // result: {},
                message: "unable to save ai assistant response.",
            });
        }

        return res.status(200).json({
            status: true,
            statusCode: 200,
            result: {
                userDiscussion: userDiscussion,
                aiDiscussReponse: aiDiscussReponse,
            },
            message: 'Successfully!'
        });

    } catch (error: any) {
        console.log(error);
        
        if (!error.statusCode) error.statusCode = 500;
        next(error);
    }
}

// get discuss messages
export const getDiscussMessagesController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user_id = req.body.authMiddlewareParam._id;
        
        const page = parseInt(req.body.page as string) || 1; // Current page number, default is 1
        const limit = parseInt(req.body.limit as string) || 25; // Number of items per page, default is 25

        const prepId = req.body.prepId as string;
        const prepFeedbackId = req.body.prepFeedbackId as string;

        // Find only the prep of the login user
        const prepDiscussions = await prepDiscussModel.find({ 
            userId: user_id,
            prepId, prepFeedbackId,
        })
            .sort({ createdAt: -1 })  // Sort by createdAt in descending order
            .limit(limit) // Set the number of items per page
            .skip((page - 1) * limit) // Skip items to create pages
            .exec();

        if (!prepDiscussions) {
            return res.status(401).json({
                status: false,
                statusCode: 401,
                message: "Invalid prep id's."
            });
        };

        // Count total doc. for the user to support pagination
        const totalDocuments = await prepDiscussModel.countDocuments({ 
            userId: user_id, 
            prepId, prepFeedbackId,
        });

        return res.status(200).json({
            status: true,
            statusCode: 200,
            result: {
                discussions: prepDiscussions,

                totalPages: Math.ceil(totalDocuments / limit), // Calculate total pages
                currentPage: page,
                totalRecords: totalDocuments,
            },
            message: 'Successfully!'
        });
    } catch (error: any) {
        if (!error.statusCode) error.statusCode = 500;
        next(error);
    }
}

// generate new prep
export const generateNewPrepController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user_id = req.body.authMiddlewareParam._id;

        const prepId: string = req.body.prepId;
        const prepType: string = req.body.prepType;
        const feedbackId: string = req.body.feedbackId;

        const prepDetails = await preparationsModel.findById(prepId);
        if (!prepDetails) {
            return res.status(401).json({
                status: false,
                statusCode: 401,
                message: 'Invalid prep. id'
            });
        }
        

        if (prepDetails.prepType == "Exam") {
            const prompt = getExamsQuestionsPrompt(
                prepDetails.exam.studyType, prepDetails.difficultyLevel, 
                prepDetails.numberOfQuestions, prepDetails.exam.documents
            );
            // console.log(prompt);

            const response = await generateByTextInput(prompt);
            // console.log(response);
            if (!response.status || !response.result) {
                return res.status(500).json({
                    status: false,
                    statusCode: 500,
                    // result: {},
                    message: response.message,
                });
            }
            
            const Questions: examQuestionInterface[] = formatAiResponse(response.result);

            const newPrep = await new preparationsModel({
                userId: user_id,
                prepType: "Exam",
                prepTitle: prepDetails.prepTitle,
                numberOfQuestions: prepDetails.numberOfQuestions,
                difficultyLevel: prepDetails.difficultyLevel,
                exam: {
                    studyType: prepDetails.exam.studyType,
                    documents: prepDetails.exam.documents,
                    tags: undefined,
                    language: undefined
                },
                transcript: Questions,
                modelChatHistory: [
                    {
                        role: "user",
                        parts: [{ text: prompt }]
                    },
                    {
                        role: "model",
                        // parts: [{ text: response.response?.candidates?.[0]?.content?.parts }],
                        parts: [{ text: response.response?.candidates?.[0]?.content?.parts ?? "" }]
                    }
                ],
                // status: "Not completed",
            }).save()

            if (!newPrep) {
                return res.status(500).json({
                    status: false,
                    statusCode: 500,
                    // result: {},
                    message: "unable to save exams questions.",
                });
            }

            return res.status(200).json({
                status: true,
                statusCode: 200,
                result: {
                    questions: Questions,
                    prep: newPrep,
                    // response
                },
                message: 'Successfully!'
            });

        } else if (prepDetails.prepType == "Interview") {
            // TODO:::: check if the user has uploaded their CV, if so add it to the prompt
            const prompt = getInterviewQuestionsPrompt(
                prepDetails.interview.jobRole, prepDetails.difficultyLevel, 
                prepDetails.interview.techstack, prepDetails.interview.interviewType, 
                prepDetails.numberOfQuestions, prepDetails.interview.jobDescription
            );

            const response = await generateByTextInput(prompt);
            // console.log(response);
            if (!response.status || !response.result) {
                return res.status(500).json({
                    status: false,
                    statusCode: 500,
                    // result: {},
                    message: response.message,
                });
            }
            
            const Questions: QuestionItemInterface[] = formatAiResponse(response.result);

            const newPrep = await new preparationsModel({
                userId: user_id,
                prepType: "Interview",
                prepTitle: prepDetails.prepTitle,
                numberOfQuestions: prepDetails.numberOfQuestions,
                difficultyLevel: prepDetails.difficultyLevel,
                interview: {
                    jobRole:  prepDetails.interview.jobRole,
                    techstack: prepDetails.interview.techstack,
                    interviewType: prepDetails.interview.interviewType,
                    jobDescription: prepDetails.interview.jobDescription
                },
                transcript: Questions,
                modelChatHistory: [
                    {
                        role: "user",
                        parts: [{ text: prompt }]
                    },
                    {
                        role: "model",
                        // parts: [{ text: response.response?.candidates?.[0]?.content?.parts }],
                        parts: [{ text: response.response?.candidates?.[0]?.content?.parts ?? "" }]
                    }
                ],
                // status: "Not completed",
            }).save()
            // const newReleaseResponds = await newRelease.save();

            if (!newPrep) {
                return res.status(500).json({
                    status: false,
                    statusCode: 500,
                    // result: {},
                    message: "unable to save intervew questions.",
                });
            }

            return res.status(200).json({
                status: true,
                statusCode: 200,
                result: {
                    questions: Questions,
                    prep: newPrep,
                    // response
                },
                message: 'Successfully!'
            });
        }


        return res.status(200).json({
            status: true,
            statusCode: 200,
            result: {
                prep: prepDetails,
                // response
            },
            message: 'Successfully!'
        });

    } catch (error: any) {
        console.log(error);
        
        if (!error.statusCode) error.statusCode = 500;
        next(error);
    }
}



// get paginated preparations
export const getUserPracticeQuestionsController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user_id = req.body.authMiddlewareParam._id;

        // const prepId: string = req.body.prepId;
        const page = parseInt(req.query.page as string) || 1; // Current page number, default is 1
        const limit = parseInt(req.query.limit as string) || 25; // Number of items per page, default is 25
        
        const prepType = req.query.prepType;

        let allPrepData: any;
        if (prepType == "Exam" || prepType == "Interview") {
            // Find only the prep of the login user
            allPrepData = await preparationsModel.find({ userId: user_id, prepType: prepType })
                .sort({ createdAt: -1 })  // Sort by createdAt in descending order
                .limit(limit) // Set the number of items per page
                .skip((page - 1) * limit) // Skip items to create pages
                .exec();
 
        } else {
            // Find only the prep of the login user
            allPrepData = await preparationsModel.find({ userId: user_id })
                .sort({ createdAt: -1 })  // Sort by createdAt in descending order
                .limit(limit) // Set the number of items per page
                .skip((page - 1) * limit) // Skip items to create pages
                .exec();
        }

        if (!allPrepData) {
            return res.status(401).json({
                status: false,
                statusCode: 401,
                message: 'Invalid interview id sent.'
            });
        };

        // Count total doc. for the user to support pagination
        const totalDocuments = await preparationsModel.countDocuments({ userId: user_id });


        return res.status(200).json({
            status: true,
            statusCode: 200,
            result: {
                prep: allPrepData,

                totalPages: Math.ceil(totalDocuments / limit), // Calculate total pages
                currentPage: page,
                totalRecords: totalDocuments,
            },
            message: 'Successfully!'
        });

    } catch (error: any) {
        if (!error.statusCode) error.statusCode = 500;
        next(error);
    }
}

// get one prep by id
export const getPrepByIdController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // const user_id = req.body.authMiddlewareParam._id;

        const prepId = req.params.prepId as string;

        const practicePrep = await preparationsModel.findById(prepId);
        if (!practicePrep) {
            return res.status(401).json({
                status: false,
                statusCode: 401,
                message: 'Invalid interview id sent.'
            });
        }


        return res.status(200).json({
            status: true,
            statusCode: 200,
            result: {
                prep: practicePrep,
                // response
            },
            message: 'Successfully!'
        });

    } catch (error: any) {
        if (!error.statusCode) error.statusCode = 500;
        next(error);
    }
}

// get feedback by prep id
export const getFeedbackController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // const user_id = req.body.authMiddlewareParam._id;

        const prepId: string = req.params.prepId;

        const prepFeedback = await prepFeedbackModel.findOne({prepId});
        if (!prepFeedback) {
            return res.status(401).json({
                status: false,
                statusCode: 401,
                message: 'Invalid interview prep. id'
            });
        }

        return res.status(200).json({
            status: true,
            statusCode: 200,
            result: {
                feedback: prepFeedback,
                // response
            },
            message: 'Successfully!'
        });

    } catch (error: any) {
        if (!error.statusCode) error.statusCode = 500;
        next(error);
    }
}

// delete prep. by id
export const deletePrepController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user_id = req.body.authMiddlewareParam._id;
        const prepId: string = req.params.prepId;
        
        const interviewPrep = await preparationsModel.findByIdAndDelete(prepId);
        const prepFeedback = await prepFeedbackModel.deleteMany({ prepId: prepId });

        return res.status(200).json({
            status: true,
            statusCode: 200,
            result: {
                // feedback: prepFeedback,
                // response
            },
            message: 'Successfully!'
        });

    } catch (error: any) {
        if (!error.statusCode) error.statusCode = 500;
        next(error);
    }
}




// generate Feedback Report PDF Controller
export const generateFeedbackPdfController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // const user_id = req.body.authMiddlewareParam._id;
        // const prepId: string = req.params.prepId;
        // const userId = "67ee3f5b8213945fe4b01076";
        // const prepId = "67fe59b86db9e38ef1fc322e";
        // const feedbackpId = "67fe5a376db9e38ef1fc323c";

        const feedbackId = req.query.feedbackId;
        const feedbackData = await prepFeedbackModel.findById(feedbackId).lean();
        if (!feedbackData) {
            return res.status(500).json({
                status: false,
                statusCode: 500,
                result: {},
                message: 'Failed! Something went wrong.'
            });
        }

        // Generate PDF (pass your logo path here)
        const pdfBuffer = await generateFeedbackPDF(feedbackData, './uploads/logo.png');

        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${feedbackData.prepTitle.replace(/ /g, '_')}_Feedback.pdf`);

        // Send the PDF
        return res.send(pdfBuffer);


        // return res.status(200).json({
        //     status: true,
        //     statusCode: 200,
        //     result: {
        //         pdf: pdfBuffer
        //     },
        //     message: 'Successfully!'
        // });

    } catch (error: any) {
        if (!error.statusCode) error.statusCode = 500;
        next(error);
    }
}
