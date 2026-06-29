const prisma = require('../src/config/db.js');

async function main() {
  console.log('Iniciando el seeding...');

  await prisma.expense.deleteMany({});
  await prisma.expenseCategory.deleteMany({});
  await prisma.menuItemImage.deleteMany({});
  await prisma.menuItem.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.user.deleteMany({});

  // ── Usuario Admin por defecto ──
  await prisma.user.create({
    data: {
      email: 'admin@capitan.com',
      password: 'admin123',
      name: 'Capitán Grill',
      role: 'admin',
    },
  });
  console.log('Admin creado: admin@capitan.com / admin123');

  // ── Categorías ──
  const cortes = await prisma.category.create({
    data: { nameEs: 'Cortes Finos', nameEn: 'Fine Cuts', slug: 'cortes-finos', sortOrder: 1 },
  });
  const extras = await prisma.category.create({
    data: { nameEs: 'Extras', nameEn: 'Extras', slug: 'extras', sortOrder: 2 },
  });
  const bebidas = await prisma.category.create({
    data: { nameEs: 'Bebidas', nameEn: 'Drinks', slug: 'bebidas', sortOrder: 3 },
  });
  console.log('Categorías creadas.');

  // ── Categorías de Gastos ──
  await prisma.expenseCategory.createMany({
    data: [
      { name: 'Bebidas' },
      { name: 'Carnes' },
      { name: 'Limpieza' },
      { name: 'Empaque' },
      { name: 'Gas / Transporte' },
      { name: 'Otros' },
    ],
  });
  console.log('Categorías de gastos creadas.');

  // ── Cortes Finos ──
  const cortesList = [
    { code: 'c01', nombre: 'Rib Eye', descEs: 'Corte jugoso con marmoleo perfecto y sabor intenso.', descEn: 'Juicy cut with perfect marbling and intense flavor.' },
    { code: 'c02', nombre: 'New York', descEs: 'Equilibrio ideal entre suavidad y textura firme.', descEn: 'Ideal balance between tenderness and firm texture.' },
    { code: 'c03', nombre: 'T-Bone', descEs: 'Corte con doble textura: suavidad del filete y sabor del New York.', descEn: 'Cut with dual texture: filet tenderness and New York flavor.' },
    { code: 'c04', nombre: 'Top Sirloin', descEs: 'Corte magro, suave y con excelente sabor.', descEn: 'Lean cut, tender with excellent flavor.' },
    { code: 'c05', nombre: 'Arrachera', descEs: 'Corte tradicional, suave y muy sabroso.', descEn: 'Traditional cut, tender and very tasty.' },
    { code: 'c06', nombre: 'Costillitas', descEs: 'Bites jugosos con todo el sabor del asado.', descEn: 'Juicy bites with all the barbecue flavor.' },
    { code: 'c07', nombre: 'Prime Rib', descEs: 'Corte suave, jugoso y de sabor profundo.', descEn: 'Tender, juicy cut with deep flavor.' },
  ];

  for (const c of cortesList) {
    await prisma.menuItem.create({
      data: {
        categoryId: cortes.id,
        code: c.code,
        nameEs: c.nombre,
        nameEn: c.nombre,
        descriptionEs: c.descEs,
        descriptionEn: c.descEn,
        price: 180.00,
        isAvailable: true,
      },
    });
  }

  // ── Extras ──
  await prisma.menuItem.create({
    data: {
      categoryId: extras.id,
      code: 'e01',
      nameEs: 'Guacamole',
      nameEn: 'Guacamole',
      descriptionEs: 'Aguacate fresco preparado al momento.',
      descriptionEn: 'Fresh avocado prepared on the spot.',
      price: 50.00,
      isAvailable: true,
    },
  });

  // ── Bebidas ──
  await prisma.menuItem.create({
    data: {
      categoryId: bebidas.id,
      code: 'b01',
      nameEs: 'Cerveza',
      nameEn: 'Beer',
      descriptionEs: 'Victoria, Corona, Modelo. En lata pequeña, fría y lista para acompañar tus cortes.',
      descriptionEn: 'Victoria, Corona, Modelo. Small cold can, ready to accompany your cuts.',
      price: 45.00,
      isAvailable: true,
    },
  });

  await prisma.menuItem.create({
    data: {
      categoryId: bebidas.id,
      code: 'b02',
      nameEs: 'Refresco',
      nameEn: 'Soda',
      descriptionEs: 'Coca-Cola. Bebida refrescante ideal para complementar tu comida.',
      descriptionEn: 'Coca-Cola. Refreshing drink ideal to complement your meal.',
      price: 35.00,
      isAvailable: true,
    },
  });

  console.log('Menú creado con éxito.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
