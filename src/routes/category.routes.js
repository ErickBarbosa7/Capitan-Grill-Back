const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');

router.get('/', categoryController.getAll);
router.get('/:id', categoryController.getById);
router.post('/', categoryController.create);
router.put('/:id', categoryController.update);

// DELETE maneja el borrado lógico (isActive: false)
router.delete('/:id', categoryController.deleteItem);

// DELETE /:id/hard maneja el borrado definitivo
router.delete('/:id/hard', categoryController.hardDeleteItem);

// PATCH maneja la restauración (isActive: true)
router.patch('/:id/restore', categoryController.restoreItem);

module.exports = router;