import { createContext, useContext, useMemo, useState } from 'react';
import {
  initialCurrentUserId,
  initialHoldings,
  initialInstallments,
  initialMembers,
  initialNotifications,
  initialStockPrices,
} from '../data/mockData';

const DemoDataContext = createContext(null);

const formatSortDate = (value) => new Date(value || 0).getTime();

const createId = (prefix) =>
  `${prefix}-${Math.random().toString(36).slice(2, 8)}-${Date.now().toString(36)}`;

function calculateDashboardData(installments, holdings, stockPrices, currentUserId) {
  const totalCapital = installments.reduce((sum, item) => sum + Number(item.amount), 0);

  const holdingGroups = holdings.reduce((acc, holding) => {
    if (!acc[holding.symbol]) {
      acc[holding.symbol] = [];
    }
    acc[holding.symbol].push(holding);
    return acc;
  }, {});

  let investedAmount = 0;
  let totalRealizedProfit = 0;
  let currentHoldingsValue = 0;

  Object.values(holdingGroups).forEach((transactions) => {
    const sortedTransactions = [...transactions].sort(
      (a, b) => formatSortDate(a.date) - formatSortDate(b.date),
    );

    let quantity = 0;
    let costBasis = 0;
    let realizedProfit = 0;

    sortedTransactions.forEach((transaction) => {
      const qty = Number(transaction.quantity);
      const price = Number(transaction.avg_price);

      if (qty > 0) {
        quantity += qty;
        costBasis += qty * price;
        return;
      }

      const sellQty = Math.abs(qty);
      if (quantity > 0) {
        const averageCost = costBasis / quantity;
        const costOfSold = sellQty * averageCost;
        realizedProfit += sellQty * price - costOfSold;
        costBasis -= costOfSold;
        quantity -= sellQty;
      } else {
        realizedProfit += sellQty * price;
        quantity -= sellQty;
      }
    });

    if (Math.abs(quantity) < 0.0001) {
      quantity = 0;
      costBasis = 0;
    }

    const currentPrice =
      stockPrices[sortedTransactions[sortedTransactions.length - 1].symbol] ||
      Number(sortedTransactions[sortedTransactions.length - 1].avg_price);

    investedAmount += costBasis;
    totalRealizedProfit += realizedProfit;
    currentHoldingsValue += quantity * currentPrice;
  });

  const cashBalance = totalCapital - investedAmount + totalRealizedProfit;
  const totalCurrentValue = cashBalance + currentHoldingsValue;
  const totalProfit = totalCurrentValue - totalCapital;

  const myInstallments = installments.filter((item) => item.user_id === currentUserId);
  const myCapital = myInstallments.reduce((sum, item) => sum + Number(item.amount), 0);
  const mySharePercentage = totalCapital > 0 ? myCapital / totalCapital : 0;
  const myCurrentValue = totalCurrentValue * mySharePercentage;
  const myProfit = myCurrentValue - myCapital;

  return {
    group: {
      totalCapital,
      cashBalance,
      investedAmount,
      currentHoldingsValue,
      totalProfit,
      totalCurrentValue,
    },
    personal: {
      myCapital,
      myCurrentValue,
      myProfit,
      mySharePercentage,
    },
    installments,
    holdings,
  };
}

export function DemoDataProvider({ children }) {
  const [members, setMembers] = useState(initialMembers);
  const [installments, setInstallments] = useState(initialInstallments);
  const [holdings, setHoldings] = useState(initialHoldings);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [stockPrices] = useState(initialStockPrices);
  const [currentUserId, setCurrentUserId] = useState(initialCurrentUserId);

  const profile = useMemo(
    () => members.find((member) => member.id === currentUserId) || null,
    [currentUserId, members],
  );

  const user = profile
    ? {
        id: profile.id,
        email: profile.email,
      }
    : null;

  const membersById = useMemo(
    () =>
      members.reduce((acc, member) => {
        acc[member.id] = member;
        return acc;
      }, {}),
    [members],
  );

  const installmentsWithProfiles = useMemo(
    () =>
      [...installments]
        .sort((a, b) => formatSortDate(b.date) - formatSortDate(a.date))
        .map((item) => ({
          ...item,
          profiles: membersById[item.user_id] || null,
        })),
    [installments, membersById],
  );

  const sortedMembers = useMemo(
    () => [...members].sort((a, b) => a.full_name.localeCompare(b.full_name)),
    [members],
  );

  const sortedHoldings = useMemo(
    () =>
      [...holdings].sort((a, b) => {
        if (a.symbol === b.symbol) {
          return formatSortDate(a.date) - formatSortDate(b.date);
        }
        return a.symbol.localeCompare(b.symbol);
      }),
    [holdings],
  );

  const userNotifications = useMemo(
    () =>
      [...notifications]
        .filter((item) => item.user_id === currentUserId)
        .sort((a, b) => formatSortDate(b.created_at) - formatSortDate(a.created_at)),
    [currentUserId, notifications],
  );

  const dashboardData = useMemo(
    () => calculateDashboardData(installments, holdings, stockPrices, currentUserId),
    [currentUserId, holdings, installments, stockPrices],
  );

  const signIn = async (email) => {
    const normalizedEmail = email.trim().toLowerCase();
    const nextProfile =
      members.find((member) => member.email.toLowerCase() === normalizedEmail) || members[0];

    setCurrentUserId(nextProfile.id);
    return nextProfile;
  };

  const signUp = async (email, _password, fullName) => {
    const nextMember = {
      id: createId('member'),
      full_name: fullName,
      email: email.trim().toLowerCase(),
      role: 'member',
      is_approved: true,
      created_at: new Date().toISOString(),
    };

    setMembers((currentMembers) => [...currentMembers, nextMember]);
    setCurrentUserId(nextMember.id);
    return nextMember;
  };

  const signOut = async () => {
    setCurrentUserId(null);
  };

  const updateEmail = async (email) => {
    const normalizedEmail = email.trim().toLowerCase();
    setMembers((currentMembers) =>
      currentMembers.map((member) =>
        member.id === currentUserId ? { ...member, email: normalizedEmail } : member,
      ),
    );
  };

  const updateProfile = async ({ fullName, password }) => {
    setMembers((currentMembers) =>
      currentMembers.map((member) =>
        member.id === currentUserId ? { ...member, full_name: fullName } : member,
      ),
    );

    return {
      passwordUpdated: Boolean(password),
    };
  };

  const addInstallment = async (newInstallment) => {
    setInstallments((currentInstallments) => [
      ...currentInstallments,
      {
        ...newInstallment,
        id: createId('inst'),
        amount: Number(newInstallment.amount),
      },
    ]);
  };

  const deleteInstallment = async (id) => {
    setInstallments((currentInstallments) =>
      currentInstallments.filter((installment) => installment.id !== id),
    );
  };

  const addHolding = async (newHolding) => {
    const quantity = Number(newHolding.quantity);
    const finalQuantity =
      newHolding.transactionType === 'sell' ? -Math.abs(quantity) : Math.abs(quantity);

    setHoldings((currentHoldings) => [
      ...currentHoldings,
      {
        ...newHolding,
        id: createId('hold'),
        quantity: finalQuantity,
        avg_price: Number(newHolding.avg_price),
      },
    ]);
  };

  const deleteHolding = async (id) => {
    setHoldings((currentHoldings) => currentHoldings.filter((holding) => holding.id !== id));
  };

  const toggleMemberApproval = async ({ id, is_approved }) => {
    setMembers((currentMembers) =>
      currentMembers.map((member) => (member.id === id ? { ...member, is_approved } : member)),
    );
  };

  const toggleMemberRole = async ({ id, role }) => {
    setMembers((currentMembers) =>
      currentMembers.map((member) => (member.id === id ? { ...member, role } : member)),
    );
  };

  const inviteMember = async ({ fullName, email }) => {
    const nextMember = {
      id: createId('member'),
      full_name: fullName,
      email: email.trim().toLowerCase(),
      role: 'member',
      is_approved: false,
      created_at: new Date().toISOString(),
    };

    setMembers((currentMembers) => [...currentMembers, nextMember]);
    return nextMember;
  };

  const sendNotification = async ({ userId, subject, message }) => {
    setNotifications((currentNotifications) => [
      {
        id: createId('note'),
        user_id: userId,
        subject,
        message,
        is_read: false,
        created_at: new Date().toISOString(),
      },
      ...currentNotifications,
    ]);
  };

  const markNotificationRead = async (id) => {
    setNotifications((currentNotifications) =>
      currentNotifications.map((item) =>
        item.id === id ? { ...item, is_read: true } : item,
      ),
    );
  };

  const changePassword = async () => true;

  const value = {
    user,
    profile,
    members: sortedMembers,
    installments: installmentsWithProfiles,
    holdings: sortedHoldings,
    notifications: userNotifications,
    stockPrices,
    dashboardData,
    signIn,
    signUp,
    signOut,
    updateEmail,
    updateProfile,
    changePassword,
    addInstallment,
    deleteInstallment,
    addHolding,
    deleteHolding,
    toggleMemberApproval,
    toggleMemberRole,
    inviteMember,
    sendNotification,
    markNotificationRead,
  };

  return <DemoDataContext.Provider value={value}>{children}</DemoDataContext.Provider>;
}

export function useDemoData() {
  const context = useContext(DemoDataContext);

  if (!context) {
    throw new Error('useDemoData must be used within a DemoDataProvider');
  }

  return context;
}
