import nodemailer from 'nodemailer';

const sendVerificationEmail = async (email, token) => {
    // Create a transporter using your Gmail account credentials
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER, // Your Gmail address
            pass: process.env.EMAIL_PASS, // Your Gmail password or App Password
        },
    });

    // Create the verification URL
    const verificationUrl = `http://localhost:3000/verify/${token}`; // Adjust the domain accordingly

    // Send the email
    try {
        await transporter.sendMail({
            to: email,
            subject: 'Email Verification',
            html: `<p>Click <a href="${verificationUrl}">here</a> to verify your email.</p>`,
        });
        console.log('Verification email sent successfully.');
    } catch (error) {
        console.error('Error sending verification email:', error);
        throw new Error('Failed to send verification email');
    }
};

export default sendVerificationEmail;
