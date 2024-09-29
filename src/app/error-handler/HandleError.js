
export const handleValidationError = (err) => {
    let errors = Object.values(err.errors).map((el) => {
        return {
            path: el?.path,
            message: el?.message,
        };
    });
    let statusCode = 400;
    return {
        statusCode,
        message: 'Validation Error',
        errorMessage: errors

    }
};

export default handleValidationError;