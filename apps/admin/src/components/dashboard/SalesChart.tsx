import { Card, CardContent, CardHeader, CardTitle, Skeleton } from '@gemfolio/ui';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { TrendingUp } from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { formatCurrency, type SalesChartData, useSalesChart } from '@/hooks/use-dashboard';

interface ChartDataPoint {
  date: string;
  displayDate: string;
  orders: number;
  revenue: number;
}

function transformData(data: SalesChartData[]): ChartDataPoint[] {
  return data.map((item) => ({
    date: item.date,
    displayDate: format(parseISO(item.date), 'EEE dd', { locale: es }),
    orders: item.orders,
    revenue: Number.parseFloat(item.revenue),
  }));
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    dataKey: string;
    payload: ChartDataPoint;
  }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const data = payload[0].payload;
  const formattedDate = format(parseISO(data.date), "EEEE d 'de' MMMM", { locale: es });

  return (
    <div className="rounded-lg border bg-background p-3 shadow-lg">
      <p className="mb-2 text-sm font-medium capitalize">{formattedDate}</p>
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">
          Ventas:{' '}
          <span className="font-medium text-foreground">{formatCurrency(data.revenue)}</span>
        </p>
        <p className="text-sm text-muted-foreground">
          Pedidos: <span className="font-medium text-foreground">{data.orders}</span>
        </p>
      </div>
    </div>
  );
}

export function SalesChart() {
  const { data: salesData, isLoading, error } = useSalesChart();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5" />
            Ventas de los últimos 7 días
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5" />
            Ventas de los últimos 7 días
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            Error al cargar datos del gráfico
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = salesData ? transformData(salesData) : [];
  const totalRevenue = chartData.reduce((sum, item) => sum + item.revenue, 0);
  const totalOrders = chartData.reduce((sum, item) => sum + item.orders, 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5" />
            Ventas de los últimos 7 días
          </CardTitle>
          <div className="flex gap-4 text-sm">
            <div className="text-right">
              <p className="text-muted-foreground">Total ventas</p>
              <p className="font-semibold">{formatCurrency(totalRevenue)}</p>
            </div>
            <div className="text-right">
              <p className="text-muted-foreground">Total pedidos</p>
              <p className="font-semibold">{totalOrders}</p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 || totalOrders === 0 ? (
          <div className="flex h-[300px] flex-col items-center justify-center text-muted-foreground">
            <TrendingUp className="mb-2 h-12 w-12 opacity-50" />
            <p>No hay datos de ventas en este período</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="displayDate"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                className="fill-muted-foreground"
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) =>
                  new Intl.NumberFormat('es-AR', {
                    notation: 'compact',
                    compactDisplay: 'short',
                  }).format(value)
                }
                className="fill-muted-foreground"
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorRevenue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
