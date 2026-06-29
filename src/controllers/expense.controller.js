const prisma = require('../config/db');
const activity = require('../services/activityLog');

const expenseController = {
  getAll: async (req, res) => {
    try {
      const expenses = await prisma.expense.findMany({
        include: { category: true },
        orderBy: { date: 'desc' },
      });
      return res.json(expenses);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Error al obtener los gastos' });
    }
  },

  getById: async (req, res) => {
    const { id } = req.params;
    try {
      const expense = await prisma.expense.findUnique({
        where: { id: parseInt(id) },
        include: { category: true },
      });
      if (!expense) {
        return res.status(404).json({ message: 'Gasto no encontrado' });
      }
      return res.json(expense);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Error al buscar el gasto' });
    }
  },

  create: async (req, res) => {
    const { person, description, amount, date, categoryId } = req.body;
    try {
      const newExpense = await prisma.expense.create({
        data: {
          person,
          description,
          amount: parseFloat(amount),
          date: date ? new Date(date) : new Date(),
          categoryId: parseInt(categoryId),
        },
        include: { category: true },
      });
      activity.add('add', 'Agregó un gasto', `${newExpense.person} - ${newExpense.description}`);
      return res.status(201).json({ message: 'Gasto registrado con éxito', expense: newExpense });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Error al registrar el gasto' });
    }
  },

  update: async (req, res) => {
    const { id } = req.params;
    const { person, description, amount, date, categoryId } = req.body;
    try {
      const dataToUpdate = {};
      if (person !== undefined) dataToUpdate.person = person;
      if (description !== undefined) dataToUpdate.description = description;
      if (amount !== undefined) dataToUpdate.amount = parseFloat(amount);
      if (date !== undefined) dataToUpdate.date = new Date(date);
      if (categoryId !== undefined) dataToUpdate.categoryId = parseInt(categoryId);

      const updatedExpense = await prisma.expense.update({
        where: { id: parseInt(id) },
        data: dataToUpdate,
        include: { category: true },
      });
      activity.add('edit', 'Actualizó un gasto', `${updatedExpense.person} - ${updatedExpense.description}`);
      return res.json({ message: 'Gasto actualizado con éxito', expense: updatedExpense });
    } catch (error) {
      console.error(error);
      if (error.code === 'P2025') {
        return res.status(404).json({ message: 'Gasto no encontrado' });
      }
      return res.status(500).json({ error: 'Error al actualizar el gasto' });
    }
  },

  delete: async (req, res) => {
    const { id } = req.params;
    try {
      const expense = await prisma.expense.findUnique({
        where: { id: parseInt(id) },
      });
      if (!expense) {
        return res.status(404).json({ message: 'Gasto no encontrado' });
      }
      await prisma.expense.delete({ where: { id: parseInt(id) } });
      activity.add('delete', 'Eliminó un gasto', `${expense.person} - ${expense.description}`);
      return res.json({ message: 'Gasto eliminado permanentemente' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Error al eliminar el gasto' });
    }
  }
};

module.exports = expenseController;
