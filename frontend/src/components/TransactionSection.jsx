import React from "react";
import "../styles/TransactionsSection.css";

const TransactionsSection = ({
  currentAccount,
  transactions,
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  onApply,
}) => {
  return (
    <div className="transactions-section">
      <div className="date-filter">
        <label>From:</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <label>To:</label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
        <button onClick={onApply}>Apply</button>
      </div>

      <ul className="transaction-list">
        {transactions && transactions.length > 0 ? (
          transactions.map((transaction) => (
            <li key={transaction.id}>
              <div className="transaction-details">
                <span className="description">{transaction.description}</span>
                <span className="amount">
                  {transaction.amount}{" "}
                  {transaction.currency || currentAccount.currency}
                </span>
                <span className="date">
                  {new Date(transaction.date).toLocaleDateString()}
                </span>
                <span className="category">/{transaction.category?.name}/</span>
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

export default TransactionsSection;
