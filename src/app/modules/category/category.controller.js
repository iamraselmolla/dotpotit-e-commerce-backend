import httpStatus from "http-status";
import catchAsyncFunction from "../../shared/catchAsynFunc.js";
import { CategoryServices } from "./category.service.js";
import sendResponse from "../../shared/sendResponse.js";

const addCategory = catchAsyncFunction(async (req, res, next) => {
    try {
        const category = await CategoryServices.addCategory(req.body);
        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: "Category created successfully",
            data: category

        }
        )
    }
    catch (error) {
        next(error);
    }
});

const getAllCategories = catchAsyncFunction(async (req, res, next) => {
    try {
        const categories = await CategoryServices.getAllCategories();
        sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: "Categories fetched successfully",
            data: categories
        }
        )
    }
    catch (error) {
        next(error);
    }
});


export const CategoryController = { addCategory, getAllCategories }