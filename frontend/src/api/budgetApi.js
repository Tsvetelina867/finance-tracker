// src/api/budgetApi.js
export const fetchBudgetData = async () => {
  try {
    const response = await fetch('/api/finance/budgets', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) {
      throw new Error('Failed to fetch budget data');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching budget data:', error);
    throw error;
  }
};
