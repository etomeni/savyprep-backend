import express from 'express';
import { body, param, query  } from 'express-validator';
// import bodyParser from 'body-parser';

// middleWares
import authMiddleware from '@/middleware/auth.js';
import routeValidationResult from '@/middleware/routeValidationResult.js';
import { upload_diskStorage } from '@/middleware/multerFile.js';

// Controllers
import { 
    generateInterviewFeedbackController,
    generateInterviewQuestionsController,
    getUserPracticeQuestionsController,
    getPrepByIdController,
    getFeedbackController,
    deletePrepController,
    generateExamFeedbackController,
    generateExamQuestionsController,
    generateNewPrepController,
    getDiscussMessagesController,
    generatePrepDiscusController,
    generateFeedbackPdfController
} from '@/controllers/prepController.js';


const router = express.Router();
// router.use(bodyParser.json());


// INTERVIEWS
// generate interview questions
router.post("/generate-interview-questions", 
    [
        // body("userId").isString().trim().notEmpty().withMessage("User ID is required"),
        // body("userName").notEmpty().withMessage("User name is required"),
        // body("userEmail").isString().trim().isEmail().withMessage("User email is required"),

        body("title").isString().trim().notEmpty().withMessage("Title is required"),
        body("role").isString().trim().notEmpty().withMessage("Role is required"),
        body("level").isString().trim().notEmpty().withMessage("Level is required"),
        body("techstack").isArray().withMessage("Techstack should be an array"),
        body("type").isString().trim().notEmpty().withMessage("Type is required"),
        body("amount").isInt({ min: 1 }).withMessage("Amount should be a positive integer"),
        body("jobDescription").optional().isString().trim().withMessage("Job description should be a string"),
        // body("cvFile").optional().isString().withMessage("CV file should be a string"),

        routeValidationResult,
        authMiddleware,
    ], 
    generateInterviewQuestionsController
);

router.post("/generate-interview-feedback", 
    [
        body("prepId").isString().trim().notEmpty().withMessage("prepId is required"),

        body("transcript").isArray().withMessage("Transcript should be an array"),

        routeValidationResult,
        authMiddleware,
    ], 
    generateInterviewFeedbackController
);


// EXAMS
// generate exams questions
router.post("/generate-exams-questions", 
    [
        // Featured image validation (optional)
        upload_diskStorage.fields([{ name: 'documents' }]),

        body("title").isString().trim().notEmpty().withMessage("Title is required"),
        body("level").isString().trim().notEmpty().withMessage("Level is required"),
        body("studyType").isString().trim().notEmpty().withMessage("Type is required"),
        body("amount").isInt({ min: 1 }).withMessage("Amount should be a positive integer"),
        // body("documents").optional().isString().trim().withMessage("Job description should be a string"),

        routeValidationResult,
        authMiddleware,
    ], 
    generateExamQuestionsController
);

// generate exams feedback
router.post("/generate-exams-feedback", 
    [
        body("prepId").isString().trim().notEmpty().withMessage("prepId is required"),
        body("transcript").isArray().withMessage("Transcript should be an array"),

        routeValidationResult,
        authMiddleware,
    ], 
    generateExamFeedbackController
);

// generate-new-questions
router.post("/generate-new-questions", 
    [
        body("prepId").isString().trim().notEmpty().withMessage("prepId is required"),
        body("prepType").isString().trim().notEmpty().withMessage("prepType is required"),
        body("feedbackId").isString().trim().notEmpty().withMessage("feedbackId is required"),

        routeValidationResult,
        authMiddleware,
    ], 
    generateNewPrepController
);


// get paginated data of preparations
router.get("/", 
    [
        query('page')
            .exists().withMessage('Page is required')
            .isInt({ min: 1 }).withMessage('Page must be a positive integer'),

        query('limit')
            .exists().withMessage('Limit is required')
            .isInt({ min: 1 }).withMessage('Limit must be a positive integer'),

        query('prepType')
            .exists().withMessage('Prep. type is required')
            .isIn(['All', 'Exam', 'Interview']).withMessage('Prep. type must be either "All", "Exam" or "Interview"'),
        
        routeValidationResult,
        authMiddleware,
    ], 
    getUserPracticeQuestionsController
);

// get preparations details by id
router.get("/details/:prepId", 
    [
        param("prepId").isString().trim().notEmpty().withMessage("prepId is required"),

        routeValidationResult,
        authMiddleware,
    ], 
    getPrepByIdController
);

// get feedback by prep id
router.get("/feedback/:prepId", 
    [
        param("prepId").isString().trim().notEmpty().withMessage("prepId is required"),

        routeValidationResult,
        authMiddleware,
    ], 
    getFeedbackController
);

// get feedback by prep id
router.post("/discussions", 
    [
        body("prepId").isString().trim().notEmpty().withMessage("Prep Id is required"),
        body("prepFeedbackId").isString().trim().notEmpty().withMessage("feedback Id is required"),

        body('page')
            .exists().withMessage('Page is required')
            .isInt({ min: 1 }).withMessage('Page must be a positive integer'),

        body('limit')
            .exists().withMessage('Limit is required')
            .isInt({ min: 1 }).withMessage('Limit must be a positive integer'),

        routeValidationResult,
        authMiddleware,
    ], 
    getDiscussMessagesController
);

// get feedback by prep id
router.post("/chat", 
    [
        body("prepId").isString().trim().notEmpty().withMessage("Prep Id is required"),
        body("prepFeedbackId").isString().trim().notEmpty().withMessage("feedback Id is required"),
        body("userPrompt").isString().trim().notEmpty().withMessage("message is required"),

        routeValidationResult,
        authMiddleware,
    ], 
    generatePrepDiscusController
);

// delete an interview
router.delete("/:prepId",
    [
        param('prepId')
            .isString().trim().notEmpty()
            .withMessage('prepId is required'),

        routeValidationResult,
        authMiddleware,
    ], 
    deletePrepController
);


// generate Feedback Report PDF Controller
router.get("/generate-pdf",
    [
        query('feedbackId')
            .isString().trim()
            .notEmpty().withMessage('feedbackId is required'),

        routeValidationResult,
        authMiddleware,
    ], 
    generateFeedbackPdfController
);

export default router;
