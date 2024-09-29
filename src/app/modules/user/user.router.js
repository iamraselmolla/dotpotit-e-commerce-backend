import express from "express";
import { UserContoller } from "./user.controller.js";
const UserRouter = express.Router();

UserRouter.post("/create-user", UserContoller.createAnUser);


export default UserRouter;
