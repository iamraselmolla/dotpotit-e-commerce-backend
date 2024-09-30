import express from "express";
import UserRouter from "../modules/user/user.router.js";
import CategoryRouter from "../modules/category/category.route.js";
const router = express.Router();
const routerArr = [

    {
        path: "/user",
        router: UserRouter,
    },
    {
        path: "/category",
        router: CategoryRouter,
    }
];

routerArr.forEach((singleRouter) =>
    router.use(singleRouter.path, singleRouter.router)
);

export default router;