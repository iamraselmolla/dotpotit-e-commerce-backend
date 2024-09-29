import express from "express";
import UserRouter from "../modules/user/user.router.js";
const router = express.Router();
const routerArr = [

    {
        path: "/user",
        router: UserRouter,
    }
];

routerArr.forEach((singleRouter) =>
    router.use(singleRouter.path, singleRouter.router)
);

export default router;