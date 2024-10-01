import express from "express";
import UserRouter from "../modules/user/user.router.js";
import CategoryRouter from "../modules/category/category.route.js";
import ProductRouter from "../modules/product/product.route.js";
import transactionRouter from "../modules/transaction/transaction.route.js";
const router = express.Router();
const routerArr = [

    {
        path: "/user",
        router: UserRouter,
    },
    {
        path: "/category",
        router: CategoryRouter,
    },
    {
        path: "/product",
        router: ProductRouter,
    },
    {
        path: "/ssl-request",
        router: transactionRouter
    }
];

routerArr.forEach((singleRouter) =>
    router.use(singleRouter.path, singleRouter.router)
);

export default router;