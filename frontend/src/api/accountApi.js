import axios from '../utils/axiosConfig';

export const fetchAccountData = async () => {
  try {
    const response = await axios.get('/accounts/current'); // Adjust the endpoint based on your backend
    return response.data;
  } catch (error) {
    console.error('Error fetching account data:', error);
    throw error;
  }
};

export const fetchAllAccounts = async () => {
  try {
    const response = await axios.get('/accounts'); // Endpoint to fetch all accounts for the logged-in user
    return response.data;
  } catch (error) {
    console.error('Error fetching all accounts:', error);
    throw error;
  }
};

export const addAccount = async (accountData) => {
    const response = await axios.post('/api/accounts', accountData);
    return response.data;
};

export const updateAccount = async (accountId, updatedData) => {
  const response = await axios.put(`/api/accounts/${accountId}`, updatedData);
  return response.data;
};

export const deleteAccount = async (accountId) => {
  await axios.delete(`/api/accounts/${accountId}`);
};
