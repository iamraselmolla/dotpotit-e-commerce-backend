class ApiError extends Error {
    statusCode

    constructor(statusCode, messge, stack = '') {
        super(messge)
        this.statusCode = statusCode;
        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor)
        }
    }
}

export default ApiError