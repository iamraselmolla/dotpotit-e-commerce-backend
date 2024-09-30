import { model, Schema } from "mongoose";


const productSchema = new Schema({
    name: { type: String, required: true },
    sku: { type: String, required: true, unique: true },
    price: {
        min: { type: Number, required: true },
        max: { type: Number, required: true },
    },
    features: [{ type: String, required: true }],
    colors: [{
        name: { type: String, required: true },
        price: { type: Number, required: true },
        image: { type: String, required: true } // URL or file path of the image
    }],
    memorySizes: [{ type: String, required: true }],
    gifts: [{
        quantity: { type: Number, required: true },
        gift: { type: String, required: true }
    }],
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true }, // Reference to Category Model
    brand: { type: String, required: true },
    images: [{ type: String, required: true }], // Array of image URLs or file paths
    inStock: { type: Boolean, default: true },
    shippingFrom: { type: String, required: true },
    views: { type: Number, default: 0 }, // For tracking most viewed products
    salesCount: { type: Number, default: 0 }, // For tracking best-selling products
    createdAt: { type: Date, default: Date.now }
});

const Product = model('Product', productSchema);
