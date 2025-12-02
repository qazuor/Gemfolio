import { Section, Text } from '@react-email/components';
import { Button } from '../components/Button';
import { Footer } from '../components/Footer';
import { Header } from '../components/Header';
import { Layout } from '../components/Layout';

interface WelcomeEmailProps {
  customerName: string;
  shopUrl: string;
  storeName?: string;
  logoUrl?: string;
}

export function WelcomeEmail({
  customerName,
  shopUrl,
  storeName = 'Gemfolio',
  logoUrl,
}: WelcomeEmailProps) {
  return (
    <Layout preview={`Welcome to ${storeName}!`}>
      <Header logoUrl={logoUrl} storeName={storeName} />

      <Section className="text-center">
        <Text className="text-3xl font-bold text-gray-800">Welcome to {storeName}!</Text>
      </Section>

      <Section className="mt-6">
        <Text className="text-gray-600">Hi {customerName},</Text>
        <Text className="text-gray-600">
          Thank you for creating an account with us. We're excited to have you as part of our
          community!
        </Text>
        <Text className="text-gray-600">As a registered member, you can:</Text>
      </Section>

      <Section className="mt-4 rounded-lg bg-gray-50 p-4">
        <Text className="m-0 text-gray-700">• Track your orders in real-time</Text>
        <Text className="m-0 text-gray-700">• Save items to your wishlist</Text>
        <Text className="m-0 text-gray-700">• Enjoy faster checkout</Text>
        <Text className="m-0 text-gray-700">• Get exclusive offers and updates</Text>
      </Section>

      <Section className="mt-8 text-center">
        <Button href={shopUrl}>Start Shopping</Button>
      </Section>

      <Section className="mt-6">
        <Text className="text-center text-gray-500">
          If you have any questions, feel free to reach out to our support team. We're here to help!
        </Text>
      </Section>

      <Footer storeName={storeName} />
    </Layout>
  );
}

export default WelcomeEmail;
