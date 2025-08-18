const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware'); // Importar o middleware de upload

router.get('/', productController.getProducts);
router.post('/adicionar', authMiddleware.verifyToken, productController.addProduct);
router.post('/completo', authMiddleware.verifyToken, upload.any(), productController.addCompleteProduct);
router.get('/meus-produtos', authMiddleware.verifyToken, productController.getSellerProducts);
router.put('/:idProduto', authMiddleware.verifyToken, productController.updateProduct);
router.delete('/:idVariacao', authMiddleware.verifyToken, productController.deleteProduct);

module.exports = router;
