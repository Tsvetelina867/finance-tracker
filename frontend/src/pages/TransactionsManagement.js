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
  const [account, setAccount] = useState(currentAccount);
;
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('regular');
  const [transactions, setTransactions] = useState([]);
  const [recurringTransactions, setRecurringTransactions] = useState([]);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isRecurringModalOpen, setIsRecurringModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);



  useEffect(() => {
    if (account) {
      fetchTransactions();
      fetchRecurringTransactionsData();
    }
  }, [account]);

  const fetchTransactions = async () => {
    if (account) {
      const data = await fetchAllTransactions(account.id);
      setTransactions(data);
    }
  };

  const fetchRecurringTransactionsData = async () => {
    if (account) {
      const data = await fetchRecurringTransactions(account.id);
      setRecurringTransactions(data);
    }
  };

  const toggleTab = (tab) => setActiveTab(tab);

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
         <button onClick={() => navigate(-1)} style={{
                                                        backgroundColor: '#4CAF50',
                                                        color: 'white',
                                                        padding: '10px 20px',
                                                        border: 'none',
                                                        borderRadius: '5px',
                                                        cursor: 'pointer',
                                                        fontSize: '16px',
                                                        marginBottom: '20px',
                                                        textAlign: 'center',
                                                        display: 'inline-block',
                                                      }}
                                                      className="back-button small-button">⬅️ Back to Dashboard</button>
          <h1>Transactions Management</h1>
          <p>No account selected. Please select an account to manage transactions.</p>
        </div>
      );
    }

  return (
    <div className="transactions-management">
    <h1 className="page-heading">Transactions Management</h1>

          <button onClick={() => navigate(-1)} className="back-button small-button">⬅️ Back to Dashboard</button>
      <div className="tabs">
        <button onClick={() => toggleTab('regular')} className={activeTab === 'regular' ? 'active' : ''}>
          Regular Transactions
        </button>
        <button onClick={() => toggleTab('recurring')} className={activeTab === 'recurring' ? 'active' : ''}>
          Recurring Transactions
        </button>
      </div>

      {activeTab === 'regular' && (
        <div className="regular-transactions-section">
          <h3>Regular Transactions</h3>
          <button className="add-button" onClick={() => handleOpenTransactionModal()}>➕ Add Transaction</button>
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
                        {transaction.amount} {transaction.currency || account.currency}
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
          <button className="add-button" onClick={() => handleOpenRecurringModal()}>➕ Add Recurring Transaction</button>
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
                        {transaction.amount} {transaction.currency || account.currency}
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

      <TransactionModal
        isOpen={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
        onSave={() => {
          setIsTransactionModalOpen(false);
          fetchTransactions();
        }}
        transaction={editingTransaction}
        currentAccount={account}
        updateAccountBalance={(newBalance) => {
            setAccount(prev => ({
              ...prev,
              balance: newBalance,
            }));
        }}
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
