import React, { useState, useEffect } from "react";
import goalsApi from "../api/goalsApi";
import '../styles/AddGoalModal.css';

const AddGoalModal = ({ isOpen, onClose, onGoalAdded, currentAccount }) => {
  const [goalData, setGoalData] = useState({
    name: "",
    targetAmount: "",
    currentAmount: 0,
    deadline: "",
  });

  const handleChange = (e) => {
    setGoalData({ ...goalData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
   if (!currentAccount || !currentAccount.id) {
      console.error("Account is not selected");
      return;
    }
    try {
      const newGoal = await goalsApi.addGoal({
        ...goalData,
        account: { id: currentAccount.id },
      });

      onGoalAdded(newGoal);
      onClose();
    } catch (error) {
      console.error("Error creating goal:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="goal-modal">
      <div className="goal-modal-content">
        <h2>Create a New Goal</h2>

        <input
          type="text"
          name="name"
          placeholder="Goal Name"
          value={goalData.name}
          onChange={handleChange}
        />

        <input
          type="number"
          name="targetAmount"
          placeholder="Target Amount"
          value={goalData.targetAmount}
          onChange={handleChange}
        />

        <input
          type="number"
          name="currentAmount"
          placeholder="Current Amount"
          value={goalData.currentAmount || ""}
          onChange={handleChange}
        />

        <label htmlFor="deadline">Deadline</label>
        <input
          type="date"
          name="deadline"
          id="deadline"
          value={goalData.deadline}
          onChange={handleChange}
        />

        <button onClick={handleSubmit}>✅ Create Goal</button>
        <button onClick={onClose}>❌ Cancel</button>
      </div>
    </div>
  );
};

export default AddGoalModal;
