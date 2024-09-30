import httpStatus from "http-status";
import catchAsyncFunction from "../../shared/catchAsynFunc.js";
import sendResponse from "../../shared/sendResponse.js";
import { ProductServices } from "./product.service.js";

const createProduct = catchAsyncFunction(async (req, res, next) => {
    try {
        const product = await ProductServices.createProduct(req.body);
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
const incrementViewCount = async (req, res) => {
    const { id } = req.params;

    try {
        // Find the product by ID and increment the view count
        const product = await ProductServices.incrementViewCount(id);

        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: "View count incremented successfully",
            data: product
        })
    } catch (error) {
        next(error)
    }
};

export const ProductController = { createProduct, getAllProducts, findProductById, incrementViewCount };