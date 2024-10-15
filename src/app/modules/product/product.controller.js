import httpStatus from "http-status";
import catchAsyncFunction from "../../shared/catchAsynFunc.js";
import sendResponse from "../../shared/sendResponse.js";
import { ProductServices } from "./product.service.js";
import sharp from 'sharp';

const createProduct = catchAsyncFunction(async (req, res, next) => {
    try {
        const productData = JSON.parse(req.body.data);
        const mainImages = req.files.images || [];
        const colorImages = req.files.colors || [];

        const processImage = async (image) => {
            const filename = `${Date.now()}-${image.originalname.split(' ').join('-')}.png`;
            const buffer = await sharp(image.buffer)
                .resize(800, 800)
                .toFormat('png')
                .toBuffer();
            // Save the buffer to your file system or cloud storage here
            // Example: await fs.promises.writeFile(`./uploads/${filename}`, buffer);
            return filename; // Return the path or URL to the saved image
        };

        const processedMainImages = await Promise.all(mainImages.map(processImage));
        const processedColorImages = await Promise.all(colorImages.map(processImage));

        const newProductData = {
            ...productData,
            images: processedMainImages,
            colors: productData.colors.map((color, index) => ({
                ...color,
                image: processedColorImages[index] || null
            })),
        };

        const product = await ProductServices.createProduct(newProductData);
        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: "Product created successfully",
            data: product
        });
    } catch (error) {
        next(error);
    }
});

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

const incrementViewCount = async (req, res, next) => {
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
};

export const ProductController = { createProduct, getAllProducts, findProductById, incrementViewCount };
