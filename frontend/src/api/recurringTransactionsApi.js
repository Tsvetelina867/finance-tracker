// src/api/recurringTransactionsApi.js

export const fetchRecurringTransactions = async (accountId) => {
  try {
    const response = await fetch(`/api/finance/recurring-transactions/${accountId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch recurring transactions data');
    }

    return await response.json();  // Assuming the response is an array of recurring transactions
  } catch (error) {
    console.error('Error fetching recurring transactions data:', error);
    throw error;
  }
};
