import { useDemoData } from '../context/DemoDataContext';

export function useDashboardData() {
  const { dashboardData } = useDemoData();

  return {
    data: dashboardData,
    isLoading: false,
    error: null,
  };
}
