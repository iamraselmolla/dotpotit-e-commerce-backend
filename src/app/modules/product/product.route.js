import express from "express";
import { ProductController } from "./product.controller.js";
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });
const ProductRouter = express.Router();

ProductRouter.post("/create-product", upload.fields([
    { name: 'images', maxCount: 5 },
    { name: 'colors', maxCount: 10 }
]), ProductController.createProduct);

ProductRouter.get("/get-products", ProductController.getAllProducts);
ProductRouter.get("/get-product/:id", ProductController.findProductById);
ProductRouter.put("/increment-view-count/:id", ProductController.incrementViewCount);

export default ProductRouter;
