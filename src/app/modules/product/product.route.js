import express from "express"
import { ProductController } from "./product.controller.js";
const ProductRouter = express.Router();

ProductRouter.post("/create-product", ProductController.createProduct);

export default ProductRouter;