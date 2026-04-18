import React, { useState } from "react";
import goalsApi from "../api/goalsApi";
import "../styles/AddGoalModal.css";

const AddGoalModal = ({ isOpen, onClose, onGoalAdded, currentAccount }) => {
  const [goalData, setGoalData] = useState({
    name: "",
    targetAmount: "",
    currentAmount: 0,
    deadline: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setGoalData({ ...goalData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!currentAccount?.id) {
      setError("No account selected.");
      return;
    }
    if (!goalData.name.trim()) {
      setError("Please enter a goal name.");
      return;
    }
    const target = parseFloat(goalData.targetAmount);
    if (isNaN(target) || target <= 0) {
      setError("Please enter a valid target amount.");
      return;
    }
    if (!goalData.deadline) {
      setError("Please select a deadline.");
      return;
    }

    setError("");

    try {
      const newGoal = await goalsApi.addGoal({
        ...goalData,
        targetAmount: target,
        currentAmount: parseFloat(goalData.currentAmount) || 0,
        account: { id: currentAccount.id },
      });
      onGoalAdded(newGoal);
      onClose();
      setGoalData({
        name: "",
        targetAmount: "",
        currentAmount: 0,
        deadline: "",
      });
    } catch (err) {
      console.error("Error creating goal:", err);
      setError("Failed to create goal. Please try again.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="goal-modal">
      <div className="goal-modal-content">
        <h2>Create a New Goal</h2>

        {error && <p className="error-message">{error}</p>}

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
