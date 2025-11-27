import { eq } from 'drizzle-orm';

import type { Database } from '../client';
import { categories } from '../schema/categories';
import { productImages, products, productVariants } from '../schema/products';
import { productTags, tags } from '../schema/tags';
import { slugify } from '../utils';

type ProductSeed = {
  name: string;
  categorySlug: string;
  shortDescription: string;
  description: string;
  price: string;
  comparePrice?: string;
  cost?: string;
  sku?: string;
  stock: number;
  isFeatured?: boolean;
  tagSlugs?: string[];
  images: string[];
  hasVariants?: boolean;
  variants?: {
    name: string;
    sku: string;
    price: string;
    stock: number;
    attributes: Record<string, string>;
  }[];
};

// Placeholder image URLs (replace with actual R2 URLs in production)
const placeholderImages = {
  ring: 'https://placehold.co/800x800/B8860B/FFFFFF?text=Anillo',
  necklace: 'https://placehold.co/800x800/B8860B/FFFFFF?text=Collar',
  bracelet: 'https://placehold.co/800x800/B8860B/FFFFFF?text=Pulsera',
  earring: 'https://placehold.co/800x800/B8860B/FFFFFF?text=Arete',
  watch: 'https://placehold.co/800x800/B8860B/FFFFFF?text=Reloj',
};

const sampleProducts: ProductSeed[] = [
  // Anillos
  {
    name: 'Anillo Solitario Diamante',
    categorySlug: 'anillos-de-compromiso',
    shortDescription: 'Elegante anillo de compromiso con diamante solitario',
    description: `
      <p>Descubre la elegancia atemporal con nuestro <strong>Anillo Solitario Diamante</strong>.</p>
      <p>Este exquisito anillo de compromiso presenta un diamante brillante de 0.5 quilates engastado en oro blanco de 18K. Su diseño clásico y sofisticado lo convierte en la elección perfecta para ese momento especial.</p>
      <h3>Características:</h3>
      <ul>
        <li>Diamante natural de 0.5 quilates</li>
        <li>Oro blanco 18K</li>
        <li>Certificado de autenticidad incluido</li>
        <li>Estuche de lujo</li>
      </ul>
    `,
    price: '185000.00',
    comparePrice: '220000.00',
    cost: '95000.00',
    stock: 5,
    isFeatured: true,
    tagSlugs: ['destacado', 'exclusivo'],
    images: [placeholderImages.ring],
    hasVariants: true,
    variants: [
      {
        name: 'Talla 6',
        sku: 'ASD-001-6',
        price: '185000.00',
        stock: 2,
        attributes: { talla: '6' },
      },
      {
        name: 'Talla 7',
        sku: 'ASD-001-7',
        price: '185000.00',
        stock: 2,
        attributes: { talla: '7' },
      },
      {
        name: 'Talla 8',
        sku: 'ASD-001-8',
        price: '185000.00',
        stock: 1,
        attributes: { talla: '8' },
      },
    ],
  },
  {
    name: 'Alianza Clásica Oro',
    categorySlug: 'alianzas',
    shortDescription: 'Alianza de matrimonio en oro 18K',
    description: `
      <p>La <strong>Alianza Clásica Oro</strong> simboliza el amor eterno con su diseño atemporal.</p>
      <p>Fabricada en oro amarillo de 18K con acabado pulido, esta alianza es perfecta para sellar tu compromiso.</p>
    `,
    price: '45000.00',
    cost: '22000.00',
    stock: 15,
    tagSlugs: ['mas-vendido'],
    images: [placeholderImages.ring],
    hasVariants: true,
    variants: [
      {
        name: 'Talla 6',
        sku: 'ACO-001-6',
        price: '45000.00',
        stock: 3,
        attributes: { talla: '6' },
      },
      {
        name: 'Talla 7',
        sku: 'ACO-001-7',
        price: '45000.00',
        stock: 4,
        attributes: { talla: '7' },
      },
      {
        name: 'Talla 8',
        sku: 'ACO-001-8',
        price: '45000.00',
        stock: 4,
        attributes: { talla: '8' },
      },
      {
        name: 'Talla 9',
        sku: 'ACO-001-9',
        price: '45000.00',
        stock: 4,
        attributes: { talla: '9' },
      },
    ],
  },
  // Collares
  {
    name: 'Collar Perlas Naturales',
    categorySlug: 'collares',
    shortDescription: 'Elegante collar de perlas cultivadas',
    description: `
      <p>Un clásico reinventado: nuestro <strong>Collar de Perlas Naturales</strong>.</p>
      <p>Compuesto por perlas cultivadas de agua dulce seleccionadas a mano, este collar añade sofisticación a cualquier atuendo.</p>
    `,
    price: '78000.00',
    comparePrice: '95000.00',
    cost: '35000.00',
    sku: 'CPN-001',
    stock: 8,
    isFeatured: true,
    tagSlugs: ['oferta', 'destacado'],
    images: [placeholderImages.necklace],
  },
  {
    name: 'Cadena Eslabones Plata',
    categorySlug: 'cadenas',
    shortDescription: 'Cadena de plata 925 estilo eslabón',
    description: `
      <p>La <strong>Cadena Eslabones Plata</strong> es versátil y moderna.</p>
      <p>Perfecta para usar sola o con tus colgantes favoritos. Fabricada en plata 925 con acabado brillante.</p>
    `,
    price: '25000.00',
    cost: '10000.00',
    sku: 'CEP-001',
    stock: 20,
    tagSlugs: ['nuevo'],
    images: [placeholderImages.necklace],
  },
  // Pulseras
  {
    name: 'Brazalete Oro Rosa',
    categorySlug: 'brazaletes',
    shortDescription: 'Brazalete rígido en oro rosa 14K',
    description: `
      <p>El <strong>Brazalete Oro Rosa</strong> combina elegancia y modernidad.</p>
      <p>Su diseño rígido en oro rosa de 14K lo hace perfecto para ocasiones especiales o uso diario.</p>
    `,
    price: '120000.00',
    cost: '55000.00',
    sku: 'BOR-001',
    stock: 6,
    isFeatured: true,
    tagSlugs: ['destacado'],
    images: [placeholderImages.bracelet],
  },
  {
    name: 'Pulsera Dijes Plata',
    categorySlug: 'pulseras-con-dijes',
    shortDescription: 'Pulsera personalizable con dijes',
    description: `
      <p>Crea tu historia con nuestra <strong>Pulsera Dijes Plata</strong>.</p>
      <p>Incluye 3 dijes iniciales y puedes agregar más para personalizar tu pulsera única.</p>
    `,
    price: '35000.00',
    comparePrice: '42000.00',
    cost: '15000.00',
    stock: 12,
    tagSlugs: ['oferta', 'mas-vendido'],
    images: [placeholderImages.bracelet],
    hasVariants: true,
    variants: [
      {
        name: '17 cm',
        sku: 'PDP-001-17',
        price: '35000.00',
        stock: 4,
        attributes: { longitud: '17' },
      },
      {
        name: '18 cm',
        sku: 'PDP-001-18',
        price: '35000.00',
        stock: 4,
        attributes: { longitud: '18' },
      },
      {
        name: '19 cm',
        sku: 'PDP-001-19',
        price: '35000.00',
        stock: 4,
        attributes: { longitud: '19' },
      },
    ],
  },
  // Aretes
  {
    name: 'Aros Argollas Oro',
    categorySlug: 'aros',
    shortDescription: 'Aros clásicos tipo argolla en oro 18K',
    description: `
      <p>Los <strong>Aros Argollas Oro</strong> son un básico imprescindible.</p>
      <p>Diseño clásico en oro amarillo de 18K, perfectos para el día a día.</p>
    `,
    price: '55000.00',
    cost: '25000.00',
    sku: 'AAO-001',
    stock: 10,
    tagSlugs: ['mas-vendido'],
    images: [placeholderImages.earring],
  },
  {
    name: 'Aretes Colgantes Esmeralda',
    categorySlug: 'aretes-colgantes',
    shortDescription: 'Aretes colgantes con esmeraldas naturales',
    description: `
      <p>Deslumbra con nuestros <strong>Aretes Colgantes Esmeralda</strong>.</p>
      <p>Esmeraldas colombianas naturales engastadas en oro blanco de 18K.</p>
    `,
    price: '245000.00',
    cost: '120000.00',
    sku: 'ACE-001',
    stock: 3,
    isFeatured: true,
    tagSlugs: ['exclusivo', 'destacado'],
    images: [placeholderImages.earring],
  },
  // Relojes
  {
    name: 'Reloj Clásico Dama',
    categorySlug: 'relojes-de-dama',
    shortDescription: 'Reloj elegante para dama con detalles en cristal',
    description: `
      <p>El <strong>Reloj Clásico Dama</strong> combina funcionalidad con elegancia.</p>
      <p>Caja de acero inoxidable, cristal mineral y correa de cuero genuino.</p>
    `,
    price: '89000.00',
    comparePrice: '110000.00',
    cost: '40000.00',
    sku: 'RCD-001',
    stock: 7,
    tagSlugs: ['oferta', 'nuevo'],
    images: [placeholderImages.watch],
  },
  {
    name: 'Reloj Deportivo Caballero',
    categorySlug: 'relojes-de-caballero',
    shortDescription: 'Reloj deportivo resistente al agua',
    description: `
      <p>El <strong>Reloj Deportivo Caballero</strong> para el hombre activo.</p>
      <p>Resistente al agua hasta 100m, con cronógrafo y luz LED.</p>
    `,
    price: '125000.00',
    cost: '55000.00',
    sku: 'RDC-001',
    stock: 5,
    tagSlugs: ['nuevo'],
    images: [placeholderImages.watch],
  },
];

export async function seedProducts(db: Database) {
  console.log('📦 Seeding products...');

  for (const product of sampleProducts) {
    const slug = slugify(product.name);

    // Check if product already exists
    const existing = await db.query.products.findFirst({
      where: eq(products.slug, slug),
    });

    if (existing) {
      console.log(`  - Product already exists: ${product.name}`);
      continue;
    }

    // Get category
    const category = await db.query.categories.findFirst({
      where: eq(categories.slug, product.categorySlug),
    });

    if (!category) {
      console.log(`  ⚠ Category not found: ${product.categorySlug}, skipping ${product.name}`);
      continue;
    }

    // Create product
    const result = await db
      .insert(products)
      .values({
        name: product.name,
        slug,
        categoryId: category.id,
        shortDescription: product.shortDescription,
        description: product.description,
        price: product.price,
        comparePrice: product.comparePrice,
        cost: product.cost,
        sku: product.sku,
        stock: product.stock,
        hasVariants: product.hasVariants || false,
        isFeatured: product.isFeatured || false,
        status: 'active',
      })
      .returning();

    const newProduct = result[0];
    if (!newProduct) {
      console.log(`  ✗ Failed to create product: ${product.name}`);
      continue;
    }

    // Add images
    for (let i = 0; i < product.images.length; i++) {
      await db.insert(productImages).values({
        productId: newProduct.id,
        url: product.images[i] as string,
        alt: product.name,
        order: i,
        isPrimary: i === 0,
      });
    }

    // Add variants
    if (product.variants) {
      for (const variant of product.variants) {
        await db.insert(productVariants).values({
          productId: newProduct.id,
          name: variant.name,
          sku: variant.sku,
          price: variant.price,
          stock: variant.stock,
          attributes: variant.attributes,
          isDefault: product.variants.indexOf(variant) === 0,
        });
      }
    }

    // Add tags
    if (product.tagSlugs) {
      for (const tagSlug of product.tagSlugs) {
        const tag = await db.query.tags.findFirst({
          where: eq(tags.slug, tagSlug),
        });

        if (tag) {
          await db.insert(productTags).values({
            productId: newProduct.id,
            tagId: tag.id,
          });
        }
      }
    }

    console.log(`  ✓ Created product: ${product.name}`);
  }

  console.log('✅ Products seeded successfully\n');
}
