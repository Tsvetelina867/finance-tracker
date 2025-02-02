import React from 'react';
import '../styles/BudgetProgress.css';

const BudgetProgress = ({ budget }) => {
  if (!budget) return <p>No budget data available</p>;

  const progress = (budget.currentSpending / budget.budgetLimit) * 100;

  return (
    <div className="budget-progress">
      <h3>Budget Progress</h3>
      <p>Limit: {budget.budgetLimit} {budget.currency}</p>
      <p>Spent: {budget.currentSpending} {budget.currency}</p>
      <div className="progress-bar">
        <div className="progress" style={{ width: `${progress}%` }}></div>
      </div>
      <p>Remaining: {budget.budgetLimit - budget.currentSpending} {budget.currency}</p>
    </div>
  );
};

export default BudgetProgress;
