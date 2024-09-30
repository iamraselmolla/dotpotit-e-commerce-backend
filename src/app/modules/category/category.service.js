import Category from "./category.model.js";

const addCategory = async (data) => {
    const category = await Category.create(data);
    return category;
};

export const CategoryServices = { addCategory }