import express from 'express';
import { body, param, query  } from 'express-validator';
import bodyParser from 'body-parser';

// middleWares
import authMiddleware from '@/middleware/auth.js';
import routeValidationResult from '@/middleware/routeValidationResult.js';

// Controllers
import { 
    createOrder, getOrders
} from '@/controllers/order.controller.js';


// import { createOrder, getOrders } from "../controllers/order.controller";

const router = express.Router();
// router.use(bodyParser.json());


router.post("/", 
    [
        routeValidationResult,
        authMiddleware,
    ], 
    createOrder
);


router.get("/", 
    [
        routeValidationResult,
        authMiddleware,
    ], 
    getOrders
);

export default router;
