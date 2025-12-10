import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const API_BASE = '/api';

// Types
export interface UserProfile {
  id: string;
  email: string;
  emailVerified: boolean;
  name: string | null;
  image: string | null;
  role: 'customer' | 'admin' | 'super_admin';
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileData {
  name?: string;
  image?: string;
}

// Fetch functions
async function fetchProfile(): Promise<UserProfile> {
  const response = await fetch(`${API_BASE}/admin/profile`);
  if (!response.ok) {
    throw new Error('Error al cargar perfil');
  }
  const result = await response.json();
  return result.data;
}

async function updateProfile(data: UpdateProfileData): Promise<UserProfile> {
  const response = await fetch(`${API_BASE}/admin/profile`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al actualizar perfil');
  }
  const result = await response.json();
  return result.data;
}

// Hooks
export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: fetchProfile,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Perfil actualizado correctamente');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Utility functions
export function getRoleLabel(role: UserProfile['role']): string {
  const labels: Record<UserProfile['role'], string> = {
    customer: 'Cliente',
    admin: 'Administrador',
    super_admin: 'Super Admin',
  };
  return labels[role];
}

export function getRoleColor(
  role: UserProfile['role']
): 'default' | 'secondary' | 'destructive' | 'outline' {
  const colors: Record<UserProfile['role'], 'default' | 'secondary' | 'destructive' | 'outline'> = {
    customer: 'secondary',
    admin: 'default',
    super_admin: 'destructive',
  };
  return colors[role];
}
