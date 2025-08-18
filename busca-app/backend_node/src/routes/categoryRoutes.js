const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

router.get('/categories', categoryController.getAllCategories);
router.get('/subcategories', categoryController.getAllSubcategories);

module.exports = router;
