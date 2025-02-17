import axios from 'axios';

const API_BASE_URL = "http://localhost:8080/api/finance";
const getToken = () => localStorage.getItem("token");

const requestHeaders = () => ({
  "Authorization": `${getToken()}`,
  "Content-Type": "application/json",
  "Cache-Control": "no-cache, no-store, must-revalidate",
  "Pragma": "no-cache",
  "Expires": "0",
});

export const fetchBudgetDetails = async (accountId) => {
    try {
        if (!getToken()) throw new Error('No token found');
        if (!accountId) {
            console.error('Account ID is undefined or invalid');
            return;
        }

        const budgetResponse = await axios.get(`${API_BASE_URL}/budgets/${accountId}`, {
            headers: requestHeaders(),
            credentials: 'include',
        });

        const budgets = budgetResponse.data;

        const budgetDetailsPromises = budgets.map(async (budget) => {
            const [progressResponse, exceededResponse] = await Promise.all([
                axios.get(`${API_BASE_URL}/budgets/${budget.id}/progress`, { headers: requestHeaders(), credentials: 'include' }),
                axios.get(`${API_BASE_URL}/budgets/${budget.id}/exceeded`, { headers: requestHeaders(), credentials: 'include' })
            ]);

            return {
                ...budget,
                progress: progressResponse.data,
                isExceeded: exceededResponse.data,
            };
        });

        return await Promise.all(budgetDetailsPromises);
    } catch (error) {
        console.error('Error fetching budget details:', error);
    }
};

export const fetchAllBudgets = async (accountId) => {
    try {
        if (!getToken()) throw new Error('No token found');

        const response = await fetch(`${API_BASE_URL}/budgets/${accountId}`, {
            method: "GET",
            headers: requestHeaders(),
            credentials: 'include',
        });

        if (!response.ok) throw new Error('Network response was not ok');

        return await response.json() || [];
    } catch (error) {
        console.error('Error fetching budgets:', error);
        return [];
    }
};

export const fetchBudgetById = async (budgetId) => {
    try {
        if (!getToken()) throw new Error('No token found');
        console.log('Fetching budget with ID:', budgetId);

        const response = await fetch(`${API_BASE_URL}/budgets/${budgetId}`, {
            method: "GET",
            headers: requestHeaders(),
            credentials: 'include',
        });

        if (!response.ok) throw new Error('Network response was not ok');

        return await response.json();
    } catch (error) {
        console.error('Error fetching budget:', error);
    }
};

export const addBudget = async (budgetData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/budgets`, {
            method: 'POST',
            headers: requestHeaders(),
            body: JSON.stringify(budgetData),
        });

        if (!response.ok) throw new Error(`Failed to add budget: ${response.statusText}`);

        return await response.json();
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