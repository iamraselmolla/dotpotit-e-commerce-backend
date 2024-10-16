import httpStatus from "http-status";
import catchAsyncFunction from "../../shared/catchAsynFunc.js";
import sendResponse from "../../shared/sendResponse.js";
import { ProductServices } from "./product.service.js";
import sharp from 'sharp';
import mongoose from 'mongoose';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Set up multer for file uploads
const storage = multer.memoryStorage(); // Using memory storage since Sharp processes buffers
const upload = multer({ storage });

// Middleware to handle file upload via multer
const uploadFiles = upload.fields([
    { name: 'images', maxCount: 5 }, // Main product images (max 5 images)
    { name: 'colorsImg', maxCount: 5 } // Color variant images (max 5 images)
]);

// Image processing helper function (resizing, sharpening)
const processImage = async (imageBuffer, uploadDir, imageName) => {
    const filename = `${Date.now()}-${imageName.split(' ').join('-')}.png`;
    const filePath = path.join(uploadDir, filename);

    // Resize and sharpen the image before saving
    const buffer = await sharp(imageBuffer)
        .resize(800, 800)     // Resize to 800x800
        .sharpen()            // Apply sharpening
        .toFormat('png')      // Convert to PNG
        .toBuffer();

    // Save the buffer to the filesystem
    await fs.promises.writeFile(filePath, buffer);

    return filePath; // Return the file path to be stored in the database
};

// Create product controller
const createProduct = catchAsyncFunction(async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Handle Multer file upload
        uploadFiles(req, res, async function (err) {
            if (err instanceof multer.MulterError) {
                // A Multer error occurred during the file upload
                return next(err);
            } else if (err) {
                // An unknown error occurred
                return next(err);
            }

            // Proceed with product creation
            const productData = req.body;
            const mainImages = req.files.images || [];
            const colorImages = req.files.colorsImg || [];

            const productIdOrName = productData.name || 'default'; // Use name or ID for folder
            const uploadDir = `./uploads/${productIdOrName}/`; // Directory to store images

            // Ensure the directory exists
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }

            // Process main and color images
            const processedMainImages = await Promise.all(
                mainImages.map(img => processImage(img.buffer, uploadDir, img.originalname))
            );

            const processedColorImages = await Promise.all(
                colorImages.map(img => processImage(img.buffer, uploadDir, img.originalname))
            );

            // Prepare product data with image paths
            const newProductData = {
                ...productData,
                images: processedMainImages, // Store main image paths
                colors: productData.colors.map((color, index) => ({
                    name: color.name,
                    price: color.price,
                    image: processedColorImages[index] || null // Assign the processed color image
                })),
            };

            // Create the product in the database using a transaction
            const product = await ProductServices.createProduct(newProductData, { session });

            // Commit the transaction
            await session.commitTransaction();
            session.endSession();

            // Send response back to the client
            sendResponse(res, {
                statusCode: httpStatus.CREATED,
                success: true,
                message: "Product created successfully",
                data: product
            });
        });
    } catch (error) {
        // Rollback the transaction if something goes wrong
        await session.abortTransaction();
        session.endSession();
        next(error); // Forward the error to the error handling middleware
    }
});

// Get all products
const getAllProducts = catchAsyncFunction(async (req, res, next) => {
    try {
        const products = await ProductServices.getAllProducts();
        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: "Products fetched successfully",
            data: products
        });
    } catch (error) {
        next(error);
    }
});

// Find product by ID
const findProductById = catchAsyncFunction(async (req, res, next) => {
    try {
        const product = await ProductServices.findProductById(req.params.id);
        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: "Product fetched successfully",
            data: product
        });
    } catch (error) {
        next(error);
    }
});

// Increment view count for a product
const incrementViewCount = catchAsyncFunction(async (req, res, next) => {
    const { id } = req.params;
    try {
        const product = await ProductServices.incrementViewCount(id);
        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: "View count incremented successfully",
            data: product
        });
    } catch (error) {
        next(error);
    }
});

export const ProductController = {
    createProduct,
    getAllProducts,
    findProductById,
    incrementViewCount,
};
