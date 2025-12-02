import {
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@gemfolio/ui';
import { createFileRoute } from '@tanstack/react-router';
import {
  ChevronDown,
  ChevronRight,
  Edit,
  Folder,
  MoreHorizontal,
  Plus,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { CategoryFormDialog } from '@/components/categories/category-form-dialog';
import { ConfirmDialog, EmptyState, PageHeader } from '@/components/shared';
import { useCategories, useDeleteCategory } from '@/hooks/use-categories';

export const Route = createFileRoute('/_dashboard/categorias/')({
  component: CategoriesPage,
});

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
  productCount?: number;
  children?: Category[];
}

function CategoriesPage() {
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const { data: categories, isLoading } = useCategories();
  const deleteCategory = useDeleteCategory();

  const handleDelete = () => {
    if (deleteId) {
      deleteCategory.mutate(deleteId, {
        onSuccess: () => setDeleteId(null),
      });
    }
  };

  const handleOpenCreate = () => {
    setEditCategory(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (category: Category) => {
    setEditCategory(category);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditCategory(null);
  };

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Build tree structure from flat categories
  const buildTree = (items: Category[]): Category[] => {
    const map = new Map<string, Category>();
    const roots: Category[] = [];

    // First pass: create map with children arrays
    for (const item of items) {
      map.set(item.id, { ...item, children: [] });
    }

    // Second pass: build tree
    for (const item of items) {
      const node = map.get(item.id)!;
      if (item.parentId && map.has(item.parentId)) {
        map.get(item.parentId)!.children!.push(node);
      } else {
        roots.push(node);
      }
    }

    // Sort by order
    const sortByOrder = (a: Category, b: Category) => a.order - b.order;
    roots.sort(sortByOrder);
    for (const node of map.values()) {
      node.children?.sort(sortByOrder);
    }

    return roots;
  };

  const tree = categories ? buildTree(categories) : [];

  const renderCategory = (category: Category, level: number = 0) => {
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expandedIds.has(category.id);

    return (
      <div key={category.id}>
        <div
          className="flex items-center gap-2 py-2 px-3 hover:bg-muted/50 rounded-lg group"
          style={{ paddingLeft: `${level * 24 + 12}px` }}
        >
          {hasChildren ? (
            <button
              type="button"
              onClick={() => toggleExpand(category.id)}
              className="p-0.5 hover:bg-muted rounded"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
          ) : (
            <span className="w-5" />
          )}

          <div className="h-8 w-8 rounded bg-muted flex items-center justify-center overflow-hidden">
            {category.image ? (
              <img
                src={category.image}
                alt={category.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <Folder className="h-4 w-4 text-muted-foreground" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{category.name}</p>
            <p className="text-xs text-muted-foreground truncate">{category.slug}</p>
          </div>

          {category.productCount !== undefined && (
            <span className="text-sm text-muted-foreground">{category.productCount} productos</span>
          )}

          <Badge variant={category.status === 'active' ? 'default' : 'secondary'}>
            {category.status === 'active' ? 'Activa' : 'Inactiva'}
          </Badge>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Acciones</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleOpenEdit(category)}>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => setDeleteId(category.id)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {hasChildren && isExpanded && (
          <div>{category.children!.map((child) => renderCategory(child, level + 1))}</div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div>
        <PageHeader
          title="Categorías"
          description="Organiza tus productos en categorías"
          actions={
            <Button disabled>
              <Plus className="mr-2 h-4 w-4" />
              Nueva categoría
            </Button>
          }
        />
        <div className="animate-pulse space-y-2">
          {['skeleton-1', 'skeleton-2', 'skeleton-3', 'skeleton-4', 'skeleton-5'].map((id) => (
            <div key={id} className="h-14 bg-muted rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Categorías"
        description="Organiza tus productos en categorías"
        actions={
          <Button onClick={handleOpenCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva categoría
          </Button>
        }
      />

      {tree.length === 0 ? (
        <EmptyState
          title="No hay categorías"
          description="Crea tu primera categoría para organizar tus productos"
          action={{
            label: 'Crear categoría',
            onClick: handleOpenCreate,
          }}
        />
      ) : (
        <div className="border rounded-lg divide-y">
          {tree.map((category) => renderCategory(category))}
        </div>
      )}

      <CategoryFormDialog
        open={isFormOpen}
        onOpenChange={handleCloseForm}
        category={editCategory}
        categories={categories || []}
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Eliminar categoría"
        description="¿Estás seguro de que deseas eliminar esta categoría? Los productos asociados quedarán sin categoría."
        confirmLabel="Eliminar"
        variant="destructive"
        onConfirm={handleDelete}
        isLoading={deleteCategory.isPending}
      />
    </div>
  );
}
