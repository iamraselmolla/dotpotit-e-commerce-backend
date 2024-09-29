import express from "express";
import { UserController } from "./user.controller.js";
const UserRouter = express.Router();

UserRouter.post("/create-user", UserController.createAnUser);
UserRouter.post('/login', UserController.loginUser);



export default UserRouter;
