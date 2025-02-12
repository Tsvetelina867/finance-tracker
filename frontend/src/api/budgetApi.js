import axios from 'axios';

export async function fetchBudgetDetails(accountId) {
    try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No token found');

        if (!accountId) {
            console.error('Account ID is undefined or invalid');
            return;
        }

        // Fetch all budgets for the given account ID
        const budgetResponse = await axios.get(`http://localhost:8080/api/finance/budgets/${accountId}`, {
            headers: {
                'Authorization': `${token}`,
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0',
            },
            credentials: 'include',
        });

        const budgets = budgetResponse.data; // Ensure budgets is an array

        // Process each budget
        const budgetDetailsPromises = budgets.map(async (budget) => {
            const progressResponse = await axios.get(`http://localhost:8080/api/finance/budgets/${budget.id}/progress`, {
                headers: {
                    'Authorization': `${token}`,
                },
                credentials: 'include',
            });

            const progress = progressResponse.data;

            const exceededResponse = await axios.get(`http://localhost:8080/api/finance/budgets/${budget.id}/exceeded`, {
                headers: {
                    'Authorization': `${token}`,
                },
                credentials: 'include',
            });

            const isExceeded = exceededResponse.data;

            return {
                ...budget,
                progress,
                isExceeded,
            };
        });

        // Wait for all the promises to resolve
        const budgetDetails = await Promise.all(budgetDetailsPromises);

        return budgetDetails;

    } catch (error) {
        console.error('Error fetching budget details:', error);
    }
}

export const fetchAllBudgets = async (accountId) => {
    try {
    const token = localStorage.getItem('token'); // Get token from localStorage
        if (!token) throw new Error('No token found');

        const response = await fetch(`http://localhost:8080/api/finance/budgets/${accountId}`, {
              method: "GET",
              headers: {
                      'Authorization': `${token}`,  // Add "Bearer" prefix before the token
                      'Cache-Control': 'no-cache, no-store, must-revalidate',
                      'Pragma': 'no-cache',
                      'Expires': '0',
                    },
                    credentials: 'include', // Include credentials to send cookies
                  });
   if (!response.ok) {
         throw new Error('Network response was not ok');
       }

       const data = await response.json();

       return data || [];
     } catch (error) {
       console.error('Error fetching budgets:', error);
       return [];
     }
};

const API_BASE_URL = "http://localhost:8080/api/finance";
const getToken = () => localStorage.getItem("token");

const requestHeaders = () => ({
  "Authorization": `${getToken()}`,
  "Content-Type": "application/json",
  "Cache-Control": "no-cache, no-store, must-revalidate",
  "Pragma": "no-cache",
  "Expires": "0",
});

export const fetchBudgetById = async (budgetId) => {
    try {
        const token = localStorage.getItem('token'); // Get token from localStorage
        if (!token) throw new Error('No token found');

        console.log('Fetching budget with ID:', budgetId); // Log the ID to verify it's being passed

        const response = await fetch(`${API_BASE_URL}/budgets/${budgetId}`, {
            method: "GET",
            headers: {
                'Authorization': `${token}`,  // Ensure the token is passed correctly
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0',
            },
            credentials: 'include', // Include credentials to send cookies
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        console.log('Budget data:', data); // Log the response data

        return data;
    } catch (error) {
        console.error('Error fetching budget:', error);
    }
};


export const addBudget = async (budgetData) => {
  try {
    const token = localStorage.getItem('token'); // Assuming you're storing the token in localStorage
    const response = await fetch('http://localhost:8080/api/finance/budgets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `${token}`,
      },
      body: JSON.stringify(budgetData),
    });

    if (!response.ok) {
      throw new Error(`Failed to add budget: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("budget data ", data);
    return data;
  } catch (error) {
    console.error(error);
    throw new Error('Error adding budget');
  }
};

export const updateBudget = async (budgetId, budget) => {
  try {
    const response = await fetch(`${API_BASE_URL}/budgets/${budgetId}`, {
      method: "PUT",
      headers: requestHeaders(),
      body: JSON.stringify(budget),
    });

    if (!response.ok) throw new Error("Failed to update budget");
    return await response.json();

  } catch (error) {
    console.error("Error updating budget:", error);
    return null;
  }
};

export const deleteBudget = async (budgetId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/budgets/${budgetId}`, {
      method: "DELETE",
      headers: requestHeaders(),
    });
    if (!response.ok) throw new Error("Failed to delete budget");
    return true;
  } catch (error) {
    console.error("Error deleting budget:", error);
    return false;
  }
};
