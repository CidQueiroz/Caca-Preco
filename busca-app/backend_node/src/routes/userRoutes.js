const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');

// Rotas para completar o cadastro após o registro inicial
// Não precisam de autenticação de token, pois o usuário ainda não está logado
router.post('/client/complete-profile', userController.registrarCliente);
router.post('/seller/complete-profile', userController.registrarVendedor);

// Rota para buscar o perfil do usuário (requer token de login)
router.get('/profile', authMiddleware.verifyToken, userController.obterPerfil);
router.get('/avaliacoes', authMiddleware.verifyToken, userController.getSellerRatings);
router.post('/indicate-seller', authMiddleware.verifyToken, userController.indicateSeller);
router.put('/profile', authMiddleware.verifyToken, userController.updateSellerProfile);
router.post('/suggestions', authMiddleware.verifyToken, userController.submitSuggestion);

module.exports = router;