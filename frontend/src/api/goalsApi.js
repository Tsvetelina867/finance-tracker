// src/api/goalsApi.js
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
