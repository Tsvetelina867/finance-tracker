import axios from 'axios';

const API_URL = '/api/finance/budgets';

export const fetchBudgetData = async (accountId) => {
  const response = await axios.get(`${API_URL}/${accountId}`);
  return response.data;
};
