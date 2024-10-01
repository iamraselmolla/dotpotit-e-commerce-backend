import { model, Schema } from "mongoose";


const transactionSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    products: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
        },
        totalPrice: {
            type: Number,
            required: true,
        },
    }],
    totalAmount: {
        type: Number,
        required: true,
    },
    paymentType: {
        type: String,
        enum: ['SSLCommerz', 'Card', 'Mobile Banking'],
        default: 'SSLCommerz',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

const Transaction = model('Transaction', transactionSchema);

export default Transaction;
