import express from "express";
import cors from "cors";
import httpStatus from "http-status";
import globalErrorHandler from "./error-handler/GlobalErrorHandler.js";
import router from "./routes/index.js"; // Assuming you have a router file named 'router.js'
import SSLCommerzPayment from "sslcommerz-lts";


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

app.post('/api/v1/ssl-request', (req, res) => {
    const data = {
        total_amount: req.body.totalAmount,
        success_url: `${process.env.ROOT}/success`,
        fail_url: `${process.env.ROOT}/fail`,
        cancel_url: `${process.env.ROOT}/cancel`,
        ipn_url: `${process.env.ROOT}/ipn`,
        cus_email: 'customer@example.com',
        total_amount: 100,
        currency: 'BDT',
        tran_id: 'REF123', // use unique tran_id for each api call
        success_url: `${process.env.ROOT}/success`,
        fail_url: `${process.env.ROOT}/fail`,
        cancel_url: `${process.env.ROOT}/cancel`,
        ipn_url: `${process.env.ROOT}/ipn`,
        shipping_method: 'Courier',
        product_name: 'Computer.',
        product_category: 'Electronic',
        product_profile: 'general',
        cus_name: 'Customer Name',
        cus_email: 'customer@example.com',
        cus_add1: 'Dhaka',
        cus_add2: 'Dhaka',
        cus_city: 'Dhaka',
        cus_state: 'Dhaka',
        cus_postcode: '1000',
        cus_country: 'Bangladesh',
        cus_phone: '01711111111',
        cus_fax: '01711111111',
        ship_name: 'Customer Name',
        ship_add1: 'Dhaka',
        ship_add2: 'Dhaka',
        ship_city: 'Dhaka',
        ship_state: 'Dhaka',
        ship_postcode: 1000,
        ship_country: 'Bangladesh',
    };
    const sslcz = new SSLCommerzPayment(process.env.STORE_ID, process.env.STORE_PASS, false)
    sslcz.init(data).then(apiResponse => {
        if (apiResponse?.GatewayPageURL) {
            return res.status(httpStatus.OK).json({ url: apiResponse?.GatewayPageURL });
        } else {
            return res.status(httpStatus.BAD_REQUEST).json({
                success: false,
                error: apiResponse
            });
        }
    });

});

app.post('/success', (req, res) => {
    return res.status(httpStatus.OK).json({
        success: true,
        message: "Payment success",
        data: req.body
    })
});
app.post('/fail', (req, res) => {
    return res.status(httpStatus.NOT_FOUND).json({
        success: false,
        message: "Payment failed",
        data: req.body
    })
});
app.post('/cancel', (req, res) => {
    return res.status(httpStatus.NOT_FOUND).json({
        success: false,
        message: "Payment canceled",
        data: req.body
    })
});
app.post('/ipn', (req, res) => {
    res.send("IPN received")
});


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