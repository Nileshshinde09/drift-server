import Mailgen from "mailgen"
import nodemailer from "nodemailer"
import { EMAIL_APP_LINK } from "../constants.js"
import { EMAIL_ID_FOR_MAIL, MAILTRAP_SMTP_HOST, MAILTRAP_SMTP_PORT, MAILTRAP_SMTP_USER, MAILTRAP_SMTP_PASS } from "../constants.js"

const sendMail = async (options,recipientEmail,emailVerificationSubject) => {
    const mailGenerator =new Mailgen({
        theme: "default",
        product: {
            name: "Drift Social",
            link: EMAIL_APP_LINK
        }
    })
    const emailTextual = mailGenerator.generatePlaintext(options)
    const emailHtml = mailGenerator.generate(options)
    const transporter = nodemailer.createTransport({
        host: MAILTRAP_SMTP_HOST,
        port: MAILTRAP_SMTP_PORT,
        auth: {
            user: MAILTRAP_SMTP_USER,
            pass: MAILTRAP_SMTP_PASS,
        },
    })
    const mail = {
        mail: EMAIL_ID_FOR_MAIL,
        to: recipientEmail,
        subject: emailVerificationSubject,
        text: emailTextual,
        html: emailHtml
    }
    try {
        await transporter.sendMail(mail)
    }
    catch (error) {
        console.log("Email sevice failed");
        console.log("error ::", error);
    }
}


const emailVerificationContent = (username, otp) => {
    return {
        body: {
            name: username,
            intro: "Welcome to our app! We're very excited to have you on board.",
            action: {
                instructions:
                    "Email Verification OTP",
                button: {
                    color: "#22BC66",
                    text: `${otp}`,
                }
            },
            outro:
                `Need help, or have questions? Just reply to ${EMAIL_ID_FOR_MAIL}, we'd love to help.`,
        },
    };
};

const QueryMailToSupport = (subject, content) => {
    return {
        body: {
            name: username,
            intro: subject,
            action: {
                instructions:
                content,
            },
            
        },
    };
};

const forgotPasswordContent = (username, passwordResetUrl) => {
    return {
        body: {
            name: username,
            intro: "We got a request to reset the password of our account",
            action: {
                instructions:
                    "To reset your password click on the following button or link:",
                button: {
                    color: "#22BC66", // Optional action button color
                    text: "Reset password",
                    link: passwordResetUrl,
                },
            },
            outro:
                `Need help, or have questions? Just reply to ${EMAIL_ID_FOR_MAIL}, we'd love to help.`,
        },
    };
};


export {
    forgotPasswordContent,
    emailVerificationContent,
    sendMail,
    QueryMailToSupport
}
