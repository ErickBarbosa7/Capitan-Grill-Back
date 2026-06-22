const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menu.controller');

// Obtener todos los platillos (público / admin)
router.get('/', menuController.getAll);

// Obtener un solo platillo por ID
router.get('/:id', menuController.getById);

// Crear un nuevo platillo con sus imágenes
router.post('/', menuController.create);

// Editar un platillo existente e imágenes
router.put('/:id', menuController.update);

// Alternar disponibilidad (Habilitar/Deshabilitar rápido)
router.patch('/:id/toggle', menuController.toggleAvailability);

// Restaurar un platillo eliminado
router.patch('/:id/restore', menuController.restoreItem);

// Eliminar un platillo permanentemente (hard delete)
router.delete('/:id/hard', menuController.hardDeleteItem);

// Eliminar un platillo (borrado lógico)
router.delete('/:id', menuController.deleteItem);

module.exports = router;