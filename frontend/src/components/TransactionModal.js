import React, { useState, useEffect } from 'react';
import { addTransaction, updateTransaction, fetchAllTransactions } from '../api/transactionsApi';
import { fetchAllCategories } from '../api/categoryApi';
import '../styles/Modal.css';

const TransactionModal = ({ isOpen, onClose, onSave, transaction, currentAccount }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState(0);
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
    if (transaction) {
      setDescription(transaction.description || '');
      setAmount(transaction.amount || '');
      setCurrency(transaction.currency || currentAccount.currency);
      setDate(transaction.date ? new Date(transaction.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
      setSelectedCategory(transaction.category || '');
    } else {
      setDescription('');
      setAmount('');
      setCurrency(currentAccount.currency || '');
      setDate(new Date().toISOString().split('T')[0]);
      setSelectedCategory('');
    }
  }, [transaction, currentAccount]);

  useEffect(() => {
    if (currentAccount?.id) {
      fetchAllTransactions(currentAccount.id);
    }
  }, [currentAccount]);

  const handleSave = async () => {
    try {
     if (amount < 0) {
          console.error('❌ Amount cannot be negative');
          alert('Amount cannot be negative');
          return;
        }

      if (transaction) {
        const updatedTransaction = {
          id: transaction.id,
          description,
          amount,
          date,
          type: type.toUpperCase(),
          currency,
          category: selectedCategory,
          account: transaction.account || currentAccount,
        };

        const updated = await updateTransaction(transaction.id, updatedTransaction);
        if (updated) {
          onSave();
          fetchAllTransactions(currentAccount.id);
        } else {
          console.error('❌ Error updating transaction');
        }
      } else {
        const newTransaction = {
                description,
                amount: parseFloat(amount),
                date,
                type: type.toUpperCase(),
                currency,
                category: selectedCategory,
                account: currentAccount,
              };

              const addedTransaction = await addTransaction(newTransaction);

              if (addedTransaction) {
                onSave();
                fetchAllTransactions(currentAccount.id);
              } else {
                console.error('❌ Error adding new transaction');
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
        <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} />

        <label>Amount:</label>
        <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />

        <label>Currency (Optional):</label>
        <input type="text" value={currency} onChange={(e) => setCurrency(e.target.value)} placeholder={currentAccount.currency} />

        <label>Date:</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />

        <label>Type:</label>
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>

        <label>Category:</label>
                <select
                  value={selectedCategory ? selectedCategory.id : ''}
                  onChange={(e) => {
                    const selectedCategoryId = Number(e.target.value);
                    const category = categories.find(c => c.id === selectedCategoryId);
                    setSelectedCategory(category);
                  }}
                >

                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>


        <button onClick={handleSave}>Save</button>
        <button onClick={onClose} className="cancel">Cancel</button>
      </div>
    </div>
  );
};

export default TransactionModal;