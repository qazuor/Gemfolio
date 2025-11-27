import { eq } from 'drizzle-orm';

import type { Database } from '../client';
import { categories } from '../schema/categories';
import { slugify } from '../utils';

type CategorySeed = {
  name: string;
  description: string;
  children?: CategorySeed[];
};

const jewelryCategories: CategorySeed[] = [
  {
    name: 'Anillos',
    description:
      'Anillos de compromiso, alianzas y anillos de moda en oro, plata y piedras preciosas.',
    children: [
      {
        name: 'Anillos de Compromiso',
        description: 'Anillos de compromiso con diamantes y piedras preciosas.',
      },
      { name: 'Alianzas', description: 'Alianzas de matrimonio en oro y platino.' },
      { name: 'Anillos de Moda', description: 'Anillos casuales y de tendencia.' },
    ],
  },
  {
    name: 'Collares',
    description: 'Collares, cadenas y colgantes para toda ocasión.',
    children: [
      { name: 'Cadenas', description: 'Cadenas en oro y plata de distintos estilos.' },
      { name: 'Colgantes', description: 'Colgantes con diseños únicos y piedras preciosas.' },
      { name: 'Gargantillas', description: 'Gargantillas elegantes para ocasiones especiales.' },
    ],
  },
  {
    name: 'Pulseras',
    description: 'Pulseras y brazaletes en diversos materiales y estilos.',
    children: [
      { name: 'Brazaletes', description: 'Brazaletes rígidos en oro y plata.' },
      { name: 'Pulseras de Cadena', description: 'Pulseras de eslabones y cadenas.' },
      { name: 'Pulseras con Dijes', description: 'Pulseras personalizables con dijes.' },
    ],
  },
  {
    name: 'Aretes',
    description: 'Aretes y aros para todos los gustos y ocasiones.',
    children: [
      { name: 'Aros', description: 'Aros clásicos y modernos.' },
      { name: 'Aretes Colgantes', description: 'Aretes largos y colgantes elegantes.' },
      { name: 'Studs', description: 'Aretes pequeños y discretos.' },
    ],
  },
  {
    name: 'Relojes',
    description: 'Relojes de lujo y moda para dama y caballero.',
    children: [
      { name: 'Relojes de Dama', description: 'Relojes elegantes para mujer.' },
      { name: 'Relojes de Caballero', description: 'Relojes clásicos y deportivos para hombre.' },
    ],
  },
  {
    name: 'Accesorios',
    description: 'Otros accesorios de joyería y complementos.',
    children: [
      { name: 'Broches', description: 'Broches decorativos.' },
      { name: 'Gemelos', description: 'Gemelos para camisas.' },
      { name: 'Tobilleras', description: 'Tobilleras y pulseras de tobillo.' },
    ],
  },
];

async function createCategory(
  db: Database,
  category: CategorySeed,
  parentId: string | null = null,
  order: number = 0
): Promise<string> {
  const slug = slugify(category.name);

  // Check if category already exists
  const existing = await db.query.categories.findFirst({
    where: eq(categories.slug, slug),
  });

  if (existing) {
    console.log(`  - Category already exists: ${category.name}`);
    return existing.id;
  }

  const result = await db
    .insert(categories)
    .values({
      name: category.name,
      slug,
      description: category.description,
      parentId,
      order,
      status: 'active',
    })
    .returning();

  const newCategory = result[0];
  if (!newCategory) {
    throw new Error(`Failed to create category: ${category.name}`);
  }

  console.log(`  ✓ Created category: ${category.name}`);

  // Create children
  if (category.children) {
    for (const child of category.children) {
      await createCategory(db, child, newCategory.id, category.children.indexOf(child));
    }
  }

  return newCategory.id;
}

export async function seedCategories(db: Database) {
  console.log('📁 Seeding categories...');

  for (const category of jewelryCategories) {
    await createCategory(db, category, null, jewelryCategories.indexOf(category));
  }

  console.log('✅ Categories seeded successfully\n');
}
