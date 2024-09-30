import httpStatus from "http-status";
import catchAsyncFunction from "../../shared/catchAsynFunc.js";
import { CategoryServices } from "./category.service.js";

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


export const CategoryController = { addCategory }