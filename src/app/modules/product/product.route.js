import express from "express"
import { ProductController } from "./product.controller.js";
const ProductRouter = express.Router();

ProductRouter.post("/create-product", ProductController.createProduct);

ProductRouter.get("/get-products", ProductController.getAllProducts);

ProductRouter.get("/get-product/:id", ProductController.findProductById);

export default ProductRouter;