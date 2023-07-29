const nodemailer = require("nodemailer")

const envConfig = require("../configs/envConfig")

const transport = nodemailer.createTransport(envConfig.email.smtp)

const sendEmail = async (to, subject, text) => {
    const msg = {
        from: envConfig.email.from,
        to,
        subject,
        text,
    }
    await transport.sendMail(msg)
}

const sendResetPasswordEmail = async (to, token) => {
    const subject = "Reset password"
    // replace this url with the link to the reset password page of your front-end app
    const resetPasswordUrl = `http://link-to-app/reset-password?token=${token}`

    const text = `Dear user, 

To reset your password, click on this link: ${resetPasswordUrl}

If you did not request any password resets, then ignore this email.`

    await sendEmail(to, subject, text)
}

const sendVerificationEmail = async (to, token) => {
    const subject = "Email Verification"
    // replace this url with the link to the email verification page of your front-end app
    const verificationEmailUrl = `${envConfig.CLIENT_URL}/verify-email?token=${token}`

    const text = `Dear user,

To verify your email, click on this link: ${verificationEmailUrl}

If you did not create an account, then ignore this email.`

    await sendEmail(to, subject, text)
}

module.exports = { transport, sendEmail, sendResetPasswordEmail, sendVerificationEmail }
