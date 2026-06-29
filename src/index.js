const express = require('express');
const cors = require('cors');
require('dotenv').config();

const menuRoutes = require('./routes/menu.routes');
const categoryRoutes = require('./routes/category.routes');
const authRoutes = require('./routes/auth.routes');
const statsRoutes = require('./routes/stats.routes');
const activityRoutes = require('./routes/activity.routes');
const aiRoutes = require('./routes/ai.routes');
const expenseCategoryRoutes = require('./routes/expenseCategory.routes');
const expenseRoutes = require('./routes/expense.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/expense-categories', expenseCategoryRoutes);
app.use('/api/expenses', expenseRoutes);

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor Capitan Grill corriendo en http://localhost:${PORT}`);
});