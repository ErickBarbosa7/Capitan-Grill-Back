const prisma = require('../config/db');

const statsController = {
  incrementMenuView: async (req, res) => {
    try {
      await prisma.pageView.upsert({
        where: { page: 'menu' },
        update: { count: { increment: 1 } },
        create: { page: 'menu', count: 1 },
      });
      return res.json({ success: true });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Error al registrar la visita' });
    }
  },

  getMenuViews: async (req, res) => {
    try {
      const row = await prisma.pageView.findUnique({
        where: { page: 'menu' },
      });
      return res.json({ count: row?.count || 0 });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Error al obtener las visitas' });
    }
  },
};

module.exports = statsController;
