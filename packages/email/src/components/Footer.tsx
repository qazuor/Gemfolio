import { Hr, Link, Section, Text } from '@react-email/components';

interface FooterProps {
  storeName?: string;
  storeUrl?: string;
  supportEmail?: string;
}

export function Footer({
  storeName = 'Gemfolio',
  storeUrl = 'https://gemfolio.com',
  supportEmail = 'support@gemfolio.com',
}: FooterProps) {
  return (
    <Section className="mt-8">
      <Hr className="border-gray-200" />
      <Text className="text-center text-xs text-gray-500">
        © {new Date().getFullYear()} {storeName}. All rights reserved.
      </Text>
      <Text className="text-center text-xs text-gray-500">
        Questions? Contact us at{' '}
        <Link href={`mailto:${supportEmail}`} className="text-blue-600">
          {supportEmail}
        </Link>
      </Text>
      <Text className="text-center text-xs text-gray-400">
        <Link href={storeUrl} className="text-gray-400">
          {storeUrl}
        </Link>
      </Text>
    </Section>
  );
}
