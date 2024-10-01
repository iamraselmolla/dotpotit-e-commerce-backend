import Transaction from "./transaction.model.js";

const getUserAllPurchases = async (user) => {
    const purchases = await Transaction.find({ user: user });
    return purchases;
};
export const PurchaseServices = { getUserAllPurchases }