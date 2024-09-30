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

export const ProductController = { createProduct }