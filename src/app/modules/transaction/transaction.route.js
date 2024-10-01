import express from "express";
import transactionController from "./transaction.controller.js";
const transactionRouter = express.Router();

transactionRouter.post("/init", transactionController.paymentCreate);
transactionRouter.post("/success", transactionController.success);
transactionRouter.post("/cancel", transactionController.cancel);
transactionRouter.post("/fail", transactionController.fail);
transactionRouter.post("/ipn", transactionController.ipn);
transactionRouter.get("/order-hisotry/:user", transactionController.getUserAllPurchases);



export default transactionRouter;