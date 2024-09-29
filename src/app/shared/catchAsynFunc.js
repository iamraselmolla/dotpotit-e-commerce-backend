// catchAsync.js - Refactored catchAsyncFunction middleware
const catchAsyncFunction = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

export default catchAsyncFunction;