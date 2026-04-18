import React, { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import TransactionModal from "../components/TransactionModal";
import RecurringTransactionModal from "../components/RecurringTransactionModal";
import "../styles/TransactionsSection.css";
import {
  fetchTransactionsByDateRange,
  deleteTransaction,
} from "../api/transactionsApi";
import {
  fetchRecurringTransactions,
  deleteRecurringTransaction,
} from "../api/recurringTransactionsApi";
import "../styles/TransactionsManagement.css";

function getPastDate(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split("T")[0];
}

const TransactionsManagement = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const currentAccount = location.state?.currentAccount;
  const [account, setAccount] = useState(currentAccount);

  const [activeTab, setActiveTab] = useState("regular");
  const [transactions, setTransactions] = useState([]);
  const [recurringTransactions, setRecurringTransactions] = useState([]);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isRecurringModalOpen, setIsRecurringModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  const [startDate, setStartDate] = useState(getPastDate(30));
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [appliedStart, setAppliedStart] = useState(getPastDate(30));
  const [appliedEnd, setAppliedEnd] = useState(
    new Date().toISOString().split("T")[0],
  );

  const fetchTransactions = useCallback(async () => {
    if (!account) return;
    try {
      const data = await fetchTransactionsByDateRange(
        account.id,
        appliedStart,
        appliedEnd,
      );
      setTransactions(data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  }, [account, appliedStart, appliedEnd]);

  const fetchRecurringTransactionsData = useCallback(async () => {
    if (!account) return;
    try {
      const data = await fetchRecurringTransactions(account.id);
      setRecurringTransactions(data);
    } catch (error) {
      console.error("Error fetching recurring transactions:", error);
    }
  }, [account]);

  useEffect(() => {
    if (account) {
      fetchTransactions();
      fetchRecurringTransactionsData();
    }
  }, [account, fetchTransactions, fetchRecurringTransactionsData]);

  const handleApply = () => {
    setAppliedStart(startDate);
    setAppliedEnd(endDate);
  };

  const handleOpenTransactionModal = (transaction = null) => {
    setEditingTransaction(null);
    setTimeout(() => {
      setEditingTransaction(transaction);
      setIsTransactionModalOpen(true);
    }, 0);
  };

  const handleOpenRecurringModal = (transaction = null) => {
    setEditingTransaction(transaction);
    setIsRecurringModalOpen(true);
  };

  if (!account) {
    return (
      <div>
        <button
          onClick={() => navigate(-1)}
          style={{
            backgroundColor: "#4CAF50",
            color: "white",
            padding: "10px 20px",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontSize: "16px",
            marginBottom: "20px",
          }}
        >
          ⬅️ Back to Dashboard
        </button>
        <h1>Transactions Management</h1>
        <p>
          No account selected. Please select an account to manage transactions.
        </p>
      </div>
    );
  }

  return (
    <div className="transactions-management">
      <h1 className="page-heading">Transactions Management</h1>

      <button onClick={() => navigate(-1)} className="back-button small-button">
        ⬅️ Back to Dashboard
      </button>

      <div className="tabs">
        <button
          onClick={() => setActiveTab("regular")}
          className={activeTab === "regular" ? "active" : ""}
        >
          Regular Transactions
        </button>
        <button
          onClick={() => setActiveTab("recurring")}
          className={activeTab === "recurring" ? "active" : ""}
        >
          Recurring Transactions
        </button>
      </div>

      {activeTab === "regular" && (
        <div className="regular-transactions-section">
          <h3>Regular Transactions</h3>

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
            <button onClick={handleApply}>Apply</button>
          </div>

          <button
            className="add-button"
            onClick={() => handleOpenTransactionModal()}
          >
            ➕ Add Transaction
          </button>

          <ul className="transaction-list">
            {transactions.length === 0 ? (
              <p>❌ No transactions found.</p>
            ) : (
              transactions.map((transaction) => (
                <li key={transaction.id}>
                  <div className="transaction-content">
                    <div className="transaction-header">
                      {transaction.description}
                    </div>
                    <div className="transaction-details">
                      <span className="transaction-date">
                        {new Date(transaction.date).toLocaleDateString()}
                      </span>
                      <span className="transaction-amount">
                        {transaction.amount}{" "}
                        {transaction.currency || account.currency}
                      </span>
                    </div>
                    <div className="button-container">
                      <button
                        className="edit-button"
                        onClick={() => handleOpenTransactionModal(transaction)}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        className="delete-button"
                        onClick={() =>
                          deleteTransaction(transaction.id).then(
                            fetchTransactions,
                          )
                        }
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      )}

      {activeTab === "recurring" && (
        <div className="recurring-transactions-section">
          <h3>Recurring Transactions</h3>
          <button
            className="add-button"
            onClick={() => handleOpenRecurringModal()}
          >
            ➕ Add Recurring Transaction
          </button>
          <ul className="recurring-transaction-list">
            {recurringTransactions.length === 0 ? (
              <p>No recurring transactions available.</p>
            ) : (
              recurringTransactions.map((transaction) => (
                <li key={transaction.id}>
                  <div className="transaction-content">
                    <div className="transaction-header">
                      {transaction.description}
                    </div>
                    <div className="transaction-details">
                      <span className="transaction-date">
                        {transaction.frequency}
                      </span>
                      <span className="transaction-amount">
                        {transaction.amount}{" "}
                        {transaction.currency || account.currency}
                      </span>
                    </div>
                    <div className="button-container">
                      <button
                        className="edit-button"
                        onClick={() => handleOpenRecurringModal(transaction)}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        className="delete-button"
                        onClick={() =>
                          deleteRecurringTransaction(transaction.id).then(
                            fetchRecurringTransactionsData,
                          )
                        }
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      )}

      <TransactionModal
        isOpen={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
        onSave={() => {
          setIsTransactionModalOpen(false);
          fetchTransactions();
        }}
        transaction={editingTransaction}
        currentAccount={account}
        updateAccountBalance={(newBalance) =>
          setAccount((prev) => ({ ...prev, balance: newBalance }))
        }
      />

      <RecurringTransactionModal
        isOpen={isRecurringModalOpen}
        onClose={() => setIsRecurringModalOpen(false)}
        onSave={() => {
          setIsRecurringModalOpen(false);
          fetchRecurringTransactionsData();
        }}
        transaction={editingTransaction}
        currentAccount={account}
      />
    </div>
  );
};

export default TransactionsManagement;
