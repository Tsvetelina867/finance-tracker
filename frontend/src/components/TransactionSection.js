import React, { useState, useEffect } from 'react';
import { fetchTransactionsByDateRange } from '../api/transactionsApi';
import '../styles/TransactionsSection.css';

const TransactionsSection = ({ currentAccount }) => {
  const [transactions, setTransactions] = useState([]);
  const [startDate, setStartDate] = useState(getPastDate(30));
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (currentAccount) {
      fetchTransactions();
    }
  }, [currentAccount]);

  const fetchTransactions = async () => {
    try {
      const data = await fetchTransactionsByDateRange(currentAccount.id, startDate, endDate);
      setTransactions(data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setTransactions([]);
    }
  };

  return (
    <div className="transactions-section">

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
              <div className="transaction-details">
                        <span className="description">{transaction.description}</span>
                        <span className="amount">{transaction.amount} {transaction.currency || currentAccount.currency}</span>
                        <span className="date">{new Date(transaction.date).toLocaleDateString()}</span>
                        <span className="category">/{transaction.category.name}/</span>
                      </div>
            </li>
          ))
        ) : (
          <p>No transactions found for this period.</p>
        )}
      </ul>
    </div>
  );
};

function getPastDate(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
}

export default TransactionsSection;
