import React, { useState } from 'react';

const TransactionModal = ({ isOpen, onClose, onSave, transaction }) => {
  const [description, setDescription] = useState(transaction ? transaction.description : '');
  const [amount, setAmount] = useState(transaction ? transaction.amount : '');
  const [date, setDate] = useState(transaction ? transaction.date : '');
  const [frequency, setFrequency] = useState(transaction ? transaction.frequency : 'Once');

  const handleSave = () => {
    onSave({
      id: transaction ? transaction.id : null,
      description,
      amount,
      date,
      frequency,
    });
    onClose();
  };

  return (
    <div className={`modal ${isOpen ? 'open' : ''}`}>
      <div className="modal-content">
        <div className="modal-header">
          <h2>{transaction ? 'Edit Transaction' : 'Add Transaction'}</h2>
          <button onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <input
            type="text"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          {transaction && (
            <select value={frequency} onChange={(e) => setFrequency(e.target.value)}>
              <option value="Once">Once</option>
              <option value="Weekly">Weekly</option>
              <option value="Monthly">Monthly</option>
            </select>
          )}
        </div>
        <div className="modal-footer">
          <button onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  );
};

export default TransactionModal;
