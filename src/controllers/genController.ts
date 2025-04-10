import { Request, Response, NextFunction } from "express-serve-static-core";
import preparationsModel, { prepInterface } from "@/models/preparations.model.js";
import { sendAdminUserContactUsNotification } from "@/util/mail.js";
import { contactUsModel } from "@/models/contact.model.js";

// models
// import { userModel } from '@/models/users.model.js';

// utilities
// import { generateTokens, verifyRefreshToken } from "@/util/JWT_tokens.js";

const appVersion = {
    // stableVerion: '1.0.0',
    latestVersion: '1.2.0',
    forceUpdate: false,
};


// get dashboaard statistics
export const getDashboardStatController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user_id = req.body.authMiddlewareParam._id;

        // total preps done by the user.
        const totalPreps = await preparationsModel.countDocuments({ userId: user_id });

        // total preps done by the user.
        const totalCompletedPreps = await preparationsModel.countDocuments({ userId: user_id, status: "Completed" });

        // total exam preps done by the user.
        const totalExamPreps = await preparationsModel.countDocuments({ userId: user_id, prepType: "Exam" });

        // total interview preps done by the user.
        const totalInterviewPreps = await preparationsModel.countDocuments({ userId: user_id, prepType: "Interview" });

       
        return res.status(200).json({
            status: true,
            statusCode: 200,
            result: {
                totalPreps, totalCompletedPreps,
                totalExamPreps, totalInterviewPreps
            },
            message: 'Successfully!'
        });

    } catch (error: any) {
        if (!error.statusCode) error.statusCode = 500;
        next(error);
    }
}

// contact us 
export const ChatUsController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // const user_id = req.body.authMiddlewareParam._id;

        const fullName = req.body.fullName;
        const email = req.body.email;
        const message = req.body.message;

        const newContactMsg = new contactUsModel({ name: fullName, email, message });
        const newContactMsgResponds = await newContactMsg.save();

        sendAdminUserContactUsNotification(email, fullName, message);

        return res.status(200).json({
            status: true,
            statusCode: 200,
            result: {
                chatUs: newContactMsgResponds
            },
            message: "Thank you for reaching out to us, we're glad to have received your message and we'll respond soon."
        });

    } catch (error: any) {
        if (!error.statusCode) error.statusCode = 500;
        next(error);
    }
}


// check-version-update
export const checkVersionUpdateController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // const user_id = req.body.authMiddlewareParam._id;
        const userVersion = req.query.userVersion as string;

        // Split the version string into parts
        const userVersionParts = userVersion.split('.').map(Number);
        // Ensure we have exactly 3 parts (pad with 0 if needed)
        while (userVersionParts.length < 3) userVersionParts.push(0);
        const [userMajor, userMinor, userPatch] = userVersionParts;


        // Split the version string into parts
        const appVersionParts = appVersion.latestVersion.split('.').map(Number);
        // Ensure we have exactly 3 parts (pad with 0 if needed)
        while (appVersionParts.length < 3) appVersionParts.push(0);
        const [appMajor, appMinor, appPatch] = appVersionParts;


        let forceUpdate = false;

        if (appMajor > userMajor) {
            forceUpdate = true;
        } else if (appMinor > userMinor) {
            forceUpdate = true;
        } else if (appVersion.forceUpdate && appPatch > userPatch) {
            forceUpdate = true;
        } else{
            forceUpdate =  false;
        }

        return res.status(200).json({
            status: true,
            statusCode: 200,
            result: {
                forceUpdate,
                latestVersion: appVersion.latestVersion
            },
            message: "success"
        });

    } catch (error: any) {
        if (!error.statusCode) error.statusCode = 500;
        next(error);
    }
}


