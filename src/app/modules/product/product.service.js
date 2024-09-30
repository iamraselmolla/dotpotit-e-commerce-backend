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

export const ProductServices = { createProduct, getAllProducts, findProductById }