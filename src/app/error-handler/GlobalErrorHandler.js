import config from "../../configs/index.js";
import ApiError from "./ApiErrorHandler.js";
import handleValidationError from "./HandleError.js";

const globalErrorHandler = (err, req, res, next) => {
    let statusCode = 501;
    let message = 'Something went wrong!';
    let errorMessage = [];
    if (err?.name === 'ValidationError') {
        const simplefiedError = handleValidationError(err)
        statusCode = simplefiedError.statusCode
        message = simplefiedError.message
        errorMessage = simplefiedError.errorMessage

    }
    // else if (err instanceof ZodError) {
    //     const simplefiedError = handleZodError(err)
    //     statusCode = simplefiedError.statusCode;
    //     message = simplefiedError.message;
    //     errorMessage = simplefiedError.errorMessage
    // }
    else if (err instanceof ApiError) {
        statusCode = err?.statusCode
        message = err?.message
        errorMessage = err?.message ? [
            {
                path: '',
                message: err?.message
            }
        ] : [

        ]
    }
    else if (err instanceof Error) {
        message = err?.message
        errorMessage = err?.message ?
            [
                {
                    path: '',
                    message: err?.message
                }
            ] : [

            ]
    }

    res.status(statusCode).json({
        success: false,
        message,
        errorMessage,
        stack: config.env !== 'production' ? err?.stack : undefined

    })
    // next()
}
export default globalErrorHandler;
