import { PieChart, TrendingUp, User, Wallet } from 'lucide-react';
import { useDashboardData } from '../hooks/useDashboardData';

const formatCurrency = (value) =>
  `INR ${Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

export default function PersonalStats() {
  const { data } = useDashboardData();
  const { personal } = data;

  const cards = [
    { title: 'My Total Investment', value: personal.myCapital, icon: Wallet, color: 'text-primary' },
    { title: 'My Current Value', value: personal.myCurrentValue, icon: PieChart, color: 'text-primary' },
    {
      title: 'My Profit',
      value: personal.myProfit,
      icon: TrendingUp,
      color: personal.myProfit >= 0 ? 'text-success' : 'text-error',
    },
    {
      title: 'Ownership Share',
      value: `${(personal.mySharePercentage * 100).toFixed(2)}%`,
      icon: User,
      color: 'text-primary',
      isText: true,
    },
  ];

  return (
    <div className="font-body">
      <h1 className="text-3xl font-bold text-primary mb-8 font-heading">My Performance</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="bg-surface p-6 rounded-2xl border border-border shadow-luxury hover:border-primary/50 transition-colors"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-text-muted text-sm font-medium">{card.title}</h3>
                <div className={`p-2 rounded-lg bg-surface-hover ${card.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <p className="text-2xl font-bold text-text-main">
                {card.isText ? card.value : formatCurrency(card.value)}
              </p>
            </div>
          );
        })}
      </div>

      <div className="bg-surface p-6 rounded-2xl border border-border shadow-luxury">
        <h3 className="text-lg font-bold text-text-main mb-4 font-heading">Investment Breakdown</h3>
        <p className="text-text-muted">
          You own <span className="text-primary font-bold">{(personal.mySharePercentage * 100).toFixed(2)}%</span> of the
          group&apos;s total assets. Your current value is derived from the seeded group fund value so the portfolio demo stays realistic.
        </p>
      </div>
    </div>
  );
}
