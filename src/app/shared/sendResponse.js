// sendResponse.js - Modified sendResponse function
function sendResponse(res, data) {
    res.status(data.statusCode).json({
        success: data.success,
        message: data.message,
        data: data.data,
    });
}

export default sendResponse;