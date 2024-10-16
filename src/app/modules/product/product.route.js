import express from "express";
import { ProductController } from "./product.controller.js";
import upload from "../../shared/multerUpload.js";

const ProductRouter = express.Router();

ProductRouter.post('/create-product', upload, ProductController.createProduct);



ProductRouter.get("/get-products", ProductController.getAllProducts);
ProductRouter.get("/get-product/:id", ProductController.findProductById);
ProductRouter.put("/increment-view-count/:id", ProductController.incrementViewCount);

export default ProductRouter;
