import Category from '../models/Category.js';

const addCategory = async (req, res) => {
    const { name } = req.body;
    try {
        const newCategory = new Category({ name });
        await newCategory.save();
        res.status(201).json({ message: "Category added successfully", category: newCategory });
    } catch (error) {
        res.status(500).json({ message: "Failed to add category", error: error.message });
    }
};

const getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find();
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch categories", error: error.message });
    }
};

const updateCategory = async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    try {
        const updatedCategory = await Category.findByIdAndUpdate(id, { name }, { new: true });
        res.status(200).json({ message: "Category updated successfully", category: updatedCategory });
    } catch (error) {
        res.status(500).json({ message: "Failed to update category", error: error.message });
    }
};

const deleteCategory = async (req, res) => {
    const { id } = req.params;
    try {
        await Category.findByIdAndDelete(id);
        res.status(200).json({ message: "Category deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete category", error: error.message });
    }
};

export { addCategory, getAllCategories, updateCategory, deleteCategory };