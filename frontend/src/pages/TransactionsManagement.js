import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import TransactionModal from '../components/TransactionModal';
import RecurringTransactionModal from '../components/RecurringTransactionModal';
import { fetchAllTransactions, addTransaction, updateTransaction, deleteTransaction } from '../api/transactionsApi';
import { fetchRecurringTransactions, addRecurringTransaction, updateRecurringTransaction, deleteRecurringTransaction } from '../api/recurringTransactionsApi';
import '../styles/TransactionsManagement.css';

const TransactionsManagement = () => {
  const location = useLocation();
  const currentAccount = location.state?.currentAccount;
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('regular');
  const [transactions, setTransactions] = useState([]);
  const [recurringTransactions, setRecurringTransactions] = useState([]);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isRecurringModalOpen, setIsRecurringModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  useEffect(() => {
    if (currentAccount) {
      fetchTransactions();
      fetchRecurringTransactionsData();
    }
  }, [currentAccount]);

  const fetchTransactions = async () => {
    if (currentAccount) {
      const data = await fetchAllTransactions(currentAccount.id);
      setTransactions(data);
    }
  };

  const fetchRecurringTransactionsData = async () => {
    if (currentAccount) {
      const data = await fetchRecurringTransactions(currentAccount.id);
      setRecurringTransactions(data);
    }
  };

  const toggleTab = (tab) => setActiveTab(tab);

  const handleOpenTransactionModal = (transaction = null) => {
    setEditingTransaction(transaction);
    setIsTransactionModalOpen(true);
  };

  const handleOpenRecurringModal = (transaction = null) => {
    setEditingTransaction(transaction);
    setIsRecurringModalOpen(true);
  };

  return (
    <div className="transactions-management">
    <h1 className="page-heading">Transactions Management</h1>
    {/* Back to Dashboard Button */}
          <button onClick={() => navigate(-1)} className="back-button small-button">⬅️ Back to Dashboard</button>
      <div className="tabs">
        <button onClick={() => toggleTab('regular')} className={activeTab === 'regular' ? 'active' : ''}>
          Regular Transactions
        </button>
        <button onClick={() => toggleTab('recurring')} className={activeTab === 'recurring' ? 'active' : ''}>
          Recurring Transactions
        </button>
      </div>

      {/* Regular Transactions Section */}
      {activeTab === 'regular' && (
        <div className="regular-transactions-section">
          <h3>Regular Transactions</h3>
          <button onClick={() => handleOpenTransactionModal()}>➕ Add Transaction</button>
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
                      <span className="transaction-date">{new Date(transaction.date).toLocaleDateString()}</span>
                      <span className="transaction-amount">
                        {transaction.amount} {transaction.currency || currentAccount.currency}
                      </span>
                    </div>
                    <div className="button-container">
                      <button className="edit-button" onClick={() => handleOpenTransactionModal(transaction)}>✏️ Edit</button>
                      <button className="delete-button" onClick={() => deleteTransaction(transaction.id).then(fetchTransactions)}>🗑️ Delete</button>
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      )}

      {activeTab === 'recurring' && (
        <div className="recurring-transactions-section">
          <h3>Recurring Transactions</h3>
          <button onClick={() => handleOpenRecurringModal()}>➕ Add Recurring Transaction</button>
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
                      <span className="transaction-date">{transaction.frequency}</span>
                      <span className="transaction-amount">
                        {transaction.amount} {transaction.currency || currentAccount.currency}
                      </span>
                    </div>
                    <div className="button-container">
                      <button className="edit-button" onClick={() => handleOpenRecurringModal(transaction)}>✏️ Edit</button>
                      <button className="delete-button" onClick={() => deleteRecurringTransaction(transaction.id).then(fetchRecurringTransactionsData)}>🗑️ Delete</button>
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      )}

      {/* Regular Transaction Modal */}
      <TransactionModal
        isOpen={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
        onSave={() => {
          setIsTransactionModalOpen(false);
          fetchTransactions();
        }}
        transaction={editingTransaction}
        currentAccount={currentAccount}
      />

      {/* Recurring Transaction Modal */}
      <RecurringTransactionModal
        isOpen={isRecurringModalOpen}
        onClose={() => setIsRecurringModalOpen(false)}
        onSave={() => {
          setIsRecurringModalOpen(false);
          fetchRecurringTransactionsData();
        }}
        transaction={editingTransaction}
        currentAccount={currentAccount}
      />
    </div>
  );
};

export default TransactionsManagement;
