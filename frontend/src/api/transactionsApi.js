const API_BASE_URL = "http://localhost:8080/api/finance";

const getToken = () => localStorage.getItem("token");

const requestHeaders = () => ({
  "Authorization": `${getToken()}`,
  "Content-Type": "application/json",
  "Cache-Control": "no-cache, no-store, must-revalidate",
  "Pragma": "no-cache",
  "Expires": "0",
});

export const fetchTransactionsByDateRange = async (accountId, startDate, endDate) => {
  try {
    const token = getToken();
    if (!token) throw new Error('No token found');

    const response = await fetch(`${API_BASE_URL}/transactions/${accountId}?startDate=${startDate}&endDate=${endDate}`, {
      method: 'GET',
      headers: requestHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    return data || [];
  } catch (error) {
    console.error('Error fetching transactions by date range:', error);
    return [];
  }
};

export const fetchAllTransactions = async (accountId) => {
  try {
    const token = getToken();
    if (!token) throw new Error('No token found');

    const response = await fetch(`${API_BASE_URL}/transactions/${accountId}`, {
      method: 'GET',
      headers: requestHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    return data || [];
  } catch (error) {
    console.error('Error fetching all transactions:', error);
    return [];
  }
};


export const addTransaction = async (transaction) => {
  try {
    const response = await fetch(`${API_BASE_URL}/transactions`, {
      method: "POST",
      headers: requestHeaders(),
      body: JSON.stringify(transaction),
    });
    if (!response.ok) throw new Error("Failed to add transaction");
    return await response.json();
  } catch (error) {
    console.error("Error adding transaction:", error);
    return null;
  }
};


export const updateTransaction = async (transactionId, transaction) => {
  try {
    const response = await fetch(`${API_BASE_URL}/transactions/${transactionId}`, {
      method: "PUT",
      headers: requestHeaders(),
      body: JSON.stringify(transaction),
    });
    if (!response.ok) throw new Error("Failed to update transaction");
    return await response.json();
  } catch (error) {
    console.error("Error updating transaction:", error);
    return null;
  }
};


export const deleteTransaction = async (transactionId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/transactions/${transactionId}`, {
      method: "DELETE",
      headers: requestHeaders(),
    });
    if (!response.ok) throw new Error("Failed to delete transaction");
    return true;
  } catch (error) {
    console.error("Error deleting transaction:", error);
    return false;
  }
};
