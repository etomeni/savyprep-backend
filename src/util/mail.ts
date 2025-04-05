import fs from "fs";
import Jwt from "jsonwebtoken";
// import axios from "axios";
import nodemailer from 'nodemailer';
import moment from 'moment';

const year = moment().format("YYYY");

const mailTransporter = () => {
    const mailTransporter = nodemailer.createTransport({
        // service: "gmail",
        host:  process.env.HOST_SENDER,
        port: 465,
        auth: {
            user: process.env.HOST_EMAIL,
            pass: process.env.HOST_PASSWORD
        }
    });

    return mailTransporter;
}

const formatMessageForEmail = (message: string) => {
    return message.replace(/\n/g, '<br>');
};
  

export const sendEmailVerificationCode = (email: string, name = "", subject = "Email Verification Code") => {
    try {
        const codeLength = 4;
        const code = Math.floor(Math.random() * Math.pow(10, codeLength)).toString().padStart(codeLength, '0');
    
        const jwt_token = Jwt.sign(
            { code, email },
            `${code}`,
            { expiresIn: '30m' }
        );

        // Read the HTML file synchronously
        const data = fs.readFileSync("./src/emailTemplates/emailVerification.html", 'utf8');
        
        // Replace the placeholder with a dynamic value (e.g., "John")
        const Htmltemplate = data.replace(/{{name}}/g, name)
        .replace(/{{code}}/g, code)
        .replace(/{{year}}/g, year);
        
        // console.log(Htmltemplate);
        
        const mailText = `
            Email Verification


            Hi ${name},
            Please use this code below to verify your email address.
            
            ${code}
            
            
            Thanks for choosing SavyPrep.
            
            Best wishes,
            SavyPrep
        `;

        const details = {
            from: `SavyPrep <${ process.env.HOST_EMAIL }>`,
            to: `${email}`,
            subject,
            text: mailText,
            html: Htmltemplate
        };

        mailTransporter().sendMail(details, (err) => {
            if (err) {
                return {
                    status: false,
                    error: err,
                    message: 'an error occured while sending verification mail.',
                }
            }
        });
        
        return {
            status: true,
            code: code,
            jwt_token: jwt_token,
            message: 'Email sent successfully.',
        }
    } catch (error) {
        return {
            status: false,
            error,
            message: 'an error occured while sending verification email.',
        }
    }
}


export const sendNewPasswordConfirmationMail = (
    email: string, name: string,
) => {
    try {
        // Read the HTML file synchronously
        const data = fs.readFileSync("./src/emailTemplates/newPasswordConfirmationMail.html", 'utf8');
        
        // Replace the placeholder with a dynamic value (e.g., "John")
        const Htmltemplate = data.replace(/{{name}}/g, name)
        .replace(/{{year}}/g, year);
        
        
        const mailText = `
            Hello ${name},

            Your password has been successfully reset. You can now log in with your new password.

            If you did not reset your password or suspect any unauthorized activity, please contact our support team immediately.

            You can log in to your account here:
            www.SavyPrep.com/auth/login/

            Thank you for using our services. If you have any questions, feel free to reach out to us.


            Best regards,
            SavyPrep


            © ${year} SavyPrep. All rights reserved.
        `;

        const details = {
            from: `SavyPrep <${ process.env.HOST_EMAIL }>`,
            to: `${email}`,
            subject: "Password Reset Successful",
            text: mailText,
            html: Htmltemplate
        };

        mailTransporter().sendMail(details, (err) => {
            if (err) {
                return {
                    status: false,
                    error: err,
                    message: 'an error occured while sending mail.',
                }
            }
        });
        
        return {
            status: true,
            message: 'Email sent successfully.',
        }
    } catch (error) {
        console.log(error);
        
        return {
            status: false,
            error,
            message: 'an error occured while sending email.',
        }
    }
}
