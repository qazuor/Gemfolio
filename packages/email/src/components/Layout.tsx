import { Body, Container, Head, Html, Preview, Tailwind } from '@react-email/components';
import type { ReactNode } from 'react';

interface LayoutProps {
  preview: string;
  children: ReactNode;
}

export function Layout({ preview, children }: LayoutProps) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Tailwind>
        <Body className="bg-gray-100 font-sans">
          <Container className="mx-auto my-10 max-w-[600px] rounded-lg bg-white p-8 shadow-lg">
            {children}
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
