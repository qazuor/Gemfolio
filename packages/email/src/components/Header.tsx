import { Img, Section, Text } from '@react-email/components';

interface HeaderProps {
  logoUrl?: string;
  storeName?: string;
}

export function Header({ logoUrl, storeName = 'Gemfolio' }: HeaderProps) {
  return (
    <Section className="mb-8 text-center">
      {logoUrl ? (
        <Img src={logoUrl} alt={storeName} width={150} height={50} className="mx-auto" />
      ) : (
        <Text className="m-0 text-2xl font-bold text-gray-800">{storeName}</Text>
      )}
    </Section>
  );
}
