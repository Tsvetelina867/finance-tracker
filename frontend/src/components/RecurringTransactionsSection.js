import React, { useState, useEffect } from 'react';
import { fetchRecurringTransactions } from '../api/recurringTransactionsApi'; // Import here
import '../styles/RecurringTransactionsSection.css';

const RecurringTransactionsSection = ({ currentAccount }) => {
  const [recurringTransactions, setRecurringTransactions] = useState([]);

  useEffect(() => {
    const getRecurringTransactions = async () => {
      try {
        if (currentAccount && currentAccount.id) {
          const data = await fetchRecurringTransactions(currentAccount.id);
          setRecurringTransactions(data || []);
        }
      } catch (error) {
        console.error('Error fetching recurring transactions:', error);
        setRecurringTransactions([]);
      }
    };

    if (currentAccount) {
      getRecurringTransactions();
    }
  }, [currentAccount]);


  return (
    <div className="recurring-transactions-section">
      <h2>Recurring Transactions</h2>

      <ul className="recurring-transaction-list">
        {recurringTransactions.length > 0 ? (
          recurringTransactions.map((transaction) => (
            <li key={transaction.id}>
              <div className="transaction-details">
                <span>{transaction.description}</span>
                <span>{transaction.amount} {currentAccount.currency}</span>
                <span>Next: {transaction.nextPaymentDate}</span>
                <span>Frequency: {transaction.frequency}</span>
              </div>
              <div className="transaction-actions">
                <button>Edit</button>
                <button>Delete</button>
              </div>
            </li>
          ))
        ) : (
          <p>No recurring transactions set.</p>
        )}
      </ul>
      <button className="add-recurring-btn">Add New Recurring Transaction</button>
    </div>
  );
};

export default RecurringTransactionsSection;
