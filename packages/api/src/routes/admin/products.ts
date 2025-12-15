import { db } from '@gemfolio/db';
import {
  addProductImages,
  addProductVariants,
  createProduct,
  deleteProduct,
  deleteProductImage,
  deleteProductVariant,
  disableProductVariants,
  duplicateProduct,
  enableProductVariants,
  getProductById,
  getProductImages,
  getProducts,
  getProductVariants,
  reorderProductImages,
  setDefaultVariant,
  setProductPrimaryImage,
  updateProduct,
  updateProductVariant,
} from '@gemfolio/db/queries';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';

import { errors, paginated, success } from '../../lib/response';
import { adminMiddleware } from '../../middleware/admin';
import { authMiddleware } from '../../middleware/auth';

const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  categoryId: z.string().optional(),
  status: z.enum(['draft', 'active', 'archived']).optional(),
  sortBy: z.enum(['name', 'price', 'createdAt', 'updatedAt']).default('createdAt'),
  sortDirection: z.enum(['asc', 'desc']).default('desc'),
});

const createSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  price: z.string(),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  status: z.enum(['draft', 'active', 'archived']).default('draft'),
  categoryId: z.string().optional(),
  stock: z.number().default(0),
  isFeatured: z.boolean().default(false),
  weight: z.string().optional(),
  dimensions: z.string().optional(),
  material: z.string().optional(),
  careInstructions: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
});

const updateSchema = createSchema.partial();

export const adminProductsRoutes = new Hono()
  // Apply auth and admin middleware to all routes
  .use('*', authMiddleware)
  .use('*', adminMiddleware)

  /**
   * GET /admin/products - List all products with filters
   */
  .get('/', zValidator('query', querySchema), async (c) => {
    const filters = c.req.valid('query');

    try {
      const result = await getProducts(
        db,
        {
          search: filters.search,
          categoryId: filters.categoryId,
          status: filters.status,
        },
        { page: filters.page, limit: filters.limit },
        filters.sortBy,
        filters.sortDirection
      );

      return paginated(c, result.items, {
        page: result.pagination.page,
        limit: result.pagination.limit,
        total: result.pagination.total,
      });
    } catch (err) {
      console.error('Error fetching products:', err);
      return errors.serverError(c);
    }
  })

  /**
   * GET /admin/products/:id - Get product by ID
   */
  .get('/:id', async (c) => {
    const id = c.req.param('id');

    try {
      const product = await getProductById(db, id);

      if (!product) {
        return errors.notFound(c, 'Producto');
      }

      return success(c, product);
    } catch (err) {
      console.error('Error fetching product:', err);
      return errors.serverError(c);
    }
  })

  /**
   * POST /admin/products - Create new product
   */
  .post('/', zValidator('json', createSchema), async (c) => {
    const data = c.req.valid('json');

    try {
      const product = await createProduct(db, data);
      return success(c, product, 201);
    } catch (err) {
      console.error('Error creating product:', err);
      return errors.serverError(c);
    }
  })

  /**
   * PATCH /admin/products/:id - Update product
   */
  .patch('/:id', zValidator('json', updateSchema), async (c) => {
    const id = c.req.param('id');
    const data = c.req.valid('json');

    try {
      const existing = await getProductById(db, id);

      if (!existing) {
        return errors.notFound(c, 'Producto');
      }

      const product = await updateProduct(db, id, data);
      return success(c, product);
    } catch (err) {
      console.error('Error updating product:', err);
      return errors.serverError(c);
    }
  })

  /**
   * DELETE /admin/products/:id - Delete product
   */
  .delete('/:id', async (c) => {
    const id = c.req.param('id');

    try {
      const existing = await getProductById(db, id);

      if (!existing) {
        return errors.notFound(c, 'Producto');
      }

      await deleteProduct(db, id);
      return success(c, { deleted: true });
    } catch (err) {
      console.error('Error deleting product:', err);
      return errors.serverError(c);
    }
  })

  // =====================
  // PRODUCT IMAGES
  // =====================

  /**
   * GET /admin/products/:id/images - Get all images for a product
   */
  .get('/:id/images', async (c) => {
    const id = c.req.param('id');

    try {
      const images = await getProductImages(db, id);
      return success(c, images);
    } catch (err) {
      console.error('Error fetching product images:', err);
      return errors.serverError(c);
    }
  })

  /**
   * POST /admin/products/:id/images - Add images to a product
   */
  .post(
    '/:id/images',
    zValidator(
      'json',
      z.object({
        images: z.array(
          z.object({
            url: z.string().url(),
            alt: z.string().optional(),
            order: z.number().optional(),
            isPrimary: z.boolean().optional(),
          })
        ),
      })
    ),
    async (c) => {
      const id = c.req.param('id');
      const { images } = c.req.valid('json');

      try {
        const existing = await getProductById(db, id);

        if (!existing) {
          return errors.notFound(c, 'Producto');
        }

        const result = await addProductImages(db, id, images);
        return success(c, result, 201);
      } catch (err) {
        console.error('Error adding product images:', err);
        return errors.serverError(c);
      }
    }
  )

  /**
   * DELETE /admin/products/:id/images/:imageId - Delete a product image
   */
  .delete('/:id/images/:imageId', async (c) => {
    const imageId = c.req.param('imageId');

    try {
      const deleted = await deleteProductImage(db, imageId);

      if (!deleted) {
        return errors.notFound(c, 'Imagen');
      }

      return success(c, { deleted: true });
    } catch (err) {
      console.error('Error deleting product image:', err);
      return errors.serverError(c);
    }
  })

  /**
   * PATCH /admin/products/:id/images/:imageId/primary - Set image as primary
   */
  .patch('/:id/images/:imageId/primary', async (c) => {
    const id = c.req.param('id');
    const imageId = c.req.param('imageId');

    try {
      const result = await setProductPrimaryImage(db, id, imageId);

      if (!result) {
        return errors.notFound(c, 'Imagen');
      }

      return success(c, result);
    } catch (err) {
      console.error('Error setting primary image:', err);
      return errors.serverError(c);
    }
  })

  /**
   * PUT /admin/products/:id/images/reorder - Reorder product images
   */
  .put(
    '/:id/images/reorder',
    zValidator(
      'json',
      z.object({
        imageIds: z.array(z.string()),
      })
    ),
    async (c) => {
      const id = c.req.param('id');
      const { imageIds } = c.req.valid('json');

      try {
        await reorderProductImages(db, id, imageIds);
        const images = await getProductImages(db, id);
        return success(c, images);
      } catch (err) {
        console.error('Error reordering product images:', err);
        return errors.serverError(c);
      }
    }
  )

  // =====================
  // PRODUCT VARIANTS
  // =====================

  /**
   * GET /admin/products/:id/variants - Get all variants for a product
   */
  .get('/:id/variants', async (c) => {
    const id = c.req.param('id');

    try {
      const variants = await getProductVariants(db, id);
      return success(c, variants);
    } catch (err) {
      console.error('Error fetching product variants:', err);
      return errors.serverError(c);
    }
  })

  /**
   * POST /admin/products/:id/variants - Add variants to a product
   */
  .post(
    '/:id/variants',
    zValidator(
      'json',
      z.object({
        variants: z.array(
          z.object({
            name: z.string().min(1),
            sku: z.string().min(1),
            price: z.string(),
            comparePrice: z.string().optional(),
            stock: z.number().int().min(0).default(0),
            lowStockThreshold: z.number().int().min(0).default(5),
            attributes: z.record(z.string(), z.string()).default({}),
            image: z.string().url().optional(),
            isDefault: z.boolean().optional(),
          })
        ),
      })
    ),
    async (c) => {
      const id = c.req.param('id');
      const { variants } = c.req.valid('json');

      try {
        const existing = await getProductById(db, id);

        if (!existing) {
          return errors.notFound(c, 'Producto');
        }

        const result = await addProductVariants(db, id, variants);
        return success(c, result, 201);
      } catch (err) {
        console.error('Error adding product variants:', err);
        return errors.serverError(c);
      }
    }
  )

  /**
   * PATCH /admin/products/:id/variants/:variantId - Update a variant
   */
  .patch(
    '/:id/variants/:variantId',
    zValidator(
      'json',
      z.object({
        name: z.string().min(1).optional(),
        sku: z.string().min(1).optional(),
        price: z.string().optional(),
        comparePrice: z.string().nullable().optional(),
        stock: z.number().int().min(0).optional(),
        lowStockThreshold: z.number().int().min(0).optional(),
        attributes: z.record(z.string(), z.string()).optional(),
        image: z.string().url().nullable().optional(),
        isDefault: z.boolean().optional(),
      })
    ),
    async (c) => {
      const variantId = c.req.param('variantId');
      const data = c.req.valid('json');

      try {
        const result = await updateProductVariant(db, variantId, data);

        if (!result) {
          return errors.notFound(c, 'Variante');
        }

        return success(c, result);
      } catch (err) {
        console.error('Error updating product variant:', err);
        return errors.serverError(c);
      }
    }
  )

  /**
   * DELETE /admin/products/:id/variants/:variantId - Delete a variant
   */
  .delete('/:id/variants/:variantId', async (c) => {
    const variantId = c.req.param('variantId');

    try {
      const deleted = await deleteProductVariant(db, variantId);

      if (!deleted) {
        return errors.notFound(c, 'Variante');
      }

      return success(c, { deleted: true });
    } catch (err) {
      console.error('Error deleting product variant:', err);
      return errors.serverError(c);
    }
  })

  /**
   * PATCH /admin/products/:id/variants/:variantId/default - Set variant as default
   */
  .patch('/:id/variants/:variantId/default', async (c) => {
    const id = c.req.param('id');
    const variantId = c.req.param('variantId');

    try {
      const result = await setDefaultVariant(db, id, variantId);

      if (!result) {
        return errors.notFound(c, 'Variante');
      }

      return success(c, result);
    } catch (err) {
      console.error('Error setting default variant:', err);
      return errors.serverError(c);
    }
  })

  /**
   * POST /admin/products/:id/variants/enable - Enable variants for a product
   */
  .post('/:id/variants/enable', async (c) => {
    const id = c.req.param('id');

    try {
      const result = await enableProductVariants(db, id);

      if (!result) {
        return errors.notFound(c, 'Producto');
      }

      return success(c, result);
    } catch (err) {
      console.error('Error enabling variants:', err);
      return errors.serverError(c);
    }
  })

  /**
   * POST /admin/products/:id/variants/disable - Disable variants for a product
   */
  .post('/:id/variants/disable', async (c) => {
    const id = c.req.param('id');

    try {
      const result = await disableProductVariants(db, id);

      if (!result) {
        return errors.notFound(c, 'Producto');
      }

      return success(c, result);
    } catch (err) {
      console.error('Error disabling variants:', err);
      return errors.serverError(c);
    }
  })

  /**
   * POST /admin/products/:id/duplicate - Duplicate a product
   */
  .post('/:id/duplicate', async (c) => {
    const id = c.req.param('id');

    try {
      const duplicated = await duplicateProduct(db, id);

      if (!duplicated) {
        return errors.notFound(c, 'Producto');
      }

      return success(c, duplicated, 201);
    } catch (err) {
      console.error('Error duplicating product:', err);
      return errors.serverError(c);
    }
  });
