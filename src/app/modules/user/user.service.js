import User from "./user.model.js";

const createAnUser = async (data) => {
    const user = await User.create(data);
    return user;
};

export const UserServices = { createAnUser }