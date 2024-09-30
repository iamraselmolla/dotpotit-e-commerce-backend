import express from "express";
import { CategoryController } from "./category.controller.js";

const CategoryRouter = express.Router();

CategoryRouter.post("/create-category", CategoryController.addCategory);

export default CategoryRouter;