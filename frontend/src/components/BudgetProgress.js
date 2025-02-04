import React, { useState, useEffect } from 'react';  // Import useState and useEffect
import { fetchBudgetDetails } from '../api/budgetApi';
import '../styles/BudgetProgress.css';

// Assuming you have a component like BudgetProgress for rendering budget progress

const BudgetProgress = ({ currentAccount }) => {
  const [budgetData, setBudgetData] = useState(null); // Declare state for budget data

  useEffect(() => {
    const fetchData = async () => {
      if (!currentAccount) return;
      try {
        const budgetRes = await fetchBudgetDetails(currentAccount.id);  // Fetch budget details
        console.log("Fetched budget details:", budgetRes);  // Log the fetched data
        setBudgetData(budgetRes);  // Set the budget data
      } catch (error) {
        console.error("Error fetching budget details:", error);
      }
    };

    fetchData();  // Call the fetch function when the component is mounted or currentAccount changes
  }, [currentAccount]); // Run this effect when currentAccount changes

  if (!budgetData) {
    return <div>Loading...</div>;  // Show loading state if budget data is not available
  }

  // Render the budget progress data
  return (
    <div className="budget-progress-container">
      <h2>{budgetData.description}</h2>
      <p>Budget Limit: {budgetData.budgetLimit} {budgetData.account.currency}</p>
      <p>Current Spending: {budgetData.currentSpending} {budgetData.account.currency}</p>
      <p>Progress: {budgetData.progress}%</p>
      <p>{budgetData.isExceeded ? "Budget Exceeded" : "Within Budget"}</p>
    </div>
  );
};

export default BudgetProgress;