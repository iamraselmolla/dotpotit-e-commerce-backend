import express from "express";
import cors from "cors";
import httpStatus from "http-status";
import globalErrorHandler from "./error-handler/GlobalErrorHandler.js";
import router from "./routes/index.js"; // Assuming you have a router file named 'router.js'

import bodyParser from "body-parser";
const app = express();
app.use(cors({
    origin: 'http://localhost:3000', // Your front-end URL
    credentials: true, // Allow cookies to be sent
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mount your API routes under the /api/v1 prefix

app.use(bodyParser.json());
app.get("/", (req, res) => {
    res.send("Hello DotPot It Personnel! Server is running...");
});
app.use("/api/v1", router);
// Error handling middleware
app.use(globalErrorHandler);

// 404 Not Found handler
app.use((req, res, next) => {
    res.status(httpStatus.NOT_FOUND).json({
        success: false,
        message: "Not found",
        errorMessages: [
            {
                path: req.originalUrl,
                message: "API Not Found",
            },
        ],
    });
});

export default app;

// check for development