import httpStatus from "http-status";
import SSLCommerzPayment from "sslcommerz-lts";
import Transaction from "./transaction.model.js";
import nodemailer from "nodemailer";
import Product from "../product/product.model.js";

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
        tran_id: transactionId,
        shipping_method: 'Courier',
        product_name: req.body.productName || 'Computer',
        product_category: 'Electronic',
        product_profile: 'general',
        cus_name: req.body.shippingData?.cus_name || 'Customer Name',
        cus_phone: req.body.shippingData?.cus_phone || '01711111111',
        cus_email: req.body.shippingData?.cus_email || 'kK9pH@example.com',
        cus_add1: req.body.shippingData?.cus_address || 'Dhaka',
        cus_city: req.body.shippingData?.cus_city || 'Dhaka',
        cus_postcode: req.body.shippingData?.cus_postcode || '1000',
        cus_country: 'Bangladesh',
        ship_name: 'Customer Name',
        ship_add1: 'Dhaka',
        ship_add2: 'Dhaka',
        ship_city: 'Dhaka',
        ship_state: 'Dhaka',
        ship_postcode: 1000,
        ship_country: 'Bangladesh',
    };

    // Save the transaction data in-memory (store in DB or Redis in production)
    transactions[transactionId] = {
        user: req.body.user,
        products: req.body.products,
        totalAmount: req.body.totalAmount,
        paymentType: 'SSLCommerz',
        shippingData: req.body.shippingData,
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
    const { tran_id } = req.query;

    const transactionData = transactions[tran_id];

    if (!transactionData) {
        return res.status(httpStatus.NOT_FOUND).json({
            success: false,
            message: "Transaction not found",
        });
    }

    try {
        // Fetch product details from the database based on product IDs
        const productIds = transactionData.products.map(product => product.productId);
        const productsFromDb = await Product.find({ _id: { $in: productIds } }); // Assuming MongoDB

        const products = productsFromDb.map(dbProduct => {
            const transactionProduct = transactionData.products.find(p => p.productId == dbProduct._id);
            return {
                productId: dbProduct._id,
                name: dbProduct.name,
                image: dbProduct?.images[0], // Assuming the product has an image field
                price: transactionProduct.price,
                quantity: transactionProduct.quantity,
                totalPrice: transactionProduct.price * transactionProduct.quantity,
            };
        });

        // Update each product's salesCount based on the quantity sold
        for (const transactionProduct of transactionData.products) {
            await Product.findByIdAndUpdate(
                transactionProduct.productId,
                { $inc: { salesCount: transactionProduct.quantity } },
                { new: true } // To return the updated document
            );
        }

        const shippingData = {
            name: transactionData.shippingData?.cus_name,
            phone: transactionData.shippingData?.cus_phone,
            address: transactionData.shippingData?.cus_address,
            city: transactionData.shippingData?.cus_city,
            postcode: transactionData.shippingData?.cus_postcode,
            email: transactionData.shippingData?.cus_email
        };

        // Create transaction record in the database
        const result = await Transaction.create({
            user: transactionData.user,
            products,
            totalAmount: transactionData.totalAmount,
            paymentType: transactionData.paymentType,
            shippingData,
            createdAt: new Date(),
        });

        if (!result) {
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: "Failed to create transaction in database",
            });
        }

        // Send an invoice to the user via email
        await sendInvoiceEmail(shippingData.email, products, transactionData.totalAmount, shippingData);

        // Clean up: remove the stored transaction data (since it's processed)
        delete transactions[tran_id];

        // Redirect the user to their purchase dashboard
        return res.status(httpStatus.OK).json({
            success: true,
            message: "Payment successful",
            transactionId: tran_id,
            transactionData: result,
            redirectUrl: `${process.env.FRONTEND_URL}/dashboard/purchase`,
        });

    } catch (error) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "An error occurred while processing the transaction",
            error: error.message
        });
    }
};


// Function to send the invoice email using Nodemailer
// Function to send the invoice email using Nodemailer
const sendInvoiceEmail = async (email, products, totalAmount, shippingData) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    // Generate HTML content for the email
    const productListHtml = products.map(product => {
        return `
            <tr style="border-bottom: 1px solid #ccc;">
                <td style="padding: 10px;">
                    <img src="${product?.image}" alt="${product.name}" style="width: 50px; height: 50px;">
                </td>
                <td style="padding: 10px;">${product.name}</td>
                <td style="padding: 10px;">${product.quantity}</td>
                <td style="padding: 10px;">$${product.price.toFixed(2)}</td>
                <td style="padding: 10px;">$${product.totalPrice.toFixed(2)}</td>
            </tr>
        `;
    }).join('');

    const emailHtml = `
        <div style="font-family: Arial, sans-serif; font-size: 14px; color: #333;">
            <h2 style="text-align: center; color: #007BFF;">Your Purchase Invoice</h2>
            <p>Dear ${shippingData.name},</p>
            <p>Thank you for your purchase! Here are the details of your order:</p>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <thead>
                    <tr style="background-color: #f7f7f7;">
                        <th style="padding: 10px;">Image</th>
                        <th style="padding: 10px;">Product Name</th>
                        <th style="padding: 10px;">Quantity</th>
                        <th style="padding: 10px;">Price</th>
                        <th style="padding: 10px;">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${productListHtml}
                </tbody>
            </table>
            <p><strong>Total Amount Paid:</strong> $${totalAmount.toFixed(2)}</p>
            <p><strong>Shipping Address:</strong></p>
            <p>${shippingData.name}<br>${shippingData.address}, ${shippingData.city}, ${shippingData.postcode}</p>
            <p>If you have any questions, feel free to reply to this email.</p>
            <p>Best regards,<br>Your E-Commerce Team</p>
        </div>
    `;

    // Send the email
    await transporter.sendMail({
        from: process.env.GMAIL_USER,
        to: email,
        subject: 'Your Purchase Invoice',
        html: emailHtml,
    });

    console.log(`Invoice email sent to ${email}`);
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
