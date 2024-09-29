import catchAsyncFunction from "../../shared/catchAsynFunc.js";
import sendResponse from "../../shared/sendResponse.js";
import { UserServices } from "./user.service.js";
import httpStatus from 'http-status'; // Make sure to import this if you're using http status codes

const createAnUser = catchAsyncFunction(async (req, res, next) => {
    try {
        if (req.body.email && req.body.password && req.body.name) {
            const result = await UserServices.createAnUser(req.body);
            sendResponse(res, {
                statusCode: httpStatus.OK,
                success: true,
                message: "User Created Successfully",
                data: result,
            });
        } else {
            sendResponse(res, {
                statusCode: httpStatus.BAD_REQUEST,
                success: false,
                message: "Email and password are required.",
            });
        }
    } catch (error) {
        next(error); // Pass the error to the next middleware (if needed)
    }
});

export const UserController = { createAnUser };
