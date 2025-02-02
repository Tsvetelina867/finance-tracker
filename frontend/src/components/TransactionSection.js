import React, { useState, useEffect } from 'react';
import { fetchTransactionsByDateRange } from '../api/transactionsApi';
import '../styles/TransactionsSection.css';

const TransactionsSection = ({ currentAccount }) => {
  const [transactions, setTransactions] = useState([]);
  const [startDate, setStartDate] = useState(getPastDate(30)); // Default: 30 days ago
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]); // Today

  useEffect(() => {
    if (currentAccount) {
      fetchTransactions();
    }
  }, [currentAccount, startDate, endDate]);

  const fetchTransactions = async () => {
    try {
      const data = await fetchTransactionsByDateRange(currentAccount.id, startDate, endDate);
      console.log('Fetched Transactions:', data);

      // Ensure the fetched data is an array before setting state
      setTransactions(data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setTransactions([]);
    }
  };

  return (
    <div className="transactions-section">
      <h2>Transaction History</h2>

      <div className="date-filter">
        <label>From:</label>
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        <label>To:</label>
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        <button onClick={fetchTransactions}>Apply</button>
      </div>

      <ul className="transaction-list">
        {transactions && transactions.length > 0 ? (
          transactions.map((transaction) => (
            <li key={transaction.id}>
              {transaction.date} - {transaction.description}: {transaction.amount} {currentAccount.currency}
            </li>
          ))
        ) : (
          <p>No transactions found for this period.</p>
        )}
      </ul>
    </div>
  );
};

// Helper function to get past date
function getPastDate(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
}

export default TransactionsSection;
