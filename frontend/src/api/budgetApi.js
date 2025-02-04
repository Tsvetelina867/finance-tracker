import axios from 'axios';

export async function fetchBudgetDetails(accountId) {
    try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No token found');

        if (!accountId) {
            console.error('Account ID is undefined or invalid');
            return;
        }

        const budgetResponse = await axios.get(`http://localhost:8080/api/finance/budgets/${accountId}`, {
            headers: {
                'Authorization': `${token}`,
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0',
            },
            credentials: 'include',
        });

        const budgets = budgetResponse.data; // Make sure budget contains id
        const budget = budgets[0];

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

        const budgetDetails = {
            ...budget,
            progress,
            isExceeded,
        };

        return budgetDetails;

    } catch (error) {
        console.error('Error fetching budget details:', error);
    }
}
