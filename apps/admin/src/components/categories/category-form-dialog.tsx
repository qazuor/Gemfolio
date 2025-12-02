import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
} from '@gemfolio/ui';
import { createCategorySchema } from '@gemfolio/validators';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';

import { useCreateCategory, useUpdateCategory } from '@/hooks/use-categories';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  parentId: string | null;
  order: number;
  status: 'active' | 'inactive';
  seoTitle: string | null;
  seoDescription: string | null;
}

interface CategoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category | null;
  categories: Category[];
}

type FormValues = z.infer<typeof createCategorySchema>;

export function CategoryFormDialog({
  open,
  onOpenChange,
  category,
  categories,
}: CategoryFormDialogProps) {
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();

  const form = useForm<FormValues>({
    resolver: zodResolver(createCategorySchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      image: null,
      parentId: null,
      order: 0,
      status: 'active',
      seoTitle: '',
      seoDescription: '',
    },
  });

  // Reset form when dialog opens/closes or category changes
  useEffect(() => {
    if (open) {
      if (category) {
        form.reset({
          name: category.name,
          slug: category.slug,
          description: category.description || '',
          image: category.image,
          parentId: category.parentId,
          order: category.order,
          status: category.status,
          seoTitle: category.seoTitle || '',
          seoDescription: category.seoDescription || '',
        });
      } else {
        form.reset({
          name: '',
          slug: '',
          description: '',
          image: null,
          parentId: null,
          order: 0,
          status: 'active',
          seoTitle: '',
          seoDescription: '',
        });
      }
    }
  }, [open, category, form]);

  const isSubmitting = createCategory.isPending || updateCategory.isPending;

  const onSubmit = (data: FormValues) => {
    if (category) {
      updateCategory.mutate(
        { id: category.id, ...data },
        {
          onSuccess: () => onOpenChange(false),
        }
      );
    } else {
      createCategory.mutate(data, {
        onSuccess: () => onOpenChange(false),
      });
    }
  };

  // Auto-generate slug from name
  const handleNameChange = (name: string) => {
    if (!category && !form.getValues('slug')) {
      const slug = name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      form.setValue('slug', slug);
    }
  };

  // Filter out current category and its descendants from parent options
  const getAvailableParents = () => {
    if (!category) return categories;

    const descendantIds = new Set<string>();
    const findDescendants = (parentId: string) => {
      for (const cat of categories) {
        if (cat.parentId === parentId) {
          descendantIds.add(cat.id);
          findDescendants(cat.id);
        }
      }
    };

    descendantIds.add(category.id);
    findDescendants(category.id);

    return categories.filter((cat) => !descendantIds.has(cat.id));
  };

  const availableParents = getAvailableParents();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{category ? 'Editar categoría' : 'Nueva categoría'}</DialogTitle>
          <DialogDescription>
            {category
              ? 'Modifica los datos de la categoría'
              : 'Crea una nueva categoría para organizar tus productos'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Tabs defaultValue="general" className="space-y-4">
              <TabsList>
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="seo">SEO</TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Anillos"
                          onChange={(e) => {
                            field.onChange(e);
                            handleNameChange(e.target.value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="anillos" />
                      </FormControl>
                      <FormDescription>URL amigable de la categoría</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="parentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoría padre</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(value === 'none' ? null : value)}
                        defaultValue={field.value || 'none'}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sin categoría padre" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">Sin categoría padre</SelectItem>
                          {availableParents.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Opcional: selecciona una categoría padre para crear subcategorías
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Descripción de la categoría" rows={3} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="image"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL de imagen</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value || ''}
                          placeholder="https://ejemplo.com/imagen.jpg"
                        />
                      </FormControl>
                      <FormDescription>URL de la imagen de la categoría</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Categoría activa</FormLabel>
                        <FormDescription>
                          Las categorías inactivas no se muestran en la tienda
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value === 'active'}
                          onCheckedChange={(checked) =>
                            field.onChange(checked ? 'active' : 'inactive')
                          }
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="seo" className="space-y-4">
                <FormField
                  control={form.control}
                  name="seoTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título SEO</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder={form.watch('name')} />
                      </FormControl>
                      <FormDescription>{field.value?.length || 0}/70 caracteres</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="seoDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meta descripción</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder={form.watch('description') || ''}
                          rows={3}
                        />
                      </FormControl>
                      <FormDescription>{field.value?.length || 0}/160 caracteres</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="rounded-lg border p-4">
                  <p className="text-sm font-medium mb-2">Vista previa en Google</p>
                  <div className="space-y-1">
                    <p className="text-blue-600 text-lg">
                      {form.watch('seoTitle') || form.watch('name') || 'Título de la categoría'}
                    </p>
                    <p className="text-green-700 text-sm">
                      tutienda.com/categoria/{form.watch('slug') || 'slug-de-categoria'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {form.watch('seoDescription') ||
                        form.watch('description') ||
                        'Descripción de la categoría...'}
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Guardando...' : category ? 'Guardar cambios' : 'Crear categoría'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
