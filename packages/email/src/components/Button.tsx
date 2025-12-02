import { Button as EmailButton } from '@react-email/components';

interface ButtonProps {
  href: string;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

export function Button({ href, children, variant = 'primary' }: ButtonProps) {
  const baseStyles = 'rounded-md px-6 py-3 text-center font-semibold no-underline';
  const variantStyles =
    variant === 'primary' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800';

  return (
    <EmailButton href={href} className={`${baseStyles} ${variantStyles}`}>
      {children}
    </EmailButton>
  );
}
