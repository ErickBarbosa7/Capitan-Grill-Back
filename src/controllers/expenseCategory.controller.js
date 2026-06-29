const prisma = require('../config/db');
const activity = require('../services/activityLog');

const expenseCategoryController = {
  getAll: async (req, res) => {
    try {
      const categories = await prisma.expenseCategory.findMany({
        orderBy: { name: 'asc' },
      });
      return res.json(categories);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Error al obtener las categorías de gastos' });
    }
  },

  getById: async (req, res) => {
    const { id } = req.params;
    try {
      const category = await prisma.expenseCategory.findUnique({
        where: { id: parseInt(id) },
      });
      if (!category) {
        return res.status(404).json({ message: 'Categoría no encontrada' });
      }
      return res.json(category);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Error al buscar la categoría' });
    }
  },

  create: async (req, res) => {
    const { name } = req.body;
    try {
      const newCategory = await prisma.expenseCategory.create({
        data: { name },
      });
      activity.add('add', 'Agregó una categoría de gasto', newCategory.name);
      return res.status(201).json({ message: 'Categoría creada con éxito', category: newCategory });
    } catch (error) {
      console.error(error);
      if (error.code === 'P2002') {
        return res.status(400).json({ error: 'Ya existe una categoría con ese nombre' });
      }
      return res.status(500).json({ error: 'Error al crear la categoría' });
    }
  },

  update: async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    try {
      const updatedCategory = await prisma.expenseCategory.update({
        where: { id: parseInt(id) },
        data: { name },
      });
      activity.add('edit', 'Actualizó una categoría de gasto', updatedCategory.name);
      return res.json({ message: 'Categoría actualizada con éxito', category: updatedCategory });
    } catch (error) {
      console.error(error);
      if (error.code === 'P2025') {
        return res.status(404).json({ message: 'Categoría no encontrada' });
      }
      return res.status(500).json({ error: 'Error al actualizar la categoría' });
    }
  },

  delete: async (req, res) => {
    const { id } = req.params;
    try {
      const category = await prisma.expenseCategory.findUnique({
        where: { id: parseInt(id) },
      });
      if (!category) {
        return res.status(404).json({ message: 'Categoría no encontrada' });
      }
      await prisma.expenseCategory.delete({ where: { id: parseInt(id) } });
      activity.add('delete', 'Eliminó una categoría de gasto', category.name);
      return res.json({ message: 'Categoría eliminada permanentemente' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Error al eliminar la categoría' });
    }
  }
};

module.exports = expenseCategoryController;
