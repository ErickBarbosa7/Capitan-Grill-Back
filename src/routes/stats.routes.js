const express = require('express');
const router = express.Router();
const statsController = require('../controllers/stats.controller');

router.get('/menu-views', statsController.getMenuViews);
router.post('/menu-view', statsController.incrementMenuView);

module.exports = router;
