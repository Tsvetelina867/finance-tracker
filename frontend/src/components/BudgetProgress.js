import React, { useEffect, useState } from 'react';
import '../styles/BudgetProgress.css';
import { fetchBudgetDetails } from '../api/budgetApi';

const BudgetProgress = ({ currentAccount }) => {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showOnDashboard, setShowOnDashboard] = useState({});
  const accountId = currentAccount.id;

  // Fetch showOnDashboard from localStorage once when the component mounts
  useEffect(() => {
    const savedShowOnDashboard = localStorage.getItem('showOnDashboard');
    if (savedShowOnDashboard) {
      setShowOnDashboard(JSON.parse(savedShowOnDashboard));
    }
  }, []);  // This effect runs only once when the component mounts

  // Fetch budget details based on accountId and showOnDashboard
  useEffect(() => {
    if (!accountId) return;  // If accountId is not available, stop execution

    const getBudgetDetails = async () => {
      setLoading(true);
      try {
        const fetchedBudgets = await fetchBudgetDetails(accountId);
        console.log(fetchedBudgets);

        if (fetchedBudgets) {
          const visibleBudgets = fetchedBudgets.filter(budget => {
            const shouldShow = showOnDashboard && showOnDashboard[budget.id];
            return shouldShow === true;
          });
          setBudgets(visibleBudgets);
        } else {
          console.log('No budgets returned from API');
        }
      } catch (error) {
        console.error('Error fetching budget details:', error);
      }
      setLoading(false);
    };

    getBudgetDetails();  // Only fetch budgets if accountId exists
  }, [accountId, showOnDashboard]);  // Add showOnDashboard as a dependency here

  if (loading) {
    return <div>Loading budgets...</div>;
  }

  return (
    <div className="budget-progress-container">
      {budgets.length === 0 ? (
        <div>No budgets available</div>
      ) : (
        budgets.map((budget) => {
          const progress = ((budget.currentSpending / budget.budgetLimit) * 100).toFixed(2);
          const remainingBudget = budget.budgetLimit - budget.currentSpending;
          const isBudgetExceeded = progress > 100;

          return (
            <div key={budget.id} className="budget-card">
              <h3>{budget.description}</h3>
              <div className="budget-details">
                <p>Budget Limit: {budget.budgetLimit} {currentAccount?.currency}</p>
                <p>Current Spending: {budget.currentSpending} {currentAccount?.currency}</p>
                <p className={isBudgetExceeded ? "exceeded" : "remaining"}>
                  {isBudgetExceeded
                    ? `Exceeded by ${Math.abs(remainingBudget).toFixed(2)} ${currentAccount?.currency}`
                    : `Remaining: ${remainingBudget.toFixed(2)} ${currentAccount?.currency}`}
                </p>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${progress}%`, backgroundColor: isBudgetExceeded ? '#ff6b6b' : '#4caf50' }}
                  data-tooltip={`${progress}%`}
                />
              </div>
              <p className="progress-status">{isBudgetExceeded ? "Budget Exceeded" : "Within Budget"}</p>
            </div>
          );
        })
      )}
    </div>
  );
};

export default BudgetProgress;
