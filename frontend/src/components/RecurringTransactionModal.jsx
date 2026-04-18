import React, { useState, useEffect } from "react";
import {
  addRecurringTransaction,
  updateRecurringTransaction,
} from "../api/recurringTransactionsApi";
import { fetchAllCategories } from "../api/categoryApi";
import "../styles/Modal.css";

const RecurringTransactionModal = ({
  isOpen,
  onClose,
  onSave,
  transaction,
  currentAccount,
}) => {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState(currentAccount?.currency || "");
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [endDate, setEndDate] = useState("");
  const [frequency, setFrequency] = useState("Monthly");
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoryList = await fetchAllCategories();
        setCategories(categoryList);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    if (transaction) {
      setDescription(transaction.description || "");
      setAmount(transaction.amount?.toString() || "");
      setCurrency(transaction.currency || currentAccount?.currency || "");
      setStartDate(
        transaction.startDate
          ? new Date(transaction.startDate).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
      );
      setEndDate(
        transaction.endDate
          ? new Date(transaction.endDate).toISOString().split("T")[0]
          : "",
      );
      setFrequency(transaction.frequency || "Monthly");
      setSelectedCategory(transaction.category || null);
    } else {
      setDescription("");
      setAmount("");
      setCurrency(currentAccount?.currency || "");
      setStartDate(new Date().toISOString().split("T")[0]);
      setEndDate("");
      setFrequency("Monthly");
      setSelectedCategory(null);
    }
  }, [isOpen, transaction, currentAccount]);

  const handleSave = async () => {
    if (!frequency) {
      alert("Please select a transaction frequency.");
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert("Please enter a valid positive amount.");
      return;
    }

    try {
      if (transaction) {
        const updatedTransaction = {
          id: transaction.id,
          description,
          amount: parsedAmount,
          currency,
          startDate,
          endDate,
          frequency,
          category: selectedCategory,
          account: transaction.account || currentAccount,
        };
        await updateRecurringTransaction(transaction.id, updatedTransaction);
      } else {
        const newTransaction = {
          description,
          amount: parsedAmount,
          currency,
          startDate,
          endDate,
          frequency: frequency.toUpperCase(),
          category: selectedCategory,
          account: currentAccount,
        };
        await addRecurringTransaction(newTransaction);
      }

      onSave();
    } catch (error) {
      console.error("❌ Error saving transaction:", error);
      alert("Failed to save. Please try again.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal open">
      <div className="modal-content">
        <h2>
          {transaction
            ? "Edit Recurring Transaction"
            : "Add Recurring Transaction"}
        </h2>

        <label>Description:</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <label>Amount:</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          min="0"
          step="0.01"
        />

        <label>Currency (Optional):</label>
        <input
          type="text"
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          placeholder={currentAccount?.currency}
        />

        <label>Start Date:</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />

        <label>End Date (Optional):</label>
        <input
          type="date"
          value={endDate || ""}
          onChange={(e) => setEndDate(e.target.value)}
        />

        <label>Frequency:</label>
        <select
          value={frequency}
          onChange={(e) => setFrequency(e.target.value)}
        >
          <option value="Daily">Daily</option>
          <option value="Weekly">Weekly</option>
          <option value="Monthly">Monthly</option>
          <option value="Yearly">Yearly</option>
        </select>

        <label>Category:</label>
        <select
          value={selectedCategory ? selectedCategory.id : ""}
          onChange={(e) => {
            const id = Number(e.target.value);
            const category = categories.find((c) => c.id === id);
            setSelectedCategory(category);
          }}
        >
          <option value="" disabled hidden></option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>

        <button onClick={handleSave}>Save</button>
        <button onClick={onClose} className="cancel">
          Cancel
        </button>
      </div>
    </div>
  );
};

export default RecurringTransactionModal;
