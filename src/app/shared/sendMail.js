import nodemailer from 'nodemailer';
const sendVerificationEmail = async (email, token) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const verificationUrl = `http://localhost:3000/verify/${token}`; // Adjust for production

    // Set the expiration date to 24 hours from now
    const expirationDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const formattedDate = expirationDate.toLocaleString('en-US', {
        weekday: 'long', // e.g. 'Monday'
        year: 'numeric', // e.g. '2024'
        month: 'long', // e.g. 'September'
        day: 'numeric', // e.g. '29'
        hour: 'numeric', // e.g. '5 PM'
        minute: 'numeric', // e.g. '30'
        hour12: true // 12-hour format
    });

    const mailOptions = {
        to: email,
        subject: 'Email Verification - DotPot',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
                <h2 style="color: #4CAF50;">Congratulations!</h2>
                <p>Welcome to <strong>DotPot</strong>, your go-to e-commerce solution!</p>
                <p>We’re excited to have you on board. To get started, please verify your email address by clicking the button below:</p>
                <a href="${verificationUrl}" style="display: inline-block; margin: 20px 0; padding: 15px 25px; color: #fff; background-color: #4CAF50; text-decoration: none; border-radius: 5px; font-weight: bold;">Verify Email</a>
                <p>Please note that your verification link will expire in 24 hours, by <strong>${formattedDate}</strong>.</p>
                <p>If the button doesn’t work, copy and paste the following link into your browser:</p>
                <p><a href="${verificationUrl}">${verificationUrl}</a></p>
                <p>Thank you for joining DotPot! We look forward to serving you.</p>
                <footer style="margin-top: 20px; font-size: 12px; color: #888;">
                    <p>&copy; ${new Date().getFullYear()} DotPot. All rights reserved.</p>
                </footer>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Verification email sent successfully.');
    } catch (error) {
        console.error('Error sending verification email:', error);
        throw new Error('Failed to send verification email');
    }
};

export default sendVerificationEmail;