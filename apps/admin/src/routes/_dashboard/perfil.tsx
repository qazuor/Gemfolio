import { useSession } from '@gemfolio/auth/client';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Separator,
  Skeleton,
} from '@gemfolio/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute } from '@tanstack/react-router';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, Mail, Save, Shield, User } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { PageHeader } from '@/components/shared';
import { getRoleColor, getRoleLabel, useProfile, useUpdateProfile } from '@/hooks/use-profile';

export const Route = createFileRoute('/_dashboard/perfil')({
  component: ProfilePage,
});

const profileSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  image: z.string().url('URL de imagen inválida').optional().or(z.literal('')),
});

type ProfileFormData = z.infer<typeof profileSchema>;

function ProfilePage() {
  const { data: session } = useSession();
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      image: '',
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        name: profile.name || '',
        image: profile.image || '',
      });
    }
  }, [profile, form]);

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return email.slice(0, 2).toUpperCase();
  };

  const onSubmit = (data: ProfileFormData) => {
    updateProfile.mutate({
      name: data.name,
      image: data.image || undefined,
    });
  };

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  const user = profile || session?.user;

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <User className="h-12 w-12 text-muted-foreground" />
        <h2 className="mt-4 text-lg font-semibold">No se pudo cargar el perfil</h2>
        <p className="text-muted-foreground">Intenta recargar la página</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mi Perfil"
        description="Administra tu información personal y preferencias"
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content - Edit Form */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Información Personal</CardTitle>
              <CardDescription>
                Actualiza tu información de perfil. Esta información será visible para otros
                administradores.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre completo</FormLabel>
                        <FormControl>
                          <Input placeholder="Tu nombre" {...field} />
                        </FormControl>
                        <FormDescription>
                          Este es el nombre que se mostrará en tu perfil.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="image"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL de imagen de perfil</FormLabel>
                        <FormControl>
                          <Input placeholder="https://ejemplo.com/mi-foto.jpg" {...field} />
                        </FormControl>
                        <FormDescription>
                          Ingresa la URL de tu imagen de perfil. Debe ser una URL válida.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end">
                    <Button type="submit" disabled={updateProfile.isPending}>
                      <Save className="mr-2 h-4 w-4" />
                      {updateProfile.isPending ? 'Guardando...' : 'Guardar cambios'}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Account Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Información de la Cuenta</CardTitle>
              <CardDescription>
                Detalles de tu cuenta que no pueden ser modificados directamente.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Correo electrónico</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <Badge variant={profile?.emailVerified ? 'default' : 'secondary'}>
                  {profile?.emailVerified ? 'Verificado' : 'Pendiente'}
                </Badge>
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Rol en el sistema</p>
                    <p className="text-sm text-muted-foreground">Determina tus permisos y acceso</p>
                  </div>
                </div>
                <Badge variant={getRoleColor(profile?.role || 'customer')}>
                  {getRoleLabel(profile?.role || 'customer')}
                </Badge>
              </div>

              {profile?.createdAt && (
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Miembro desde</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(profile.createdAt), "dd 'de' MMMM 'de' yyyy", {
                          locale: es,
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Profile Preview */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Vista previa</CardTitle>
              <CardDescription>Así se ve tu perfil actualmente</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center gap-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage
                    src={form.watch('image') || profile?.image || undefined}
                    alt={form.watch('name') || profile?.name || user.email}
                  />
                  <AvatarFallback className="text-2xl">
                    {getInitials(form.watch('name') || profile?.name || null, user.email)}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <p className="text-lg font-semibold">
                    {form.watch('name') || profile?.name || 'Sin nombre'}
                  </p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
                <Badge variant={getRoleColor(profile?.role || 'customer')}>
                  {getRoleLabel(profile?.role || 'customer')}
                </Badge>
              </div>

              <Separator />

              <div className="space-y-2 text-center text-sm text-muted-foreground">
                <p>Los cambios en tu imagen de perfil</p>
                <p>se verán reflejados en toda la aplicación.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-64" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Skeleton className="h-[300px]" />
          <Skeleton className="h-[250px]" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-[300px]" />
        </div>
      </div>
    </div>
  );
}
