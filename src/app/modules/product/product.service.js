import Product from "./product.model.js";

const createProduct = async (data) => {
    const product = await Product.create(data);
    return product;
}

export const ProductServices = { createProduct }