import { useState, useEffect } from "react";

const useTransactionData = (accountId) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    if (accountId == null) {
      return;
    }

    fetch(`http://localhost:8080/api/finance/transactions/summary?accountId=${accountId}`, {
      headers: {
        "Authorization": `${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) {
          console.error("Response status:", res.status);
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((summary) => {
        const formattedData = Object.entries(summary).map(([month, amount]) => ({
          month,
          amount,
        }));
        setData(formattedData);
      })
      .catch((error) => {
        console.error("Failed to fetch transaction summary:", error);
      });
  }, [accountId]);

  return data;
};

export default useTransactionData;
