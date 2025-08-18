const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/analise', authMiddleware.verifyToken, dashboardController.getAnalysisData);

module.exports = router;
