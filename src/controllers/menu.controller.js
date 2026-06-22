const prisma = require('../config/db');
const activity = require('../services/activityLog');

const menuController = {
  // 1. OBTENER TODOS LOS PLATILLOS (Incluyendo imágenes y categoría)
  getAll: async (req, res) => {
    const { includeInactive } = req.query;
    try {
      const items = await prisma.menuItem.findMany({
        where: includeInactive === 'true' ? {} : { isActive: true },
        include: {
          category: true,
          images: true,
        },
        orderBy: {
          code: 'asc',
        },
      });
      return res.json(items);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Error al obtener el menú' });
    }
  },

  // 2. OBTENER UNO SOLO POR ID
  getById: async (req, res) => {
    const { id } = req.params;
    try {
      const item = await prisma.menuItem.findUnique({
        where: { id: parseInt(id) },
        include: {
          category: true,
          images: true,
        },
      });

      if (!item) {
        return res.status(404).json({ message: 'Platillo no encontrado' });
      }
      return res.json(item);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Error al buscar el platillo' });
    }
  },

  // 3. CREAR PLATILLO CON IMÁGENES (Transacción manejada por Prisma)
  create: async (req, res) => {
    const { categoryId, code, nameEs, nameEn, descriptionEs, descriptionEn, price, images } = req.body;
    
    try {
      // Prisma permite crear el elemento principal y sus relaciones (imágenes) en una sola operación transaccional
      const newItem = await prisma.menuItem.create({
        data: {
          categoryId: categoryId ? parseInt(categoryId) : null,
          code,
          nameEs,
          nameEn,
          descriptionEs,
          descriptionEn,
          price: parseFloat(price),
          images: {
            create: images ? images.map(img => ({
              url: img.url,
              isPrimary: img.isPrimary || false
            })) : []
          }
        },
        include: {
          images: true // Queremos que la respuesta nos devuelva el platillo con las imágenes ya creadas
        }
      });

      activity.add('add', 'Agregó un nuevo platillo', newItem.nameEs);
      return res.status(201).json({ message: 'Creado con éxito', item: newItem });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Error al crear el platillo' });
    }
  },

  // 4. EDITAR / ACTUALIZAR
  update: async (req, res) => {
    const { id } = req.params;
    const { categoryId, code, nameEs, nameEn, descriptionEs, descriptionEn, price, images } = req.body;

    try {
      // Usamos una transacción explícita de Prisma si necesitamos borrar imágenes viejas e insertar nuevas
      const updatedItem = await prisma.$transaction(async (tx) => {
        
        // Si vienen imágenes nuevas en el request, borramos las anteriores
        if (images) {
          await tx.menuItemImage.deleteMany({
            where: { menuItemId: parseInt(id) }
          });
        }

        // Actualizamos el platillo
        return await tx.menuItem.update({
          where: { id: parseInt(id) },
          data: {
            categoryId: categoryId ? parseInt(categoryId) : undefined,
            code,
            nameEs,
            nameEn,
            descriptionEs,
            descriptionEn,
            price: price ? parseFloat(price) : undefined,
            // Si mandamos imágenes nuevas, las creamos. Si no, no hacemos nada.
            images: images ? {
              create: images.map(img => ({
                url: img.url,
                isPrimary: img.isPrimary || false
              }))
            } : undefined
          },
          include: {
            images: true
          }
        });
      });

      activity.add('edit', 'Actualizó el platillo', updatedItem.nameEs);
      return res.json({ message: 'Actualizado con éxito', item: updatedItem });
    } catch (error) {
      console.error(error);
      // Prisma tira un error específico (P2025) si el registro no existe
      if (error.code === 'P2025') {
        return res.status(404).json({ message: 'Platillo no encontrado' });
      }
      return res.status(500).json({ error: 'Error al actualizar el platillo' });
    }
  },

  // 5. HABILITAR / DESHABILITAR (PATCH rápido)
  toggleAvailability: async (req, res) => {
    const { id } = req.params;
    const { isAvailable } = req.body; 

    try {
      const item = await prisma.menuItem.update({
        where: { id: parseInt(id) },
        data: { isAvailable: Boolean(isAvailable) },
      });
      
      activity.add(item.isAvailable ? 'show' : 'hide', item.isAvailable ? 'Mostró el platillo' : 'Ocultó el platillo', item.nameEs);
      return res.json({ message: 'Estado actualizado', item });
    } catch (error) {
      console.error(error);
      if (error.code === 'P2025') {
        return res.status(404).json({ message: 'Platillo no encontrado' });
      }
      return res.status(500).json({ error: 'Error al cambiar disponibilidad' });
    }
  },

  // 6. ELIMINAR (Borrado lógico)
  deleteItem: async (req, res) => {
    const { id } = req.params;
    try {
      const item = await prisma.menuItem.update({
        where: { id: parseInt(id) },
        data: { isActive: false },
      });
      activity.add('delete', 'Eliminó el platillo', item.nameEs);
      return res.json({ message: 'Platillo eliminado correctamente', item });
    } catch (error) {
      console.error(error);
      if (error.code === 'P2025') {
        return res.status(404).json({ message: 'Platillo no encontrado' });
      }
      return res.status(500).json({ error: 'Error al eliminar el platillo' });
    }
  },

  // 7. ELIMINAR DEFINITIVAMENTE (Hard delete)
  hardDeleteItem: async (req, res) => {
    const { id } = req.params;
    try {
      const item = await prisma.menuItem.findUnique({ where: { id: parseInt(id) } });
      if (!item) {
        return res.status(404).json({ message: 'Platillo no encontrado' });
      }
      await prisma.menuItem.delete({ where: { id: parseInt(id) } });
      activity.add('delete', 'Eliminó definitivamente el platillo', item.nameEs);
      return res.json({ message: 'Platillo eliminado permanentemente' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Error al eliminar el platillo' });
    }
  },

  // 8. RESTAURAR (Volver a activar)
  restoreItem: async (req, res) => {
    const { id } = req.params;
    try {
      const item = await prisma.menuItem.update({
        where: { id: parseInt(id) },
        data: { isActive: true, isAvailable: true },
      });
      activity.add('restore', 'Restauró el platillo', item.nameEs);
      return res.json({ message: 'Platillo restaurado con éxito', item });
    } catch (error) {
      console.error(error);
      if (error.code === 'P2025') {
        return res.status(404).json({ message: 'Platillo no encontrado' });
      }
      return res.status(500).json({ error: 'Error al restaurar el platillo' });
    }
  }
};

module.exports = menuController;