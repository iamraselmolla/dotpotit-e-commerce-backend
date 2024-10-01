import httpStatus from "http-status";
import SSLCommerzPayment from "sslcommerz-lts";
import Transaction from "./transaction.model.js";

// In-memory storage for demonstration (use a database or Redis for production)
const transactions = {};

const paymentCreate = async (req, res) => {
    const transactionId = `REF${Date.now()}`; // Unique transaction ID

    const data = {
        total_amount: req.body.totalAmount,
        success_url: `${process.env.ROOT}/ssl-request/success?tran_id=${transactionId}`,
        fail_url: `${process.env.ROOT}/ssl-request/fail`,
        cancel_url: `${process.env.ROOT}/ssl-request/cancel`,
        ipn_url: `${process.env.ROOT}/ssl-request/ipn`,
        currency: 'BDT',
        tran_id: transactionId, // Unique tran_id for each API call
        shipping_method: 'Courier',
        product_name: req.body.productName || 'Computer',
        product_category: 'Electronic',
        product_profile: 'general',
        cus_name: req.body.shippingData?.cus_name || 'Customer Name',
        cus_phone: req.body.shippingData?.cus_phone || '01711111111',
        cus_add1: req.body.shippingData?.cus_address || 'Dhaka',
        cus_city: req.body.shippingData?.cus_city || 'Dhaka',
        cus_postcode: req.body.shippingData?.cus_postcode || '1000',
        cus_country: 'Bangladesh',
    };

    // Save the transaction data in-memory (store in DB or Redis in production)
    transactions[transactionId] = {
        user: req.body.user,
        products: req.body.products,
        totalAmount: req.body.totalAmount,
        paymentType: 'SSLCommerz', // Payment type based on your logic
        shippingData: req.body.shippingData, // Store shipping details
    };

    const sslcz = new SSLCommerzPayment(process.env.STORE_ID, process.env.STORE_PASS, false);
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
};

const success = async (req, res) => {
    const { tran_id } = req.query; // Extract transaction ID from query

    // Retrieve transaction data from in-memory storage (use DB or Redis in production)
    const transactionData = transactions[tran_id];

    if (!transactionData) {
        return res.status(httpStatus.NOT_FOUND).json({
            success: false,
            message: "Transaction not found",
        });
    }

    // Insert the transaction data into the database
    try {
        // Calculate total prices for each product (if not passed)
        const products = transactionData.products.map(product => ({
            productId: product.productId,
            price: product.price,
            quantity: product.quantity,
            totalPrice: product.price * product.quantity,
        }));

        // Prepare shipping data
        const shippingData = {
            name: transactionData.shippingData?.cus_name,
            phone: transactionData.shippingData?.cus_phone,
            address: transactionData.shippingData?.cus_address,
            city: transactionData.shippingData?.cus_city,
            postcode: transactionData.shippingData?.cus_postcode,
        };

        // Create transaction record in the database
        const result = await Transaction.create({
            user: transactionData.user,
            products,
            totalAmount: transactionData.totalAmount,
            paymentType: transactionData.paymentType,
            shippingData, // Store the shipping data
            createdAt: new Date(),
        });

        if (!result) {
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: "Failed to create transaction in database",
            });
        }

        // Clean up: remove the stored transaction data (since it's processed)
        delete transactions[tran_id];

        // Send success response to the frontend
        return res.status(httpStatus.OK).json({
            success: true,
            message: "Payment successful",
            transactionId: tran_id,
            transactionData: result, // Send created transaction data
        });

    } catch (error) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "An error occurred while processing the transaction",
            error: error.message
        });
    }
};


const cancel = async (req, res) => {
    console.log('Transaction canceled');
    return res.status(httpStatus.OK).json({
        success: false,
        message: "Payment canceled"
    });
};

const fail = async (req, res) => {
    console.log('Transaction failed');
    return res.status(httpStatus.OK).json({
        success: false,
        message: "Payment failed"
    });
};

const ipn = async (req, res) => {
    console.log('IPN received');
    return res.status(httpStatus.OK).json({
        success: true,
        message: "IPN received",
        data: req.body
    });
};

export default { paymentCreate, success, cancel, fail, ipn };
