import React, { useState, useEffect } from 'react';
import { addRecurringTransaction, updateRecurringTransaction, fetchRecurringTransactions } from '../api/recurringTransactionsApi';
import { fetchAllCategories } from '../api/categoryApi';
import '../styles/Modal.css';

const RecurringTransactionModal = ({ isOpen, onClose, onSave, transaction, currentAccount }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState(currentAccount?.currency || '');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [frequency, setFrequency] = useState('Monthly');
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
      setStartDate(transaction.startDate ? new Date(transaction.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
      setEndDate(transaction.endDate ? new Date(transaction.endDate).toISOString().split('T')[0] : '');
      setFrequency(transaction.frequency || 'Monthly');
      setSelectedCategory(transaction.category || '');
    } else {
      setDescription('');
      setAmount('');
      setCurrency(currentAccount.currency || '');
      setStartDate(new Date().toISOString().split('T')[0]);
      setEndDate('');
      setFrequency('Monthly');
      setSelectedCategory('');
    }
  }, [transaction, currentAccount]);

  useEffect(() => {
      if (currentAccount?.id) {
        fetchRecurringTransactions(currentAccount.id);
      }
    }, [currentAccount]);

 const handleSave = async () => {
    if(!frequency) {
    alert('Please select a transaction frequency.');
        return;
    }

    const parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        alert('Please enter a valid positive amount.');
        return;
      }

      if (parsedAmount > parseFloat(currentAccount?.balance || 0)) {
        alert(`Insufficient balance to cover the first ${frequency.toLowerCase()} payment of this recurring expense.`);
        return;
      }

     try {
       if (transaction) {
         const updatedTransaction = {
           id: transaction.id,
           description,
           amount,
           currency,
           startDate,
           endDate,
           frequency,
           category: selectedCategory,
           account: transaction.account || currentAccount,
         };

         const updated = await updateRecurringTransaction(transaction.id, updatedTransaction);
         if (updated) {
           onSave();
           fetchRecurringTransactions(currentAccount.id);
         } else {
           console.error('❌ Error updating transaction');
         }
       } else {
         const newTransaction = {
                 description,
                 amount: parseFloat(amount),
                 currency,
                 startDate,
                 endDate,
                 frequency: frequency.toUpperCase(),
                 category: selectedCategory,
                 account: currentAccount,
               };

               const addedTransaction = await addRecurringTransaction(newTransaction);

               if (addedTransaction) {
                 onSave();
                 fetchRecurringTransactions(currentAccount.id);
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
        <h2>{transaction ? 'Edit Recurring Transaction' : 'Add Recurring Transaction'}</h2>

        <label>Description:</label>
        <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} />

        <label>Amount:</label>
        <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />

        <label>Currency (Optional):</label>
        <input type="text" value={currency} onChange={(e) => setCurrency(e.target.value)} placeholder={currentAccount.currency} />

        <label>Start Date:</label>
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />

        <label>End Date (Optional):</label>
        <input type="date" value={endDate || ''} onChange={(e) => setEndDate(e.target.value)} />

        <label>Frequency:</label>
        <option value="" disabled hidden>
                                  </option>
        <select value={frequency} onChange={(e) => setFrequency(e.target.value)}>
          <option value="Daily">Daily</option>
          <option value="Weekly">Weekly</option>
          <option value="Monthly">Monthly</option>
          <option value="Yearly">Yearly</option>
        </select>

        <label>Category:</label>
        <select
          value={selectedCategory ? selectedCategory.id : ''}
          onChange={(e) => {
            const selectedCategoryId = Number(e.target.value);
            const category = categories.find((c) => c.id === selectedCategoryId);
            setSelectedCategory(category);
          }}
        >
        <option value="" disabled hidden>

                          </option>
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

export default RecurringTransactionModal;
