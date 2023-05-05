import nodemailer from "nodemailer";
import Mailgen from "mailgen";

import ENV from "../config.js";

// https://ethereal.email/create
const NodeConfig = {
  host: "smtp.ethereal.email",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: ENV.EMAIL, // generated ethereal user
    pass: ENV.PASSWORD, // generated ethereal password
  },
};

const transporter = nodemailer.createTransport(NodeConfig)
const mailGenerator = new Mailgen({
    theme: "default",
    product: {
        name: "Mailgen",
        link: "https://mailgen.js/"
    }
})

/** POST: http://localhost:8000/api/registerMail
 * @param: {
 * "username": "example123",
 * "userEmail": "admin123@gmail.com"
 * "text": "",
 * subject: ""
 * }
 */
export const registerMail = async(req, res) => {
    const { username, userEmail, text, subject } = req.body
    
    // body of the email
    let email = {
        body: {
            name: username,
            intro: text || 'Welcome to Daily Tuition! We\'re very excited to have you in board.',
            outro: 'Need help, or have questions? Just reply to this email, we\'d love to help you.'
        }
    }
    
    let emailBody = mailGenerator.generate(email);
    let message = {
        from: ENV.EMAIL,
        to: userEmail,
        subject: subject || "Signup successful",
        html: emailBody
    }
    
    // send mail
    transporter.sendMail(message)
        .then(() => res.status(200).send({ msg: "You should reveice an email from us. "}))
        .catch(error => res.status(500).send({ error: error.message }))
}