import express from 'express';
import helmet from 'helmet';
import compression from 'compression';

// import fileUpload from 'express-fileupload';

import bodyParser from 'body-parser';
import cors from 'cors';
import { rateLimit } from 'express-rate-limit';

import mongoose from 'mongoose';
import 'dotenv/config';

import authRoutes from './routes/auth.routes.js';
// import orderRoutes from "./routes/order.routes.js";
// import chatRoutes from "./routes/chat.routes.js";

import { get404, get500 } from './controllers/error.js';

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 5 minutes
	limit: 300, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
	// standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
	// legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
	// store: ... , // Redis, Memcached, etc. See below.

    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers

    // validate: false,
    message: "Too many requests from this IP, please try again later",
})


const app = express();

// Apply the rate limiting middleware to all requests.
app.use(limiter);
app.use(helmet());
app.use(cors());
app.use(compression());

const PORT = process.env.PORT || 3000;
// const PORT = 5000;

app.use(bodyParser.json({limit: "50mb"}));

// app.use(getSource);
// app.use('/api', apiV1Routes);
app.use('/api/v1/auth', authRoutes);
// app.use("/api/orders", orderRoutes);
// app.use("/api/chat", chatRoutes);


app.use(get404);
app.use(get500);

const dbAccess = process.env.MONGO_DB_ACCESS_URI;

if (dbAccess) {
    mongoose.connect(dbAccess)
    .then((res) => {
        // console.log(res);
        app.listen(PORT, () => {
            console.log(`Server Running on port: http://localhost:${PORT}`);
        })
    })
    .catch((err) => console.log(err));
    
} else {
    app.listen(PORT, () => {
        console.log(`Server Running on port: http://localhost:${PORT}`);
    })
}
