import { Column, Hr, Row, Section, Text } from '@react-email/components';
import { Button } from '../components/Button';
import { Footer } from '../components/Footer';
import { Header } from '../components/Header';
import { Layout } from '../components/Layout';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  sku?: string;
}

interface NewOrderAdminProps {
  orderNumber: string;
  orderDate: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  shippingAddress: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  adminOrderUrl: string;
  storeName?: string;
  logoUrl?: string;
}

export function NewOrderAdmin({
  orderNumber,
  orderDate,
  customerName,
  customerEmail,
  items,
  subtotal,
  shipping,
  tax,
  total,
  shippingAddress,
  adminOrderUrl,
  storeName = 'Gemfolio',
  logoUrl,
}: NewOrderAdminProps) {
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  return (
    <Layout preview={`New Order Received - ${orderNumber}`}>
      <Header logoUrl={logoUrl} storeName={storeName} />

      <Section className="rounded-lg bg-green-50 p-4">
        <Text className="m-0 text-center text-xl font-bold text-green-800">
          New Order Received!
        </Text>
      </Section>

      <Section className="mt-6 rounded-lg bg-gray-50 p-4">
        <Row>
          <Column>
            <Text className="m-0 text-sm text-gray-500">Order Number</Text>
            <Text className="m-0 font-semibold text-gray-800">{orderNumber}</Text>
          </Column>
          <Column>
            <Text className="m-0 text-sm text-gray-500">Order Date</Text>
            <Text className="m-0 font-semibold text-gray-800">{orderDate}</Text>
          </Column>
          <Column>
            <Text className="m-0 text-sm text-gray-500">Total</Text>
            <Text className="m-0 font-bold text-green-600">{formatCurrency(total)}</Text>
          </Column>
        </Row>
      </Section>

      <Section className="mt-6">
        <Text className="mb-2 font-semibold text-gray-800">Customer</Text>
        <Text className="m-0 text-gray-600">
          {customerName}
          <br />
          {customerEmail}
        </Text>
      </Section>

      <Section className="mt-6">
        <Text className="mb-2 font-semibold text-gray-800">Shipping Address</Text>
        <Text className="m-0 text-gray-600">
          {shippingAddress.line1}
          {shippingAddress.line2 && <br />}
          {shippingAddress.line2}
          <br />
          {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}
          <br />
          {shippingAddress.country}
        </Text>
      </Section>

      <Section className="mt-6">
        <Text className="mb-4 font-semibold text-gray-800">Order Items</Text>
        {items.map((item) => (
          <Row key={`${item.name}-${item.sku || item.quantity}`} className="mb-2">
            <Column className="w-1/2">
              <Text className="m-0 text-gray-800">{item.name}</Text>
              {item.sku && <Text className="m-0 text-xs text-gray-500">SKU: {item.sku}</Text>}
            </Column>
            <Column className="w-1/4 text-center">
              <Text className="m-0 text-gray-600">x{item.quantity}</Text>
            </Column>
            <Column className="w-1/4 text-right">
              <Text className="m-0 text-gray-800">
                {formatCurrency(item.price * item.quantity)}
              </Text>
            </Column>
          </Row>
        ))}
        <Hr className="my-4 border-gray-200" />
        <Row>
          <Column className="w-3/4">
            <Text className="m-0 text-gray-600">Subtotal</Text>
          </Column>
          <Column className="w-1/4 text-right">
            <Text className="m-0 text-gray-600">{formatCurrency(subtotal)}</Text>
          </Column>
        </Row>
        <Row>
          <Column className="w-3/4">
            <Text className="m-0 text-gray-600">Shipping</Text>
          </Column>
          <Column className="w-1/4 text-right">
            <Text className="m-0 text-gray-600">{formatCurrency(shipping)}</Text>
          </Column>
        </Row>
        <Row>
          <Column className="w-3/4">
            <Text className="m-0 text-gray-600">Tax</Text>
          </Column>
          <Column className="w-1/4 text-right">
            <Text className="m-0 text-gray-600">{formatCurrency(tax)}</Text>
          </Column>
        </Row>
        <Hr className="my-2 border-gray-200" />
        <Row>
          <Column className="w-3/4">
            <Text className="m-0 font-bold text-gray-800">Total</Text>
          </Column>
          <Column className="w-1/4 text-right">
            <Text className="m-0 font-bold text-gray-800">{formatCurrency(total)}</Text>
          </Column>
        </Row>
      </Section>

      <Section className="mt-8 text-center">
        <Button href={adminOrderUrl}>View Order in Admin</Button>
      </Section>

      <Footer storeName={storeName} />
    </Layout>
  );
}

export default NewOrderAdmin;
