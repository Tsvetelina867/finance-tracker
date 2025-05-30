import axios from '../utils/axiosConfig';

export const fetchAccountData = async () => {
  try {
    const response = await axios.get('/accounts/current');
    return response.data;
  } catch (error) {
    console.error('Error fetching account data:', error);
    throw error;
  }
};

export const fetchAllAccounts = async () => {
  try {
    const response = await axios.get('/accounts');
    return response.data;
  } catch (error) {
    console.error('Error fetching all accounts:', error);
    throw error;
  }
};

export const addAccount = async (accountData) => {
    const response = await axios.post('/accounts', accountData);
    return response.data;
};

export const updateAccount = async (accountId, updatedData) => {
  const response = await axios.put(`accounts/${accountId}`, updatedData);
  return response.data;
};

export const deleteAccount = async (accountId) => {
  await axios.delete(`accounts/${accountId}`);
};