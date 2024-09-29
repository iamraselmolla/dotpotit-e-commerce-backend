import ApiError from "../../error-handler/ApiErrorHandler.js";
import User from "./user.model.js";

const createAnUser = async (data) => {
    const user = await User.create(data);
    return user;
};

const loginUser = async (email, password) => {

    // Find the user by email
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
        throw new ApiError(401, "Invalid email or password");
    }

    // Check if the user is verified
    if (!user.isVerified) {
        throw new ApiError(403, "Email not verified. Please check your inbox.");
    }

    // Compare the password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        throw new ApiError(401, "Invalid email or password");
    }

    // Return the user object, no token generation here
    return user;
};

const findByVerificationToken = async (token) => {
    return await User.findOne({ verificationToken: token });
};

export const UserServices = { createAnUser, loginUser, findByVerificationToken };
