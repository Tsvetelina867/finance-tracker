import React, { useState, useEffect } from 'react';
import TransactionModal from '../components/TransactionModal'; // Import the modal component
import { fetchTransactionsByDateRange } from '../api/transactionsApi';
import { fetchRecurringTransactions } from '../api/recurringTransactionsApi';
import '../styles/TransactionsManagement.css';

const TransactionsManagement = ({ currentAccount }) => {
  const [activeTab, setActiveTab] = useState('regular');
  const [transactions, setTransactions] = useState([]);
  const [recurringTransactions, setRecurringTransactions] = useState([]);
  const [viewPastRecurring, setViewPastRecurring] = useState(false);
  const [startDate, setStartDate] = useState(getPastDate(30));
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  useEffect(() => {
    if (currentAccount) {
      fetchTransactions();
      fetchRecurringTransactionsData();
    }
  }, [currentAccount, viewPastRecurring]);

  const fetchTransactions = async () => {
    if (currentAccount) {
      const data = await fetchTransactionsByDateRange(currentAccount.id, startDate, endDate);
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

  const handleOpenModal = (transaction = null) => {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleSaveTransaction = (transaction) => {
    if (editingTransaction) {
      // Handle update logic
    } else {
      // Handle add logic
    }
    setIsModalOpen(false);
  };

  return (
    <div className="transactions-management">
      <div className="tabs">
        <button onClick={() => toggleTab('regular')} className={activeTab === 'regular' ? 'active' : ''}>Regular Transactions</button>
        <button onClick={() => toggleTab('recurring')} className={activeTab === 'recurring' ? 'active' : ''}>Recurring Transactions</button>
      </div>

      {activeTab === 'regular' && (
        <div className="regular-transactions-section">
          <h3>Regular Transactions</h3>
          <ul className="transaction-list">
            {transactions.map((transaction) => (
              <li key={transaction.id}>
                {transaction.date} - {transaction.description}: {transaction.amount} {currentAccount.currency}
                <button onClick={() => handleOpenModal(transaction)}>Edit</button>
                <button>Delete</button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {activeTab === 'recurring' && (
        <div className="recurring-transactions-section">
          <h3>Recurring Transactions</h3>
          <ul className="recurring-transaction-list">
            {recurringTransactions.map((transaction) => (
              <li key={transaction.id}>
                {transaction.description} - {transaction.amount} {currentAccount.currency}
                <button onClick={() => handleOpenModal(transaction)}>Edit</button>
                <button>Delete</button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTransaction}
        transaction={editingTransaction}
      />
    </div>
  );
};

function getPastDate(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
}

export default TransactionsManagement;
