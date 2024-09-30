import Category from "./category.model.js";

const addCategory = async (data) => {
    const category = await Category.create(data);
    return category;
};

const getAllCategories = async () => {
    const categories = await Category.find();
    return categories;
};

export const CategoryServices = { addCategory, getAllCategories }