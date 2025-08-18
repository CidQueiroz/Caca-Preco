const express = require('express');
const router = express.Router();
const monitorController = require('../controllers/monitorController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/add-url', authMiddleware.verifyToken, monitorController.addUrlToMonitor);

module.exports = router;
