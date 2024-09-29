import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import ApiError from '../../error-handler/ApiErrorHandler.js';

// Create user schema
const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            match: [
                /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                'Please provide a valid email address',
            ],
        },
        password: {
            type: String,
            required: true,
            minlength: 6,
        },
        role: {
            type: String,
            enum: ['user', 'admin'],
            default: 'user',
        },
        isVerified: {
            type: Boolean,
            default: false, // User must verify their email
        },
        verificationToken: {
            type: String,
        },
        verificationTokenExpires: {
            type: Date,
        },
        profileImage: {
            type: String,
            default: 'default.jpg',
        },
        bio: {
            type: String,
            maxlength: 500,
        },
        tokens: {
            type: [String],
        },
    },
    {
        timestamps: true,
    }
);

// Check for existing email before saving
userSchema.pre('save', async function (next) {
    // Check if email is unique
    const existingUser = await this.constructor.findOne({ email: this.email });
    if (existingUser && this.isModified('email')) {
        return next(new ApiError(409, 'User already exists'));
    }

    if (!this.isModified('password')) return next();

    // Hash password before saving
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare password method
userSchema.methods.comparePassword = async function (inputPassword) {
    return bcrypt.compare(inputPassword, this.password);
};

// Generate a verification token
userSchema.methods.generateVerificationToken = function () {
    const token = crypto.randomBytes(20).toString('hex');
    this.verificationToken = token;
    this.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // Token expires in 24 hours
    return token;
};

const User = mongoose.model('User', userSchema);
export default User;
