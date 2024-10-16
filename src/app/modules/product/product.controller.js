import httpStatus from "http-status";
import catchAsyncFunction from "../../shared/catchAsynFunc.js";
import sendResponse from "../../shared/sendResponse.js";
import { ProductServices } from "./product.service.js";
import sharp from 'sharp';
import mongoose from 'mongoose';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
const storage = multer.memoryStorage(); // Using memory storage to work with buffers in sharp
const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit for file uploads
});

// Middleware to handle file upload via multer
const uploadFiles = upload.fields([
    { name: 'images', maxCount: 1 },     // Single main image
    { name: 'colorsImg', maxCount: 5 },  // Up to 5 color variant images
]);

// Helper function for processing and resizing images
const processImage = async (imageBuffer, uploadDir, imageName) => {
    const filename = `${Date.now()}-${imageName.split(' ').join('-')}.png`;
    const filePath = path.join(uploadDir, filename);

    // Resize and sharpen the image before saving
    const buffer = await sharp(imageBuffer)
        .resize(800, 800)
        .sharpen()
        .toFormat('png')
        .toBuffer();

    // Save the buffer to the filesystem
    await fs.promises.writeFile(filePath, buffer);
    return filePath;
};

// Create product controller
const createProduct = catchAsyncFunction(async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Wrap the multer file upload logic in a Promise to ensure it waits
        await new Promise((resolve, reject) => {
            uploadFiles(req, res, (err) => {
                if (err instanceof multer.MulterError) {
                    console.log("Multer error occurred during file upload");
                    return reject(err);
                } else if (err) {
                    return reject(err);
                }
                resolve();
            });
        });

        // Proceed with product creation
        const productData = req.body;
        if (typeof productData.gifts === "string") {
            productData.gifts = JSON.parse(productData.gifts);
        }
        if (typeof productData.price === "string") {
            productData.price = JSON.parse(productData.price);
        }
        if (typeof productData.features === "string") {
            productData.features = JSON.parse(productData.features);
        }
        if (typeof productData.memorySizes === "string") {
            productData.memorySizes = JSON.parse(productData.memorySizes);
        }
        // if (typeof productData.colors === "string") {
        //     productData.colors = JSON.parse(productData.colors);
        // }
        const mainImages = req.files['images'] ? req.files['images'][0] : null;
        const colorImages = req.files['colorsImg'] || [];

        const productIdOrName = productData.name || 'default';
        const uploadDir = `./uploads/${productIdOrName}/`;

        // Ensure the directory exists
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        // Process main image
        let processedMainImage = null;
        if (mainImages) {
            processedMainImage = await processImage(mainImages.buffer, uploadDir, mainImages.originalname);
        }

        // Process color images
        const processedColorImages = await Promise.all(
            colorImages.map(img => processImage(img.buffer, uploadDir, img.originalname))
        );

        // Prepare product data with image paths
        const newProductData = {
            ...productData,
            images: processedMainImage,  // Store main image path
            colors: productData?.colors ? JSON.parse(productData.colors).map((color, index) => ({
                ...color,
                image: processedColorImages[index] || null  // Assign the processed color image
            })) : []
        };
        console.log(newProductData);

        // Create the product in the database using a transaction
        const product = await ProductServices.createProduct(newProductData, { session });

        // Commit the transaction
        await session.commitTransaction();
        session.endSession();

        // Send response back to the client
        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: "Product created successfully",
            data: product
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
