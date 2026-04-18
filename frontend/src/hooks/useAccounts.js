import { useEffect, useState } from "react";
import { fetchAllAccounts } from "../api/accountApi";

export default function useAccounts(currentUser) {
  const [accounts, setAccounts] = useState([]);
  const [currentAccount, setCurrentAccount] = useState(null);
  const [loadingAccounts, setLoadingAccounts] = useState(true);

  const savedAccountId = localStorage.getItem("selectedAccountId");

  useEffect(() => {
    if (!currentUser?.id) return;

    const loadAccounts = async () => {
      try {
        const all = await fetchAllAccounts();

        const userAccounts = all.filter(
          (acc) => acc.user.id === currentUser.id,
        );

        setAccounts(userAccounts);

        if (userAccounts.length > 0) {
          const foundSaved = userAccounts.find(
            (a) => a.id === Number(savedAccountId),
          );

          const initial = foundSaved || userAccounts[0];

          setCurrentAccount(initial);
          localStorage.setItem("selectedAccountId", initial.id);
        }
      } catch (err) {
        console.error("Error loading accounts:", err);
      } finally {
        setLoadingAccounts(false);
      }
    };

    loadAccounts();
  }, [currentUser?.id]);

  const setAccount = (acc) => {
    setCurrentAccount(acc);
    localStorage.setItem("selectedAccountId", acc.id);
  };

  return {
    accounts,
    currentAccount,
    setCurrentAccount: setAccount,
    setAccounts,
    loadingAccounts,
  };
}
