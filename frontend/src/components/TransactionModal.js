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
  const [categories, setCategories] = useState([]);  // State for categories
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Update the form fields when the modal opens
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoryList = await fetchAllCategories(); // Fetch categories
        setCategories(categoryList);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []); // ✅ This should be a standalone effect

  useEffect(() => {
    if (transaction) {
      setDescription(transaction.description || '');
      setAmount(transaction.amount || '');
      setCurrency(transaction.currency || currentAccount.currency);
      setDate(transaction.date ? new Date(transaction.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
      setSelectedCategory(transaction.category || '');
    } else {
      // If it's a new transaction, set default values
      setDescription('');
      setAmount('');
      setCurrency(currentAccount.currency || '');
      setDate(new Date().toISOString().split('T')[0]); // ✅ Set today's date
      setSelectedCategory('');
    }
  }, [transaction, currentAccount]); // ✅ This should be another standalone effect

  useEffect(() => {
    if (currentAccount?.id) {
      fetchAllTransactions(currentAccount.id);
    }
  }, [currentAccount]); // ✅ Another standalone effect


  // Handling save for updating transaction
  const handleSave = async () => {
    try {
      if (transaction) {
        // Editing existing transaction
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
          onSave(); // Refresh list in parent component
          fetchAllTransactions(currentAccount.id);  // Fetch updated transactions
        } else {
          console.error('❌ Error updating transaction');
        }
      } else {
        const newTransaction = {
                description,
                amount: parseFloat(amount), // Ensure amount is a number
                date,
                type: type.toUpperCase(),
                currency,
                category: selectedCategory,
                account: currentAccount, // Make sure you're passing the account ID
              };

              const addedTransaction = await addTransaction(newTransaction); // Call the API function

              if (addedTransaction) {
                onSave(); // Refresh list in parent component
                fetchAllTransactions(currentAccount.id); // Refresh the list
              } else {
                console.error('❌ Error adding new transaction');
              }
    }
     onClose(); // Close modal
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
                    const selectedCategoryId = Number(e.target.value);  // Convert to number if category.id is a number
                    const category = categories.find(c => c.id === selectedCategoryId); // Find the full category object by id
                    setSelectedCategory(category); // Set the full category object
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