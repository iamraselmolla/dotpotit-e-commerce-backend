import Product from "./product.model.js";

const createProduct = async (data) => {
    const product = await Product.create(data);
    return product;
}

const getAllProducts = async () => {
    const products = await Product.find();
    return products;
}

const findProductById = async (id) => {
    const product = await Product.findById(id).populate('category');
    return product;
}
const incrementViewCount = async (id) => {
    const product = await Product.findByIdAndUpdate(
        id,
        { $inc: { views: 1 } }, // Increment views count by 1
        { new: true }
    );

    return product;
}



export const ProductServices = { createProduct, getAllProducts, findProductById, incrementViewCount }