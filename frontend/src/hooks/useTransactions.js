import { useEffect, useState } from "react";
import { fetchTransactionsByDateRange } from "../api/transactionsApi";

export default function useTransactions(currentAccount, startDate, endDate) {
  const [transactions, setTransactions] = useState([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);

  useEffect(() => {
    if (!currentAccount?.id) return;

    const load = async () => {
      try {
        setLoadingTransactions(true);

        const res = await fetchTransactionsByDateRange(
          currentAccount.id,
          startDate,
          endDate,
        );

        setTransactions(res);
      } catch (err) {
        console.error("Error fetching transactions:", err);
      } finally {
        setLoadingTransactions(false);
      }
    };

    load();
  }, [currentAccount?.id, startDate, endDate]);

  return { transactions, setTransactions, loadingTransactions };
}
