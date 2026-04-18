import React, { useState, useEffect, useCallback } from "react";
import {
  fetchRecurringTransactions,
  fetchPastRecurringTransactions,
} from "../api/recurringTransactionsApi";
import "../styles/RecurringTransactionsSection.css";

const RecurringTransactionsSection = ({ currentAccount }) => {
  const [recurringTransactions, setRecurringTransactions] = useState([]);
  const [pastTransactions, setPastTransactions] = useState(null);
  const [showPastTransactions, setShowPastTransactions] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const calculateNextPaymentDate = useCallback(
    (startDate, frequency, transactionEndDate) => {
      let nextDate = new Date(startDate);
      const today = new Date();

      while (nextDate < today) {
        switch (frequency) {
          case "DAILY":
            nextDate.setDate(nextDate.getDate() + 1);
            break;
          case "WEEKLY":
            nextDate.setDate(nextDate.getDate() + 7);
            break;
          case "MONTHLY":
            nextDate.setMonth(nextDate.getMonth() + 1);
            break;
          case "ANNUALLY":
            nextDate.setFullYear(nextDate.getFullYear() + 1);
            break;
          default:
            return null;
        }
      }

      if (transactionEndDate && nextDate > new Date(transactionEndDate))
        return null;
      return nextDate;
    },
    [],
  );

  const isActiveTransaction = useCallback(
    (transaction) => {
      const next = calculateNextPaymentDate(
        transaction.startDate,
        transaction.frequency,
        transaction.endDate,
      );
      return next !== null && next > new Date();
    },
    [calculateNextPaymentDate],
  );

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const parsed = new Date(dateString);
    return isNaN(parsed) ? "Invalid Date" : parsed.toLocaleDateString();
  };

  useEffect(() => {
    if (!currentAccount?.id) return;

    const getRecurringTransactions = async () => {
      try {
        const data = await fetchRecurringTransactions(currentAccount.id);
        setRecurringTransactions(data.filter(isActiveTransaction));
      } catch (error) {
        console.error("Error fetching recurring transactions:", error);
        setRecurringTransactions([]);
      }
    };

    getRecurringTransactions();
  }, [currentAccount, isActiveTransaction]);

  const handleShowPastTransactions = async () => {
    if (!startDate || !endDate) {
      setErrorMessage("Please select both start and end dates.");
      return;
    }

    try {
      setErrorMessage("");
      const data = await fetchPastRecurringTransactions(
        currentAccount.id,
        startDate,
        endDate,
      );
      setPastTransactions(data.filter((t) => !isActiveTransaction(t)));
      setShowPastTransactions(true);
    } catch (error) {
      console.error("Error fetching past recurring transactions:", error);
      setErrorMessage("There was an error fetching past transactions.");
    }
  };

  return (
    <div className="recurring-transactions-section">
      <h2>Active Recurring Transactions</h2>

      <ul className="recurring-transaction-list">
        {recurringTransactions.length > 0 ? (
          recurringTransactions.map((transaction) => {
            const nextPaymentDate = calculateNextPaymentDate(
              transaction.startDate,
              transaction.frequency,
              transaction.endDate,
            );

            return (
              <li key={transaction.id}>
                <div className="transaction-details">
                  <span>{transaction.description}</span>
                  <span className="transaction-amount">
                    {transaction.amount} {currentAccount.currency}
                  </span>
                  <span className="transaction-date">
                    <strong>Next Payment:</strong>{" "}
                    {nextPaymentDate
                      ? nextPaymentDate.toLocaleDateString()
                      : "N/A"}
                  </span>
                  <span className="transaction-date">
                    <strong>End Date:</strong> {formatDate(transaction.endDate)}
                  </span>
                  <span>{transaction.frequency}</span>
                  <span className="transaction-category">
                    <strong>Category:</strong> {transaction.category?.name}
                  </span>
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
        onClick={() => setShowPastTransactions((prev) => !prev)}
      >
        {showPastTransactions
          ? "Hide Past Transactions"
          : "View Past Transactions"}
      </button>

      {showPastTransactions && (
        <div className="date-picker-container">
          <label>
            Start Date:
            <input
              type="date"
              name="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </label>
          <label>
            End Date:
            <input
              type="date"
              name="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </label>
          <button
            className="submit-date-range-btn"
            onClick={handleShowPastTransactions}
          >
            View Transactions
          </button>
        </div>
      )}

      {errorMessage && <p className="error-message">{errorMessage}</p>}

      {showPastTransactions && (
        <div className="past-transactions-section">
          <h3>Past Recurring Transactions</h3>
          {pastTransactions === null ? (
            <p>Select a date range and click View Transactions.</p>
          ) : pastTransactions.length > 0 ? (
            <ul className="past-recurring-transaction-list">
              {pastTransactions.map((transaction) => (
                <li key={transaction.id}>
                  <div className="transaction-details-past">
                    <span>{transaction.description}</span>
                    <span>
                      {transaction.amount} {currentAccount.currency}
                    </span>
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
