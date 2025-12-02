import { Section, Text } from '@react-email/components';
import { Button } from '../components/Button';
import { Footer } from '../components/Footer';
import { Header } from '../components/Header';
import { Layout } from '../components/Layout';

type OrderStatus = 'processing' | 'shipped' | 'delivered' | 'cancelled';

interface OrderStatusUpdateProps {
  customerName: string;
  orderNumber: string;
  status: OrderStatus;
  trackingNumber?: string;
  trackingUrl?: string;
  orderUrl: string;
  message?: string;
  storeName?: string;
  logoUrl?: string;
}

const statusConfig: Record<
  OrderStatus,
  { title: string; description: string; bgColor: string; textColor: string }
> = {
  processing: {
    title: 'Order is Being Processed',
    description: 'We are preparing your order for shipment.',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-800',
  },
  shipped: {
    title: 'Order Shipped!',
    description: 'Your order is on its way.',
    bgColor: 'bg-green-50',
    textColor: 'text-green-800',
  },
  delivered: {
    title: 'Order Delivered',
    description: 'Your order has been delivered.',
    bgColor: 'bg-green-50',
    textColor: 'text-green-800',
  },
  cancelled: {
    title: 'Order Cancelled',
    description: 'Your order has been cancelled.',
    bgColor: 'bg-red-50',
    textColor: 'text-red-800',
  },
};

export function OrderStatusUpdate({
  customerName,
  orderNumber,
  status,
  trackingNumber,
  trackingUrl,
  orderUrl,
  message,
  storeName = 'Gemfolio',
  logoUrl,
}: OrderStatusUpdateProps) {
  const config = statusConfig[status];

  return (
    <Layout preview={`Order Update - ${orderNumber}`}>
      <Header logoUrl={logoUrl} storeName={storeName} />

      <Section className={`rounded-lg ${config.bgColor} p-6 text-center`}>
        <Text className={`m-0 text-2xl font-bold ${config.textColor}`}>{config.title}</Text>
        <Text className={`m-0 mt-2 ${config.textColor}`}>{config.description}</Text>
      </Section>

      <Section className="mt-6">
        <Text className="text-gray-600">Hi {customerName},</Text>
        <Text className="text-gray-600">
          {message || `Your order ${orderNumber} status has been updated.`}
        </Text>
      </Section>

      <Section className="mt-4 rounded-lg bg-gray-50 p-4">
        <Text className="m-0 text-sm text-gray-500">Order Number</Text>
        <Text className="m-0 font-semibold text-gray-800">{orderNumber}</Text>
      </Section>

      {trackingNumber && (
        <Section className="mt-4 rounded-lg bg-gray-50 p-4">
          <Text className="m-0 text-sm text-gray-500">Tracking Number</Text>
          <Text className="m-0 font-semibold text-gray-800">{trackingNumber}</Text>
          {trackingUrl && (
            <Section className="mt-4">
              <Button href={trackingUrl} variant="secondary">
                Track Package
              </Button>
            </Section>
          )}
        </Section>
      )}

      <Section className="mt-8 text-center">
        <Button href={orderUrl}>View Order Details</Button>
      </Section>

      <Footer storeName={storeName} />
    </Layout>
  );
}

export default OrderStatusUpdate;
