const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/cadastro', authController.registrar);
router.post('/login', authController.login);
router.post('/verify-email', authController.verificarEmail);
router.post('/resend-verification', authController.reenviarCodigoVerificacao);


module.exports = router;