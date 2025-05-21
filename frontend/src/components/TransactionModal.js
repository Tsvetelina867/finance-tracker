import React, { useState, useEffect } from 'react';
import { addTransaction, updateTransaction, fetchAllTransactions } from '../api/transactionsApi';
import { fetchAllCategories } from '../api/categoryApi';
import '../styles/Modal.css';

const TransactionModal = ({ isOpen, onClose, onSave, transaction, currentAccount, updateAccountBalance }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState(currentAccount?.currency || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [type, setType] = useState('expense');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoryList = await fetchAllCategories();
        setCategories(categoryList);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (isOpen) {
      if (transaction) {
        setDescription(transaction.description || '');
        setAmount(transaction.amount?.toString() || '');
        setCurrency(transaction.currency || currentAccount?.currency || '');
        setDate(transaction.date ? new Date(transaction.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
        setType(transaction.type?.toLowerCase() || 'expense');
        setSelectedCategory(transaction.category || null);
      } else {
        setDescription('');
        setAmount('');
        setCurrency(currentAccount?.currency || '');
        setDate(new Date().toISOString().split('T')[0]);
        setType('expense');
        setSelectedCategory(null);
      }
    }
  }, [isOpen, transaction, currentAccount]);

  const handleSave = async () => {
    if (!type) {
        alert('Please select a transaction type.');
        return;
      }

      const parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        alert('Please enter a valid positive amount.');
        return;
      }

      if (type === 'expense' && parsedAmount > parseFloat(currentAccount?.balance || 0)) {
        alert('Insufficient balance to complete this expense transaction.');
        return;
      }

    try {
      if (transaction) {
        const updatedTransaction = {
          id: transaction.id,
          description,
          amount: parsedAmount,
          date,
          type: type.toUpperCase(),
          currency,
          category: selectedCategory,
          account: transaction.account || currentAccount,
        };

        const updated = await updateTransaction(updatedTransaction.id, updatedTransaction);
        if (updated) {
          onSave();
        } else {
          console.error('❌ Error updating transaction');
        }
      } else {
        const newTransaction = {
          description,
          amount: parsedAmount,
          date,
          type: type.toUpperCase(),
          currency,
          category: selectedCategory,
          account: currentAccount,
        };

        const addedTransaction = await addTransaction(newTransaction);
        if (addedTransaction) {
          const currentBalance = parseFloat(currentAccount.balance || 0);
          const amountValue = parseFloat(addedTransaction.amount || 0);
          let updatedBalance = currentBalance;

          if (type === 'income') {
            updatedBalance += amountValue;
          } else if (type === 'expense') {
            updatedBalance -= amountValue;
          }

          updateAccountBalance(updatedBalance);
          onSave();
        }
      }
      onClose();
    } catch (error) {
      console.error('❌ Error saving transaction:', error);
    }
  };

  return (
    <div className={`modal ${isOpen ? 'open' : ''}`}>
      <div className="modal-content">
        <h2>{transaction ? 'Edit Transaction' : 'Add Transaction'}</h2>

        <label>Description:</label>
        <input type="text" value={description} onChange={e => setDescription(e.target.value)} />

        <label>Amount:</label>
        <input type="number" value={amount} onChange={e => setAmount(e.target.value)} min="0" step="0.01" />

        <label>Currency (Optional):</label>
        <input type="text" value={currency} onChange={e => setCurrency(e.target.value)} placeholder={currentAccount.currency} />

        <label>Date:</label>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} />

        <label>Type:</label>
        <select value={type} onChange={e => setType(e.target.value)}>
          <option value="" disabled hidden></option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>

        <label>Category:</label>
        <select
          value={selectedCategory ? selectedCategory.id : ''}
          onChange={e => {
            const selectedCategoryId = Number(e.target.value);
            const category = categories.find(c => c.id === selectedCategoryId);
            setSelectedCategory(category);
          }}
        >
          <option value="" disabled hidden></option>
          {categories.map(category => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </select>

        <button onClick={handleSave}>Save</button>
        <button onClick={onClose} className="cancel">Cancel</button>
      </div>
    </div>
  );
};

export default TransactionModal;
