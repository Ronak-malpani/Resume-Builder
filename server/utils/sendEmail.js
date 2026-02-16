import nodemailer from 'nodemailer';

export const sendEmail = async (options) => {
    //console.log("SENDING FROM EMAIL:", process.env.EMAIL_FROM);
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST, // smtp-relay.brevo.com
        port: process.env.SMTP_PORT, // 587
        secure: false, // true for 465, false for 587
        auth: {
            user: process.env.SMTP_USER, 
            pass: process.env.SMTP_PASS, 
        },
    });

    const mailOptions = {
        from: `ATS Support <${process.env.EMAIL_FROM}>`,
        to: options.email,
        subject: options.subject,
        // We use HTML for a professional look, just like in your Job Portal
        html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
            <h2 style="color: #5F9D08; text-align: center;">Reset Your Password</h2>
            <p>We received a request to reset your password for the ATS Resume Builder.</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${options.resetUrl}" style="background-color: #5F9D08; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                    Reset Password
                </a>
            </div>
            <p style="font-size: 12px; color: #64748b;">This link will expire in 15 minutes. If you didn't request this, ignore this email.</p>
        </div>
        `,
    };

    await transporter.sendMail(mailOptions);
};