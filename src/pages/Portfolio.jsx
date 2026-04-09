import React, { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Rectangle,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  ArrowLeft,
  ChevronRight,
  Plus,
  RefreshCw,
  Trash2,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '../hooks/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useStockPrices } from '../hooks/useStockPrices';
import { useDemoData } from '../context/DemoDataContext';

const formatCurrency = (value) =>
  `INR ${Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    if (data.isEmpty) {
      return null;
    }

    return (
      <div className="bg-surface border border-border p-3 rounded-xl shadow-luxury">
        <p className="font-bold text-text-main mb-1">{data.symbol}</p>
        <p className="text-sm text-text-muted">
          Return:{' '}
          <span className={data.profit >= 0 ? 'text-success' : 'text-error'}>
            {formatCurrency(data.profit)}
          </span>
        </p>
      </div>
    );
  }

  return null;
};

const CustomCursor = ({ x, y, width, height, payload }) => {
  if (payload && payload.length && payload[0].payload && payload[0].payload.isEmpty) {
    return null;
  }

  return (
    <Rectangle
      fill="var(--color-surface-hover)"
      opacity={0.4}
      x={x}
      y={y}
      width={width}
      height={height}
      radius={[4, 4, 4, 4]}
    />
  );
};

export default function Portfolio() {
  const { profile } = useAuth();
  const { theme } = useTheme();
  const { holdings, addHolding, deleteHolding } = useDemoData();
  const { prices, isLoading: isLoadingPrices, refetch: refetchPrices } = useStockPrices(holdings);
  const successColor = '#10B981';
  const errorColor = '#EF4444';
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState('aggregated');
  const [selectedSymbol, setSelectedSymbol] = useState(null);
  const [formData, setFormData] = useState({
    symbol: '',
    fake_symbol: '',
    name: '',
    quantity: '',
    avg_price: '',
    type: 'stock',
    transactionType: 'buy',
    date: new Date().toISOString().split('T')[0],
  });

  const aggregatedHoldings = useMemo(() => {
    const groups = {};

    holdings.forEach((holding) => {
      if (!groups[holding.symbol]) {
        groups[holding.symbol] = [];
      }
      groups[holding.symbol].push(holding);
    });

    return Object.keys(groups).map((symbol) => {
      const transactions = groups[symbol].sort(
        (a, b) => new Date(a.date || 0) - new Date(b.date || 0),
      );

      let quantity = 0;
      let costBasis = 0;
      let realizedProfit = 0;
      let name = transactions[0]?.name || '';
      let fakeSymbol = transactions[0]?.fake_symbol || '';

      transactions.forEach((transaction) => {
        const qty = Number(transaction.quantity);
        const price = Number(transaction.avg_price);

        if (qty > 0) {
          quantity += qty;
          costBasis += qty * price;
        } else {
          const sellQty = Math.abs(qty);

          if (quantity > 0) {
            const averageCost = costBasis / quantity;
            const costOfSoldShares = sellQty * averageCost;
            realizedProfit += sellQty * price - costOfSoldShares;
            costBasis -= costOfSoldShares;
            quantity -= sellQty;
          } else {
            realizedProfit += sellQty * price;
            quantity -= sellQty;
          }
        }

        if (transaction.name) {
          name = transaction.name;
        }

        if (transaction.fake_symbol) {
          fakeSymbol = transaction.fake_symbol;
        }
      });

      if (Math.abs(quantity) < 0.0001) {
        quantity = 0;
        costBasis = 0;
      }

      return {
        symbol,
        fake_symbol: fakeSymbol,
        name,
        quantity,
        totalInvested: costBasis,
        realizedProfit,
        avg_price: quantity > 0 ? costBasis / quantity : 0,
      };
    });
  }, [holdings]);

  const chartData = useMemo(
    () =>
      aggregatedHoldings.map((holding) => {
        const currentPrice = prices[holding.symbol] || holding.avg_price;
        const currentValue = holding.quantity * currentPrice;
        const profit = currentValue - holding.totalInvested + holding.realizedProfit;

        return {
          symbol: holding.fake_symbol || holding.symbol,
          profit,
          isEmpty: false,
        };
      }),
    [aggregatedHoldings, prices],
  );

  const selectedHolding = aggregatedHoldings.find((item) => item.symbol === selectedSymbol);
  const displaySymbol = selectedHolding?.fake_symbol || selectedSymbol;
  const historyData = selectedSymbol ? holdings.filter((item) => item.symbol === selectedSymbol) : [];
  const hasLivePrices = Object.keys(prices).length > 0;

  const handleSubmit = async (event) => {
    event.preventDefault();
    await addHolding(formData);
    setIsModalOpen(false);
    setFormData({
      symbol: '',
      fake_symbol: '',
      name: '',
      quantity: '',
      avg_price: '',
      type: 'stock',
      transactionType: 'buy',
      date: new Date().toISOString().split('T')[0],
    });
  };

  return (
    <div className="p-6 pb-24 md:pb-6 space-y-8 min-h-screen">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          {viewMode === 'history' && (
            <button
              onClick={() => {
                setSelectedSymbol(null);
                setViewMode('aggregated');
              }}
              className="p-2 hover:bg-surface-hover rounded-full transition-colors text-primary flex-shrink-0"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
          )}
          <div className="min-w-0">
            <h1 className="text-2xl md:text-3xl font-bold text-primary font-heading tracking-wide truncate">
              {viewMode === 'aggregated' ? 'Portfolio Overview' : `${displaySymbol} History`}
            </h1>
            <p className="text-text-muted text-sm mt-1">
              Static holdings, demo prices, and local interactions for showcase mode.
            </p>
          </div>
          {theme === 'dark' && !isLoadingPrices && (
            <RefreshCw className="w-5 h-5 text-primary flex-shrink-0" />
          )}
        </div>
        {profile?.role === 'admin' && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center px-4 py-2 bg-primary text-background font-bold rounded-xl hover:bg-primary-hover transition-all shadow-gold-glow hover:shadow-gold-glow-hover whitespace-nowrap flex-shrink-0"
          >
            <Plus className="w-5 h-5 mr-2" />
            <span className="hidden md:inline">Add Holding</span>
            <span className="md:hidden">Add</span>
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 mb-4 text-sm">
        <div
          className={`w-2 h-2 rounded-full ${
            isLoadingPrices ? 'bg-yellow-400 animate-pulse' : hasLivePrices ? 'bg-success' : 'bg-error'
          }`}
        />
        <span className="text-text-muted">
          {isLoadingPrices ? 'Refreshing demo prices...' : hasLivePrices ? 'Demo prices loaded' : 'Using position averages'}
        </span>
        {!isLoadingPrices && !hasLivePrices && (
          <button onClick={() => refetchPrices()} className="ml-2 text-primary hover:underline text-xs">
            Retry
          </button>
        )}
      </div>

      {viewMode === 'aggregated' && (
        <div className="bg-surface p-6 rounded-2xl border border-border shadow-luxury mb-8">
          <h3 className="text-lg font-bold text-text-main mb-6 font-heading border-b border-border/30 pb-2">
            Total Return on Holdings
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} opacity={0.2} />
                <XAxis
                  dataKey="symbol"
                  stroke="var(--color-text-muted)"
                  tick={{ fill: 'var(--color-text-muted)', fontFamily: 'Inter' }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="var(--color-text-muted)"
                  tick={{ fill: 'var(--color-text-muted)', fontFamily: 'Inter' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `INR ${value}`}
                />
                <Tooltip content={<CustomTooltip />} cursor={<CustomCursor chartData={chartData} />} />
                <Legend wrapperStyle={{ fontFamily: 'Inter' }} />
                <Bar dataKey="profit" name="Total Return" radius={[4, 4, 0, 0]} barSize={40}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.profit >= 0 ? successColor : errorColor} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {viewMode === 'aggregated' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {aggregatedHoldings.map((item) => {
            const currentPrice = prices[item.symbol] || item.avg_price || 0;
            const totalValue = currentPrice * item.quantity;
            const unrealizedProfit = totalValue - item.totalInvested;
            const totalProfit = unrealizedProfit + item.realizedProfit;
            const profitPercent = item.totalInvested > 0 ? (unrealizedProfit / item.totalInvested) * 100 : 0;

            return (
              <div
                key={item.symbol}
                className="bg-surface rounded-2xl border border-border p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => {
                  setSelectedSymbol(item.symbol);
                  setViewMode('history');
                }}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-text-main">{item.fake_symbol || item.symbol}</h3>
                    <p className="text-xs text-text-muted">{item.name}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-primary" />
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <p className="text-text-muted text-xs">Quantity</p>
                    <p className="font-medium text-text-main">{item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-text-muted text-xs">Avg Price</p>
                    <p className="font-medium text-text-main">{formatCurrency(item.avg_price)}</p>
                  </div>
                  <div>
                    <p className="text-text-muted text-xs">Current Price</p>
                    <p className="font-bold text-success">{formatCurrency(currentPrice)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-text-muted text-xs">Invested</p>
                    <p className="font-medium text-text-main">{formatCurrency(item.totalInvested)}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-border flex justify-between items-end">
                  <div>
                    <p className="text-text-muted text-xs mb-1">Current Value</p>
                    <p className="text-xl font-bold text-text-main">{formatCurrency(totalValue)}</p>
                  </div>
                  <div className={`text-right ${totalProfit >= 0 ? 'text-success' : 'text-error'}`}>
                    <div className="flex items-center justify-end gap-1 font-bold text-sm">
                      {totalProfit >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      {item.quantity > 0 ? `${profitPercent.toFixed(2)}%` : 'Sold'}
                    </div>
                    <p className="text-xs font-medium mt-1">{formatCurrency(totalProfit)}</p>
                    {item.realizedProfit !== 0 && (
                      <p className="text-[10px] text-text-muted mt-0.5">
                        Realized: {formatCurrency(item.realizedProfit)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <>
          <div className="hidden md:block bg-surface rounded-2xl border border-border overflow-hidden shadow-luxury">
            <div className="overflow-x-auto">
              <table className="w-full text-left whitespace-nowrap">
                <thead className="bg-surface-hover text-primary border-b border-border font-heading">
                  <tr>
                    <th className="px-3 py-2 md:px-6 md:py-4 text-sm font-bold tracking-wider">Date</th>
                    <th className="px-3 py-2 md:px-6 md:py-4 text-sm font-bold tracking-wider">Symbol</th>
                    <th className="px-3 py-2 md:px-6 md:py-4 text-sm font-bold tracking-wider text-right">Quantity</th>
                    <th className="px-3 py-2 md:px-6 md:py-4 text-sm font-bold tracking-wider text-right">Price</th>
                    <th className="px-3 py-2 md:px-6 md:py-4 text-sm font-bold tracking-wider text-right">Invested</th>
                    <th className="px-3 py-2 md:px-6 md:py-4 text-sm font-bold tracking-wider" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50 font-body">
                  {historyData.map((item) => {
                    const investedValue = Number(item.avg_price || 0) * Math.abs(Number(item.quantity || 0));

                    return (
                      <tr key={item.id} className="hover:bg-surface-hover transition-colors">
                        <td className="px-3 py-2 md:px-6 md:py-4 text-text-muted text-sm">
                          {item.date
                            ? new Date(item.date).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: '2-digit',
                              })
                            : '-'}
                        </td>
                        <td className="px-3 py-2 md:px-6 md:py-4 text-text-main font-bold">
                          {item.fake_symbol || item.symbol}
                          <span
                            className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                              item.quantity < 0 ? 'bg-error/10 text-error' : 'bg-success/10 text-success'
                            }`}
                          >
                            {item.quantity < 0 ? 'SELL' : 'BUY'}
                          </span>
                        </td>
                        <td className="px-3 py-2 md:px-6 md:py-4 text-text-main text-right">
                          {Math.abs(item.quantity)}
                        </td>
                        <td className="px-3 py-2 md:px-6 md:py-4 text-text-muted text-right">
                          {formatCurrency(item.avg_price)}
                        </td>
                        <td className="px-3 py-2 md:px-6 md:py-4 text-text-main text-right font-bold">
                          {formatCurrency(investedValue)}
                        </td>
                        <td className="px-3 py-2 md:px-6 md:py-4 text-right">
                          {profile?.role === 'admin' && (
                            <button
                              onClick={() => deleteHolding(item.id)}
                              className="text-error hover:text-red-400 p-2 hover:bg-error/10 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {historyData.length === 0 && (
                    <tr>
                      <td colSpan="6" className="px-6 py-8 text-center text-text-muted">
                        No history found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="md:hidden space-y-2">
            {historyData.map((item) => {
              const investedValue = Number(item.avg_price || 0) * Math.abs(Number(item.quantity || 0));

              return (
                <div
                  key={item.id}
                  className="bg-surface rounded-xl border border-border p-3 shadow-sm flex justify-between items-center"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-text-main">{item.fake_symbol || item.symbol}</h3>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                          item.quantity < 0 ? 'bg-error/10 text-error' : 'bg-success/10 text-success'
                        }`}
                      >
                        {item.quantity < 0 ? 'SELL' : 'BUY'}
                      </span>
                    </div>
                    <div className="text-xs text-text-muted mt-1">
                      {item.date
                        ? new Date(item.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                        : ''}
                      {' • '}
                      {Math.abs(item.quantity)} @ {formatCurrency(item.avg_price)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-text-main">{formatCurrency(investedValue)}</div>
                    {profile?.role === 'admin' && (
                      <button
                        onClick={() => deleteHolding(item.id)}
                        className="text-error hover:text-red-400 p-1 mt-1 hover:bg-error/10 rounded transition-colors inline-block"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
            {historyData.length === 0 && (
              <div className="text-center text-text-muted text-sm py-4">No history found.</div>
            )}
          </div>
        </>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-in fade-in duration-200">
          <div className="bg-surface rounded-2xl p-6 w-full max-w-md border border-border shadow-luxury">
            <h2 className="text-xl font-bold text-primary mb-4 font-heading">
              {formData.transactionType === 'buy' ? 'Add New Holding' : 'Sell Holding'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4 font-body">
              <div className="flex bg-background rounded-xl p-1 border border-border mb-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, transactionType: 'buy' })}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                    formData.transactionType === 'buy'
                      ? 'bg-success text-white shadow-md'
                      : 'text-text-muted hover:text-text-main'
                  }`}
                >
                  Buy
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, transactionType: 'sell' })}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                    formData.transactionType === 'sell'
                      ? 'bg-error text-white shadow-md'
                      : 'text-text-muted hover:text-text-main'
                  }`}
                >
                  Sell
                </button>
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
                <label className="block text-sm font-medium text-text-muted mb-1">Symbol</label>
                <input
                  type="text"
                  required
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-text-main focus:outline-none focus:border-primary uppercase transition-colors"
                  value={formData.symbol}
                  onChange={(event) =>
                    setFormData({ ...formData, symbol: event.target.value.toUpperCase() })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-muted mb-1">Display Symbol</label>
                <input
                  type="text"
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-text-main focus:outline-none focus:border-primary transition-colors"
                  placeholder="Optional alias"
                  value={formData.fake_symbol}
                  onChange={(event) => setFormData({ ...formData, fake_symbol: event.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-muted mb-1">Company Name</label>
                <input
                  type="text"
                  required
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-text-main focus:outline-none focus:border-primary transition-colors"
                  value={formData.name}
                  onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1">Quantity</label>
                  <input
                    type="number"
                    required
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-text-main focus:outline-none focus:border-primary transition-colors"
                    value={formData.quantity}
                    onChange={(event) => setFormData({ ...formData, quantity: event.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-1">Avg Price</label>
                  <input
                    type="number"
                    required
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-text-main focus:outline-none focus:border-primary transition-colors"
                    value={formData.avg_price}
                    onChange={(event) => setFormData({ ...formData, avg_price: event.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-muted mb-1">Type</label>
                <select
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-text-main focus:outline-none focus:border-primary transition-colors"
                  value={formData.type}
                  onChange={(event) => setFormData({ ...formData, type: event.target.value })}
                >
                  <option value="stock">Stock</option>
                  <option value="mf">Mutual Fund</option>
                </select>
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
                  {formData.transactionType === 'buy' ? 'Add Holding' : 'Sell Holding'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
