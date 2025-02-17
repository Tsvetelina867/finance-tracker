import React, { useState, useEffect } from 'react';
import { fetchRecurringTransactions, fetchPastRecurringTransactions } from '../api/recurringTransactionsApi';
import '../styles/RecurringTransactionsSection.css';

const RecurringTransactionsSection = ({ currentAccount }) => {
  const [recurringTransactions, setRecurringTransactions] = useState([]);
  const [pastTransactions, setPastTransactions] = useState(null);
  const [showPastTransactions, setShowPastTransactions] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const calculateNextPaymentDate = (startDate, frequency, transactionEndDate) => {
      let nextDate = new Date(startDate);

      // Add one period (this basic approach assumes you want the NEXT date from the start date)
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

      // If there is an end date and the next payment date is after it, return null
      if (transactionEndDate) {
        const end = new Date(transactionEndDate);
        if (nextDate > end) {
          return null;
        }
      }

      return nextDate;
    };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const parsedDate = new Date(dateString);
    if (isNaN(parsedDate)) {
      console.warn('Invalid Date:', dateString);
      return 'Invalid Date';
    }
    return parsedDate.toLocaleDateString();
  };

  const isActiveTransaction = (transaction) => {
      const nextPaymentDate = calculateNextPaymentDate(transaction.startDate, transaction.frequency, transaction.endDate);
      return nextPaymentDate !== null && nextPaymentDate > new Date();
    };

  useEffect(() => {
    const getRecurringTransactions = async () => {
      try {
        if (currentAccount && currentAccount.id) {
          const data = await fetchRecurringTransactions(currentAccount.id);
          setRecurringTransactions(data.filter(isActiveTransaction) || []);
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

  const handleShowPastTransactions = async () => {
    if (!startDate || !endDate) {
      setErrorMessage('Please select both start and end dates.');
      return;
    }

    try {
      setErrorMessage('');
      const data = await fetchPastRecurringTransactions(currentAccount.id, startDate, endDate);

      const pastTransactionsData = data.filter(transaction => !isActiveTransaction(transaction));

      if (pastTransactionsData.length > 0) {
        setPastTransactions(pastTransactionsData);
      } else {
        setPastTransactions([]);
      }

      setShowPastTransactions(true);
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
    setShowPastTransactions((prev) => !prev);
  };

  return (
    <div className="recurring-transactions-section">
      <h2>Active Recurring Transactions</h2>

      <ul className="recurring-transaction-list">
        {recurringTransactions.length > 0 ? (
          recurringTransactions.map((transaction) => {
            const nextPaymentDate = calculateNextPaymentDate(transaction.startDate, transaction.frequency);

            return (
              <li key={transaction.id || `transaction-${transaction.description}`}>
                <div className="transaction-details">
                  <span>{transaction.description}</span>
                  <span className="transaction-amount">{transaction.amount} {currentAccount.currency}</span>
                  <span className="transaction-date"><strong>Next Payment:</strong> {nextPaymentDate.toLocaleDateString()}</span>
                  <span className="transaction-date"><strong>End Date:</strong> {formatDate(transaction.endDate)}</span>
                  <span>{transaction.frequency}</span>
                  <span className="transaction-category"><strong>Category:</strong> {transaction.category.name}</span>
                </div>
              </li>

            );
          })
        ) : (
          <p>No active recurring transactions found.</p>
        )}
      </ul>

      <button
        className="view-past-transactions-btn"
        onClick={handleTogglePastTransactions}
      >
        {showPastTransactions ? 'Hide Past Transactions' : 'View Past Transactions'}
      </button>

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

      {errorMessage && <p className="error-message">{errorMessage}</p>}

      {showPastTransactions && (
        <div className="past-transactions-section">
          <h3>Past Recurring Transactions</h3>
          {pastTransactions === null ? (
            <p>Loading past transactions...</p>
          ) : pastTransactions.length > 0 ? (
            <ul className="past-recurring-transaction-list">
              {pastTransactions.map((transaction) => (
                <li key={transaction.id || `transaction-${transaction.description}`}>
                  <div className="transaction-details-past">
                    <span>{transaction.description}</span>
                    <span>{transaction.amount} {currentAccount.currency}</span>
                    <span>End Date: {formatDate(transaction.endDate)}</span>
                    <span>Frequency: {transaction.frequency}</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>No past transactions found for the selected date range.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default RecurringTransactionsSection;
