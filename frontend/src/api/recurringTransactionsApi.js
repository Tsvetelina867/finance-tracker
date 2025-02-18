const API_BASE_URL = "http://localhost:8080/api/finance";

const getToken = () => localStorage.getItem("token");

const requestHeaders = () => ({
  "Authorization": `${getToken()}`,
  "Content-Type": "application/json",
  "Cache-Control": "no-cache, no-store, must-revalidate",
  "Pragma": "no-cache",
  "Expires": "0",
});

export const fetchRecurringTransactions = async (accountId, frequency = null, category = null) => {
  try {
    if (!getToken()) throw new Error('No token found');

    let url = `${API_BASE_URL}/recurring-transactions/${accountId}`;
    const params = new URLSearchParams();

    if (frequency) params.append("frequency", frequency);
    if (category) params.append("category", category);

    if (params.toString()) {
      url = `${url}/catch-up?${params.toString()}`;
    }

    const response = await fetch(url, {
      method: "GET",
      headers: requestHeaders(),
      credentials: "include",
    });

    if (!response.ok) throw new Error(`Error: ${response.statusText}`);

    return await response.json() || [];
  } catch (error) {
    console.error("Error fetching recurring transactions:", error);
    return [];
  }
};

export const fetchPastRecurringTransactions = async (accountId, startDate, endDate, frequency = null, category = null) => {
  try {
    if (!getToken()) throw new Error('No token found');

    const url = new URL(`${API_BASE_URL}/recurring-transactions/catch-up`);
    const params = { accountId, startDate, endDate, frequency, category };

    Object.entries(params).forEach(([key, value]) => {
      if (value) url.searchParams.append(key, value);
    });

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: requestHeaders(),
      credentials: "include",
    });

    if (!response.ok) throw new Error(`Error: ${response.statusText}`);

    return await response.json() || [];
  } catch (error) {
    console.error("Error fetching past recurring transactions:", error);
    return [];
  }
};

export const addRecurringTransaction = async (transaction) => {
  try {
    const response = await fetch(`${API_BASE_URL}/recurring-transactions`, {
      method: "POST",
      headers: requestHeaders(),
      body: JSON.stringify(transaction),
    });

    if (!response.ok) throw new Error("Failed to add recurring transaction");

    return await response.json();
  } catch (error) {
    console.error("Error adding recurring transaction:", error);
    return null;
  }
};

export const updateRecurringTransaction = async (transactionId, transaction) => {
  try {
    const response = await fetch(`${API_BASE_URL}/recurring-transactions/${transactionId}`, {
      method: "PUT",
      headers: requestHeaders(),
      body: JSON.stringify(transaction),
    });

    if (!response.ok) throw new Error("Failed to update recurring transaction");

    return await response.json();
  } catch (error) {
    console.error("Error updating recurring transaction:", error);
    return null;
  }
};

export const deleteRecurringTransaction = async (transactionId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/recurring-transactions/${transactionId}`, {
      method: "DELETE",
      headers: requestHeaders(),
    });

    if (!response.ok) throw new Error("Failed to delete recurring transaction");

    return true;
  } catch (error) {
    console.error("Error deleting recurring transaction:", error);
    return false;
  }
};
