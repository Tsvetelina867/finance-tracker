import axios from 'axios';

export const fetchTransactionsByDateRange = async (accountId, startDate, endDate) => {
  try {
    const response = await axios.get(`/api/finance/transactions`, {
      params: { startDate, endDate }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
};
