const prisma = require('../config/db');

const authController = {
  login: async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña requeridos' });
    }

    try {
      const user = await prisma.user.findUnique({ where: { email } });

      if (!user || user.password !== password) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }

      return res.json({
        email: user.email,
        name: user.name,
        role: user.role,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Error al iniciar sesión' });
    }
  },
};

module.exports = authController;
