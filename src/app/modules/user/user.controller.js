import catchAsyncFunction from "../../shared/catchAsynFunc.js";
import sendResponse from "../../shared/sendResponse.js";
import { UserServices } from "./user.service.js";
import httpStatus from 'http-status';
import crypto from 'crypto';
import sendVerificationEmail from "../../shared/sendMail.js";

const createAnUser = catchAsyncFunction(async (req, res, next) => {
    try {
        if (req.body.email && req.body.password && req.body.name) {
            // Call service to create user
            const user = await UserServices.createAnUser(req.body);
            const token = crypto.randomBytes(20).toString('hex');
            user.verificationToken = token;
            user.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000;
            await user.save(); // Token expires in 24 hours
            await sendVerificationEmail(req.body?.email, token)
            sendResponse(res, {
                statusCode: httpStatus.CREATED, // Changed to CREATED status
                success: true,
                message: "User Created Successfully. Verification email sent.",
                data: { userId: user._id, email: user.email }, // Don't expose the password or sensitive info
            });
        } else {
            sendResponse(res, {
                statusCode: httpStatus.BAD_REQUEST,
                success: false,
                message: "Email, password, and name are required.",
            });
        }
    } catch (error) {
        next(error); // Pass the error to the next middleware (if needed)
    }
});

const loginUser = catchAsyncFunction(async (req, res, next) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return sendResponse(res, {
                statusCode: httpStatus.BAD_REQUEST,
                success: false,
                message: "Email and password are required.",
            });
        }

        // Call the login service
        const result = await UserServices.loginUser(email, password);

        // Set the JWT token as a cookie without expiration
        res.cookie('jwt', result.token, {
            httpOnly: true, // Mitigate XSS
            secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
        });

        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: "Login successful.",
            data: {
                user: {
                    id: result.user._id,
                    email: result.user.email,
                    name: result.user.name,
                },
            },
        });
    } catch (error) {
        next(error); // Pass the error to the next middleware
    }
});

export const UserController = { createAnUser, loginUser };
