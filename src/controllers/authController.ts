import { Request, Response, NextFunction } from "express-serve-static-core";
import bcryptjs from "bcryptjs";
import Jwt from "jsonwebtoken";

// models
import { userModel } from '@/models/users.model.js';

// utilities
import { generateTokens, verifyRefreshToken } from "@/util/JWT_tokens.js";
import { userTokenModel } from "@/models/userToken.model.js";
import { sendEmailVerificationCode, sendNewPasswordConfirmationMail } from "@/util/mail.js";
import { verifyEmailToken } from "@/util/resources.js";




interface passwordResetCodeInterface {
    email: string,
    code: string
}
let passwordResetCode: passwordResetCodeInterface[] = [];


export const signupController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // check if the password and confirm password are the same
        if (req.body.password !== req.body.confirmPassword) {
            return res.status(400).json({
                status: false,
                statusCode: 400,
                message: 'Password and confirm password do not match.'
            });
        }

        // check if the user exist in the database
        const emailExist = await userModel.findOne({ email: req.body.email });
        if (emailExist) {
            return res.status(400).json({
                status: false,
                statusCode: 400,
                message: 'Email already exists.'
            });
        }

        // generate hashed password to keep the password secret always
        const hashSalt = await bcryptjs.genSalt(12);
        const hashedPassword = await bcryptjs.hash(req.body.password, hashSalt);
        
        // save the registration details to the database
        const newUser = new userModel({
            fullName: req.body.fullName,

            email: req.body.email,
            location: req.body.location,

            password: hashedPassword,
            role: "user",
        });
        
        // save the user to the database
        const result = await newUser.save();
        if (!result._id) {
            return res.status(500).json({
                status: false,
                statusCode: 500,
                message: 'server error, try again after some time.'
            });
        }

        // TODO:: send the user a verification email
        
        const tokens = await generateTokens(result);

        return res.status(201).json({
            status: true,
            statusCode: 201,
            result: {
                token: tokens.access_token,
                refresh_token: tokens.refresh_token,
                user: result,
            },
            message: 'User registered successfully!'
        });
           
    } catch (error: any) {
        if (!error.statusCode) error.statusCode = 500;
        next(error);
    }
}

export const loginController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const email = req.body.email;
        const sentPassword = req.body.password;
        // const location = req.body.location;

        // check if the user exist in the database
        const user = await userModel.findOne({email});
        if (!user) {
            return res.status(401).json({
                status: false,
                statusCode: 401,
                message: "Incorrect email or password"
            });
        }

        // check if password is correct
        const isPassEqual = await bcryptjs.compare(sentPassword, user.password);
        if (!isPassEqual) {
            return res.status(401).json({
                status: false,
                statusCode: 401,
                message: "Incorrect email or password!"
            });
        }

        const tokens = await generateTokens(user);

        return res.status(201).json({
            status: true,
            statusCode: 201,
            result: {
                access_token: tokens.access_token,
                refresh_token: tokens.refresh_token,
                user,
            }, 
            message: 'Login successful',
        });
    } catch (error: any) {
        if (!error.statusCode) error.statusCode = 500;
        next(error);
    }
}

export const refreshAuthCtrl = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const refresh_token = req.body.refresh_token;
        
        const decodedToken = await verifyRefreshToken(`${refresh_token}`);
        if (!decodedToken.token) {
            return res.status(401).json({
                status: false,
                statusCode: 401,
                message: decodedToken.message
            });
        }

        const tokenDetails: any = decodedToken.token;

        // check if the user exist in the database
        const user = await userModel.findById(tokenDetails._id);
        if (!user) {
            return res.status(401).json({
                status: false,
                statusCode: 401,
                message: "A user with this email could not be found!"
            });
        }

        // get a new access token
        const newAccessToken = Jwt.sign(
            {
                email: user.email,
                _id: user._id,
                role: user.role,
                name: `${user.fullName}`,
            },
            `${process.env.JWT_SECRET}`,
            { expiresIn: '14m' }
        );
        
        return res.status(201).json({
            status: true,
            statusCode: 201,
            result: {
                newToken: newAccessToken,
                user, 
            },
            message: 'success!',
        });
    } catch (error: any) {
        if (!error.statusCode) error.statusCode = 500;
        next(error);
    }
}

export const logoutCtrl = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const refresh_token = req.body.refresh_token;

        const usesdd = await userTokenModel.deleteOne({token: refresh_token});

        return res.status(201).json({
            status: true,
            statusCode: 201,
            message: 'Logged out successfully!',
        });
    } catch (error: any) {
        if (!error.statusCode) error.statusCode = 500;
        next(error);
    }
}

export const deleteAccountCtrl = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user_id = req.body.authMiddlewareParam._id;

        const loggedOutUser = await userTokenModel.deleteMany({ user_id });
        const deletedUser = await userModel.findByIdAndDelete(user_id);

        return res.status(201).json({
            status: true,
            statusCode: 201,
            message: 'Logged out successfully!',
        });
    } catch (error: any) {
        if (!error.statusCode) error.statusCode = 500;
        next(error);
    }
}


// forgot password ::-> verifies the user and sends email to verify its him requesting the rest
export const sendPasswordResetEmailCtr = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const email = req.body.email;
        const uzer = await userModel.findOne({email});

        if (!uzer) {
            return res.status(401).json({
                status: false,
                statusCode: 401,
                message: 'Password reset Email sent, kindly check your mail for verification code.',
            });
        }

        const mailResponse = sendEmailVerificationCode(
            email,
            `${uzer.fullName}`,
            "Password Reset Request"
        );

        if (!mailResponse.status) {
            return res.status(500).json({
                status: false,
                statusCode: 500,
                message: mailResponse.message,
                error: mailResponse.error
            });
        }

        // save the code to memory
        setPasswordResetCode({
            code: mailResponse.code || '',
            email: uzer.email || email,
        });

        return res.status(201).json({
            statusCode: 201,
            status: true,
            token: mailResponse.jwt_token,
            message: 'Password reset Email sent, kindly check your mail for verification code.',
        });
    } catch (error: any) {
        if (!error.statusCode) error.statusCode = 500;
        next(error);
    }
}

// verify email reset code
export const verifyEmailTokenCtr = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const code = req.body.code;
        // const email = req.body.email;
        // const token = req.body.token;

        const authHeader = req.get('Authorization');
        if (!authHeader) {
            return res.status(401).json({
                status: false,
                statusCode: 401,
                message: "No authentication token, Please try again.",
            });
        };

        const token = authHeader.split(' ')[1];
        
        const verifyRes =  verifyEmailToken(code, token);
        
        if (!verifyRes.status) {
            return res.status(401).json({
                statusCode: 401,
                status: false,
                message: 'wrong verification code!',
            });
        }


        return res.status(201).json({
            status: true,
            statusCode: 201,
            // decodedToken: verifyRes.decodedToken,
            message: 'Please proceed to reset your password.',
        });
    } catch (error: any) {
        if (!error.statusCode) {
            error.statusCode = 500;
            error.message = 'server error!';
        }
        next(error);
    }
}


export const setNewPasswordCtr = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const email = req.body.email;
        const newPassword = req.body.password;
        const confirmPassword = req.body.confirmPassword;

        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                status: false,
                statusCode: 400,
                message: 'password does not match.',
            });
        }

        // get the saved tempt code
        const resetcode = getPasswordResetCodeByEmail(email);
        if (!resetcode) {
            return res.status(401).json({
                status: false,
                statusCode: 401,
                message: 'session timeout!',
            });
        }


        // add extra security to ensure the actual user requested for the change
        const authHeader = req.get('Authorization');
        if (!authHeader) {
            return res.status(401).json({
                status: false,
                statusCode: 401,
                message: "No authentication token, Please try again.",
            });
        };

        const token = authHeader.split(' ')[1];
        const verifyRes = verifyEmailToken(resetcode.code, token);
        if (!verifyRes.status) {
            return res.status(401).json({
                statusCode: 401,
                status: false,
                message: 'session timeout!',
            });
        }

        // remove the saved code;
        removePasswordResetCode(email);

        // generate and update the new password hash
        const hashedPassword = await bcryptjs.hash(newPassword, 12);
        const updatedUser = await userModel.findOneAndUpdate(
            { email: email }, 
            { password: hashedPassword },
            {
                runValidators: true,
                returnOriginal: false,
            }
        );

        if (!updatedUser) {
            return res.status(500).json({
                status: false,
                statusCode: 500,
                message: 'Ooopps unable to update password.',
            });
        }

        // send email to user about the changed password.
        sendNewPasswordConfirmationMail(updatedUser.email, `${updatedUser.fullName}`);

        return res.status(201).json({
            status: true,
            statusCode: 201,
            message: 'Password Changed successfully!',
        });
    } catch (error: any) {
        if (!error.statusCode) error.statusCode = 500;
        next(error);
    }
}


function setPasswordResetCode(passwordResetData: passwordResetCodeInterface) {
    // Check if the email already exists in the array
    const existingCode = passwordResetCode.find(code => code.email == passwordResetData.email);
  
    // If the email doesn't exist, add the new code to the array
    if (!existingCode) passwordResetCode.push(passwordResetData);
}

function removePasswordResetCode(email: string) {
    // Find the index of the code with the specified email
    const index = passwordResetCode.findIndex(code => code.email === email);
  
    // If the code is found, remove it from the array
    if (index !== -1) passwordResetCode.splice(index, 1);
}

function getPasswordResetCodeByEmail(email: string) {
    // Find the code object with the specified email
    const code = passwordResetCode.find(code => code.email == email);
  
    // Return the code object or null if not found
    return code || null;
}
