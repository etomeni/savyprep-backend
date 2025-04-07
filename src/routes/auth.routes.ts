import express from 'express';
import { body } from 'express-validator';
import bodyParser from 'body-parser';

const router = express.Router();

// middleWares
import authMiddleware from '@/middleware/auth.js';
import routeValidationResult from '@/middleware/routeValidationResult.js';

// Controllers
import { 
    signupController, 
    loginController, 
    refreshAuthCtrl,
    logoutCtrl,
    setNewPasswordCtr,
    verifyEmailTokenCtr,
    sendPasswordResetEmailCtr,
    deleteAccountCtrl,
} from '@/controllers/authController.js';


router.use(bodyParser.json());

// signup
router.post(
    '/signup',
    [
        body('fullName').trim().notEmpty(),
        // body('gender').trim().not().isEmpty(),
        // body('country').trim().not().isEmpty(),

        body('email').trim()
        .isEmail().withMessage('Please enter a valid email')
        .normalizeEmail(),

        // body('phoneNumber').trim().not().isEmpty(),

        body('password').trim().notEmpty(),
        body('confirmPassword').trim().notEmpty(),
        // body('role').trim().notEmpty(),
        // body('userIp').trim().not().isEmpty(),

        routeValidationResult,
    ],
    signupController
);

// Login
router.post(
    '/login',
    [
        body('email').trim()
        .isEmail().withMessage('Please enter a valid email')
        .normalizeEmail(),

        body('password').trim().not().isEmpty(),

        routeValidationResult
    ],
    loginController
);

router.post(
    "/refresh",
    [
        body('refresh_token')
            .isString().trim().notEmpty()
            .withMessage('refresh_token is required'),
        
        routeValidationResult
    ],
    refreshAuthCtrl
);

// logout
router.post(
    "/logout",
    [
        body('refresh_token')
            .isString().trim().notEmpty()
            .withMessage('refresh_token is required'),
        
        routeValidationResult
    ],
    logoutCtrl
);

// delete user account
router.delete(
    "/delete-account",
    [
        // body('refresh_token')
        //     .isString().trim().notEmpty()
        //     .withMessage('refresh_token is required'),
        
        routeValidationResult,
        authMiddleware
    ],
    deleteAccountCtrl
);

// send Password Reset Email
router.post(
    '/sendPasswordResetEmail',
    [
        body('email').trim()
        .isEmail().withMessage('Please enter a valid email')
        .normalizeEmail(),

        routeValidationResult
    ],
    sendPasswordResetEmailCtr
);

// verify sent email reset password token
router.post(
    '/verifyEmailToken',
    verifyEmailTokenCtr
);


// reset new password
router.post(
    '/setNewPassword',
    [
        body('password').trim()
        .matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]+$/)
        .not().isEmpty(),
        
        body('confirmPassword').trim()
        .matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]+$/)
        .not().isEmpty(),

        body('email').trim()
        .isEmail().withMessage('Please enter a valid email')
        .normalizeEmail(),

        routeValidationResult
    ],
    setNewPasswordCtr
);


export default router;