import express from "express";

const router = express.Router();

// middleWares
import authMiddleware from '@/middleware/auth.js';
import routeValidationResult from '@/middleware/routeValidationResult.js';

// Controllers
import { 
    sendMessage, closeChat
} from '@/controllers/chat.controller.js';



router.post("/send", 
    [

        routeValidationResult,
        authMiddleware
    ], 
    sendMessage
);


router.post("/close/:orderId", 
    [
        
        routeValidationResult,
        authMiddleware
    ], 
    closeChat
);

export default router;
