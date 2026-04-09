import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { DollarSign, PieChart, TrendingUp, Wallet } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useDashboardData } from '../hooks/useDashboardData';

const formatCurrency = (value) =>
  `INR ${Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

export default function DashboardHome() {
  const { data } = useDashboardData();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const primaryColor = '#D4AF37';
  const surfaceColor = isDark ? '#10121B' : '#ffffff';
  const borderColor = isDark ? '#CBA35A' : '#e5e7eb';
  const textColor = isDark ? '#E8E3D0' : '#111827';
  const mutedColor = isDark ? '#A0A0A0' : '#6b7280';

  const cards = [
    { title: 'Group Fund Value', value: data.group.totalCurrentValue, icon: Wallet, color: 'text-primary' },
    { title: 'My Contribution', value: data.personal.myCapital, icon: DollarSign, color: 'text-success' },
    { title: 'Invested Assets', value: data.group.investedAmount, icon: PieChart, color: 'text-primary' },
    {
      title: 'My Returns',
      value: data.personal.myProfit,
      icon: TrendingUp,
      color: data.personal.myProfit >= 0 ? 'text-success' : 'text-error',
    },
  ];

  const chartData = data.installments
    .slice()
    .reverse()
    .map((item) => ({
      date: new Date(item.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      amount: Number(item.amount),
    }));

  let cumulative = 0;
  const cumulativeData = chartData.map((item) => {
    cumulative += item.amount;
    return { ...item, capital: cumulative };
  });

  return (
    <div className="space-y-8 font-body">
      <div>
        <h1 className="text-3xl font-bold text-primary mb-2 font-heading">Dashboard Overview</h1>
        <p className="text-text-muted">A polished frontend snapshot powered entirely by seeded mock data.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="bg-surface p-6 rounded-2xl border border-border hover:border-primary/50 transition-colors shadow-luxury"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-text-muted text-sm font-medium">{card.title}</h3>
                <div className={`p-2 rounded-lg bg-surface-hover ${card.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <p className="text-2xl font-bold text-text-main">{formatCurrency(card.value)}</p>
            </div>
          );
        })}
      </div>

      <div className="bg-surface p-6 rounded-2xl border border-border shadow-luxury">
        <h3 className="text-lg font-bold text-text-main mb-6 font-heading">Capital Growth History</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={cumulativeData}>
              <defs>
                <linearGradient id="colorCapital" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={primaryColor} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={primaryColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={borderColor} vertical={false} opacity={0.3} />
              <XAxis
                dataKey="date"
                stroke={mutedColor}
                tick={{ fill: mutedColor }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke={mutedColor}
                tick={{ fill: mutedColor }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `INR ${Math.round(value / 1000)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: surfaceColor,
                  borderColor,
                  color: textColor,
                  borderRadius: '12px',
                }}
                itemStyle={{ color: textColor }}
                formatter={(value) => [formatCurrency(value), 'Total Capital']}
              />
              <Area
                type="monotone"
                dataKey="capital"
                stroke={primaryColor}
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorCapital)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
