const express = require('express');
const router = express.Router();
const expenseCategoryController = require('../controllers/expenseCategory.controller');

router.get('/', expenseCategoryController.getAll);
router.get('/:id', expenseCategoryController.getById);
router.post('/', expenseCategoryController.create);
router.put('/:id', expenseCategoryController.update);
router.delete('/:id', expenseCategoryController.delete);

module.exports = router;
