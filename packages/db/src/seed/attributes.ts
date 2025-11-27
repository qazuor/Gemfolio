import { eq } from 'drizzle-orm';

import type { Database } from '../client';
import type { AttributeValue } from '../schema/attributes';
import { attributes, categoryAttributes } from '../schema/attributes';
import { categories } from '../schema/categories';
import { slugify } from '../utils';

type AttributeSeed = {
  name: string;
  type: 'select' | 'color' | 'size' | 'text';
  values: AttributeValue[];
  description?: string;
  categories?: string[]; // Category slugs to associate with
};

const jewelryAttributes: AttributeSeed[] = [
  {
    name: 'Material',
    type: 'select',
    description: 'Material principal de la joya',
    values: [
      { value: 'oro-18k', label: 'Oro 18K', order: 1 },
      { value: 'oro-14k', label: 'Oro 14K', order: 2 },
      { value: 'oro-blanco', label: 'Oro Blanco', order: 3 },
      { value: 'oro-rosa', label: 'Oro Rosa', order: 4 },
      { value: 'plata-925', label: 'Plata 925', order: 5 },
      { value: 'platino', label: 'Platino', order: 6 },
      { value: 'acero-inoxidable', label: 'Acero Inoxidable', order: 7 },
    ],
    categories: ['anillos', 'collares', 'pulseras', 'aretes'],
  },
  {
    name: 'Talla de Anillo',
    type: 'size',
    description: 'Talla del anillo según estándar internacional',
    values: [
      { value: '5', label: '5', order: 1 },
      { value: '6', label: '6', order: 2 },
      { value: '7', label: '7', order: 3 },
      { value: '8', label: '8', order: 4 },
      { value: '9', label: '9', order: 5 },
      { value: '10', label: '10', order: 6 },
      { value: '11', label: '11', order: 7 },
      { value: '12', label: '12', order: 8 },
    ],
    categories: ['anillos', 'anillos-de-compromiso', 'alianzas', 'anillos-de-moda'],
  },
  {
    name: 'Longitud de Cadena',
    type: 'size',
    description: 'Longitud de la cadena en centímetros',
    values: [
      { value: '40', label: '40 cm', order: 1 },
      { value: '45', label: '45 cm', order: 2 },
      { value: '50', label: '50 cm', order: 3 },
      { value: '55', label: '55 cm', order: 4 },
      { value: '60', label: '60 cm', order: 5 },
    ],
    categories: ['collares', 'cadenas', 'colgantes', 'gargantillas'],
  },
  {
    name: 'Longitud de Pulsera',
    type: 'size',
    description: 'Longitud de la pulsera en centímetros',
    values: [
      { value: '16', label: '16 cm', order: 1 },
      { value: '17', label: '17 cm', order: 2 },
      { value: '18', label: '18 cm', order: 3 },
      { value: '19', label: '19 cm', order: 4 },
      { value: '20', label: '20 cm', order: 5 },
      { value: '21', label: '21 cm', order: 6 },
    ],
    categories: ['pulseras', 'brazaletes', 'pulseras-de-cadena', 'pulseras-con-dijes'],
  },
  {
    name: 'Piedra Principal',
    type: 'select',
    description: 'Tipo de piedra preciosa o semipreciosa',
    values: [
      { value: 'diamante', label: 'Diamante', order: 1 },
      { value: 'rubi', label: 'Rubí', order: 2 },
      { value: 'esmeralda', label: 'Esmeralda', order: 3 },
      { value: 'zafiro', label: 'Zafiro', order: 4 },
      { value: 'amatista', label: 'Amatista', order: 5 },
      { value: 'topacio', label: 'Topacio', order: 6 },
      { value: 'perla', label: 'Perla', order: 7 },
      { value: 'circonia', label: 'Circonia', order: 8 },
      { value: 'sin-piedra', label: 'Sin piedra', order: 9 },
    ],
    categories: ['anillos', 'anillos-de-compromiso', 'collares', 'colgantes', 'aretes'],
  },
  {
    name: 'Color del Metal',
    type: 'color',
    description: 'Color del metal de la joya',
    values: [
      { value: 'dorado', label: 'Dorado', color: '#FFD700', order: 1 },
      { value: 'plateado', label: 'Plateado', color: '#C0C0C0', order: 2 },
      { value: 'rosa', label: 'Oro Rosa', color: '#B76E79', order: 3 },
      { value: 'negro', label: 'Negro', color: '#2C2C2C', order: 4 },
      { value: 'bicolor', label: 'Bicolor', color: '#DAA520', order: 5 },
    ],
    categories: ['anillos', 'collares', 'pulseras', 'aretes', 'relojes'],
  },
  {
    name: 'Estilo',
    type: 'select',
    description: 'Estilo de la joya',
    values: [
      { value: 'clasico', label: 'Clásico', order: 1 },
      { value: 'moderno', label: 'Moderno', order: 2 },
      { value: 'vintage', label: 'Vintage', order: 3 },
      { value: 'minimalista', label: 'Minimalista', order: 4 },
      { value: 'bohemio', label: 'Bohemio', order: 5 },
      { value: 'elegante', label: 'Elegante', order: 6 },
    ],
    categories: ['anillos', 'collares', 'pulseras', 'aretes'],
  },
  {
    name: 'Género',
    type: 'select',
    description: 'Género del reloj',
    values: [
      { value: 'dama', label: 'Dama', order: 1 },
      { value: 'caballero', label: 'Caballero', order: 2 },
      { value: 'unisex', label: 'Unisex', order: 3 },
    ],
    categories: ['relojes', 'relojes-de-dama', 'relojes-de-caballero'],
  },
];

export async function seedAttributes(db: Database) {
  console.log('💎 Seeding attributes...');

  for (const attr of jewelryAttributes) {
    const slug = slugify(attr.name);

    // Check if attribute already exists
    const existing = await db.query.attributes.findFirst({
      where: eq(attributes.slug, slug),
    });

    let attributeId: string;

    if (!existing) {
      const result = await db
        .insert(attributes)
        .values({
          name: attr.name,
          slug,
          type: attr.type,
          values: attr.values,
          description: attr.description,
        })
        .returning();

      const newAttribute = result[0];
      if (!newAttribute) {
        throw new Error(`Failed to create attribute: ${attr.name}`);
      }

      attributeId = newAttribute.id;
      console.log(`  ✓ Created attribute: ${attr.name}`);
    } else {
      attributeId = existing.id;
      console.log(`  - Attribute already exists: ${attr.name}`);
    }

    // Associate with categories
    if (attr.categories) {
      for (const categorySlug of attr.categories) {
        const category = await db.query.categories.findFirst({
          where: eq(categories.slug, categorySlug),
        });

        if (category) {
          // Check if association already exists
          const existingAssoc = await db.query.categoryAttributes.findFirst({
            where: (ca, { and, eq: eqOp }) =>
              and(eqOp(ca.categoryId, category.id), eqOp(ca.attributeId, attributeId)),
          });

          if (!existingAssoc) {
            await db.insert(categoryAttributes).values({
              categoryId: category.id,
              attributeId: attributeId,
              required: 0,
              order: attr.categories.indexOf(categorySlug),
            });
          }
        }
      }
    }
  }

  console.log('✅ Attributes seeded successfully\n');
}
