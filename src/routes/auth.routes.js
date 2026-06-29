const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

router.post('/login', authController.login);
router.put('/perfil', authController.updateProfile);

module.exports = router;
