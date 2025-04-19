import express from 'express';
import { body, param, query  } from 'express-validator';
// import bodyParser from 'body-parser';

// middleWares
import authMiddleware from '@/middleware/auth.js';
import routeValidationResult from '@/middleware/routeValidationResult.js';

// Controllers
import { 
    ChatUsController,
    getDashboardStatController,
    checkVersionUpdateController,
    setPushNotificationTokenController
} from '@/controllers/genController.js';


const router = express.Router();
// router.use(bodyParser.json());


// get dashboaard statistics
router.get("/dashboard-stat", 
    [
        routeValidationResult,
        authMiddleware,
    ], 
    getDashboardStatController
);

// chat-us
router.post("/chat-us", 
    [
        body("fullName").isString().trim().notEmpty().withMessage("FullName is required"),
        body("message").isString().trim().notEmpty().withMessage("Message is required"),

        body('email').trim()
            .isEmail().withMessage('Please enter a valid email')
            .normalizeEmail(),


        routeValidationResult,
        // authMiddleware,
    ], 
    ChatUsController
);

// check-version-update
router.get("/check-version-update", 
    [
        query("userVersion").isString().trim().notEmpty().withMessage("userVersion is required"),

        routeValidationResult,
        // authMiddleware,
    ], 
    checkVersionUpdateController
);

// set Push Notification Token
router.post("/setPushNotificationToken", 
    [
        body("notificationToken").isString().trim().notEmpty().withMessage("notification token is required"),

        routeValidationResult,
        // authMiddleware,
    ], 
    setPushNotificationTokenController
);


export default router;
