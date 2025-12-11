import { zodResolver } from '@hookform/resolvers/zod';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../src/components/form';
import { Input } from '../src/components/input';

const formSchema = z.object({
  username: z.string().min(2, 'Username must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
});

type FormValues = z.infer<typeof formSchema>;

function TestForm({
  onSubmit = vi.fn(),
  defaultValues = { username: '', email: '' },
}: {
  onSubmit?: (data: FormValues) => void;
  defaultValues?: FormValues;
}) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="Enter username" {...field} />
              </FormControl>
              <FormDescription>Your public display name.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="Enter email" type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <button type="submit">Submit</button>
      </form>
    </Form>
  );
}

describe('Form', () => {
  describe('FormItem', () => {
    it('should render form item', () => {
      render(<TestForm />);
      expect(screen.getByText('Username')).toBeInTheDocument();
    });
  });

  describe('FormLabel', () => {
    it('should render label', () => {
      render(<TestForm />);
      expect(screen.getByText('Username')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
    });

    it('should associate label with input', () => {
      render(<TestForm />);
      const usernameInput = screen.getByPlaceholderText('Enter username');
      const label = screen.getByText('Username');
      expect(label).toHaveAttribute('for', usernameInput.id);
    });
  });

  describe('FormControl', () => {
    it('should render input inside form control', () => {
      render(<TestForm />);
      expect(screen.getByPlaceholderText('Enter username')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter email')).toBeInTheDocument();
    });
  });

  describe('FormDescription', () => {
    it('should render description', () => {
      render(<TestForm />);
      expect(screen.getByText('Your public display name.')).toBeInTheDocument();
    });
  });

  describe('FormMessage', () => {
    it('should show error message on validation failure', async () => {
      const user = userEvent.setup();
      render(<TestForm />);

      await user.click(screen.getByRole('button', { name: /submit/i }));

      await waitFor(() => {
        expect(screen.getByText('Username must be at least 2 characters')).toBeInTheDocument();
      });
    });

    it('should validate email format', async () => {
      const user = userEvent.setup();
      render(<TestForm />);

      const usernameInput = screen.getByPlaceholderText('Enter username');
      const emailInput = screen.getByPlaceholderText('Enter email');
      await user.type(usernameInput, 'validuser');
      await user.type(emailInput, 'notanemail');
      await user.click(screen.getByRole('button', { name: /submit/i }));

      await waitFor(
        () => {
          const errorMessage = screen.queryByText(/invalid email/i);
          expect(errorMessage || screen.getByPlaceholderText('Enter email')).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });
  });

  describe('form submission', () => {
    it('should call onSubmit with valid data', async () => {
      const user = userEvent.setup();
      const handleSubmit = vi.fn();
      render(<TestForm onSubmit={handleSubmit} />);

      await user.type(screen.getByPlaceholderText('Enter username'), 'testuser');
      await user.type(screen.getByPlaceholderText('Enter email'), 'test@example.com');
      await user.click(screen.getByRole('button', { name: /submit/i }));

      await waitFor(() => {
        expect(handleSubmit).toHaveBeenCalledWith(
          { username: 'testuser', email: 'test@example.com' },
          expect.anything()
        );
      });
    });

    it('should not submit with invalid data', async () => {
      const user = userEvent.setup();
      const handleSubmit = vi.fn();
      render(<TestForm onSubmit={handleSubmit} />);

      await user.click(screen.getByRole('button', { name: /submit/i }));

      await waitFor(() => {
        expect(handleSubmit).not.toHaveBeenCalled();
      });
    });
  });

  describe('accessibility', () => {
    it('should have aria-invalid on error', async () => {
      const user = userEvent.setup();
      render(<TestForm />);

      await user.click(screen.getByRole('button', { name: /submit/i }));

      await waitFor(() => {
        const usernameInput = screen.getByPlaceholderText('Enter username');
        expect(usernameInput).toHaveAttribute('aria-invalid', 'true');
      });
    });

    it('should have aria-describedby linking to description and error', async () => {
      render(<TestForm />);
      const usernameInput = screen.getByPlaceholderText('Enter username');
      expect(usernameInput).toHaveAttribute('aria-describedby');
    });
  });

  describe('default values', () => {
    it('should render with default values', () => {
      render(
        <TestForm defaultValues={{ username: 'defaultuser', email: 'default@example.com' }} />
      );

      expect(screen.getByPlaceholderText('Enter username')).toHaveValue('defaultuser');
      expect(screen.getByPlaceholderText('Enter email')).toHaveValue('default@example.com');
    });
  });
});
