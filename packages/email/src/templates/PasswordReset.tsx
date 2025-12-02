import { Section, Text } from '@react-email/components';
import { Button } from '../components/Button';
import { Footer } from '../components/Footer';
import { Header } from '../components/Header';
import { Layout } from '../components/Layout';

interface PasswordResetProps {
  customerName: string;
  resetUrl: string;
  expiresIn?: string;
  storeName?: string;
  logoUrl?: string;
}

export function PasswordReset({
  customerName,
  resetUrl,
  expiresIn = '1 hour',
  storeName = 'Gemfolio',
  logoUrl,
}: PasswordResetProps) {
  return (
    <Layout preview="Reset your password">
      <Header logoUrl={logoUrl} storeName={storeName} />

      <Section className="text-center">
        <Text className="text-2xl font-bold text-gray-800">Reset Your Password</Text>
      </Section>

      <Section className="mt-6">
        <Text className="text-gray-600">Hi {customerName},</Text>
        <Text className="text-gray-600">
          We received a request to reset your password. Click the button below to create a new
          password:
        </Text>
      </Section>

      <Section className="mt-8 text-center">
        <Button href={resetUrl}>Reset Password</Button>
      </Section>

      <Section className="mt-6 rounded-lg bg-yellow-50 p-4">
        <Text className="m-0 text-center text-sm text-yellow-800">
          This link will expire in {expiresIn}.
        </Text>
      </Section>

      <Section className="mt-6">
        <Text className="text-gray-500">
          If you didn't request a password reset, you can safely ignore this email. Your password
          will remain unchanged.
        </Text>
        <Text className="text-gray-500">
          For security reasons, please don't forward this email to anyone.
        </Text>
      </Section>

      <Footer storeName={storeName} />
    </Layout>
  );
}

export default PasswordReset;
