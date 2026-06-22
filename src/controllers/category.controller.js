const prisma = require('../config/db');
const activity = require('../services/activityLog');

const categoryController = {
  // 1. VER TODAS (El admin puede pasar ?includeInactive=true para ver las eliminadas)
  getAll: async (req, res) => {
    const { includeInactive } = req.query;
    try {
      const categories = await prisma.category.findMany({
        where: includeInactive === 'true' ? {} : { isActive: true },
        orderBy: { sortOrder: 'asc' },
      });
      return res.json(categories);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Error al obtener las categorías' });
    }
  },

  // 2. VER UNA SOLA POR ID
  getById: async (req, res) => {
    const { id } = req.params;
    try {
      const category = await prisma.category.findUnique({
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

  // 3. AGREGAR / CREAR
  create: async (req, res) => {
    const { nameEs, nameEn, sortOrder } = req.body;
    try {
      // Generar un slug automático basado en el nombre en español (ej: "Cortes Finos" -> "cortes-finos")
      const slug = nameEs
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-');

      const newCategory = await prisma.category.create({
        data: {
          slug,
          nameEs,
          nameEn,
          sortOrder: sortOrder ? parseInt(sortOrder) : 0,
        },
      });
      activity.add('add', 'Agregó una nueva categoría', newCategory.nameEs);
      return res.status(201).json({ message: 'Categoría creada con éxito', category: newCategory });
    } catch (error) {
      console.error(error);
      // Error de unicidad en Prisma (P2002) por si el slug ya existe
      if (error.code === 'P2002') {
        return res.status(400).json({ error: 'Ya existe una categoría con un nombre similar' });
      }
      return res.status(500).json({ error: 'Error al crear la categoría' });
    }
  },

  // 4. EDITAR / ACTUALIZAR
  update: async (req, res) => {
    const { id } = req.params;
    const { nameEs, nameEn, sortOrder } = req.body;
    try {
      const dataToUpdate = { nameEs, nameEn };
      if (sortOrder !== undefined) dataToUpdate.sortOrder = parseInt(sortOrder);

      // Si cambian el nombre en español, actualizamos también el slug
      if (nameEs) {
        dataToUpdate.slug = nameEs
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-');
      }

      const updatedCategory = await prisma.category.update({
        where: { id: parseInt(id) },
        data: dataToUpdate,
      });

      activity.add('edit', 'Actualizó la categoría', updatedCategory.nameEs);
      return res.json({ message: 'Categoría actualizada con éxito', category: updatedCategory });
    } catch (error) {
      console.error(error);
      if (error.code === 'P2025') {
        return res.status(404).json({ message: 'Categoría no encontrada' });
      }
      return res.status(500).json({ error: 'Error al actualizar la categoría' });
    }
  },

  // 5. ELIMINAR (Borrado Lógico / Deshabilitar)
  deleteItem: async (req, res) => {
    const { id } = req.params;
    try {
      const category = await prisma.category.update({
        where: { id: parseInt(id) },
        data: { isActive: false },
      });
      activity.add('delete', 'Eliminó la categoría', category.nameEs);
      return res.json({ message: 'Categoría deshabilitada (eliminada lógicamente)', category });
    } catch (error) {
      console.error(error);
      if (error.code === 'P2025') {
        return res.status(404).json({ message: 'Categoría no encontrada' });
      }
      return res.status(500).json({ error: 'Error al eliminar la categoría' });
    }
  },

  // 6. ELIMINAR DEFINITIVAMENTE (Hard delete)
  hardDeleteItem: async (req, res) => {
    const { id } = req.params;
    try {
      const category = await prisma.category.findUnique({ where: { id: parseInt(id) } });
      if (!category) {
        return res.status(404).json({ message: 'Categoría no encontrada' });
      }
      await prisma.category.delete({ where: { id: parseInt(id) } });
      activity.add('delete', 'Eliminó definitivamente la categoría', category.nameEs);
      return res.json({ message: 'Categoría eliminada permanentemente' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Error al eliminar la categoría' });
    }
  },

  // 7. RESTAURAR (Volver a habilitar)
  restoreItem: async (req, res) => {
    const { id } = req.params;
    try {
      const category = await prisma.category.update({
        where: { id: parseInt(id) },
        data: { isActive: true },
      });
      activity.add('restore', 'Restauró la categoría', category.nameEs);
      return res.json({ message: 'Categoría restaurada con éxito', category });
    } catch (error) {
      console.error(error);
      if (error.code === 'P2025') {
        return res.status(404).json({ message: 'Categoría no encontrada' });
      }
      return res.status(500).json({ error: 'Error al restaurar la categoría' });
    }
  }
};

module.exports = categoryController;