import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const API_BASE = '/api';

interface CustomerProfile {
  id: string;
  email: string;
  emailVerified: boolean;
  name: string | null;
  image: string | null;
  createdAt: string;
  updatedAt: string;
}

interface UpdateProfileData {
  name?: string;
  image?: string;
}

// Fetch functions
async function fetchCustomerProfile(): Promise<CustomerProfile> {
  const response = await fetch(`${API_BASE}/customer/profile`);
  if (!response.ok) {
    throw new Error('Error al cargar perfil');
  }
  const result = await response.json();
  return result.data;
}

async function updateCustomerProfile(data: UpdateProfileData): Promise<CustomerProfile> {
  const response = await fetch(`${API_BASE}/customer/profile`, {
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

// Query para obtener el perfil del cliente
export function useCustomerProfile() {
  return useQuery<CustomerProfile>({
    queryKey: ['customer-profile'],
    queryFn: fetchCustomerProfile,
  });
}

// Mutation para actualizar el perfil del cliente
export function useUpdateCustomerProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCustomerProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-profile'] });
      toast.success('Perfil actualizado correctamente');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
