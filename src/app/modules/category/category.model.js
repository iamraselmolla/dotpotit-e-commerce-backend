import { model, Schema } from "mongoose";

const categorySchema = new Schema({
    name: { type: String, required: true, unique: true },
    description: { type: String },
});

const Category = model('Category', categorySchema);
export default Category;
