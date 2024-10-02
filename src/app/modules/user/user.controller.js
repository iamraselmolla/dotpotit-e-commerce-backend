import catchAsyncFunction from "../../shared/catchAsynFunc.js";
import sendResponse from "../../shared/sendResponse.js";
import { UserServices } from "./user.service.js";
import httpStatus from 'http-status';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
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
        // Authenticate user with email and password
        const user = await UserServices.loginUser(email, password);

        // Generate a JWT token after successful login
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

        res.cookie('jwttoken', token, {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        });

        res.cookie('dotpotItSign', true, {
            httpOnly: false, // Accessible by JS
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        });

        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: "Login successful",
            data: {
                userId: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
                isVerified: user.isVerified
            }, // Send back minimal user info
            jwttoken: token,
        });
    } catch (error) {
        next(error); // Pass the error to the error handler middleware
    }
});

const verifyToken = catchAsyncFunction(async (req, res) => {
    const { token } = req.body; // Get token from the request parameters
    // Find user by verification token
    const user = await UserServices.findByVerificationToken(token);

    // Check if the user exists and the token has not expired
    if (!user || user.verificationTokenExpires < Date.now()) {
        return sendResponse(res, {
            statusCode: httpStatus.BAD_REQUEST,
            success: false,
            message: 'Invalid or expired token.',
        });
    }

    // Update user data
    user.isVerified = true; // Mark user as verified
    // user.verificationToken = undefined; // Optional: Remove the verification token
    // user.verificationTokenExpires = undefined; // Optional: Remove expiration date
    await user.save();

    return sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Email verified successfully!',
        data: user, // You can choose to return user data if needed
    });
});


export const UserController = { createAnUser, loginUser, verifyToken };
