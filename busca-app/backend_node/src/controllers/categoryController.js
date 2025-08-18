const Category = require('../models/category');

exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.getAll();
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar categorias.' });
    }
};

exports.getAllSubcategories = async (req, res) => {
    try {
        const subcategories = await Category.getAllSubcategories();
        res.status(200).json(subcategories);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar subcategorias.' });
    }
};
