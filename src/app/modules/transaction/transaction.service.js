const getUserAllPurchases = async (user) => {
    const purchases = await Transaction.find({ user: user._id });
    return purchases;
};
export const PurchaseServices = { getUserAllPurchases }