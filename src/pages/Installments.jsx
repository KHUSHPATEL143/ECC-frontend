import { useState } from 'react';
import { PieChart, Plus, Trash2, TrendingUp, Wallet } from 'lucide-react';
import { useAuth } from '../hooks/AuthContext';
import { useDashboardData } from '../hooks/useDashboardData';
import { useDemoData } from '../context/DemoDataContext';

const formatCurrency = (value) =>
  `INR ${Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

export default function Installments() {
  const { profile } = useAuth();
  const { members, installments, addInstallment, deleteInstallment } = useDemoData();
  const { data: dashboardData } = useDashboardData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    user_id: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    type: 'cash',
    installment_type: '',
    note: '',
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    await addInstallment(formData);
    setIsModalOpen(false);
    setFormData({
      user_id: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      type: 'cash',
      installment_type: '',
      note: '',
    });
  };

  const visibleInstallments =
    profile?.role === 'admin'
      ? installments
      : installments.filter((item) => item.user_id === profile?.id);

  const stats = [
    {
      title: 'Total Contribution',
      value: dashboardData?.personal.myCapital || 0,
      icon: Wallet,
      color: 'text-primary',
    },
    {
      title: 'Invested Amount',
      value:
        (dashboardData?.personal.mySharePercentage || 0) *
          (dashboardData?.group.investedAmount || 0) || 0,
      icon: PieChart,
      color: 'text-primary',
    },
    {
      title: 'Current Value',
      value: dashboardData?.personal.myCurrentValue || 0,
      icon: TrendingUp,
      color: 'text-success',
    },
    {
      title: 'My Profit',
      value: dashboardData?.personal.myProfit || 0,
      icon: TrendingUp,
      color: (dashboardData?.personal.myProfit || 0) >= 0 ? 'text-success' : 'text-error',
    },
  ];

  return (
    <div className="space-y-8 font-body">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary font-heading">
            {profile?.role === 'admin' ? 'All Installments' : 'My Contributions'}
          </h1>
          <p className="text-text-muted">Viewing seeded portfolio demo data for {profile?.full_name}</p>
        </div>
        {profile?.role === 'admin' && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center px-4 py-2 bg-primary text-background font-bold rounded-xl hover:bg-primary-hover transition-all shadow-gold-glow hover:shadow-gold-glow-hover"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Installment
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((card) => {
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
              <p className="text-2xl font-bold text-text-main">{formatCurrency(card.value)}</p>
            </div>
          );
        })}
      </div>

      <div className="hidden md:block bg-surface rounded-2xl border border-border overflow-hidden shadow-luxury">
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-surface-hover text-primary border-b border-border font-heading">
              <tr>
                <th className="px-6 py-4 text-sm font-bold tracking-wider">Date</th>
                <th className="px-6 py-4 text-sm font-bold tracking-wider">Member</th>
                <th className="px-6 py-4 text-sm font-bold tracking-wider">Type</th>
                <th className="px-6 py-4 text-sm font-bold tracking-wider">Mode</th>
                <th className="px-6 py-4 text-sm font-bold tracking-wider text-right">Amount</th>
                {profile?.role === 'admin' && (
                  <th className="px-6 py-4 text-sm font-bold tracking-wider" />
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 font-body">
              {visibleInstallments.map((item) => (
                <tr key={item.id} className="hover:bg-surface-hover transition-colors">
                  <td className="px-6 py-4 text-text-muted">{item.date}</td>
                  <td className="px-6 py-4 text-text-main font-medium">
                    {item.profiles?.full_name || 'Unknown'}
                  </td>
                  <td className="px-6 py-4 text-text-muted">{item.installment_type}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 text-xs rounded-full font-medium ${
                        item.type === 'invested'
                          ? 'bg-primary/10 text-primary'
                          : 'bg-success/10 text-success'
                      }`}
                    >
                      {item.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-text-main text-right">
                    {formatCurrency(item.amount)}
                  </td>
                  {profile?.role === 'admin' && (
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => deleteInstallment(item.id)}
                        className="text-error hover:text-red-400 p-2 hover:bg-error/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
              {visibleInstallments.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-text-muted">
                    No installments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="md:hidden space-y-4">
        {visibleInstallments.map((item) => (
          <div key={item.id} className="bg-surface rounded-2xl border border-border p-4 shadow-luxury">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-lg font-bold text-text-main">{item.profiles?.full_name || 'Unknown'}</h3>
                <p className="text-sm text-text-muted">
                  {item.date} • {item.installment_type}
                </p>
              </div>
              <div className="text-right">
                <span className="text-xl font-bold text-text-main">{formatCurrency(item.amount)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-border/50 pt-3 mt-2">
              <span
                className={`px-2.5 py-0.5 text-xs rounded-full font-medium ${
                  item.type === 'invested'
                    ? 'bg-primary/10 text-primary'
                    : 'bg-success/10 text-success'
                }`}
              >
                {item.type === 'invested' ? 'Invested' : 'Cash Deposit'}
              </span>

              {profile?.role === 'admin' && (
                <button
                  onClick={() => deleteInstallment(item.id)}
                  className="text-sm font-medium text-error hover:text-red-400 flex items-center"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}
        {visibleInstallments.length === 0 && (
          <div className="text-center py-8 text-text-muted bg-surface rounded-2xl border border-border">
            No installments found.
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-in fade-in duration-200">
          <div className="bg-surface rounded-2xl p-6 w-full max-w-md border border-border shadow-luxury">
            <h2 className="text-xl font-bold text-primary mb-4 font-heading">Add New Installment</h2>
            <form onSubmit={handleSubmit} className="space-y-4 font-body">
              <div>
                <label className="block text-sm font-medium text-text-muted mb-1">Member</label>
                <select
                  required
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-text-main focus:outline-none focus:border-primary transition-colors"
                  value={formData.user_id}
                  onChange={(event) => setFormData({ ...formData, user_id: event.target.value })}
                >
                  <option value="">Select Member</option>
                  {members.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.full_name} ({member.email})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-muted mb-1">Amount (INR)</label>
                <input
                  type="number"
                  required
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-text-main focus:outline-none focus:border-primary transition-colors"
                  value={formData.amount}
                  onChange={(event) => setFormData({ ...formData, amount: event.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-muted mb-1">Date</label>
                <input
                  type="date"
                  required
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-text-main focus:outline-none focus:border-primary transition-colors"
                  value={formData.date}
                  onChange={(event) => setFormData({ ...formData, date: event.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-muted mb-1">Type</label>
                <input
                  type="text"
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-text-main focus:outline-none focus:border-primary transition-colors"
                  placeholder="e.g. Monthly, Deposit"
                  value={formData.installment_type}
                  onChange={(event) =>
                    setFormData({ ...formData, installment_type: event.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-muted mb-1">Transaction Mode</label>
                <select
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-text-main focus:outline-none focus:border-primary transition-colors"
                  value={formData.type}
                  onChange={(event) => setFormData({ ...formData, type: event.target.value })}
                >
                  <option value="cash">Cash (Deposit)</option>
                  <option value="invested">Invested (Direct)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-muted mb-1">Note</label>
                <textarea
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-text-main focus:outline-none focus:border-primary transition-colors"
                  rows="3"
                  placeholder="Optional note..."
                  value={formData.note}
                  onChange={(event) => setFormData({ ...formData, note: event.target.value })}
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-text-muted hover:text-text-main transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary text-background font-bold rounded-xl hover:bg-primary-hover transition-all shadow-gold-glow"
                >
                  Add Installment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
