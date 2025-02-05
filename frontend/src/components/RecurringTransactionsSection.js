import React, { useState, useEffect } from 'react';
import { fetchRecurringTransactions } from '../api/recurringTransactionsApi'; // Fetch active recurring transactions
import { fetchPastRecurringTransactions } from '../api/recurringTransactionsApi'; // Fetch past recurring transactions
import '../styles/RecurringTransactionsSection.css';

const RecurringTransactionsSection = ({ currentAccount }) => {
  const [recurringTransactions, setRecurringTransactions] = useState([]);
  const [pastTransactions, setPastTransactions] = useState(null); // Set to null initially
  const [showPastTransactions, setShowPastTransactions] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [errorMessage, setErrorMessage] = useState(''); // For error messages

  // Fetch active recurring transactions
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

  // Utility function to calculate the next payment date
  const calculateNextPaymentDate = (startDate, frequency) => {
    let nextDate = new Date(startDate);
    switch (frequency) {
      case 'DAILY':
        nextDate.setDate(nextDate.getDate() + 1);
        break;
      case 'WEEKLY':
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      case 'MONTHLY':
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
      case 'ANNUALLY':
        nextDate.setFullYear(nextDate.getFullYear() + 1);
        break;
      default:
        break;
    }
    return nextDate;
  };

  // Handle fetching and displaying past recurring transactions
  const handleShowPastTransactions = async () => {
    // Only proceed if both dates are selected
    if (!startDate || !endDate) {
      setErrorMessage('Please select both start and end dates.');
      return;
    }

    try {
      // Clear previous error message
      setErrorMessage('');
      console.log('Fetching past transactions with', startDate, endDate); // Debugging line
      const data = await fetchPastRecurringTransactions(currentAccount.id, startDate, endDate);

      // Set the state for past transactions
      if (data && data.length > 0) {
        setPastTransactions(data); // Set fetched data
      } else {
        setPastTransactions([]); // No transactions found, set to empty array
      }

      setShowPastTransactions(true); // Ensure past transactions are shown after fetching
    } catch (error) {
      console.error('Error fetching past recurring transactions:', error);
      setErrorMessage('There was an error fetching past transactions.');
    }
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    if (name === 'startDate') {
      setStartDate(value);
    } else if (name === 'endDate') {
      setEndDate(value);
    }
  };

  const handleTogglePastTransactions = () => {
    setShowPastTransactions((prev) => !prev); // Toggle visibility of past transactions
  };

  return (
    <div className="recurring-transactions-section">
      <h2>Active Recurring Transactions</h2>

      {/* Show Active Recurring Transactions */}
      <ul className="recurring-transaction-list">
        {recurringTransactions.length > 0 ? (
          recurringTransactions.map((transaction) => {
            // Calculate next payment date dynamically
            const nextPaymentDate = calculateNextPaymentDate(transaction.startDate, transaction.frequency);

            return (
              <li key={transaction.id || `transaction-${transaction.description}`}>
                <div className="transaction-details">
                  <span>{transaction.description}</span>
                  <span>{transaction.amount} {currentAccount.currency}</span>
                  <span>Next: {nextPaymentDate.toLocaleDateString()}</span> {/* Display formatted next payment date */}
                  <span>Frequency: {transaction.frequency}</span>
                </div>
              </li>
            );
          })
        ) : (
          <p>No active recurring transactions found.</p>
        )}
      </ul>

      {/* Button to show/hide past transactions */}
      <button
        className="view-past-transactions-btn"
        onClick={handleTogglePastTransactions}
      >
        {showPastTransactions ? 'Hide Past Transactions' : 'View Past Transactions'}
      </button>

      {/* Date picker to select the range of past transactions */}
      {showPastTransactions && (
        <div className="date-picker-container">
          <label>
            Start Date:
            <input type="date" name="startDate" value={startDate} onChange={handleDateChange} />
          </label>
          <label>
            End Date:
            <input type="date" name="endDate" value={endDate} onChange={handleDateChange} />
          </label>
          <button className="submit-date-range-btn" onClick={handleShowPastTransactions}>
            View Transactions
          </button>
        </div>
      )}

      {/* Error message if dates are not selected */}
      {errorMessage && <p className="error-message">{errorMessage}</p>}

      {/* Show Past Recurring Transactions */}
      {showPastTransactions && (
        <div className="past-transactions-section">
          <h3>Past Recurring Transactions</h3>
          {pastTransactions === null ? (
            <p>Loading past transactions...</p> // Show loading message until data is fetched
          ) : pastTransactions.length > 0 ? (
            <ul className="past-recurring-transaction-list">
              {pastTransactions.map((transaction) => (
                <li key={transaction.id || `transaction-${transaction.description}`}>
                  <div className="transaction-details">
                    <span>{transaction.description}</span>
                    <span>{transaction.amount} {currentAccount.currency}</span>
                    <span>Date: {transaction.transactionDate}</span>
                    <span>Frequency: {transaction.frequency}</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>No past transactions found for the selected date range.</p> // Only show if no data is returned
          )}
        </div>
      )}
    </div>
  );
};

export default RecurringTransactionsSection;
