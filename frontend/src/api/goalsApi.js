import axios from 'axios';


export const fetchGoalsData = async () => {
  try {
    const response = await fetch('/api/finance/goals', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) {
      throw new Error('Failed to fetch goals data');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching goals data:', error);
    throw error;
  }
};



const API_BASE_URL = '/api/finance/goals';

export const fetchGoalsByAccountId = async (accountId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/account/${accountId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching goals:', error);
    return [];
  }
};

