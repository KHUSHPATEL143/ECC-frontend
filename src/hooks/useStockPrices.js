import { useDemoData } from '../context/DemoDataContext';

export function useStockPrices() {
  const { stockPrices } = useDemoData();

  return {
    prices: stockPrices,
    isLoading: false,
    refetch: () => {},
  };
}
